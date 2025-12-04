import { Platform, StreamStatus } from "@prisma/client";

/**
 * Represents an active stream/broadcast on a platform
 */
export interface ActiveStream {
  externalBroadcastId: string;
  externalChatId: string;
  title: string;
}

/**
 * Represents a message from a platform's chat
 */
export interface PlatformMessage {
  id: string;
  text: string;
  authorName: string;
  timestamp?: Date;
}

/**
 * Result of polling messages from a platform
 */
export interface PollMessagesResult {
  messages: PlatformMessage[];
  nextPageToken?: string;
  pollingIntervalMillis: number; // Platform's recommended polling interval
}

/**
 * User context for adapter operations
 */
export interface AdapterUser {
  id: string;
  platformRefreshToken?: string; // Platform-specific refresh token
  platformChannelId?: string;
}

/**
 * Platform adapter interface
 * Each platform (YouTube, Twitch, etc.) must implement this interface
 */
export interface PlatformAdapter {
  /**
   * Get all active streams for a user
   * @param user User context with platform credentials
   * @returns Array of active streams
   */
  getActiveStreamsForUser(user: AdapterUser): Promise<ActiveStream[]>;

  /**
   * Poll messages from a stream's chat
   * @param session Stream session with platform-specific IDs
   * @param pageToken Optional pagination token
   * @returns Messages and polling metadata
   */
  pollMessages(
    session: {
      externalChatId: string;
      platform: Platform;
      lastPageToken?: string;
    },
    user: AdapterUser
  ): Promise<PollMessagesResult>;

  /**
   * Send a message to a stream's chat
   * @param session Stream session with platform-specific IDs
   * @param text Message text to send
   * @param user User context (may not be needed if bot uses its own credentials)
   */
  sendMessage(
    session: {
      externalChatId: string;
      platform: Platform;
    },
    text: string
  ): Promise<void>;
}


