import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { discoverActiveStreams } from "@/lib/stream-discovery";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with YouTube credentials
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { documents: { where: { isEmbedded: true } } },
    });

    if (!user?.youtubeRefreshToken) {
      return NextResponse.json(
        { error: "YouTube not connected" },
        { status: 400 }
      );
    }

    if (user.documents.length === 0) {
      return NextResponse.json(
        { error: "No documents embedded. Upload documents first." },
        { status: 400 }
      );
    }

    // Update bot config to active
    await prisma.botConfig.upsert({
      where: { userId },
      update: {
        isActive: true,
      },
      create: {
        userId,
        isActive: true,
      },
    });

    // Trigger discovery to find active streams and create sessions
    // This will automatically create StreamSession records and start polling
    logger.info({ userId }, "Bot enabled - triggering stream discovery");
    await discoverActiveStreams();

    return NextResponse.json({
      success: true,
      message: "Bot enabled. Active streams will be discovered automatically.",
    });
  } catch (error) {
    logger.error({ error }, "Start bot error");
    return NextResponse.json(
      { error: "Failed to start bot" },
      { status: 500 }
    );
  }
}
