import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const streamId = searchParams.get("streamId");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      streamSession: {
        userId,
      },
    };

    // Filter by stream if provided
    if (streamId) {
      where.streamSessionId = streamId;
    }

    // Add search filter if provided
    if (search) {
      where.OR = [
        { authorName: { contains: search, mode: "insensitive" } },
        { messageText: { contains: search, mode: "insensitive" } },
        { botReply: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch messages with pagination
    const [messages, totalCount] = await Promise.all([
      prisma.processedMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          processedAt: "desc",
        },
        select: {
          id: true,
          messageId: true,
          authorName: true,
          messageText: true,
          question: true,
          botReply: true,
          processedAt: true,
        },
      }),
      prisma.processedMessage.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    logger.error({ error }, "Logs GET error");
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
