import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Clerk's installed @deprecated JSDoc on createRouteMatcher recommends
// resource-based auth.protect() calls in each route/layout instead of
// middleware path matching. Middleware-based /account(.*) gating here is the
// accepted design (see docs/00-architecture.md ADR-W006 and
// docs/phase-3-auth-cart-merge.md §3.1), not a stopgap — do not move this
// into app/account/layout.tsx without first updating that ADR and phase doc.
const isAccountRoute = createRouteMatcher(["/account(/.*)?"]);

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
