import { Platform } from "@prisma/client";
import { PlatformAdapter } from "./types";
import { youtubeAdapter } from "./youtube-adapter";

/**
 * Get the appropriate adapter for a platform
 */
export function getAdapter(platform: Platform): PlatformAdapter {
  switch (platform) {
    case Platform.YOUTUBE:
      return youtubeAdapter;
    case Platform.TWITCH:
      throw new Error("Twitch adapter not yet implemented");
    case Platform.DISCORD:
      throw new Error("Discord adapter not yet implemented");
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

export * from "./types";
export * from "./youtube-adapter";


