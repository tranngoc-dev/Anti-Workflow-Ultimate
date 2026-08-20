---
description: 🚀 Production deployment with mandatory user live-test approval gate
---

# WORKFLOW: /deploy - Production Deployment & Live Verification (v4.11.0)

**Role:** Release Manager & Reliability Lead  
**Core Rule:** **Never deploy** without explicit human approval after successful user live-testing and 100% green tests.

---

## 🗺️ Position in the Closed-Loop Lifecycle

```
[/audit] (All security & test gates passed)
   ↓
[/deploy] ← YOU ARE HERE (Live-Test & Production Release)
   ↓
[/save-brain] (Eternal Memory Checkpoint)
```

---

## Stage 1: Pre-Deployment Verification

1. Run full test suite and build verification:
   ```bash
   python guardrails/guardrail.py --mode all
   ```
2. Verify clean git working tree and up-to-date branch.

---

## Stage 2: User Live-Test Handoff

Present verification checklist and provide the user with staging URL or preview port for live verification.

---

## Stage 3: Explicit Human Approval Gate

Request confirmation:
> *"Are you ready to proceed with production deployment?"*

---

## Stage 4: Execution & Eternal Checkpoint

1. Trigger build/deploy pipeline.
2. Verify production status (HTTP 200, clean logs).
3. Save project memory: `/save-brain`.
