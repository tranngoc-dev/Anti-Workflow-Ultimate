---
description: 👀 Independent 2-Stage Code Review (Spec Compliance + Code Quality)
---

# WORKFLOW: /review - 2-Stage Independent Code Review (v4.11.0)

**Role:** Independent Senior Code Reviewer  
**Objective:** Execute a rigorous 2-stage verification: Stage 1 for Feature Spec Compliance, Stage 2 for Code Quality, Typing, and AST Structure.

---

## 🗺️ Position in the Closed-Loop Lifecycle

```
[/code] (Tasks completed & Targeted E2E Passed)
   ↓
[/review] ← YOU ARE HERE
   ├── Stage 1: Spec Compliance (Task Brief vs Final Diff)
   └── Stage 2: Code Quality, Typing, and GitNexus AST Verification
   ↓
[/audit] ➔ [/deploy]
```

---

## Stage 1: Spec Compliance Review

Generate diff package:
```powershell
.\scripts\review-package.ps1 -PlanFile <plan_path> -Base origin/main -Head HEAD
```
* Verify all acceptance criteria are met.
* Confirm no out-of-scope files were modified.

---

## Stage 2: Code Quality & Architecture Review

* Check for dead code, magic strings/numbers, explicit error handling, and type safety.
* Run GitNexus shape check and AST validation:
  ```bash
  gitnexus detect-changes
  ```

---

## ⚠️ NEXT STEPS:
```text
1️⃣ Review Approved? Run security audit: /audit
2️⃣ Changes Needed? Return to coding loop: /code
3️⃣ Clean up technical debt? /refactor
```
