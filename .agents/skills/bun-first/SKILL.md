---
name: bun-first
description: Use Bun for package management, scripts, and repository tooling in this project. Apply when installing dependencies or choosing JavaScript commands; do not replace framework-required Next.js or Node-compatible APIs merely for Bun purity.
---

# Bun-First Development

This repository uses **Bun** as its package manager and task runner. Follow the
existing Next.js toolchain instead of introducing Vite, Vitest, npm, pnpm, or
yarn.

## General Principles

- Use Bun commands for dependency and script operations.
- Preserve framework-required Node.js and Web APIs when they are the idiomatic
  Next.js choice.
- Keep dependencies minimal and intentional.

## Package Management

- Use `bun install`, `bun add`, and `bun remove`.
- Never use `npm`, `npx`, `yarn`, or `pnpm` in this repository.
- Prefer Bun-native lockfiles and resolution behavior

## Scripts & Tooling

- Use the repository's established commands: `bun dev`, `bun lint`,
  `bunx tsc --noEmit`, and `bun run build`.
- Use `bunx` for one-off CLIs such as shadcn.
- No automated test suite is configured; do not invent a Vitest or Bun test
  workflow unless the user asks to add one.
- Avoid introducing extra task runners.

## Runtime & APIs

- Prefer standard Web APIs where Next.js supports them.
- Do not access `process.env` in application code; use the validated
  `lib/env.ts` singleton.
- Use Bun-specific runtime APIs only when the code actually runs under Bun and
  the API is a better fit than the framework-native option.

## Performance & DX

- Prefer simple, explicit scripts over complex toolchains.
- Avoid unnecessary abstractions.
