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
  "/api/bot/cleanup-streams",
  "/api/bot/cleanup-messages",
  "/api/bot/poll-stream(.*)",
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

  // For protected routes, check both authentication AND beta access
  if (!isPublicRoute(request)) {
    // If not authenticated, redirect to sign-in
    if (!userId) {
      return auth().redirectToSignIn();
    }

    // If authenticated but no beta access, redirect to access page
    // This prevents users who signed in via Clerk's hosted page from accessing the app
    if (!hasBetaAccess) {
      const url = new URL("/access", request.url);
      return NextResponse.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
