import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { StreamStatus } from "@prisma/client";
import { getAdapter } from "@/lib/adapters";
import { schedulePollJob } from "@/lib/qstash";
import { calculateNextPollingInterval } from "@/lib/adaptive-polling";
import { trackApiUsage, shouldEnableBackoff } from "@/lib/quota";
import { logger } from "@/lib/logger";
import { processMessage } from "@/lib/message-processor";

/**
 * Per-stream polling endpoint
 * Called by QStash for each active StreamSession
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const sessionId = params.sessionId;
  const startTime = Date.now();

  try {
    // Verify authorization
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.BOT_POLL_SECRET}`) {
      logger.warn({ sessionId }, "Unauthorized poll request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get session with user and bot config
    const session = await prisma.streamSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          include: {
            botConfig: true,
          },
        },
      },
    });

    if (!session) {
      logger.warn({ sessionId }, "Session not found");
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if session is active
    if (session.status !== StreamStatus.ACTIVE) {
      logger.info(
        { sessionId, status: session.status },
        "Skipping poll - session not active"
      );
      return NextResponse.json({
        skipped: true,
        reason: "Session not active",
        status: session.status,
      });
    }

    // Check if bot is still active
    if (!session.user.botConfig?.isActive) {
      logger.info({ sessionId }, "Bot disabled - marking session as ended");
      await prisma.streamSession.update({
        where: { id: sessionId },
        data: {
          status: StreamStatus.ENDED,
          endedAt: new Date(),
        },
      });
      return NextResponse.json({ skipped: true, reason: "Bot disabled" });
    }

    // Check quota backoff
    const backoffEnabled = await shouldEnableBackoff();
    if (backoffEnabled) {
      logger.warn({ sessionId }, "Quota backoff enabled - skipping poll");
      // Still schedule next poll but with longer delay
      await schedulePollJob(sessionId, session.pollingIntervalMillis * 2);
      return NextResponse.json({ skipped: true, reason: "Quota backoff" });
    }

    const adapter = getAdapter(session.platform);

    // Poll messages
    const pollResult = await adapter.pollMessages(
      {
        externalChatId: session.externalChatId,
        platform: session.platform,
        lastPageToken: session.lastPageToken || undefined,
      },
      {
        id: session.userId,
        platformRefreshToken: session.user.youtubeRefreshToken || undefined,
        platformChannelId: session.user.youtubeChannelId || undefined,
      }
    );

    // Track API usage
    await trackApiUsage(1, 0.001); // Estimate 0.001 per poll

    const messages = pollResult.messages || [];
    const hasMessages = messages.length > 0;

    logger.info(
      {
        sessionId,
        messageCount: messages.length,
        hasMessages,
      },
      `Polled ${messages.length} message(s)`
    );

    // Process messages
    let processedCount = 0;
    let repliedCount = 0;

    if (hasMessages && session.user.botConfig) {
      for (const message of messages) {
        try {
          const result = await processMessage(
            session,
            message,
            session.user.botConfig
          );

          if (result.processed) {
            processedCount++;
          }
          if (result.replied) {
            repliedCount++;
          }
        } catch (error) {
          logger.error(
            { sessionId, messageId: message.id, error },
            "Error processing message"
          );
        }
      }
    }

    // Update session
    const consecutiveEmptyPolls = hasMessages
      ? 0
      : session.consecutiveEmptyPolls + 1;

    const nextInterval = calculateNextPollingInterval(
      session.pollingIntervalMillis,
      consecutiveEmptyPolls,
      pollResult.pollingIntervalMillis
    );

    await prisma.streamSession.update({
      where: { id: sessionId },
      data: {
        lastPolledAt: new Date(),
        lastPageToken: pollResult.nextPageToken || null,
        pollingIntervalMillis: nextInterval,
        consecutiveEmptyPolls,
        messageCount: {
          increment: messages.length,
        },
        // Update lastProcessedMessageId if we have messages
        ...(messages.length > 0 && {
          lastProcessedMessageId: messages[messages.length - 1].id,
        }),
      },
    });

    // Schedule next poll
    await schedulePollJob(sessionId, nextInterval);

    const duration = Date.now() - startTime;
    logger.info(
      {
        sessionId,
        duration,
        messagesReceived: messages.length,
        processedCount,
        repliedCount,
        nextInterval,
      },
      "Poll completed"
    );

    return NextResponse.json({
      success: true,
      sessionId,
      messagesReceived: messages.length,
      processedCount,
      repliedCount,
      nextInterval,
      duration: `${duration}ms`,
    });
  } catch (error) {
    logger.error({ sessionId, error }, "Poll failed");

    // Check if this is a liveChatEnded error (stream ended)
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorObj = error as any;
    const isLiveChatEnded =
      errorMessage.includes("liveChatEnded") ||
      errorMessage.includes("live chat is no longer live") ||
      errorObj?.code === 403 ||
      (errorObj?.errors &&
        Array.isArray(errorObj.errors) &&
        errorObj.errors.some(
          (e: any) =>
            e.reason === "liveChatEnded" ||
            e.message?.includes("live chat is no longer live")
        ));

    // Handle live chat ended - mark session as ENDED and stop polling
    if (isLiveChatEnded) {
      try {
        await prisma.streamSession.update({
          where: { id: sessionId },
          data: {
            status: StreamStatus.ENDED,
            endedAt: new Date(),
          },
        });
        logger.info(
          { sessionId },
          "Live chat ended - marked session as ENDED and stopped polling"
        );
        return NextResponse.json({
          success: true,
          sessionId,
          ended: true,
          reason: "Live chat ended",
          message: "Session ended - live chat is no longer live",
        });
      } catch (updateError) {
        logger.error(
          { sessionId, error: updateError },
          "Failed to update session status to ENDED"
        );
        return NextResponse.json(
          {
            error: "Poll failed - live chat ended",
            message: errorMessage,
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }
    }

    // Determine if this is a critical error that should mark session as ERROR
    const isCriticalError =
      errorMessage.includes("unauthorized") ||
      (errorMessage.includes("forbidden") && !isLiveChatEnded) ||
      errorMessage.includes("invalid") ||
      errorMessage.includes("token") ||
      errorMessage.includes("credentials");

    // Only mark as ERROR for critical failures, not transient errors
    if (isCriticalError) {
      try {
        await prisma.streamSession.update({
          where: { id: sessionId },
          data: {
            status: StreamStatus.ERROR,
          },
        });
        logger.warn(
          { sessionId, error: errorMessage },
          "Marked session as ERROR due to critical failure"
        );
      } catch (updateError) {
        logger.error(
          { sessionId, error: updateError },
          "Failed to update session status"
        );
      }
    } else {
      // Transient error - log but don't mark as ERROR
      // Next poll will retry, discovery will reactivate if needed
      logger.warn(
        { sessionId, error: errorMessage },
        "Poll failed with transient error - will retry on next poll"
      );
    }

    return NextResponse.json(
      {
        error: "Poll failed",
        message: errorMessage,
        critical: isCriticalError,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
