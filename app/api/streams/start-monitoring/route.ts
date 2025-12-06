import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Platform, StreamStatus, BotConfig } from "@prisma/client";
import { getAdapter } from "@/lib/adapters";
import { schedulePollJob } from "@/lib/qstash";
import { logger } from "@/lib/logger";
import { decryptIfEncrypted } from "@/lib/encryption";

/**
 * Generate a welcome message for the bot to send when monitoring starts
 * Note: YouTube chat has a 300 character limit
 */
function generateWelcomeMessage(botConfig: BotConfig): string {
  const botName = botConfig.botName || "Looomy";
  const triggerPhrase = botConfig.triggerPhrase || "@looomybot";

  return `👋 Hi! I'm ${botName}, your AI assistant. Type ${triggerPhrase} + your question and I'll help!`;
}

/**
 * POST /api/streams/start-monitoring
 * Instantly discovers live streams and starts monitoring them.
 * Returns the list of streams that were found and started monitoring.
 */
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with YouTube credentials and bot config
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        botConfig: true,
        documents: { where: { isEmbedded: true } },
      },
    });

    if (!user?.youtubeRefreshToken) {
      return NextResponse.json(
        {
          error:
            "YouTube not connected. Please connect your YouTube channel first.",
        },
        { status: 400 }
      );
    }

    if (!user.documents || user.documents.length === 0) {
      return NextResponse.json(
        {
          error:
            "No documents embedded. Please upload and embed documents first.",
        },
        { status: 400 }
      );
    }

    // Ensure bot config exists and is active
    const botConfig = await prisma.botConfig.upsert({
      where: { userId },
      update: { isActive: true },
      create: { userId, isActive: true },
    });

    // Check concurrent stream limit
    const activeSessionCount = await prisma.streamSession.count({
      where: {
        userId,
        status: StreamStatus.ACTIVE,
      },
    });

    if (activeSessionCount >= botConfig.maxConcurrentStreams) {
      return NextResponse.json(
        {
          error: `Maximum concurrent streams reached (${botConfig.maxConcurrentStreams}). Stop monitoring an existing stream first.`,
          activeStreams: activeSessionCount,
          maxConcurrentStreams: botConfig.maxConcurrentStreams,
        },
        { status: 400 }
      );
    }

    // Discover active streams from YouTube
    const platform = Platform.YOUTUBE;
    const adapter = getAdapter(platform);

    // Decrypt the refresh token
    const decryptedRefreshToken = decryptIfEncrypted(user.youtubeRefreshToken);

    const activeStreams = await adapter.getActiveStreamsForUser({
      id: userId,
      platformRefreshToken: decryptedRefreshToken,
      platformChannelId: user.youtubeChannelId || undefined,
    });

    if (activeStreams.length === 0) {
      return NextResponse.json(
        {
          error:
            "No live streams found. Make sure you are currently streaming on YouTube.",
          success: false,
        },
        { status: 404 }
      );
    }

    const createdSessions = [];
    const reactivatedSessions = [];
    const existingSessions = [];

    for (const stream of activeStreams) {
      // Check if we've hit the limit
      const currentActiveCount = await prisma.streamSession.count({
        where: {
          userId,
          status: StreamStatus.ACTIVE,
        },
      });

      if (currentActiveCount >= botConfig.maxConcurrentStreams) {
        logger.info(
          { userId, maxConcurrent: botConfig.maxConcurrentStreams },
          "Reached max concurrent streams during discovery"
        );
        break;
      }

      // Check if session already exists
      const existingSession = await prisma.streamSession.findUnique({
        where: {
          platform_externalBroadcastId: {
            platform,
            externalBroadcastId: stream.externalBroadcastId,
          },
        },
      });

      if (existingSession) {
        if (existingSession.status === StreamStatus.ACTIVE) {
          // Already monitoring this stream
          existingSessions.push({
            id: existingSession.id,
            title: existingSession.title,
            status: "already_monitoring",
          });
          continue;
        }

        // Reactivate ended/paused/error session
        const reactivated = await prisma.streamSession.update({
          where: { id: existingSession.id },
          data: {
            status: StreamStatus.ACTIVE,
            endedAt: null,
            consecutiveEmptyPolls: 0,
            title: stream.title, // Update title in case it changed
          },
        });

        // Schedule polling
        try {
          await schedulePollJob(reactivated.id, 0);
        } catch (qstashError) {
          logger.error(
            { sessionId: reactivated.id, error: qstashError },
            "Failed to schedule poll for reactivated session"
          );
        }

        // Send welcome message to chat
        try {
          const welcomeMessage = generateWelcomeMessage(botConfig);
          await adapter.sendMessage(
            { externalChatId: stream.externalChatId, platform },
            welcomeMessage
          );
          logger.info(
            { sessionId: reactivated.id },
            "Sent welcome message for reactivated session"
          );
        } catch (welcomeError) {
          logger.error(
            { sessionId: reactivated.id, error: welcomeError },
            "Failed to send welcome message for reactivated session"
          );
          // Don't fail the whole operation if welcome message fails
        }

        reactivatedSessions.push({
          id: reactivated.id,
          title: reactivated.title,
          status: "reactivated",
        });

        logger.info(
          { sessionId: reactivated.id, previousStatus: existingSession.status },
          "Reactivated stream session via start-monitoring"
        );
        continue;
      }

      // Create new session
      const session = await prisma.streamSession.create({
        data: {
          userId,
          platform,
          externalBroadcastId: stream.externalBroadcastId,
          externalChatId: stream.externalChatId,
          title: stream.title,
          status: StreamStatus.ACTIVE,
          pollingIntervalMillis: 5000,
        },
      });

      // Schedule first poll immediately
      try {
        await schedulePollJob(session.id, 0);
      } catch (qstashError) {
        logger.error(
          { sessionId: session.id, error: qstashError },
          "Failed to schedule poll for new session"
        );
      }

      // Send welcome message to chat
      try {
        const welcomeMessage = generateWelcomeMessage(botConfig);
        await adapter.sendMessage(
          { externalChatId: stream.externalChatId, platform },
          welcomeMessage
        );
        logger.info(
          { sessionId: session.id },
          "Sent welcome message for new session"
        );
      } catch (welcomeError) {
        logger.error(
          { sessionId: session.id, error: welcomeError },
          "Failed to send welcome message for new session"
        );
        // Don't fail the whole operation if welcome message fails
      }

      createdSessions.push({
        id: session.id,
        title: session.title,
        status: "started",
      });

      logger.info(
        { sessionId: session.id, userId, title: stream.title },
        "Created new stream session via start-monitoring"
      );
    }

    const allSessions = [
      ...createdSessions,
      ...reactivatedSessions,
      ...existingSessions,
    ];

    return NextResponse.json({
      success: true,
      message:
        createdSessions.length > 0 || reactivatedSessions.length > 0
          ? "Stream monitoring started successfully"
          : "All discovered streams are already being monitored",
      streams: allSessions,
      summary: {
        created: createdSessions.length,
        reactivated: reactivatedSessions.length,
        alreadyMonitoring: existingSessions.length,
      },
    });
  } catch (error) {
    logger.error({ error }, "Start monitoring error");
    return NextResponse.json(
      { error: "Failed to start monitoring. Please try again." },
      { status: 500 }
    );
  }
}
