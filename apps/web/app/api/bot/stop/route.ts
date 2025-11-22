import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@database/prisma";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.botConfig.updateMany({
      where: { userId },
      data: {
        isActive: false,
        liveChatId: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Stop bot error:", error);
    return NextResponse.json(
      { error: "Failed to stop bot" },
      { status: 500 }
    );
  }
}
