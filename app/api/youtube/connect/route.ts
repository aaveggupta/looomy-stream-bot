import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/youtube";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use userId as state for verification in callback
    const authUrl = getAuthUrl(userId);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    logger.error({ error }, "YouTube connect error");
    return NextResponse.json(
      { error: "Failed to initiate YouTube connection" },
      { status: 500 }
    );
  }
}
