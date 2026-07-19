# SG Couture Web Storefront

Customer-facing web storefront for SG Couture, built as a standalone frontend that consumes the `sg-couture-api` backend REST API. This repository has no database or business backend of its own.

**Stack:** Next.js 16 App Router · React 19 · TypeScript · Bun · Tailwind v4 · shadcn/base-ui · Clerk · TanStack Query v5 · nuqs · Zod v4.

## Getting started

```bash
bun install
```

Create `.env.local` with:

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
API_URL=
```

Then start the development server:

```bash
bun dev
```

## Project documentation

- [`docs/README.md`](docs/README.md) — development plan and phase tracker.
- [`docs/integration/storefront/`](docs/integration/storefront/) — vendored, read-only API contract.
- [`CLAUDE.md`](CLAUDE.md) and [`AGENTS.md`](AGENTS.md) — repository rules for coding agents.
