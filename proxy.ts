import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// TODO(phase-3): Clerk's installed @deprecated JSDoc directs resource-based
// auth.protect() calls into each route/layout because middleware-level auth
// gating can create a false sense of security. Keep this check only until
// app/account/layout.tsx ships in Phase 4; then move await auth.protect() there
// and remove this middleware matcher entirely.
const isAccountRoute = createRouteMatcher(["/account(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAccountRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
