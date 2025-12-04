import {
  PlatformAdapter,
  ActiveStream,
  PlatformMessage,
  PollMessagesResult,
  AdapterUser,
} from "./types";
import { Platform } from "@prisma/client";
import {
  getActiveLiveBroadcast,
  getLiveChatMessages,
  sendLiveChatMessageAsBot,
} from "@/lib/youtube";
import { logger } from "@/lib/logger";

/**
 * YouTube platform adapter implementation
 */
export class YouTubeAdapter implements PlatformAdapter {
  async getActiveStreamsForUser(user: AdapterUser): Promise<ActiveStream[]> {
    if (!user.platformRefreshToken) {
      logger.warn({ userId: user.id }, "No YouTube refresh token for user");
      return [];
    }

    try {
      const broadcast = await getActiveLiveBroadcast(user.platformRefreshToken);

      if (!broadcast || !broadcast.liveChatId) {
        return [];
      }

      return [
        {
          externalBroadcastId: broadcast.id,
          externalChatId: broadcast.liveChatId,
          title: broadcast.title,
        },
      ];
    } catch (error) {
      logger.error(
        { userId: user.id, error },
        "Error fetching active YouTube streams"
      );
      return [];
    }
  }

  async pollMessages(
    session: {
      externalChatId: string;
      platform: Platform;
      lastPageToken?: string;
    },
    user: AdapterUser
  ): Promise<PollMessagesResult> {
    if (!user.platformRefreshToken) {
      throw new Error("No YouTube refresh token available");
    }

    if (session.platform !== Platform.YOUTUBE) {
      throw new Error("Invalid platform for YouTube adapter");
    }

    const result = await getLiveChatMessages(
      user.platformRefreshToken,
      session.externalChatId,
      session.lastPageToken
    );

    const messages: PlatformMessage[] = (result.messages || [])
      .filter((msg) => msg.id != null)
      .map((msg) => {
        // Remove @ prefix from displayName if present (to avoid @@username)
        const rawAuthorName = msg.authorDetails?.displayName || "Unknown";
        const authorName = rawAuthorName.startsWith("@")
          ? rawAuthorName.slice(1)
          : rawAuthorName;

        return {
          id: msg.id!,
          text: msg.snippet?.textMessageDetails?.messageText || "",
          authorName,
          timestamp: msg.snippet?.publishedAt
            ? new Date(msg.snippet.publishedAt)
            : undefined,
        };
      });

    return {
      messages,
      nextPageToken: result.nextPageToken,
      pollingIntervalMillis: result.pollingIntervalMillis || 5000,
    };
  }

  async sendMessage(
    session: {
      externalChatId: string;
      platform: Platform;
    },
    text: string
  ): Promise<void> {
    if (session.platform !== Platform.YOUTUBE) {
      throw new Error("Invalid platform for YouTube adapter");
    }

    await sendLiveChatMessageAsBot(session.externalChatId, text);
  }
}

// Export singleton instance
export const youtubeAdapter = new YouTubeAdapter();


