# Agent instructions

## Dashboard

Dashboard project ID: sillytavern-lancer-ui-theme

Use the shared `DASHBOARD_BASE_URL` for dashboard requests: GET `DASHBOARD_BASE_URL/api/checkin?project=sillytavern-lancer-ui-theme` for project context and POST `DASHBOARD_BASE_URL/api/checkin/sillytavern-lancer-ui-theme/events` for project-scoped updates.

## Before starting project work

Before starting work in this project, check the dashboard for project-scoped human notes, active work, blockers, and additional instructions. After work, record completed, blocked, planned, test, and documentation findings through the dashboard API or CLI. Never edit materialized state files directly.

## AI agent dashboard updates

Do not start the dashboard server automatically. Use the shared dashboard URL configuration in `G:\GIT-REPOS\AGENTS.md`; if it is unavailable, report the exact request and tell the user how to run the dashboard manually.

```powershell
node G:\GIT-REPOS\ai-agent-dashboard\dashboard-cli.js add-note --project PROJECT_ID --note "Describe the change and remaining work"
```

Use a unique event id for retries. Never edit `ai-agent-dashboard\data\state.json` or `events.jsonl` directly. Record completed, blocked, planned, and documentation work, along with test evidence and source paths. The canonical protocol is in `G:\GIT-REPOS\ai-agent-dashboard\data\README.md`.
## Release versioning

Read [`docs/VERSIONING.md`](docs/VERSIONING.md) before completing project work.
It identifies the machine-readable version source and any project-specific
release automation.
