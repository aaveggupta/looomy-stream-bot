import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { StreamStatus } from "@prisma/client";
import { getQuotaStatus } from "@/lib/quota";
import { logger } from "@/lib/logger";

/**
 * Monitoring endpoint - provides system health and metrics
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authorization
    const authHeader = req.headers.get("authorization");
    const isAuthorized =
      authHeader === `Bearer ${process.env.BOT_POLL_SECRET}`;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get active sessions count
    const activeSessions = await prisma.streamSession.count({
      where: { status: StreamStatus.ACTIVE },
    });

    // Get sessions by status
    const sessionsByStatus = await prisma.streamSession.groupBy({
      by: ["status"],
      _count: true,
    });

    // Get sessions by platform
    const sessionsByPlatform = await prisma.streamSession.groupBy({
      by: ["platform"],
      _count: true,
    });

    // Get recent activity (sessions polled in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentActivity = await prisma.streamSession.count({
      where: {
        status: StreamStatus.ACTIVE,
        lastPolledAt: {
          gte: oneHourAgo,
        },
      },
    });

    // Get total processed messages today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messagesToday = await prisma.processedMessage.count({
      where: {
        processedAt: {
          gte: today,
        },
      },
    });

    // Get quota status
    const quotaStatus = await getQuotaStatus();

    // Get active bot configs
    const activeBotConfigs = await prisma.botConfig.count({
      where: { isActive: true },
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      sessions: {
        active: activeSessions,
        byStatus: sessionsByStatus.reduce(
          (acc, item) => ({ ...acc, [item.status]: item._count }),
          {} as Record<string, number>
        ),
        byPlatform: sessionsByPlatform.reduce(
          (acc, item) => ({ ...acc, [item.platform]: item._count }),
          {} as Record<string, number>
        ),
        recentActivity,
      },
      messages: {
        processedToday: messagesToday,
      },
      quota: quotaStatus,
      bots: {
        active: activeBotConfigs,
      },
    });
  } catch (error) {
    logger.error({ error }, "Monitoring endpoint error");
    return NextResponse.json(
      {
        error: "Failed to get monitoring data",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}


