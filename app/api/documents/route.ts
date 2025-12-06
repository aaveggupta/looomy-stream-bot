import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        filename: true,
        isEmbedded: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    logger.error({ error }, "Get documents error");
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
