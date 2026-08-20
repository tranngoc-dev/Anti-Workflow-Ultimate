---
description: 📋 Author Smart TDD Implementation Plans with Blast Radius & Historical Learnings
---

# WORKFLOW: /plan - TDD Implementation Planning & Blast Radius Analysis (v4.11.0)

**Role:** Lead Software Architect & Technical Planner  
**Objective:** Translate requirements into concrete Feature Specs and Smart TDD Implementation Plans, calculate Blast Radius via **GitNexus**, cross-reference historical lessons via **Semantic Brain Micro RAG (`scripts/brain-query.ps1`)**, and decompose work into 2–5 minute tasks.

---

## 🗺️ Position in the Closed-Loop Lifecycle

```
[/brainstorm] / [/visualize]
   ↓
[gitnexus analyze] + [brain-query .brain/learnings.md]
   ↓
[/plan] ← YOU ARE HERE (Feature Spec & Smart TDD Plan)
   ↓
🔄 [MODULAR HANDOVER: /save-brain ➔ Fresh Chat Session]
   ↓
[/code] (Execute Subagent TDD in 100% clean context)
```

---

## Stage 1: Architecture Mapping & Semantic Brain Query

1. **Scan Knowledge Graph:**
   ```bash
   gitnexus analyze
   ```
2. **Execute GitNexus MCP Tools:**
   * `gitnexus:query` & `gitnexus:context`: Map modules, clusters, and interfaces.
   * `gitnexus:impact`: Compute blast radius and affected dependencies.
3. **Semantic Brain Query (`scripts/brain-query.ps1`):**
   ```powershell
   .\scripts\brain-query.ps1 -Query "<Feature Name / Technical Keyword>"
   ```
   * Retrieve the top 1-2 relevant historical lessons (~100 tokens).
   * Ensure the new plan complies with proven architectural fixes (e.g., Explicit FK hints).

---

## Stage 2: Feature Specification (`docs/superpowers/specs/<feature>.md`)

Document:
* **Product Goal:** Observable user-visible behavior.
* **Acceptance Criteria:** Deterministic verification conditions.
* **Out of Scope:** Boundaries that must remain untouched.
* **Data Model & Contracts:** Types, schemas, and API routes.

---

## Stage 3: Smart TDD Plan Decomposition (`docs/superpowers/plans/<feature>.md`)

Decompose into discrete tasks (2–5 minutes per task):
* Explicit file paths.
* Complete code snippets (no `// TODO` placeholders).
* Smallest Scoped Unit Test (< 1s) per task.
* 1 Targeted E2E Smoke Test scenario for the entire feature.

---

## Stage 4: Checkpoint & Session Handover

1. Record plan path in `.brain/session.json`.
2. Append to `.brain/session_log.txt`.
3. Provide Handover instructions for the user to open a fresh session with `/recap`.
