import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import {
  getLiveChatMessages,
  sendLiveChatMessageAsBot,
} from "@/lib/youtube";
import { generateEmbedding, generateChatResponse } from "@/lib/openai";
import { queryVectors } from "@/lib/pinecone";
import {
  MessageTracker,
  processLiveChatMessages,
  type YouTubeLiveChatMessage,
} from "@/lib/message-queue";
import { logger, cronLogger } from "@/lib/logger";
import { PINECONE_CONFIG, PLATFORM_CONFIG } from "@/lib/config";

// Message tracker to avoid re-processing messages across cron runs
const messageTracker = new MessageTracker();

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  cronLogger.start();

  try {
    // Verify Vercel Cron or manual trigger with secret
    const authHeader = req.headers.get("authorization");
    const userAgent = req.headers.get("user-agent") || "";
    const isVercelCron = userAgent.includes("vercel-cron");
    const isAuthorized = authHeader === `Bearer ${process.env.BOT_POLL_SECRET}`;

    logger.info({ isVercelCron, isAuthorized }, "Authentication check");

    if (!isVercelCron && !isAuthorized) {
      logger.warn("Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active bot configs
    logger.info("Fetching active bot configs from database");
    const activeConfigs = await prisma.botConfig.findMany({
      where: { isActive: true, liveChatId: { not: null } },
      include: {
        user: true,
      },
    });

    logger.info(`Found ${activeConfigs.length} active bot config(s)`);

    const results: Array<{
      userId: string;
      processed?: number;
      messagesReceived?: number;
      triggerPhrase?: string;
      error?: string;
    }> = [];

    for (const config of activeConfigs) {
      cronLogger.userStart(config.userId, {
        triggerPhrase: config.triggerPhrase,
        botName: config.botName,
        liveChatId: config.liveChatId || "unknown",
      });

      if (!config.user.youtubeRefreshToken || !config.liveChatId) {
        logger.warn({ userId: config.userId }, "Skipping user - missing credentials");
        results.push({
          userId: config.userId,
          error: "Missing credentials (youtubeRefreshToken or liveChatId)",
        });
        continue;
      }

      try {
        // Get live chat messages from YouTube
        logger.info({ userId: config.userId }, "Fetching messages from YouTube");
        const { messages } = await getLiveChatMessages(
          config.user.youtubeRefreshToken,
          config.liveChatId
        );

        logger.info({ userId: config.userId, count: messages.length }, `Fetched ${messages.length} message(s) from YouTube`);

        // Filter out messages without IDs and convert to YouTubeLiveChatMessage type
        const validMessages = messages
          .filter((msg) => msg.id != null)
          .map((msg) => ({ ...msg, id: msg.id! })) as YouTubeLiveChatMessage[];

        if (validMessages.length < messages.length) {
          logger.warn({ userId: config.userId, filteredCount: messages.length - validMessages.length }, `Filtered out ${messages.length - validMessages.length} message(s) without IDs`);
        }

        // Process messages using our tested utility function
        // This handles: deduplication, trigger phrase filtering, question extraction
        const lastProcessed = messageTracker.getLastProcessed(config.userId);
        logger.debug({ userId: config.userId, lastProcessed: lastProcessed || "none" }, `Last processed message ID: ${lastProcessed || "none (first run)"}`);

        const result = processLiveChatMessages(
          validMessages,
          lastProcessed,
          config.triggerPhrase
        );

        logger.info({
          userId: config.userId,
          total: result.totalMessages,
          skipped: result.skippedMessages,
          ignored: result.ignoredMessages,
          toReply: result.messagesToReply.length,
        }, "Message processing summary");

        let repliedCount = 0;

        // Generate and send replies for each message
        for (let i = 0; i < result.messagesToReply.length; i++) {
          const message = result.messagesToReply[i];
          const msgIndex = i + 1;
          const msgTotal = result.messagesToReply.length;

          cronLogger.messageStart(config.userId, msgIndex, msgTotal, {
            id: message.id,
            author: message.authorName,
            text: message.originalMessage,
          });

          logger.debug({ userId: config.userId, messageIndex: msgIndex, question: message.question }, "Extracted question");

          try {
            // Generate embedding for the question
            logger.debug({ userId: config.userId, messageIndex: msgIndex }, "Generating embedding");
            const questionEmbedding = await generateEmbedding(message.question);

            // Query Pinecone for relevant context
            logger.debug({ userId: config.userId, messageIndex: msgIndex }, "Querying Pinecone for context (top 3)");
            const matches = await queryVectors(
              config.userId,
              questionEmbedding,
              PINECONE_CONFIG.DEFAULT_TOP_K
            );

            logger.info({ userId: config.userId, messageIndex: msgIndex, matchCount: matches.length }, `Found ${matches.length} relevant context match(es)`);

            // Build context from matches
            const context = matches
              .map((match) => (match.metadata as { text: string })?.text || "")
              .filter(Boolean)
              .join("\n\n");

            let replyText: string;

            if (!context) {
              logger.warn({ userId: config.userId, messageIndex: msgIndex }, "No context found - sending default response");
              replyText = `@${message.authorName} I don't have information about that topic.`;
            } else {
              logger.debug({ userId: config.userId, messageIndex: msgIndex, contextLength: context.length }, `Generating AI response with context (${context.length} chars)`);
              const response = await generateChatResponse(
                context,
                message.question,
                config.botName
              );
              replyText = `@${message.authorName} ${response}`;
              logger.debug({ userId: config.userId, messageIndex: msgIndex, responseLength: response.length }, `Generated response (${response.length} chars)`);
            }

            // Truncate to platform message limit
            const originalLength = replyText.length;
            if (replyText.length > PLATFORM_CONFIG.MAX_MESSAGE_LENGTH) {
              replyText = replyText.slice(0, PLATFORM_CONFIG.TRUNCATE_LENGTH) + PLATFORM_CONFIG.MESSAGE_TRUNCATE_SUFFIX;
              logger.debug({ userId: config.userId, messageIndex: msgIndex, originalLength, truncatedLength: replyText.length }, `Truncated reply: ${originalLength} → ${replyText.length} chars`);
            }

            // Send response to live chat as bot
            logger.debug({ userId: config.userId, messageIndex: msgIndex }, "Sending to YouTube Live Chat");
            await sendLiveChatMessageAsBot(
              config.liveChatId,
              replyText
            );

            cronLogger.messageSuccess(config.userId, msgIndex, msgTotal, replyText);
            repliedCount++;
          } catch (messageError: any) {
            logger.error({
              userId: config.userId,
              messageIndex: msgIndex,
              messageId: message.id,
              error: messageError,
            }, "Error processing message");

            // Check if error is due to bot not being a moderator
            if (
              messageError?.response?.status === 403 ||
              messageError?.message?.includes("unauthorized") ||
              messageError?.message?.includes("forbidden")
            ) {
              logger.error({ userId: config.userId, error: messageError }, "Bot is not a moderator - deactivating bot");

              // Deactivate bot - user needs to add bot as moderator
              await prisma.botConfig.update({
                where: { id: config.id },
                data: {
                  isActive: false,
                  liveChatId: null,
                },
              });

              results.push({
                userId: config.userId,
                error:
                  "Bot is not added as a moderator. Please add the bot to your channel moderators and try again.",
              });

              break; // Stop processing messages for this user
            }

            // Re-throw if it's a critical error
            throw messageError;
          }
        }

        // Update tracking with the last message we saw (prevents re-processing)
        if (result.lastSeenMessageId) {
          logger.debug({ userId: config.userId, lastSeenMessageId: result.lastSeenMessageId }, `Updating tracking: lastSeenMessageId = ${result.lastSeenMessageId}`);
          messageTracker.setLastProcessed(config.userId, result.lastSeenMessageId);
        }

        cronLogger.userEnd(config.userId, {
          repliedCount,
          totalMessages: result.messagesToReply.length,
        });

        results.push({
          userId: config.userId,
          processed: repliedCount,
          messagesReceived: messages.length,
          triggerPhrase: config.triggerPhrase,
        });
      } catch (error) {
        logger.error({ userId: config.userId, error }, "Fatal error processing chat");

        logger.info({ userId: config.userId }, "Deactivating bot due to error");
        await prisma.botConfig.update({
          where: { id: config.id },
          data: { isActive: false, liveChatId: null },
        });

        results.push({
          userId: config.userId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const duration = Date.now() - startTime;
    cronLogger.end(duration, {
      total: activeConfigs.length,
      success: results.filter((r) => !r.error).length,
      errors: results.filter((r) => r.error).length,
    });

    return NextResponse.json({
      activeConfigs: activeConfigs.length,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    logger.error({ err: error instanceof Error ? error : new Error(String(error)) }, "CRON JOB FATAL ERROR");
    return NextResponse.json({
      error: "Cron failed",
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
