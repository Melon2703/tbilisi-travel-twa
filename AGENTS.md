<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Agent skills

### Issue tracker

Issues live in GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Standard triage label mapping (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repository layout (`CONTEXT.md` at root). See `docs/agents/domain.md`.

## Mandatory Visual Verification
- Whenever modifying any frontend UI/CSS component, the agent MUST run a headless browser screenshot at 390x844px (Telegram WebApp viewport), inspect the image with `view_file`, and visually audit the layout before completing the task, calling `/code-review`, or committing code.


