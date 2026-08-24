---
name: web-security
description: Review or implement storefront code with secure server/client boundaries, strict input validation, token hygiene, and safe rendering. Applies to auth, forms, API calls, cookies, redirects, and untrusted content.
---

# Web Security

We treat **web security as a core requirement**, not an afterthought.
Assume hostile input and untrusted environments by default.

## Core Principles

- **NEVER** trust user input
- **ALWAYS** validate and sanitize data at boundaries
- Prefer secure defaults over configurability

## XSS & Injection

- **AVOID** `dangerouslySetInnerHTML` and raw HTML injection
- Escape and encode dynamic content properly
- Never interpolate untrusted data into HTML, CSS, or JS contexts
- This storefront has no database; never introduce one or move backend business
  logic into the frontend.

## Authentication & Authorization

- Do not store secrets or tokens in insecure locations
- **AVOID** localStorage for sensitive credentials when possible
- Keep Clerk JWTs and `sg_cart_session` out of client JavaScript, URLs, logs,
  and analytics.
- Use the repository's server-only BFF and httpOnly cookie helpers.
- Treat backend 401/403 responses as authoritative; UI gates are only UX.

## Browser Security APIs

- Respect CSP and browser security boundaries. The browser must not call the
  backend API directly.
- Use Content Security Policy to restrict script and resource execution
- Avoid inline scripts and styles when CSP is enabled

## Data Handling

- Minimize data exposure
- Do not log sensitive information

## Dependencies & Supply Chain

- Avoid unnecessary packages
- Treat third-party code as untrusted input

## General Principles

- Simplicity reduces attack surface
- If unsure, choose the more restrictive option
