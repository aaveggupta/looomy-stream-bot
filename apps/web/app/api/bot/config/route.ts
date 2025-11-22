import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@database/prisma";
import { z } from "zod";

const configSchema = z.object({
  botName: z.string().min(1).max(50),
  triggerPhrase: z.string().min(1).max(50),
});

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

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = configSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid config data" },
        { status: 400 }
      );
    }

    const config = await prisma.botConfig.upsert({
      where: { userId },
      update: {
        botName: parsed.data.botName,
        triggerPhrase: parsed.data.triggerPhrase,
      },
      create: {
        userId,
        botName: parsed.data.botName,
        triggerPhrase: parsed.data.triggerPhrase,
      },
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Update config error:", error);
    return NextResponse.json(
      { error: "Failed to update config" },
      { status: 500 }
    );
  }
}
