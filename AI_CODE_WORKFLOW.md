# AI Code Workflow - Anti-Workflow Ultimate

This document serves as the **Single Source of Truth** for all AI Agents operating in this repository on **Antigravity 2.0**. These standards apply unconditionally to all engineering tasks: feature development, bug fixes, refactoring, UI/UX implementation, configurations, dependencies, database migrations, and deployments.

---

## 1. Core Operating Model

1. **User Owns Product Intent:** The user defines desired behavior, user experience (UX), business priorities, and visible risk acceptance.
2. **AI Owns Technical Execution:** The AI autonomously drives architecture investigation, knowledge graph mapping (GitNexus & CodeGraph), TDD task decomposition, subagent coordination, and automated verification.
3. **No Trivial Technical Questions:** The AI selects the safest, most reversible technical solution and communicates its product impact in plain language.
4. **Continuous Autonomous Execution:** Once product specifications are approved, the AI works autonomously until the change is ready for user live-testing, unless a mandatory stop condition is triggered.

---

## 2. Modular Conversation & Session Slicing Protocol

> **Objective:** Maintain a 100% clean Context Window, eliminate context degradation (Context Rot), and maximize reasoning speed and precision.

1. **Deconstruct Projects into Independent Modular Sessions:**
   - **Session 1 (Architecture & Specs):** `/init` $\to$ `/brainstorm` $\to$ `/visualize` $\to$ `/plan` $\to$ Checkpoint via `/save-brain`.
   - **Session 2 (Backend & Database):** Fresh Chat Session $\to$ `/recap` (hydrate ~800 tokens) $\to$ `/code phase-01` (TDD + Targeted E2E) $\to$ `/save-brain`.
   - **Session 3 (Frontend UI & Integration):** Fresh Chat Session $\to$ `/recap` $\to$ `/code phase-02` (TDD + Targeted E2E) $\to$ `/save-brain`.
   - **Session 4 (Audit & Release):** Fresh Chat Session $\to$ `/audit` $\to$ Live-test $\to$ `/deploy`.

2. **Handover Protocol:**
   - Upon completing a major phase, the AI outputs an explicit handover recommendation:
     > *"🎉 Phase [X] is verified and passed 100%! To preserve maximum AI reasoning capacity and prevent context bloat, please open a fresh chat session and type `/recap` to continue."*

---

## 3. Non-Negotiable Engineering Rules

1. **Observable Acceptance Criteria:** Always define clear, observable acceptance criteria before changing any code.
2. **Knowledge Graph First (Relational Intelligence):**
   - Before modifying code, inspect upstream/downstream dependencies using GitNexus (`impact`, `context`, `trace`) and CodeGraph (`codegraph explore`).
   - Never perform speculative edits without mapping caller/callee dependencies.
3. **Strict Test-Driven Development (RED-GREEN-REFACTOR):**
   - Write smallest scoped failing test $\to$ Verify failure $\to$ Write minimal implementation to pass $\to$ Refactor $\to$ Commit.
   - Never write production logic before the test is established.
   - Never weaken or delete valid assertions merely to make tests pass.
4. **Empirical Verification & Cognitive Reasoning Protocols:** ⭐ UPDATED (v4.15.0)
   - **No Exit-Code Only Assumptions:** Never conclude a tool or subsystem is healthy based merely on an exit code 0 or passive file existence without verifying that the output payload is non-empty and semantically valid.
   - **Scope Gate (Audit vs. Review):** `/audit` executes full repository & architectural verification across all 4 layers. Do not confuse with or downgrade to `/review` (which only checks git diffs).
   - **Hypothesis Elimination Protocol (HEP):** Formulate explicit hypotheses ($H_1 \dots H_n$) and eliminate or validate them with empirical stdout evidence before drawing audit or debugging conclusions.
   - **Diagnostic Accuracy (Mistake vs. Outage):** If a probe symbol/file returns `not found`, verify whether the symbol exists in the codebase before assuming tool or index failure.
   - **Security Invariant ("Absence $\neq$ Safety"):** A zero-finding scan from Taint/PDG or secrets scanners does not prove absolute immunity; defense-in-depth across all 4 layers is mandatory.
   - **Fail-Closed Validator Invariant:** All probes and validators (`.\scripts\schema-probe.ps1`, `.\scripts\data-probe.ps1`) must fail closed with exit code 1 if schemas or live `.brain/` state files are missing.
   - **Test-Fixture & Scanner Isolation:** Scanners must isolate test fixtures to prevent self-poisoning, while probes must support explicit `--root` parameters for deterministic isolated verification.
   - **Runtime Smoke Probes:** When initializing or auditing indexing engines (GitNexus, CodeGraph), execute at least 2–3 live queries (Smoke Probes) to verify runtime readiness (e.g., FTS and Graph status).
5. **Two-Way Lifecycle, Chaining & Clean Reversibility:** ⭐ (v4.13.0)
   - **Idempotency Guarantee:** Installation scripts and configuration modifiers must be idempotent (executing $N$ times produces identical, error-free results).
   - **Non-Destructive Hook Chaining:** Framework hooks must never overwrite existing user hooks; prior hooks must be chained to run first.
   - **Clean Uninstallation:** Every system/Git configuration module must support complete, byte-for-byte reversal (e.g., `python guardrails/install.py --uninstall`).
6. **Supply-Chain Hardening & Strict Version Pinning:** ⭐ (v4.13.0)
   - Never use floating tags such as `@latest` or `*` in MCP configurations (`.gemini/mcp_config.json`), dependency manifests, or CI workflows.
   - All third-party tools and subagent dependencies must be pinned to exact immutable versions (e.g., `gitnexus@1.6.9`).
7. **Smart Testing Pyramid & Process Guard:**
   - **Test what your app owns:** Never re-test primitives guaranteed by the framework or database engine (e.g., UUID uniqueness, ACID properties).
   - **Smallest Scoped Unit Test (< 1s):** Executed during individual task coding in `/code`.
   - **Targeted E2E Smoke Test (Timeout 30s):** Executed upon feature completion. Must meet **Zero Network Errors (HTTP $\ge 400$)** and cleanly kill background process trees.
   - **Evidence Ledger:** Record test metadata into `.brain/verification_ledger.json` instead of dumping raw stdout to chat context.
8. **Sacred Prompt Caching Protection:**
   - Maintain **byte-stable** system prompts, core rules (`GEMINI.md`, `AI_CODE_WORKFLOW.md`), and tool schemas across turns to achieve 90%+ prefix cache hit rates.
9. **Database Integrity & Explicit Foreign Key Hints:**
   - When writing Supabase / PostgREST embedded queries, **ALWAYS** specify explicit foreign key hints (e.g., `supabase.from('questions').select('*, profiles!author_id(*)')`) whenever more than one relationship exists.
   - Run migration impact analysis across all API query files whenever modifying database schema or foreign keys.
10. **Systematic Error Classification & Failed-First-Fix Rule:**
    - **Transient Errors (503, 429, Timeout):** Apply exponential backoff with jitter (max 3 retries).
    - **Deterministic Errors (Ambiguous FK, Logic, Type Error, 400, 401/403):** Stop immediately. Investigate the root cause and confirm hypotheses with evidence from runtime logs and `gitnexus trace`.
    - **Failed-First-Fix Stop Gate:** If the first fix attempt has failed, stop immediately, revert the speculative patch, and return to phase A investigation. Never stack speculative patches on top of a failed fix.
11. **Continuous Learning & Autonomous Skill Synthesis:**
    - Automatically record root causes and proven solutions in `.brain/learnings.md` following successful bug fixes.
    - Synthesize complex reusable solutions into `skills/custom/[skill-name]/SKILL.md` strictly adhering to the `agentskills.io` directory standard.
    - Query `.brain/learnings.md` via `.\scripts\brain-query.ps1` before authoring new plans.
12. **Strict Automated Guardrails & Pre-flight Gate:**
    - Install and enforce **automated guardrails** (`guardrails/guardrail.py` and pre-commit hooks).
    - Agents **must not bypass**, disable, or weaken guardrails, and must never use `git commit --no-verify`.
    - Direct commits on protected branches (`main`, `master`) are strictly blocked.
    - Pre-flight Task Validation: Run `.\scripts\task-brief.ps1 -Validate` before dispatching implementer subagents.
13. **Live-Test Deployment Gate:**
    - **Never deploy** or execute production mutations without the user's **explicit approval** after the user has live-tested the verified change.

---

## 4. The 8-Stage Closed-Loop Lifecycle

```
[/init] ──► [/brainstorm] ──► [/visualize] ──► [gitnexus analyze] ──► [/plan]
   ▲                                                  │                  │
   │                                           [Query .brain/learnings]  │
   │                                                                     │
   │                              [Modular Handover / Fresh Session]     ▼
[/save-brain] ◄── [/deploy] ◄── [/audit] ◄── [/review] ◄── [/code (Smart TDD + E2E)]
   ▲                                                                     │
   └─────────────── [Continuous Learning & Skill Synthesis: /debug] ─────┘
```

1. **Stage 1 - Init & Onboarding (`/init`):** Configure environment, install guardrails, and index codebase.
2. **Stage 2 - Brainstorm & Visualize (`/brainstorm` & `/visualize`):** Discover requirements, draft specs, and build UI mockups.
3. **Stage 3 - Code Intelligence (`gitnexus analyze` & `codegraph init`):** Map AST, execution flows, and route trees.
4. **Stage 4 - Planning (`/plan`):** Query historical learnings via `brain-query`, calculate blast radius, and generate TDD tasks.
5. **Stage 5 - Implementation (`/code`):** Execute tasks via isolated Git Worktrees, strict TDD loops, and targeted E2E smoke tests.
6. **Stage 6 - Independent 2-Stage Review (`/review`):** Verify Spec Compliance and Code Quality.
7. **Stage 7 - Systematic Debugging (`/debug`):** Trace root causes, reproduce errors via failing tests, fix cleanly, and record learnings.
8. **Stage 8 - Audit & Release Gate (`/audit` & `/deploy`):** Comprehensive security scan, user live-test verification, and eternal memory checkpointing.

---

## 5. Mandatory Stop Conditions

The AI must **STOP IMMEDIATELY AND REQUEST USER APPROVAL** when:
1. Deploying to production or modifying production infrastructure.
2. Executing destructive database migrations or schema drops.
3. Detecting security, authentication, authorization, or credential exposure risks.
4. Encountering a blast radius exceeding agreed feature boundaries.
5. First fix attempt fails and root cause lacks deterministic evidence.
6. Targeted E2E tests fail consecutively after 3 fix iterations.
