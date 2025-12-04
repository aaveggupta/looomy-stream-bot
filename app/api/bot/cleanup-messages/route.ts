import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * Cleanup endpoint - deletes ProcessedMessage records older than retention period
 * Should run daily via cron
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify authorization
    const authHeader = req.headers.get("authorization");
    const userAgent = req.headers.get("user-agent") || "";
    const isVercelCron = userAgent.includes("vercel-cron");
    const isAuthorized = authHeader === `Bearer ${process.env.BOT_POLL_SECRET}`;

    if (!isVercelCron && !isAuthorized) {
      logger.warn("Unauthorized cleanup request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.info("Starting message cleanup job");

    // Get all bot configs to determine retention periods
    const configs = await prisma.botConfig.findMany({
      select: {
        userId: true,
        messageRetentionDays: true,
      },
    });

    let totalDeleted = 0;

    for (const config of configs) {
      const retentionDate = new Date();
      retentionDate.setDate(
        retentionDate.getDate() - config.messageRetentionDays
      );

      // Get sessions for this user
      const sessions = await prisma.streamSession.findMany({
        where: { userId: config.userId },
        select: { id: true },
      });

      const sessionIds = sessions.map((s) => s.id);

      if (sessionIds.length === 0) continue;

      // Delete expired messages
      const result = await prisma.processedMessage.deleteMany({
        where: {
          streamSessionId: { in: sessionIds },
          expiresAt: { lt: retentionDate },
        },
      });

      totalDeleted += result.count;
    }

    // Also delete messages from sessions that no longer exist (orphaned)
    // Get all stream session IDs that exist
    const existingSessionIds = await prisma.streamSession.findMany({
      select: { id: true },
    });
    const existingIds = existingSessionIds.map((s) => s.id);

    // Delete messages that don't belong to any existing session
    if (existingIds.length > 0) {
      const orphanedResult = await prisma.processedMessage.deleteMany({
        where: {
          streamSessionId: {
            notIn: existingIds,
          },
        },
      });
      totalDeleted += orphanedResult.count;
    } else {
      // If no sessions exist, we could delete all messages, but that's probably not desired
      // So we'll skip orphaned cleanup in this case
    }

    const duration = Date.now() - startTime;
    logger.info({ totalDeleted, duration }, "Message cleanup job completed");

    return NextResponse.json({
      success: true,
      deletedCount: totalDeleted,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error }, "Message cleanup job failed");
    return NextResponse.json(
      {
        error: "Cleanup failed",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
