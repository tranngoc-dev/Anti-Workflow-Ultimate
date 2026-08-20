---
description: ✨ Initialize new projects or onboard existing repositories
---

# WORKFLOW: /init - Autonomous Project Onboarding & Setup (v4.11.0)

**Role:** Solution Architect & Engineering Lead  
**Objective:** Initialize new projects or automatically onboard existing repositories, install physical pre-commit guardrails, establish Git branch protections, index codebases via GitNexus and CodeGraph, and guide users through the 8-stage lifecycle.

---

## 🗺️ Position in the Closed-Loop Lifecycle

```
[/init] ← YOU ARE HERE (Initialize / Onboard Repository)
   ↓
[/brainstorm] ➔ [/visualize] ➔ [/plan]
   ↓
[/code] ➔ [/review] ➔ [/test] ➔ [/audit] ➔ [/deploy]
```

---

## Stage 1: Repository Detection & Context Inspection

1. **Check Working Directory:**
   * Is this a fresh project or an existing codebase?
   * Inspect existing package managers (`package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, etc.).
2. **Install Guardrails:**
   ```bash
   python guardrails/install.py
   ```
3. **Index Knowledge Graph:**
   ```bash
   gitnexus analyze
   codegraph init
   ```

---

## Stage 2: Establish Project Persona & Preferences

Read `.brain/preferences.json` (or initialize if missing):
* `technical_level`: `technical` / `basic` / `newbie`
* `language`: User preferred conversation language
* `framework_stack`: Detected technologies

---

## Stage 3: Initial Health Audit & Recommendations

For existing repositories:
* Suggest running `/audit` immediately to discover latent vulnerabilities and relational conflicts.
* Display Next Steps Menu.

---

## ⚠️ NEXT STEPS:
```text
1️⃣ Start brainstorming features? /brainstorm
2️⃣ Design system architecture? /design
3️⃣ Create UI mockups? /visualize
4️⃣ Build implementation plan? /plan
5️⃣ Run project health audit? /audit
```
