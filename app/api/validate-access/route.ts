import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";

// Set your secret access key here or in environment variable
const VALID_ACCESS_KEY = process.env.BETA_ACCESS_KEY;

export async function POST(req: NextRequest) {
  try {
    const { accessKey } = await req.json();

    // Validate access key
    if (accessKey === VALID_ACCESS_KEY) {
      // Set cookie to remember access (valid for 30 days)
      cookies().set("beta_access", "granted", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Invalid access key" },
        { status: 401 }
      );
    }
  } catch (error) {
    logger.error({ error }, "Access validation error");
    return NextResponse.json(
      { error: "Failed to validate access" },
      { status: 500 }
    );
  }
}
