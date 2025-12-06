import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { StreamStatus } from "@prisma/client";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

/**
 * POST /api/streams/[sessionId]/stop
 * Stops monitoring a specific stream session.
 */
export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    // Find the session and verify ownership
    const session = await prisma.streamSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Stream session not found" },
        { status: 404 }
      );
    }

    if (session.userId !== userId) {
      return NextResponse.json(
        { error: "You do not have permission to stop this stream" },
        { status: 403 }
      );
    }

    if (session.status !== StreamStatus.ACTIVE) {
      return NextResponse.json(
        {
          error: "Stream is not currently being monitored",
          currentStatus: session.status,
        },
        { status: 400 }
      );
    }

    // End the session
    const updatedSession = await prisma.streamSession.update({
      where: { id: sessionId },
      data: {
        status: StreamStatus.ENDED,
        endedAt: new Date(),
      },
    });

    logger.info(
      { sessionId, userId, title: session.title },
      "Stream monitoring stopped by user"
    );

    return NextResponse.json({
      success: true,
      message: "Stream monitoring stopped",
      session: {
        id: updatedSession.id,
        title: updatedSession.title,
        status: updatedSession.status,
        endedAt: updatedSession.endedAt,
      },
    });
  } catch (error) {
    logger.error({ error }, "Stop monitoring error");
    return NextResponse.json(
      { error: "Failed to stop monitoring" },
      { status: 500 }
    );
  }
}
