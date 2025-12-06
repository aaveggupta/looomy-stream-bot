import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { validateEnv } from "@/lib/env";

// Validate environment variables on startup
try {
  validateEnv();
} catch (error) {
  console.error("Environment validation failed:", error);
  // In production, you might want to throw here to prevent the app from starting
  // For now, we'll log and continue to allow graceful degradation
}

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
  "/api/bot/cleanup-streams",
  "/api/bot/cleanup-messages",
  "/api/bot/poll-stream(.*)",
  "/api/bot/process-message",
  "/api/bot/monitoring",
]);

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const betaAccess = request.cookies.get("beta_access");
  const hasBetaAccess = betaAccess?.value === "granted";
  const { userId } = auth();

  // Check if trying to access sign-in/sign-up pages
  if (isAuthRoute(request)) {
    // If no beta access cookie, redirect to access page
    if (!hasBetaAccess) {
      const url = new URL("/access", request.url);
      return NextResponse.redirect(url);
    }
  }

  // For protected routes, check both beta access AND authentication
  if (!isPublicRoute(request)) {
    // First check for beta access - users without beta access
    // should go to access page, not sign-in (accounts.looomy.com)
    if (!hasBetaAccess) {
      const url = new URL("/access", request.url);
      return NextResponse.redirect(url);
    }

    // If has beta access but not authenticated, redirect to sign-in
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
