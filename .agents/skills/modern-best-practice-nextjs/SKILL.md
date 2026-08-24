---
name: modern-best-practice-nextjs
description: Build and review this Next.js 16 App Router storefront using version-correct Server Component, Server Action, routing, caching, and metadata patterns.
---

# Next.js Best Practices (App Router)

Next.js changes frequently. Before writing version-sensitive code, read the
relevant guide under `node_modules/next/dist/docs/`. Use the `docs-explorer`
agent when the local guides do not settle the question or live runtime evidence
is needed.

This repository is on Next.js 16: `params` and `searchParams` are Promises,
middleware lives in `proxy.ts`, and `node_modules/next/dist/docs/` has the
current guides — read the relevant one before writing Next.js code.

## Routing & Structure

- Use the App Router in `app/` for new work
- Use nested layouts and route groups to organize sections
- Keep server components as the default; add `'use client'` only where needed

## Data Fetching & Caching

- Fetch page data in Server Components through the repository's thin,
  server-only queries; never add `useEffect` data loading.
- Use the repository's documented Server Action result style for each mutation:
  typed interactive results for cart/wishlist, and `ActionState` for forms.
- Keep Clerk JWTs and guest-cart tokens on the server.

## UI States

- Add route-level loading/error files or focused `Suspense` boundaries only
  where they improve a real navigation or streaming state.

## Metadata & SEO

- Use the Metadata API in layouts and pages
- Prefer static metadata when possible; keep dynamic metadata minimal
