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
