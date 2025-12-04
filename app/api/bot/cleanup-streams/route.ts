import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { cleanupStaleSessions } from "@/lib/stream-discovery";
import { logger } from "@/lib/logger";

/**
 * Cleanup endpoint - marks stale sessions as ENDED
 * Should run every 15 minutes via cron
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify authorization
    const authHeader = req.headers.get("authorization");
    const userAgent = req.headers.get("user-agent") || "";
    const isVercelCron = userAgent.includes("vercel-cron");
    const isAuthorized =
      authHeader === `Bearer ${process.env.BOT_POLL_SECRET}`;

    if (!isVercelCron && !isAuthorized) {
      logger.warn("Unauthorized cleanup request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.info("Starting stream cleanup job");

    await cleanupStaleSessions();

    const duration = Date.now() - startTime;
    logger.info({ duration }, "Stream cleanup job completed");

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error }, "Stream cleanup job failed");
    return NextResponse.json(
      {
        error: "Cleanup failed",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}


