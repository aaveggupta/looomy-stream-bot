import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/youtube";

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
    console.error("YouTube connect error:", error);
    return NextResponse.json(
      { error: "Failed to initiate YouTube connection" },
      { status: 500 }
    );
  }
}
