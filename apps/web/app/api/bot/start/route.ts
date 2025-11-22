import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@database/prisma";
import { getActiveLiveBroadcast } from "@/lib/youtube";

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

    // Check for active live broadcast
    const broadcast = await getActiveLiveBroadcast(user.youtubeRefreshToken);

    if (!broadcast?.liveChatId) {
      return NextResponse.json(
        { error: "No active live stream found. Start a live stream first." },
        { status: 400 }
      );
    }

    // Update bot config
    await prisma.botConfig.upsert({
      where: { userId },
      update: {
        isActive: true,
        liveChatId: broadcast.liveChatId,
      },
      create: {
        userId,
        isActive: true,
        liveChatId: broadcast.liveChatId,
      },
    });

    return NextResponse.json({
      success: true,
      broadcast: {
        title: broadcast.title,
        liveChatId: broadcast.liveChatId,
      },
    });
  } catch (error) {
    console.error("Start bot error:", error);
    return NextResponse.json(
      { error: "Failed to start bot" },
      { status: 500 }
    );
  }
}
