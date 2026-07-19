---
name: modern-best-practice-nextjs
description: Build modern Next.js apps with App Router and best practices
---

# Next.js Best Practices (App Router)

Next.js is a framework that changes frequently - use web search or context7 MCP (via docs-explorer agent) for exploring the current documentation.

This repository is on Next.js 16: `params` and `searchParams` are Promises,
middleware lives in `proxy.ts`, and `node_modules/next/dist/docs/` has the
current guides — read the relevant one before writing Next.js code.

## Routing & Structure

- Use the App Router in `app/` for new work
- Use nested layouts and route groups to organize sections
- Keep server components as the default; add `'use client'` only where needed

## Data Fetching & Caching

- Fetch data in React Server Components - AVOID fetching via `useEffect()` and `fetch()`
- Use server actions ("Server Functions") for mutations, potentially in conjunction with React Hooks like `useActionState`

## UI States

- Provide `loading.tsx` and `error.tsx` for route-level UX
- Use `Suspense` boundaries around async UI

## Metadata & SEO

- Use the Metadata API in layouts and pages
- Prefer static metadata when possible; keep dynamic metadata minimal
