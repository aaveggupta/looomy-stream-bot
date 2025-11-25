import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@database/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let config = await prisma.botConfig.findUnique({
      where: { userId },
    });

    if (!config) {
      config = await prisma.botConfig.create({
        data: { userId },
      });
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Get config error:", error);
    return NextResponse.json(
      { error: "Failed to fetch config" },
      { status: 500 }
    );
  }
}

// Bot name and trigger phrase are now fixed and cannot be changed by users
// Defaults: botName = "Looomy", triggerPhrase = "@looomybot"
