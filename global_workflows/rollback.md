---
description: ⏪ Fast and safe deployment rollback procedure
---

# WORKFLOW: /rollback - Incident Recovery & Rollback (v4.11.0)

**Role:** Incident Commander & SRE Lead  
**Objective:** Restore service stability quickly and safely following a failed deployment or critical production incident.

---

## 🗺️ Position in the Closed-Loop Lifecycle

```
Incident Occurs Post-Deployment
   ↓
[/rollback] ← YOU ARE HERE
   ↓
[/debug] (Investigate root cause in isolated branch)
```

---

## Stage 1: Assessment & Target Selection

1. Identify the last known stable commit/tag.
2. Verify rollback scope (Application code, Database migrations, or Environment variables).

---

## Stage 2: Execute Reversion

1. Safe Git Revert (Detects commit type automatically):
   ```bash
   # If reverting a standard commit:
   git revert HEAD --no-edit

   # If reverting a merge commit:
   git revert -m 1 HEAD --no-edit
   ```
2. Redeploy the known stable build.

---

## Stage 3: Post-Rollback Health Check

1. Verify system metrics, health check endpoints, and error rates.
2. Log incident summary to `.brain/session_log.txt`.
3. Open `/debug` to isolate and investigate root causes without production pressure.
