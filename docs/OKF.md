---
type: Runbook
title: Maintain OKF documentation
description: Install the pinned checker, maintain navigation and understand validation scope.
---
# Maintain OKF documentation

The [documentation index](index.md) is the bundle entry point. This repository
pins house profile 1.0.0 and OKF 0.2 in [.okf/tools/profile.json](../.okf/tools/profile.json).
The [profile](../.okf/tools/profile.md) defines metadata, navigation and evidence rules.
The project release version is separate; follow [VERSIONING.md](VERSIONING.md).

CI uses `actions/checkout@v7`, `actions/setup-node@v7` and Node 24.

## Install and validate

Use Node 20.19 or later from the repository root:

```sh
npm ci --prefix .okf/tools --ignore-scripts --no-audit --no-fund
node .okf/tools/cli.mjs index .
node .okf/tools/cli.mjs check .
```

CI runs the same locked dependency installation and bundle check. Keep the
committed runtime snapshot together when explicitly reviewing an upgrade.
The index command creates missing indexes and refreshes generated indexes;
maintain handwritten indexes manually. Preserve document paths and unknown
metadata. Concept documents require type, title and description.

## Scope and existing entry points

All maintained Markdown in docs/ belongs to the checked bundle. The following
entry points retain their existing paths and formats outside that bundle:

- [README](../README.md) - Project overview and existing usage guidance.
- [Agent instructions](../AGENTS.md) - Repository workflow and dashboard rules.

Tool/profile documentation, dependencies and generated outputs retain their
formats outside the bundle. The bundle checker does not recursively validate
linked documents outside docs/. Metadata conversion and link checks do not
constitute factual review, test every example or verify remote links. Preserve
existing historical claims and implementation state until separately reviewed;
record review evidence and task or roadmap progress in the dashboard.
