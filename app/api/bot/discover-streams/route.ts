import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { discoverActiveStreams } from "@/lib/stream-discovery";
import { logger } from "@/lib/logger";

/**
 * Discovery endpoint - runs every 3 minutes via cron
 * Discovers active streams and creates StreamSession records
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify authorization
    const authHeader = req.headers.get("authorization");
    const userAgent = req.headers.get("user-agent") || "";
    const isVercelCron = userAgent.includes("vercel-cron");
    const isAuthorized = authHeader === `Bearer ${process.env.BOT_POLL_SECRET}`;

    if (!isVercelCron && !isAuthorized) {
      logger.warn("Unauthorized discovery request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.info("Starting stream discovery job");

    await discoverActiveStreams();

    const duration = Date.now() - startTime;
    logger.info({ duration }, "Stream discovery job completed");

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error }, "Stream discovery job failed");
    return NextResponse.json(
      {
        error: "Discovery failed",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

