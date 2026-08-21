# ⚡ Anti-Workflow Ultimate (v4.13.0)

[English](README.md) | [Tiếng Việt](README_VN.md)

> **Autonomous Software Engineering Operating System & Governance Framework for Antigravity 2.0.**  
> Combining the power of: **AWF Orchestrator** + **Superpowers Subagent TDD** + **Hybrid Code-Intelligence (GitNexus Graph DB + CodeGraph Single-Shot & Watcher)** + **Dify-Inspired Production Capabilities** *(Semantic Brain Micro RAG, Pre-flight Contract Gate, Multi-Model Fallback & Observability Ledger)* + **Strict Physical Guardrails** + **Smart Testing Pyramid & Process Guard**.

---

## 🌟 The 5-Pillar Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. ORCHESTRATION & AGENTIC INTERACTION (AWF)                                │
│ • Multi-persona collaboration (PM, Dev, Designer, QA)                       │
│ • Full Lifecycle: /init, /visualize (UI Mockups), /deploy, /save-brain      │
│ • Eternal Memory: .brain/ (Semantic Micro RAG, Verification Ledger)         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 2. GOVERNANCE & STRICT GUARDRAILS (Enforcement & Resilience)                │
│ • Engineering Constitution: AI_CODE_WORKFLOW.md & GEMINI.md                 │
│ • Physical Guardrails: guardrails/ (Pre-commit hooks, Protected branches)   │
│ • Model Resilience: Automatic Fallback on HTTP 429/503                      │
│ • Sacred Prompt Caching: Byte-stable prefixes -> 90%+ Cache Hit             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 3. EXECUTION ENGINE (Superpowers Subagents)                                 │
│ • Subagent-Driven Development (isolated background tasks, 2-5 min scope)    │
│ • Pre-flight Task Validation (verifies observable acceptance criteria)       │
│ • Smart TDD: RED ➔ GREEN ➔ REFACTOR (Smallest Scoped Unit Test < 1s)        │
│ • Observability Ledger: .brain/verification_ledger.json (Duration, Tokens)  │
│ • Git Worktree Isolation & 2-Stage Independent Code Review                  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 4. HYBRID CODE-INTELLIGENCE & MCP (GitNexus + CodeGraph)                    │
│ • GitNexus: Knowledge Graph (LadybugDB / Cypher), Flows & Blast Radius      │
│ • CodeGraph: Live Watcher (Auto-sync), Single-shot Explore, Framework Routes│
│ • Smart Test Selector (codegraph affected via git diff)                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 5. SMART TESTING PYRAMID & PROCESS GUARD                                    │
│ • Layered Testing: Unit (< 1s) ➔ Targeted E2E Smoke (30s) ➔ Full Suite Gate  │
│ • Zero Network Errors (HTTP >= 400) Acceptance Criterion                    │
│ • Process Tree Auto-Kill: Eliminates orphan background servers & browsers   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Advanced Architecture Innovations (Hermes & Dify Inspired)

1. **⚡ Sacred Prompt Caching (Prefix Cache Protection):**
   - Preserves **byte-stable** system prompts, core rules (`GEMINI.md`, `AI_CODE_WORKFLOW.md`), and tool schemas.
   - Enables Gemini and Claude to hit **90%+ Prefix Caching**, reducing token costs by 70–85% and maximizing latency performance.
2. **🧠 Semantic Brain Micro RAG (`scripts/brain-query.ps1`):**
   - Indexes project learnings into a fast searchable store. Queries only the 1-2 most relevant learnings (~100 tokens) instead of parsing entire text files.
3. **🛡️ Pre-flight Task Contract Gate (`scripts/task-brief.ps1 -Validate`):**
   - Verifies Goal, Acceptance Criteria, Scoped Test Files, and Database constraints **before** subagents write code, catching hallucinations early.
4. **📜 Observability & Verification Ledger (`.brain/verification_ledger.json`):**
   - Structured JSON logging of test outcomes, exit codes, durations (`duration_ms`), and execution status, keeping context windows clean.
5. **🛠️ Autonomous Skill Synthesis:**
   - Automatically synthesizes reusable engineering techniques from `/debug` into standard `skills/custom/[skill-name]/SKILL.md` (compliant with `agentskills.io`).

---

## 📦 Quick Installation (One-Time Setup)

### Windows (PowerShell):
```powershell
& ".\install.ps1"
```

### Linux / macOS (Bash):
```bash
bash "./install.sh"
```

---

> [!IMPORTANT]
> ## 🎯 FOR EXISTING PROJECTS (ONBOARDING):
> **When opening Antigravity 2.0 in any existing project directory, simply type:**
> ```text
> /init
> ```
> **👉 Anti-Workflow-Ultimate will AUTO-CONFIGURE the project with zero friction!**
> 
> * **Zero Code Loss:** Preserves 100% of existing source code, branches, and git history.
> * **Automatic Setup:** Installs Git Pre-commit Guardrails and auto-detects true project test commands.
> * **Codebase Indexing:** Automatically builds GitNexus & CodeGraph knowledge graphs in seconds.
> * **Instant Health Audit:** Suggests running `/audit` to identify latent bugs and database relation conflicts before coding!

---

## 🛡️ Smart Testing Pyramid & Process Guard

> *"The goal is not to run fewer tests. The goal is to run the RIGHT tests, at the RIGHT layer, at the RIGHT time."*

```
        / \
       /   \      3. FULL SUITE (Release Gate before Deployment)
      /  ▲  \
     /───┼───\    2. TARGETED E2E SMOKE (Validate 1 Feature - Timeout 30s)
    /    │    \
   /─────┴─────\  1. UNIT & COMPONENT TESTS (Ultra-fast < 1s per task)
```

1. **Test What Your App Owns:** Never re-test framework primitives or database engine guarantees (e.g., UUID collision or Postgres ACID).
2. **Smallest Scoped Unit Test (< 1s):** Executed during individual task implementation in `/code`.
3. **Targeted E2E Smoke Test (Timeout 30s):** Executed upon feature completion with **Zero Network Errors (HTTP $\ge 400$)** criteria and automatic process cleanup.
4. **Smart Test Selection via CodeGraph:** Use `git diff --name-only | codegraph affected --stdin` to run only tests impacted by recent changes.

---

## 📋 Comprehensive Workflow Commands

| Command | Workflow | Description |
| :--- | :--- | :--- |
| `/init` | `init.md` | ✨ Initialize or onboard an existing repository |
| `/brainstorm` | `brainstorm.md` | 💡 Socratic requirement discovery & spec drafting |
| `/visualize` | `visualize.md` | 🖼️ Generate HTML/CSS UI mockups & extract design tokens |
| `/plan` | `plan.md` | 📋 Generate Smart TDD Implementation Plan with Blast Radius |
| `/design` | `design.md` | 🎨 System architecture, Database schema & API Route mapping |
| `/code` | `code.md` | 💻 Execute tasks via Subagents & Strict TDD Loop |
| `/test` | `test.md` | 🧪 Smart layered testing pyramid & affected test runner |
| `/debug` | `debug.md` | 🐛 Root cause tracing, Failed-First-Fix & Learning synthesis |
| `/review` | `review.md` | 👀 2-Stage independent review (Spec compliance + Code quality) |
| `/audit` | `audit.md` | 🔒 Security, architecture integrity & database relation audit |
| `/deploy` | `deploy.md` | 🚀 Production deployment with mandatory live-test gate |
| `/rollback` | `rollback.md` | ⏪ Safe deployment rollback |
| `/recap` | `recap.md` | 📖 Hydrate context into a fresh modular session (~800 tokens) |
| `/save-brain` | `save_brain.md` | 🧠 Eternal context checkpoint & session handoff |
| `/next` | `next.md` | ➡️ Context-aware next action recommendation |
| `/help` | `help.md` | ❓ Interactive guidance & framework assistant |
| `/customize` | `customize.md` | ⚙️ Persona, technical level, and workflow tuning |
| `/refactor` | `refactor.md` | 🔧 Code restructuring without behavior alteration |
| `/run` | `run.md` | ▶️ Safe application launch with process guard |

---

## 🔒 Physical Pre-Commit Guardrails

* Blocks direct commits to protected branches (`main`, `master`).
* Enforces true test, lint, typecheck, and build execution before commits.
* Scans for credentials (`sk-...`, `ghp_...`, private keys), merge conflict markers, and debug markers (`DEBUG_ONLY`).
* Strictly blocks `--no-verify` workarounds.

---

## 📄 License & Standards

* Compliant with `agentskills.io` open standard.
* Released under the MIT License.
