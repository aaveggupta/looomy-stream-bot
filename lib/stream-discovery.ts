import { prisma } from "./db";
import { Platform, StreamStatus } from "@prisma/client";
import { getAdapter } from "./adapters";
import { schedulePollJob } from "./qstash";
import { logger } from "./logger";

/**
 * Discover active streams for all users with active bot configs
 * Creates StreamSession records for new streams
 */
export async function discoverActiveStreams(): Promise<void> {
  logger.info("Starting stream discovery");

  // Get all users with active bot configs
  const activeConfigs = await prisma.botConfig.findMany({
    where: { isActive: true },
    include: {
      user: true,
    },
  });

  logger.info(`Found ${activeConfigs.length} active bot config(s)`);

  let discoveredCount = 0;
  let createdCount = 0;

  for (const config of activeConfigs) {
    const user = config.user;

    // Check user's concurrent stream limit
    const activeSessionCount = await prisma.streamSession.count({
      where: {
        userId: user.id,
        status: StreamStatus.ACTIVE,
      },
    });

    if (activeSessionCount >= config.maxConcurrentStreams) {
      logger.info(
        {
          userId: user.id,
          activeSessions: activeSessionCount,
          maxConcurrent: config.maxConcurrentStreams,
        },
        "User has reached max concurrent streams limit"
      );
      continue;
    }

    // For now, only support YouTube
    // In the future, we can iterate over multiple platforms
    const platform = Platform.YOUTUBE;

    if (!user.youtubeRefreshToken) {
      logger.warn({ userId: user.id }, "User missing YouTube refresh token");
      continue;
    }

    try {
      const adapter = getAdapter(platform);
      const activeStreams = await adapter.getActiveStreamsForUser({
        id: user.id,
        platformRefreshToken: user.youtubeRefreshToken,
        platformChannelId: user.youtubeChannelId || undefined,
      });

      discoveredCount += activeStreams.length;

      for (const stream of activeStreams) {
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
          // Update status if it was ended/paused/error but stream is still live
          if (
            existingSession.status === StreamStatus.ENDED ||
            existingSession.status === StreamStatus.PAUSED ||
            existingSession.status === StreamStatus.ERROR
          ) {
            await prisma.streamSession.update({
              where: { id: existingSession.id },
              data: {
                status: StreamStatus.ACTIVE,
                endedAt: null,
                consecutiveEmptyPolls: 0, // Reset on reactivation
              },
            });
            logger.info(
              {
                sessionId: existingSession.id,
                previousStatus: existingSession.status,
              },
              "Reactivated existing stream session"
            );

            // Schedule a poll if session was reactivated
            try {
              await schedulePollJob(existingSession.id, 0);
              logger.info(
                { sessionId: existingSession.id },
                "Scheduled poll for reactivated session"
              );
            } catch (qstashError) {
              logger.error(
                {
                  sessionId: existingSession.id,
                  error: qstashError,
                },
                "Failed to schedule poll for reactivated session"
              );
            }
          }
          continue;
        }

        // Create new session
        const session = await prisma.streamSession.create({
          data: {
            userId: user.id,
            platform,
            externalBroadcastId: stream.externalBroadcastId,
            externalChatId: stream.externalChatId,
            title: stream.title,
            status: StreamStatus.ACTIVE,
            pollingIntervalMillis: 5000, // Start with default interval
          },
        });

        createdCount++;

        logger.info(
          {
            sessionId: session.id,
            userId: user.id,
            platform,
            broadcastId: stream.externalBroadcastId,
            title: stream.title,
          },
          "Created new stream session"
        );

        // Schedule first poll immediately
        try {
          await schedulePollJob(session.id, 0);
          logger.info(
            { sessionId: session.id },
            "Successfully scheduled QStash polling job"
          );
        } catch (qstashError) {
          // Log QStash errors but don't fail discovery - polling can be done manually
          logger.error(
            {
              sessionId: session.id,
              error: qstashError,
              message:
                "Failed to schedule QStash job. Polling can be triggered manually.",
            },
            "QStash scheduling failed"
          );
          // Don't throw - allow discovery to complete
        }
      }
    } catch (error) {
      logger.error(
        { userId: user.id, platform, error },
        "Error discovering streams for user"
      );
    }
  }

  logger.info({ discoveredCount, createdCount }, "Stream discovery completed");
}

/**
 * Mark sessions as ENDED if they haven't been polled in >15 minutes
 * and verify they're still live
 */
export async function cleanupStaleSessions(): Promise<void> {
  logger.info("Starting stale session cleanup");

  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  const staleSessions = await prisma.streamSession.findMany({
    where: {
      status: StreamStatus.ACTIVE,
      lastPolledAt: {
        lt: fifteenMinutesAgo,
      },
    },
    include: {
      user: true,
    },
  });

  logger.info(`Found ${staleSessions.length} potentially stale session(s)`);

  for (const session of staleSessions) {
    try {
      const adapter = getAdapter(session.platform);

      // Verify if stream is still live
      const activeStreams = await adapter.getActiveStreamsForUser({
        id: session.userId,
        platformRefreshToken: session.user.youtubeRefreshToken || undefined,
        platformChannelId: session.user.youtubeChannelId || undefined,
      });

      const isStillLive = activeStreams.some(
        (stream) => stream.externalBroadcastId === session.externalBroadcastId
      );

      if (!isStillLive) {
        await prisma.streamSession.update({
          where: { id: session.id },
          data: {
            status: StreamStatus.ENDED,
            endedAt: new Date(),
          },
        });

        logger.info(
          { sessionId: session.id },
          "Marked session as ENDED (stream no longer live)"
        );
      } else {
        // Stream is still live but polling stopped - log warning
        logger.warn(
          { sessionId: session.id, lastPolledAt: session.lastPolledAt },
          "Session is stale but stream is still live - polling may have stopped"
        );
      }
    } catch (error) {
      logger.error(
        { sessionId: session.id, error },
        "Error verifying stale session"
      );
    }
  }
}
