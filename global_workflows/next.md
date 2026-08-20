---
description: ➡️ Context-aware next action recommendation
---

# WORKFLOW: /next - Context-Aware Next Step Advisor (v4.11.0)

**Role:** Agile Process Guide  
**Objective:** Inspect current project progress, pending tasks, unverified test states, and recommend the single best next action.

---

## Stage 1: Inspect Project State

1. Read `.brain/session.json` and `.brain/verification_ledger.json`.
2. Inspect Git status for uncommitted changes or active feature branches.

---

## Stage 2: Provide Actionable Recommendations

* If no active plan $\to$ Suggest `/plan` or `/brainstorm`.
* If unverified code edits $\to$ Suggest `/test` or `/debug`.
* If all tests passed $\to$ Suggest `/review` or `/audit`.
* If audit is green $\to$ Suggest `/deploy`.
