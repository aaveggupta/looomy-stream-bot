import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@database/prisma";
import { getTokensFromCode, getChannelInfo } from "@/lib/youtube";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(
        new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      console.error("YouTube OAuth error:", error);
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=oauth_denied", process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=no_code", process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    // Verify state matches userId
    if (state !== userId) {
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=invalid_state", process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=no_refresh_token", process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    // Get channel info
    const channelInfo = await getChannelInfo(tokens.refresh_token);

    // Update user with YouTube credentials
    await prisma.user.update({
      where: { id: userId },
      data: {
        youtubeRefreshToken: tokens.refresh_token,
        youtubeChannelId: channelInfo.id,
        youtubeChannelName: channelInfo.name,
      },
    });

    return NextResponse.redirect(
      new URL("/dashboard/settings?success=youtube_connected", process.env.NEXT_PUBLIC_APP_URL)
    );
  } catch (error) {
    console.error("YouTube callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=callback_failed", process.env.NEXT_PUBLIC_APP_URL)
    );
  }
}
