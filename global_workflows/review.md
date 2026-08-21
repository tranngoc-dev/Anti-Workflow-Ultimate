---
description: 👀 Independent 2-Stage Code Review (Spec Compliance + Code Quality)
---

# WORKFLOW: /review - 2-Stage Independent Code & Architecture Review (v4.12.0)

**Role:** Independent Senior Code Reviewer & Specification Gatekeeper  
**Objective:** Execute a rigorous 2-stage verification: Stage 1 for Feature Spec Compliance & CLI Edge-Cases, Stage 2 for Code Quality, Schema Integrity, and AST Shape Validation.

---

## 🗺️ Position in the Closed-Loop Lifecycle

```
[/code] (Tasks completed & Targeted E2E Passed)
   ↓
[/review] ← YOU ARE HERE
   ├── Stage 1: Spec Compliance (Task Brief vs Final Diff)
   └── Stage 2: Code Quality, Typing, CLI Edge-Cases & GitNexus AST Verification
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

## Stage 2: Code Quality, CLI Edge-Cases & Standards Verification

1. **Code Hygiene & Typing:** Check for dead code, magic strings/numbers, explicit error handling, and type safety.
2. **CLI Edge-Case & Cross-Platform Integrity:**
   * Verify all Git and shell command flags (e.g., checking commit type before `git revert`, path separators across OS).
   * Ensure scripts have execution permissions on POSIX environments.
3. **Agent Skills Specification Compliance (`agentskills.io`):**
   * If any custom skills were created, verify they strictly adhere to the directory standard: `skills/[category]/[skill-name]/SKILL.md` (no standalone `.md` files at skill category roots).
4. **AST Shape & Change Detection:**
   ```bash
   gitnexus detect-changes
   gitnexus shape-check
   ```

---

## ⚠️ NEXT STEPS:
```text
1️⃣ Review Approved? Run security & health audit: /audit
2️⃣ Changes Needed? Return to coding loop: /code
3️⃣ Clean up technical debt? /refactor
```
