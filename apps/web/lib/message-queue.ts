/**
 * Message Queue Utilities for YouTube Live Chat Bot
 *
 * Handles deduplication and tracking of processed messages to ensure
 * the bot doesn't re-process old messages or skip new ones.
 */

export interface Message {
  id: string;
  [key: string]: any;
}

/**
 * Represents a YouTube Live Chat message with relevant fields
 * Uses string | null to match YouTube API response types
 */
export interface YouTubeLiveChatMessage extends Message {
  snippet?: {
    textMessageDetails?: {
      messageText?: string | null;
    };
  };
  authorDetails?: {
    displayName?: string | null;
  };
}

/**
 * A processed message ready for bot response
 */
export interface ProcessedMessage {
  id: string;
  question: string;
  authorName: string;
  originalMessage: string;
}

export interface MessageProcessingResult<T extends Message> {
  /** Messages that should be processed (new messages after last processed) */
  messagesToProcess: T[];
  /** The ID of the last message seen in this batch (for tracking) */
  lastSeenMessageId: string | null;
  /** Total messages in the batch */
  totalMessages: number;
  /** Number of messages skipped (already processed) */
  skippedMessages: number;
}

/**
 * Filters messages to only return new ones that haven't been processed yet.
 *
 * Logic:
 * - If no lastProcessedId: process all messages (first run)
 * - If lastProcessedId exists: skip all messages up to and including that ID
 * - Always tracks the last message ID seen for the next iteration
 *
 * Edge cases handled:
 * - Empty message array
 * - lastProcessedId not found in current batch (processes all messages)
 * - lastProcessedId is the last message (processes nothing, updates tracking)
 * - All messages already processed
 *
 * @param messages - Array of messages from YouTube (or any message source)
 * @param lastProcessedId - ID of the last message we've seen (not necessarily replied to)
 * @returns Result object with messages to process and tracking information
 */
export function filterNewMessages<T extends Message>(
  messages: T[],
  lastProcessedId: string | null = null
): MessageProcessingResult<T> {
  // Handle empty messages array
  if (messages.length === 0) {
    return {
      messagesToProcess: [],
      lastSeenMessageId: null,
      totalMessages: 0,
      skippedMessages: 0,
    };
  }

  // If no lastProcessedId, process all messages (first run)
  if (!lastProcessedId) {
    const lastSeenMessageId = messages[messages.length - 1].id;
    return {
      messagesToProcess: messages,
      lastSeenMessageId,
      totalMessages: messages.length,
      skippedMessages: 0,
    };
  }

  // Find the index of the lastProcessedId
  const lastProcessedIndex = messages.findIndex((msg) => msg.id === lastProcessedId);

  // If lastProcessedId not found: assume messages are newer, process ALL
  // This handles the case where old messages have been purged from the API
  if (lastProcessedIndex === -1) {
    const lastSeenMessageId = messages[messages.length - 1].id;
    return {
      messagesToProcess: messages,
      lastSeenMessageId,
      totalMessages: messages.length,
      skippedMessages: 0,
    };
  }

  // If found: process only messages after the lastProcessedId
  const messagesToProcess = messages.slice(lastProcessedIndex + 1);
  const lastSeenMessageId = messages[messages.length - 1].id;
  const skippedMessages = lastProcessedIndex + 1;

  return {
    messagesToProcess,
    lastSeenMessageId,
    totalMessages: messages.length,
    skippedMessages,
  };
}

/**
 * Result of processing live chat messages
 */
export interface ProcessLiveChatResult {
  /** Messages that need bot replies (have trigger phrase and valid question) */
  messagesToReply: ProcessedMessage[];
  /** The ID of the last message seen in this batch (for tracking) */
  lastSeenMessageId: string | null;
  /** Total messages in the batch */
  totalMessages: number;
  /** Number of messages skipped (already processed) */
  skippedMessages: number;
  /** Number of messages ignored (no trigger phrase or invalid) */
  ignoredMessages: number;
}

/**
 * Process YouTube Live Chat messages for bot responses.
 *
 * This is the main processing function that handles:
 * - Deduplication (filtering already-processed messages)
 * - Trigger phrase detection
 * - Question extraction
 * - Author name formatting
 *
 * The API route should call this single function instead of implementing
 * the logic inline.
 *
 * @param messages - Raw YouTube Live Chat messages
 * @param lastProcessedId - ID of the last message we've seen
 * @param triggerPhrase - Phrase that must be in the message (case-insensitive)
 * @returns Result with messages to reply to and tracking information
 *
 * @example
 * ```typescript
 * const result = processLiveChatMessages(
 *   youtubeMessages,
 *   tracker.getLastProcessed(userId),
 *   "@loomybot"
 * );
 *
 * for (const msg of result.messagesToReply) {
 *   const answer = await generateAnswer(msg.question);
 *   await sendReply(`@${msg.authorName} ${answer}`);
 * }
 *
 * tracker.setLastProcessed(userId, result.lastSeenMessageId);
 * ```
 */
export function processLiveChatMessages(
  messages: YouTubeLiveChatMessage[],
  lastProcessedId: string | null,
  triggerPhrase: string
): ProcessLiveChatResult {
  // Step 1: Filter out already-processed messages
  const { messagesToProcess, lastSeenMessageId, skippedMessages } =
    filterNewMessages(messages, lastProcessedId);

  // Step 2: Process each new message
  const messagesToReply: ProcessedMessage[] = [];
  let ignoredMessages = 0;

  for (const message of messagesToProcess) {
    const messageText =
      message.snippet?.textMessageDetails?.messageText || "";

    // Check if message contains trigger phrase (case-insensitive)
    const hasTrigger = messageText
      .toLowerCase()
      .includes(triggerPhrase.toLowerCase());

    if (!hasTrigger) {
      ignoredMessages++;
      continue;
    }

    // Extract the question (remove trigger phrase)
    const question = messageText
      .replace(new RegExp(triggerPhrase, "gi"), "")
      .trim();

    // Skip if no question after removing trigger
    if (!question) {
      ignoredMessages++;
      continue;
    }

    // Format author name (remove @ prefix if present to avoid @@username)
    const rawAuthorName = message.authorDetails?.displayName || "User";
    const authorName = rawAuthorName.startsWith("@")
      ? rawAuthorName.slice(1)
      : rawAuthorName;

    messagesToReply.push({
      id: message.id,
      question,
      authorName,
      originalMessage: messageText,
    });
  }

  return {
    messagesToReply,
    lastSeenMessageId,
    totalMessages: messages.length,
    skippedMessages,
    ignoredMessages,
  };
}

/**
 * In-memory store for tracking last processed message per user.
 *
 * NOTE: This is in-memory only and will reset on server restart.
 * For production, consider using Redis or database storage.
 */
export class MessageTracker {
  private tracking = new Map<string, string>();

  /**
   * Get the last processed message ID for a user
   */
  getLastProcessed(userId: string): string | null {
    return this.tracking.get(userId) || null;
  }

  /**
   * Update the last processed message ID for a user
   */
  setLastProcessed(userId: string, messageId: string): void {
    this.tracking.set(userId, messageId);
  }

  /**
   * Remove tracking for a user (useful for testing or cleanup)
   */
  clear(userId: string): void {
    this.tracking.delete(userId);
  }

  /**
   * Clear all tracking (useful for testing)
   */
  clearAll(): void {
    this.tracking.clear();
  }

  /**
   * Get number of users being tracked
   */
  size(): number {
    return this.tracking.size;
  }
}
