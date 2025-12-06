import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BotPersonality } from "@prisma/client";
import { logger } from "@/lib/logger";

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
    logger.error({ error }, "Get config error");
    return NextResponse.json(
      { error: "Failed to fetch config" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { personality } = body;

    // Validate personality
    if (personality && !Object.values(BotPersonality).includes(personality)) {
      return NextResponse.json(
        { error: "Invalid personality" },
        { status: 400 }
      );
    }

    // Update config
    const config = await prisma.botConfig.update({
      where: { userId },
      data: { personality },
    });

    return NextResponse.json({ config });
  } catch (error) {
    logger.error({ error }, "Update config error");
    return NextResponse.json(
      { error: "Failed to update config" },
      { status: 500 }
    );
  }
}

// Bot name and trigger phrase are now fixed and cannot be changed by users
// Defaults: botName = "Looomy", triggerPhrase = "@looomybot"
