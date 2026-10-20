---
type: Runbook
title: Maintain OKF documentation
description: Install the pinned checker, maintain navigation and understand validation scope.
status: stable
tags:
  - documentation
sources:
  - id: okf-profile
    resource: ../.okf/tools/profile.md
    title: House documentation profile
  - id: okf-lock
    resource: ../.okf/tools/profile.json
    title: Pinned profile and specification revision
  - id: okf-config
    resource: ../.okf.json
    title: Bundle configuration
  - id: okf-workflow
    resource: ../.github/workflows/okf.yml
    title: Documentation CI workflow
  - id: okf-spec
    resource: https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/0b87c52c6ef999286c745e19998fdfcd03d5dbee/SPEC.md
    title: Open Knowledge Format v0.2 specification
generated:
  by: claude-code/claude-opus-5-5
  at: 2026-10-20T05:09:48Z
stale_after: 2027-01-18T00:00:00Z
---
# Maintain OKF documentation

The [documentation index](index.md) is the bundle entry point. This repository
pins house profile 1.1.0 and OKF 0.2 in [.okf/tools/profile.json](../.okf/tools/profile.json).
The [profile](../.okf/tools/profile.md) defines metadata, navigation and evidence rules.
The project release version is separate; follow [VERSIONING.md](VERSIONING.md).
Profile 1.1.0 warns when a concept lacks `generated` or a runbook lacks
`sources` or `stale_after`; warnings keep the check passing, but treat them as
review work.

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

## Metadata conventions

Every concept carries `status`, `tags` and `generated`, in addition to the
required keys. Only record what evidence supports.

- `status`: `draft` while a document is still an unapproved proposal, `stable`
  otherwise, `deprecated` once replaced (link the replacement). It never records
  whether the described work shipped; the dashboard carries implementation
  state.
- `tags`: choose from `documentation` and `versioning`. Extend this list here
  before using a new tag.
- `generated`: `by` names the agent that wrote the current content, as
  `AGENT/model-id`, `codex/unrecorded` or `claude-code/unrecorded` when the
  producer version was not recorded, or `human:masterevan27` for hand-written
  content. `at` is the last meaningful content change; metadata-only edits do
  not move it.
- `sources`: runbooks and references cite the code, scripts and configuration
  they describe as GitHub URLs pinned to the commit the content was written
  against. When the cited file changes in the same commit as the document, use a
  relative path instead, because that commit does not exist yet. Refresh sources
  when the content is next revised.
- `stale_after`: runbooks, operational references, this guide and VERSIONING use
  90 days after `generated.at`. When the deadline passes, check the content
  against its sources, then revise or verify it before moving the date.
- `verified`: add `{ by: human:masterevan27, at: ... }` only after the owner
  actually reviewed the content, or an agent entry only after an agent checked
  it against its sources. The 2026-10-20 metadata backfill recorded no
  verification.

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
