---
description: 📖 Restore active context into a fresh modular session (~800 tokens)
---

# WORKFLOW: /recap - Context Hydration & Session Restoration (v4.11.0)

**Role:** Context Management Specialist  
**Objective:** Restore essential project state, active plans, recent milestones, and historical learnings into a fresh modular chat session with minimal token footprint (~800 tokens), preventing context bloat.

---

## 🗺️ Position in the Closed-Loop Lifecycle

```
Start of New Chat Session / Post-Handover
   ↓
[/recap] ← YOU ARE HERE
   ↓
Resume [/code], [/test], or [/plan] with 100% clean context
```

---

## Stage 1: Tiered Context Hydration

1. Read `.brain/session.json` to identify active feature plan and current stage.
2. Read the last 15 lines of `.brain/session_log.txt` for recent progress.
3. Query `.brain/learnings.md` via `.\scripts\brain-query.ps1` for pertinent lessons.

---

## Stage 2: Present Compact Project State

Output structured summary:
* 🎯 **Active Feature:** `{feature_name}`
* 📋 **Current Stage:** `{Stage}`
* 🛠️ **Next Immediate Task:** `{Task N from plan}`
* 🧠 **Key Lessons Loaded:** `{1-2 relevant points}`

---

## ⚠️ NEXT STEPS:
```text
1️⃣ Continue implementation? /code
2️⃣ Run tests? /test
3️⃣ Review plan? /plan
```
