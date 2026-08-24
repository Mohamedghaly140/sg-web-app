---
name: modern-browser-apis
description: Prefer suitable browser-native APIs over custom JavaScript or dependencies when support, accessibility, and progressive enhancement are verified for the storefront's target browsers.
---

# Using Modern Browser APIs

Prefer native browser capabilities when they simplify the implementation without
weakening accessibility or target-browser support. Verify current compatibility
in primary documentation before adopting a version-sensitive API.

## Philosophy

- Prefer browser-native capabilities over new dependencies when behavior and
  accessibility are equivalent.
- Progressively enhance APIs that are not universally available.
- Respect secure-context, permission, and user-gesture requirements.

## Candidate APIs

Consider these by use case; this list does not guarantee support in every target
browser.

### UI & Interaction

- **Intersection Observer API** — Efficiently detect when elements enter/exit the viewport (lazy loading, infinite scroll).
- **ResizeObserver API** — React to element size changes without layout thrashing.
- **PerformanceObserver API** — Observe performance metrics (RUM/perf insights).
- **BroadcastChannel API** — Cross-tab communication in the same origin.

### Navigation & View Management

- **View Transitions API** — Native, hardware-accelerated transitions between UI states.
- **URLPattern API** — Declaratively match and parse URLs (helps in routing logic).

### Clipboard & Sharing

- **Clipboard Async API** — Non-blocking, modern clipboard read/write with user consent.
- **Web Share API Level 2** — Share text, links, files through native device dialogs.

### Files & Persistence

- **File System Access API** — Read/write local files with user permissions.
- **File Handle & Directory Picker** extensions for batch file/directory selection.

### Concurrency & Scheduling

- **Web Locks API** — Coordinate async access to shared resources (avoid races).
- **Scheduling API** — Prioritize/background non-essential work to improve responsiveness.

### Workers & Off-Main Thread

- **Web Workers API** — Run scripts off the main thread for intensive tasks.
- **OffscreenCanvas** — Use canvas rendering in workers for performant graphics/visuals.

### Advanced Graphics & Compute

- **WebGPU API** — Low-level GPU access for specialized rendering and compute;
  use only with verified support and a real need.

### Real-Time & Networking

- **WebRTC** — Real-time peer-to-peer audio/video communication without plugins.

## When to Use & How to Fallback

- **FEATURE DETECTION** is required before use:
  ```js
  if ('clipboard' in navigator) { … }
  ```

For APIs not universally supported, provide a graceful fallback or omit the
enhancement.

Always combine user gesture requirements (e.g., for sharing or clipboard) with permission checks.

## Best Practices

**ASYNC FIRST**: Prefer promise/async APIs to avoid blocking UI.

**PERMISSIONS UI**: Convey clearly to users when the browser will ask for access (files, clipboard, sharing).

**PERFORMANCE MINDFUL**: Observe and prioritize main thread work using PerformanceObserver or Scheduling APIs.

**SECURE CONTEXTS**: Use HTTPS; many APIs require secure contexts to function.

## General Principles

Write code for browsers as platforms, not just JS engines.

Prefer native semantics (e.g., lazy loading via IntersectionObserver vs manual scroll handlers).

Reduce external dependencies where modern browser APIs suffice.

Document API usage and fallback patterns for maintenance and cross-browser support.
