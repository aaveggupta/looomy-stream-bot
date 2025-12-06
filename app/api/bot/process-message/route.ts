import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { queryVectors } from "@/lib/pinecone";
import { generateChatResponse } from "@/lib/openai";
import { getAdapter } from "@/lib/adapters";
import { trackApiUsage } from "@/lib/quota";
import { logger } from "@/lib/logger";
import { MessageJobPayload } from "@/lib/qstash";
import { BotPersonality, Platform } from "@prisma/client";
import { PINECONE_CONFIG, PLATFORM_CONFIG } from "@/lib/config";

/**
 * Process a single message job dispatched from QStash
 * This enables parallel processing of multiple messages
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify authorization
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.BOT_POLL_SECRET}`) {
      logger.warn("Unauthorized process-message request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: MessageJobPayload = await req.json();
    const {
      sessionId,
      messageId,
      authorName,
      messageText,
      question,
      embedding,
      botConfig,
      userId,
      platform,
      externalChatId,
    } = payload;

    logger.info({ sessionId, messageId, authorName }, "Processing message job");

    // Check if message was already processed (deduplication)
    const existing = await prisma.processedMessage.findUnique({
      where: { messageId },
    });

    if (existing) {
      logger.debug({ messageId }, "Message already processed - skipping");
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "Already processed",
      });
    }

    // Calculate expiration date based on retention days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + botConfig.messageRetentionDays);

    try {
      // Query Pinecone for context using pre-computed embedding
      logger.debug(
        { sessionId, messageId, embeddingLength: embedding?.length },
        "Querying Pinecone for context"
      );
      const matches = await queryVectors(
        userId,
        embedding,
        PINECONE_CONFIG.DEFAULT_TOP_K
      );

      // Build context
      const context = matches
        .map((match) => (match.metadata as { text: string })?.text || "")
        .filter(Boolean)
        .join("\n\n");

      logger.debug(
        {
          sessionId,
          messageId,
          matchCount: matches.length,
          contextLength: context.length,
        },
        "Pinecone query complete"
      );

      // Generate AI response
      logger.debug(
        {
          sessionId,
          messageId,
          botName: botConfig.botName,
          personality: botConfig.personality,
        },
        "Generating AI response"
      );
      const response = await generateChatResponse(
        context,
        question,
        botConfig.botName,
        botConfig.personality as BotPersonality
      );
      await trackApiUsage(1, 0.01); // Track GPT-4 API call

      let replyText = `@${authorName} ${response}`;

      // Truncate to platform message limit
      if (replyText.length > PLATFORM_CONFIG.MAX_MESSAGE_LENGTH) {
        replyText =
          replyText.slice(0, PLATFORM_CONFIG.TRUNCATE_LENGTH) +
          PLATFORM_CONFIG.MESSAGE_TRUNCATE_SUFFIX;
      }

      logger.debug(
        { sessionId, messageId, replyLength: replyText.length },
        "Sending reply via adapter"
      );

      // Send reply via adapter
      const adapter = getAdapter(platform as Platform);
      await adapter.sendMessage(
        {
          externalChatId,
          platform: platform as Platform,
        },
        replyText
      );

      logger.debug({ sessionId, messageId }, "Reply sent, recording to DB");

      // Record processed message with reply
      await prisma.processedMessage.create({
        data: {
          streamSessionId: sessionId,
          messageId,
          authorName,
          messageText,
          question,
          botReply: replyText,
          expiresAt,
        },
      });

      const duration = Date.now() - startTime;
      logger.info(
        { sessionId, messageId, authorName, question, replyText, duration },
        "Processed and replied to message"
      );

      return NextResponse.json({
        success: true,
        replied: true,
        duration: `${duration}ms`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error(
        { sessionId, messageId, error: errorMessage, stack: errorStack },
        "Error processing message"
      );

      // Record as processed even on error to avoid retries
      await prisma.processedMessage.create({
        data: {
          streamSessionId: sessionId,
          messageId,
          authorName,
          messageText,
          question,
          botReply: null,
          expiresAt,
        },
      });

      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error(
      { error: errorMessage, stack: errorStack },
      "Failed to process message job"
    );
    return NextResponse.json(
      {
        error: "Processing failed",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
