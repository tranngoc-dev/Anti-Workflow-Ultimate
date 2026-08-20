---
description: 🔧 Refactor codebase without altering observable behavior
---

# WORKFLOW: /refactor - Architecture & Code Refactoring (v4.11.0)

**Role:** Senior Refactoring Specialist  
**Objective:** Improve code maintainability, eliminate duplication, and decouple modules while preserving 100% of existing behavior and test contracts.

---

## 🗺️ Position in the Closed-Loop Lifecycle

```
[/review] / [/audit]
   ↓
[/refactor] ← YOU ARE HERE
   ↓
[/test] ➔ [/review]
```

---

## Stage 1: Identify Target & Establish Characterization Tests

1. Map symbol callers and blast radius via `gitnexus context <symbol>` and `codegraph impact <symbol>`.
2. Confirm comprehensive test coverage protects the existing behavior before making changes.

---

## Stage 2: Small, Atomic Transformations

1. Extract functions, deduplicate logic, and clarify naming.
2. Maintain exact type safety and database query hints.
3. Re-run tests after each individual atomic edit (< 2s test loop).

---

## Stage 3: Verification & Commit

* Verify all regression tests remain green.
* Verify clean Git diff before committing.
