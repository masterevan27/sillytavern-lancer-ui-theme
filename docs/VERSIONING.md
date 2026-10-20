---
type: Reference
title: "Release versioning"
description: "Canonical version source and change increment policy for this repository."
status: stable
tags:
  - documentation
  - versioning
sources:
  - id: manifest
    resource: ../manifest.json
    title: Machine-readable version source
generated:
  by: claude-code/claude-opus-5-5
  at: 2026-10-20T05:09:48Z
stale_after: 2027-01-18T00:00:00Z
---
# Versioning

Version `1.3.6` records OKF lifecycle, tags, provenance, code sources and review
deadlines in every documentation concept and adopts house profile 1.1.0, which
warns when provenance, runbook sources or review deadlines are missing. No
document is marked verified. This repository has no changelog, so this
documentation-only change is recorded here.

The extension release version remains the `version` field in `manifest.json`.

Every completed change should update the project version once, including changes made directly on the default branch. Use patch/subversion increases for ordinary changes, minor increases for larger compatible changes, and reserve major increases for intentional breaking or owner-approved releases. Use conventional unpadded numeric versions where the existing project format permits it.

Canonical version source: [`manifest.json`](../manifest.json). Keep this file as the agent-facing explanation of that source; do not create a competing version field when release automation already owns the version.

The existing source is authoritative for this project. Update it according to the project workflow before reporting a completed change.

