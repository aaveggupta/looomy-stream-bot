import { Client } from "@upstash/qstash";
import { logger } from "./logger";

let qstashClient: Client | null = null;

export function getQStashClient(): Client {
  if (!qstashClient) {
    const token = process.env.QSTASH_TOKEN;
    if (!token) {
      throw new Error("QSTASH_TOKEN environment variable is required");
    }
    qstashClient = new Client({ token });
  }
  return qstashClient;
}

/**
 * Schedule a polling job for a stream session
 * @param sessionId Stream session ID
 * @param delayMillis Delay before first execution (in milliseconds)
 */
export async function schedulePollJob(
  sessionId: string,
  delayMillis: number
): Promise<void> {
  const client = getQStashClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}/api/bot/poll-stream/${sessionId}`;

  try {
    await client.publishJSON({
      url,
      body: {},
      delay: Math.max(0, Math.floor(delayMillis / 1000)), // QStash uses seconds
      headers: {
        Authorization: `Bearer ${process.env.BOT_POLL_SECRET}`,
      },
    });

    logger.info(
      { sessionId, delayMillis, url },
      "Scheduled polling job for stream session"
    );
  } catch (error) {
    logger.error({ sessionId, error }, "Failed to schedule polling job");
    throw error;
  }
}

/**
 * Cancel all pending jobs for a stream session
 * @param sessionId Stream session ID
 */
export async function cancelPollJobs(sessionId: string): Promise<void> {
  // Note: QStash doesn't have a direct way to cancel by URL pattern
  // This would require storing message IDs or using a different approach
  // For now, we'll rely on the endpoint checking session status
  logger.info({ sessionId }, "Poll jobs will be cancelled when session ends");
}

export interface MessageJobPayload {
  sessionId: string;
  messageId: string;
  authorName: string;
  messageText: string;
  question: string;
  embedding: number[];
  botConfig: {
    botName: string;
    personality: string;
    triggerPhrase: string;
    messageRetentionDays: number;
  };
  userId: string;
  platform: string;
  externalChatId: string;
}

/**
 * Publish individual message processing jobs to QStash for parallel processing
 * @param messages Array of message job payloads
 */
export async function publishMessageJobs(
  messages: MessageJobPayload[]
): Promise<void> {
  if (messages.length === 0) return;

  const client = getQStashClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}/api/bot/process-message`;

  // Use QStash batch API for efficiency
  const batchMessages = messages.map((msg) => ({
    url, // QStash uses 'url' not 'destination'
    body: msg, // batchJSON auto-serializes the body
    headers: {
      Authorization: `Bearer ${process.env.BOT_POLL_SECRET}`,
      "Content-Type": "application/json",
    },
  }));

  try {
    await client.batchJSON(batchMessages);
    logger.info(
      { count: messages.length },
      "Published message processing jobs to QStash"
    );
  } catch (error) {
    // Log without embeddings to avoid huge log messages
    const messagesWithoutEmbeddings = messages.map(({ embedding, ...rest }) => ({
      ...rest,
      embeddingLength: embedding?.length,
    }));
    logger.error(
      { error, count: messages.length, messages: messagesWithoutEmbeddings },
      "Failed to publish message jobs"
    );
    throw error;
  }
}


