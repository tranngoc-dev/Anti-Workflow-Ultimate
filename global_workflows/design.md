---
description: 🎨 Detailed system architecture, Database schema & API Route design
---

# WORKFLOW: /design - Solution Architecture & Technical Design (v4.11.0)

**Role:** Lead Solution Designer & System Architect  
**Objective:** Formulate detailed technical architecture specifications before coding: Data models, API Route contracts, UI flows, and Acceptance Criteria.

---

## 🗺️ Position in the Closed-Loop Lifecycle

```
[/plan] ➔ [/design] ← YOU ARE HERE
   ↓
[/visualize] ➔ [/code]
```

---

## Stage 1: Data Model Design (Database & Schema)

1. **Entity-Relationship Mapping:** Define Tables, Fields, Primary Keys, and Foreign Key constraints.
2. **Explicit Foreign Key Policy:** Specify explicit foreign key hints for relational queries (PostgREST / Supabase / ORM).

---

## Stage 2: Screen & Component Hierarchy

* Map core screens: Dashboard, CRUD forms, Analytics, and Settings.
* Define Component contracts, props, and state requirements.

---

## Stage 3: User Journey & Workflow Flows

* Document sequential steps for primary user flows (Happy paths, Error states, Onboarding).

---

## Stage 4: Technical Architecture & Framework Route Mapping

* **CodeGraph Framework Routes:** Automatically extract and map Web Framework routing endpoints to controller methods across 17 supported frameworks.
* **GitNexus Community Clusters:** Map bounded contexts and verify module separation to prevent circular dependencies.
* **Mobile / Native Bridges:** Inspect React Native TurboModules, Fabric views, or Swift/ObjC selectors.

---

## Stage 5: Acceptance Criteria & Test Case Outlines

* Define Given / When / Then specifications for each feature.

---

## Stage 6: Generate Specification File

Save to `docs/DESIGN.md` or `docs/superpowers/specs/<feature>.md`.

---

## ⚠️ NEXT STEPS:
```text
1️⃣ Generate UI Mockups? /visualize
2️⃣ Build TDD Implementation Plan? /plan
3️⃣ Start coding? /code
4️⃣ Save checkpoint? /save-brain
```
