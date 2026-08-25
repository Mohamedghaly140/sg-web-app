# CLAUDE.md

@AGENTS.md

## Claude-Specific Delegation

Implementation work spanning more than a couple of files against an existing
specification goes to the `cursor-delegate` skill. Claude remains the planner
and reviewer: write a bounded brief, let Cursor edit without committing, then
review the diff and rerun the repository's gates before landing it.

```bash
node .claude/skills/cursor-delegate/scripts/relay.mjs \
  --brief <brief>.txt \
  --cd /Users/mohamedghaly/sg_couture/sg-web-app \
  --timeout 2h
```

Choose a Cursor model only from the live `cursor-agent models` output; do not
hard-code a possibly stale model name. Default to `cursor-grok-4.5-high-fast`
— the Claude Sonnet/Opus models on this Cursor Pro plan hit their monthly
usage cap quickly and fail the dispatch with `ActionRequiredError` — and only
deviate when a task specifically calls for a different model.

We also delegate to Codex through `/codex:rescue`. Invoke it via the `Agent`
tool with `subagent_type: "codex:codex-rescue"`, forwarding a bounded brief
(same scope/leave-untouched/verification-loop/action-safety shape as the
Cursor brief above) as the prompt, prefixed with `--background` for
anything multi-file or long-running. It defaults to a write-capable run and
never commits on its own, but the brief must still say so explicitly — no
`git add`/`git commit`, leave the tree for review. The subagent is a thin
forwarder only (it does not inspect the repo or monitor progress), so poll
progress and review the result yourself: `/codex:status <job-id>` while it
runs, `/codex:result <job-id>` once it completes. Re-run the repo's real
gates (`bun lint`, `bunx tsc --noEmit`, `bun run build`) and diff the
changes against the brief before landing, same as after a Cursor run.
