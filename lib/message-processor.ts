import { prisma } from "./db";
import { StreamSession, BotConfig } from "@prisma/client";
import { PlatformMessage } from "./adapters/types";
import { getAdapter } from "./adapters";
import { generateEmbedding, generateChatResponse } from "./openai";
import { queryVectors } from "./pinecone";
import { logger } from "./logger";
import { trackApiUsage } from "./quota";

interface ProcessMessageResult {
  processed: boolean;
  replied: boolean;
  error?: string;
}

/**
 * Process a single message from a stream chat
 * Handles deduplication, trigger phrase detection, RAG, and response
 */
export async function processMessage(
  session: StreamSession & { user: { botConfig: BotConfig | null } },
  message: PlatformMessage,
  botConfig: BotConfig
): Promise<ProcessMessageResult> {
  // Check if message was already processed
  const existing = await prisma.processedMessage.findUnique({
    where: { messageId: message.id },
  });

  if (existing) {
    logger.debug(
      { sessionId: session.id, messageId: message.id },
      "Message already processed - skipping"
    );
    return { processed: false, replied: false };
  }

  // Calculate expiration date based on retention days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + botConfig.messageRetentionDays);

  // Check for trigger phrase
  const hasTrigger = message.text
    .toLowerCase()
    .includes(botConfig.triggerPhrase.toLowerCase());

  if (!hasTrigger) {
    // Still record as processed to avoid re-checking
    await prisma.processedMessage.create({
      data: {
        streamSessionId: session.id,
        messageId: message.id,
        authorName: message.authorName,
        messageText: message.text,
        question: null,
        botReply: null,
        expiresAt,
      },
    });
    return { processed: true, replied: false };
  }

  // Extract question
  const question = message.text
    .replace(new RegExp(botConfig.triggerPhrase, "gi"), "")
    .trim();

  if (!question) {
    await prisma.processedMessage.create({
      data: {
        streamSessionId: session.id,
        messageId: message.id,
        authorName: message.authorName,
        messageText: message.text,
        question: null,
        botReply: null,
        expiresAt,
      },
    });
    return { processed: true, replied: false };
  }

  try {
    // Generate embedding
    const questionEmbedding = await generateEmbedding(question);
    await trackApiUsage(1, 0.0001); // Track embedding API call

    // Query Pinecone for context
    const matches = await queryVectors(
      session.userId,
      questionEmbedding,
      3
    );

    // Build context
    const context = matches
      .map((match) => (match.metadata as { text: string })?.text || "")
      .filter(Boolean)
      .join("\n\n");

    // Generate AI response (with or without context)
    const response = await generateChatResponse(
      context,
      question,
      botConfig.botName,
      botConfig.personality
    );
    await trackApiUsage(1, 0.01); // Track GPT-4 API call
    let replyText = `@${message.authorName} ${response}`;

    // Truncate to 200 chars (YouTube limit)
    if (replyText.length > 200) {
      replyText = replyText.slice(0, 197) + "...";
    }

    // Send reply via adapter
    const adapter = getAdapter(session.platform);
    await adapter.sendMessage(
      {
        externalChatId: session.externalChatId,
        platform: session.platform,
      },
      replyText
    );

    // Record processed message with reply
    await prisma.processedMessage.create({
      data: {
        streamSessionId: session.id,
        messageId: message.id,
        authorName: message.authorName,
        messageText: message.text,
        question,
        botReply: replyText,
        expiresAt,
      },
    });

    logger.info(
      {
        sessionId: session.id,
        messageId: message.id,
        authorName: message.authorName,
        question,
      },
      "Processed and replied to message"
    );

    return { processed: true, replied: true };
  } catch (error) {
    logger.error(
      { sessionId: session.id, messageId: message.id, error },
      "Error processing message"
    );

    // Record as processed even on error to avoid retries
    await prisma.processedMessage.create({
      data: {
        streamSessionId: session.id,
        messageId: message.id,
        authorName: message.authorName,
        messageText: message.text,
        question,
        botReply: null,
        expiresAt,
      },
    });

    return {
      processed: true,
      replied: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

