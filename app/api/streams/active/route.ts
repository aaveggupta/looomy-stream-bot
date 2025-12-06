import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { StreamStatus } from "@prisma/client";
import { logger } from "@/lib/logger";

/**
 * GET /api/streams/active
 * Returns all active stream sessions for the current user.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's bot config for limits
    const botConfig = await prisma.botConfig.findUnique({
      where: { userId },
    });

    // Get all active sessions with message counts
    const activeSessions = await prisma.streamSession.findMany({
      where: {
        userId,
        status: StreamStatus.ACTIVE,
      },
      orderBy: {
        startedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        platform: true,
        status: true,
        startedAt: true,
        lastPolledAt: true,
        messageCount: true,
        pollingIntervalMillis: true,
        externalBroadcastId: true,
      },
    });

    // Get recent ended sessions (last 24 hours) for history
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEndedSessions = await prisma.streamSession.findMany({
      where: {
        userId,
        status: StreamStatus.ENDED,
        endedAt: {
          gte: twentyFourHoursAgo,
        },
      },
      orderBy: {
        endedAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        platform: true,
        status: true,
        startedAt: true,
        endedAt: true,
        messageCount: true,
      },
    });

    return NextResponse.json({
      success: true,
      activeSessions,
      recentEndedSessions,
      limits: {
        current: activeSessions.length,
        max: botConfig?.maxConcurrentStreams ?? 3,
      },
    });
  } catch (error) {
    logger.error({ error }, "Get active streams error");
    return NextResponse.json(
      { error: "Failed to fetch active streams" },
      { status: 500 }
    );
  }
}
