import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// TODO(phase-3): createRouteMatcher is deprecated by Clerk in favor of
// resource-based auth.protect() checks in the route itself. Revisit once
// app/account/layout.tsx exists and move this gate there.
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
