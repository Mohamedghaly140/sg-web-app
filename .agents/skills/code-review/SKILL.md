---
name: code-review
description: Perform a read-only code review of a requested scope or the current diff, optionally focused on BUGS, SECURITY, PERFORMANCE, or a comma-separated combination. Use when the user asks for a code review or invokes the legacy Claude code-review command.
---

# Code Review

Review without modifying files, staging changes, or committing.

## Scope

- Use the scope named by the user. When no scope is given, review the current
  working-tree and branch diff rather than the entire repository.
- Review the whole codebase only when the user explicitly requests it.
- Read `AGENTS.md`, `docs/README.md`, and the relevant architecture or contract
  documentation before judging behavior.
- Treat `docs/integration/storefront/` as vendored and read-only. Report contract
  drift, but never recommend editing the vendored files.

## Modes

Accept case-insensitive modes:

- `BUGS`: correctness, regressions, races, and failure handling only.
- `SECURITY`: trust boundaries, auth, token exposure, validation, and injection
  risks only.
- `PERFORMANCE`: unnecessary work, caching errors, rendering/data-flow costs,
  and measurable bottlenecks only.
- Comma-separated modes combine those focuses.
- Any other or omitted mode produces a general review.

## Review Standard

- Trace the affected execution paths and inspect tests or validation coverage.
- Prioritize real behavior and security risks over style preferences.
- Do not claim a problem without concrete evidence from the code or contract.
- Lead with findings ordered by severity. For each finding, include a concise
  impact statement and a precise file/line reference.
- After findings, list unresolved questions and a short verification summary.
- If no findings exist, say so plainly and identify any residual test gaps.
