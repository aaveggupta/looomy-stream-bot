import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@database/prisma";
import {
  getLiveChatMessages,
  sendLiveChatMessage,
} from "@/lib/youtube";
import { generateEmbedding, generateChatResponse } from "@/lib/openai";
import { queryVectors } from "@/lib/pinecone";

// Store last processed message ID per user to avoid duplicates
const lastProcessedMessages = new Map<string, string>();

export async function POST(req: NextRequest) {
  try {
    // This endpoint should be called by a cron job or external scheduler
    // Verify the request is authorized (e.g., via a secret key)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.BOT_POLL_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active bot configs
    const activeConfigs = await prisma.botConfig.findMany({
      where: { isActive: true, liveChatId: { not: null } },
      include: {
        user: true,
      },
    });

    const results = [];

    for (const config of activeConfigs) {
      if (!config.user.youtubeRefreshToken || !config.liveChatId) {
        continue;
      }

      try {
        // Get live chat messages
        const { messages } = await getLiveChatMessages(
          config.user.youtubeRefreshToken,
          config.liveChatId
        );

        const lastProcessed = lastProcessedMessages.get(config.userId);
        let foundLastProcessed = !lastProcessed;
        let processedCount = 0;

        for (const message of messages) {
          const messageId = message.id!;
          const messageText =
            message.snippet?.textMessageDetails?.messageText || "";
          // Remove @ prefix if already present to avoid @@username
          const rawAuthorName = message.authorDetails?.displayName || "User";
          const authorName = rawAuthorName.startsWith("@") ? rawAuthorName.slice(1) : rawAuthorName;

          // Skip until we find the last processed message
          if (!foundLastProcessed) {
            if (messageId === lastProcessed) {
              foundLastProcessed = true;
            }
            continue;
          }

          // Check if message contains trigger phrase
          if (
            !messageText
              .toLowerCase()
              .includes(config.triggerPhrase.toLowerCase())
          ) {
            continue;
          }

          // Extract the question (remove trigger phrase)
          const question = messageText
            .replace(new RegExp(config.triggerPhrase, "gi"), "")
            .trim();

          if (!question) {
            continue;
          }

          // Generate embedding for the question
          const questionEmbedding = await generateEmbedding(question);

          // Query Pinecone for relevant context
          const matches = await queryVectors(
            config.userId,
            questionEmbedding,
            3
          );

          // Build context from matches
          const context = matches
            .map((match) => (match.metadata as { text: string })?.text || "")
            .filter(Boolean)
            .join("\n\n");

          let replyText: string;

          if (!context) {
            // No relevant context found
            replyText = `@${authorName} I don't have information about that topic.`;
          } else {
            // Generate response using OpenAI
            const response = await generateChatResponse(
              context,
              question,
              config.botName
            );
            replyText = `@${authorName} ${response}`;
          }

          // Truncate to YouTube's 200 char limit
          if (replyText.length > 200) {
            replyText = replyText.slice(0, 197) + "...";
          }

          // Send response to live chat
          await sendLiveChatMessage(
            config.user.youtubeRefreshToken,
            config.liveChatId,
            replyText
          );

          processedCount++;
          lastProcessedMessages.set(config.userId, messageId);
        }

        results.push({
          userId: config.userId,
          processed: processedCount,
        });
      } catch (error) {
        console.error(`Error processing chat for user ${config.userId}:`, error);

        // If we get an error, the stream might have ended
        // Deactivate the bot for this user
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

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Poll error:", error);
    return NextResponse.json({ error: "Poll failed" }, { status: 500 });
  }
}
