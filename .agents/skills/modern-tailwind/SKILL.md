---
name: modern-tailwind
description: Build clean, scalable UIs with Tailwind CSS using modern utilities and variants
---

# Tailwind CSS Best Practices

## Core Principles

- Prefer utility classes over custom CSS for most styling
- Keep class lists readable by grouping: layout → spacing → typography → color → effects
- Use semantic HTML first; utilities should enhance, not replace structure

## Variants & State

- Use `hover`, `focus-visible`, `disabled`, `dark`, and `motion-safe` variants where appropriate
- Prefer `data-*` and `aria-*` variants for stateful styling tied to DOM semantics
- Use `group` and `peer` for parent/sibling state without extra JS

## Responsive & Container Queries

- Start with the base styles, then add responsive variants (`sm`, `md`, `lg`, ...)
- Use container query utilities when layout depends on parent size

## Theming & Customization

- For this repository, use Tailwind v4 CSS-first theming in `app/globals.css`
  via `@theme`; do not add `tailwind.config.*`
- Use the v4 `@utility` directive for custom utilities (auto-sorted, variant-aware);
  reserve `@layer base` for base styles — `@layer utilities` is the v3 pattern
- Avoid `@apply` except for small, repeatable patterns

## Maintainability

- Extract reusable UI into components instead of repeating large class strings
- Keep class names deterministic; avoid dynamic string concatenation when possible
