import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { StreamStatus } from "@prisma/client";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Deactivate bot config
    await prisma.botConfig.updateMany({
      where: { userId },
      data: {
        isActive: false,
        liveChatId: null, // Keep for backward compatibility
      },
    });

    // Mark all active sessions as ENDED
    const result = await prisma.streamSession.updateMany({
      where: {
        userId,
        status: StreamStatus.ACTIVE,
      },
      data: {
        status: StreamStatus.ENDED,
        endedAt: new Date(),
      },
    });

    logger.info(
      { userId, endedSessions: result.count },
      "Bot disabled - ended all active sessions"
    );

    return NextResponse.json({
      success: true,
      endedSessions: result.count,
    });
  } catch (error) {
    logger.error({ error }, "Stop bot error");
    return NextResponse.json(
      { error: "Failed to stop bot" },
      { status: 500 }
    );
  }
}
