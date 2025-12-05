import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/access",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy",
  "/terms",
  "/api/webhooks(.*)",
  "/api/validate-access",
  // Bot API endpoints use bearer token auth, not Clerk
  "/api/bot/poll",
  "/api/bot/cron",
  "/api/bot/discover-streams",
  "/api/bot/cleanup-streams",
  "/api/bot/cleanup-messages",
  "/api/bot/poll-stream(.*)",
  "/api/bot/monitoring",
]);

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // Check if trying to access sign-in/sign-up pages
  if (isAuthRoute(request)) {
    const betaAccess = request.cookies.get("beta_access");

    // If no beta access cookie, redirect to access page
    if (!betaAccess || betaAccess.value !== "granted") {
      const url = new URL("/access", request.url);
      return NextResponse.redirect(url);
    }
  }

  if (!isPublicRoute(request)) {
    const { userId } = auth();
    if (!userId) {
      return auth().redirectToSignIn();
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
