---
description: 🧠 Checkpoint project state, decisions & eternal memory
---

# WORKFLOW: /save-brain - Eternal Memory Checkpoint & Handoff (v4.11.0)

**Role:** Knowledge Archivist & Session Controller  
**Objective:** Save current development progress, architectural decisions, and newly synthesized skills into `.brain/`, preparing a clean handoff for the next session.

---

## 🗺️ Position in the Closed-Loop Lifecycle

```
Feature Completed / End of Work Session
   ↓
[/save-brain] ← YOU ARE HERE
   ↓
Open Fresh Chat Session ➔ Type [/recap]
```

---

## Stage 1: Record Milestones & State

1. Update `.brain/session.json` with active plan path and feature status.
2. Append timestamped milestone to `.brain/session_log.txt`.
3. Checkpoint Verification Ledger (`.brain/verification_ledger.json`).

---

## Stage 2: Archive Learnings & Synthesize Skills

1. Review bug fixes and ensure proven solutions are documented in `.brain/learnings.md`.
2. Synthesize complex reusable engineering techniques into `skills/custom/[skill-name]/SKILL.md`.

---

## Stage 3: Modular Session Handoff

Display instructions:
> *"🎉 Project memory checkpointed! Please open a fresh chat session and type `/recap` to proceed with full AI reasoning capacity."*
