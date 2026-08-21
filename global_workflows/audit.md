---
description: 🔒 Comprehensive security, architecture integrity & database relationship audit
---

# WORKFLOW: /audit - 4-Layer Empirical Verification & Security Gate (v4.15.0)

**Role:** Lead Security Auditor & Empirical Verification Specialist  
**Objective:** Execute an automated 4-Layer Empirical Verification Matrix covering structural schemas, deep payload semantics, runtime tool readiness, supply-chain integrity, and physical guardrail security.

---

## 🧭 Operational Directives (Cognitive Protocols)

### 1. Scope Gate: Full Audit vs. Review Diff
* `/audit` is a **Full Repository & Architecture Audit** across the entire codebase and its live environment.
* **Do NOT short-circuit to `/review`:** The `/review` subagent/skill only compares Git diffs on staged changes or branches. `/audit` evaluates the entire system state, data cleanliness, graph health, and security posture.

### 2. Hypothesis Elimination Protocol (HEP)
Before drawing conclusions, formulate explicit hypotheses ($H_1, H_2, \dots, H_n$) and eliminate or validate them using stdout evidence:
| Hypothesis | Initial Assumption | Empirical Evidence | Verdict |
|---|---|---|---|
| $H_1$ (Schema) | Are unknown properties rejected? | `.\scripts\schema-probe.ps1` output | Confirmed / Refuted |
| $H_2$ (Data) | Is there foreign project contamination? | `.\scripts\data-probe.ps1` output | Confirmed / Refuted |
| $H_3$ (Runtime) | Are hybrid search & PDG live? | `gitnexus query` / `context` | Confirmed / Refuted |
| $H_4$ (Guardrails) | Are all unit tests and hooks clean? | `guardrail.py --mode all` | Confirmed / Refuted |

### 3. Diagnostic Accuracy: Operational Mistake vs. System Outage
* If a probe symbol or file returns `not found`, verify whether the symbol actually exists in the codebase before declaring a tool outage or index corruption.

### 4. Security Invariant: "Absence $\neq$ Safety"
* A scanner or Taint/PDG returning `0 findings` means no violations were detected under the current model; it does NOT prove absolute absence of vulnerabilities. Defense-in-depth across all 4 layers is mandatory.

---

## 🗺️ Position in the Closed-Loop Lifecycle

```
[/code] ➔ [/test]
   ↓
[/audit] ← YOU ARE HERE (4-Layer Empirical Verification & Security Gate)
   ↓
[/deploy] (Production Release Gate)
```

---

## 🏛️ The 4-Layer Empirical Audit Matrix

### 🔹 Layer 1: Structural Schema & Contract Probe
Run the automated schema probe validator:
```powershell
.\scripts\schema-probe.ps1
# or bash ./scripts/schema-probe
```
* Verifies 100% compliance across `schemas/*.schema.json` and `templates/*.example.json`.
* **Zero Discrepancies Rule:** Enforce `additionalProperties: false` across top-level and nested objects. Flag any type mismatch or missing required field.

---

### 🔹 Layer 2: Deep Data & Payload Semantic Probe
Run the deep payload validator:
```powershell
.\scripts\data-probe.ps1
# or bash ./scripts/data-probe
```
* **Project Identity Check:** Matches `project.name` and `repository` in `.brain/brain.json` against active project context.
* **Payload Cleanliness & Isolation:** Scans `.brain/`, `templates/`, and docs for foreign project IDs, foreign URLs, or unmapped entity references, while cleanly isolating test fixtures to prevent self-poisoning.

---

### 🔹 Layer 3: Runtime Tooling & Live Smoke Probes
Never conclude indexing or MCP tools are healthy without executing live smoke probes:
1. **Graph Symbol Context Probe:**
   ```bash
   gitnexus context <primary_function>
   ```
   * Ensure `status: found` and incoming/outgoing call graphs are populated.
2. **Query / FTS Search Probe:**
   ```bash
   gitnexus query "<core_concept>"
   ```
   * Ensure both BM25 and vector semantic search execute cleanly with fresh commit index.
   * If FTS or PDG layers are missing, repair: `gitnexus analyze --repair-fts --pdg`.

---

### 🔹 Layer 4: Physical Guardrail, Supply-Chain & Unit Test Gate
Run the full automated guardrail suite:
```bash
python guardrails/guardrail.py --mode all
```
* **Secrets & Debug Markers Scan:** Blocks exposed API keys, private keys, and unresolved `DEBUG_ONLY` markers.
* **Supply-Chain Hardening:** Enforces pinned immutable versions (blocks floating tags like `@latest` in MCP configs).
* **Two-Way Lifecycle & Hook Integrity:** Verifies hook idempotency, previous hook chaining, and clean `--uninstall` support.
* **Unit & Regression Suite:** Executes 100% of test suites in `guardrails/tests/`.

---

## ⚠️ NEXT STEPS:
```text
1️⃣ Everything Green? Proceed to production release: /deploy
2️⃣ Vulnerabilities, dirty payload, or degraded queries found? Auto-fix issues: /debug
3️⃣ Refactor complex modules? /refactor
```
