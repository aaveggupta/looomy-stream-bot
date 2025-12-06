import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clear YouTube credentials
    await prisma.user.update({
      where: { id: userId },
      data: {
        youtubeRefreshToken: null,
        youtubeChannelId: null,
        youtubeChannelName: null,
      },
    });

    // Stop bot if running
    await prisma.botConfig.updateMany({
      where: { userId },
      data: {
        isActive: false,
        liveChatId: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, "YouTube disconnect error");
    return NextResponse.json(
      { error: "Failed to disconnect YouTube" },
      { status: 500 }
    );
  }
}
