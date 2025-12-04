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


