# Agent instructions

## Dashboard

Dashboard project ID: sillytavern-lancer-ui-theme

Use the scoped dashboard check-in endpoint GET http://127.0.0.1:5080/api/checkin?project=sillytavern-lancer-ui-theme for project context and POST http://127.0.0.1:5080/api/checkin/sillytavern-lancer-ui-theme/events for project-scoped updates.

## Before starting project work

Before starting work in this project, check the dashboard for project-scoped human notes, active work, blockers, and additional instructions. After work, record completed, blocked, planned, test, and documentation findings through the dashboard API or CLI. Never edit materialized state files directly.

## AI agent dashboard updates

When work in this repository is completed, blocked, planned, tested, or found to have stale documentation, update the local AI agent dashboard at `G:\GIT-REPOS\ai-agent-dashboard`. Start it with `node G:\GIT-REPOS\ai-agent-dashboard\server.js` if needed, then use the dashboard API or CLI, for example:

```powershell
node G:\GIT-REPOS\ai-agent-dashboard\dashboard-cli.js add-note --project PROJECT_ID --note "Describe the change and remaining work"
```

Use a unique event id for retries. Never edit `ai-agent-dashboard\data\state.json` or `events.jsonl` directly. Record completed, blocked, planned, and documentation work, along with test evidence and source paths. The canonical protocol is in `G:\GIT-REPOS\ai-agent-dashboard\data\README.md`.
