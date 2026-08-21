---
description: 🔒 Comprehensive security, architecture integrity & database relationship audit
---

# WORKFLOW: /audit - 4-Layer Empirical Verification & Security Gate (v4.13.0)

**Role:** Lead Security Auditor & Empirical Verification Specialist  
**Objective:** Execute an automated 4-Layer Empirical Verification Matrix covering structural schemas, deep payload semantics, runtime tool readiness, supply-chain integrity, and physical guardrail security.

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
* **Zero Discrepancies Rule:** Flag any type mismatch, unmapped enum, or missing required field.

---

### 🔹 Layer 2: Deep Data & Payload Semantic Probe
Run the deep payload validator:
```powershell
.\scripts\data-probe.ps1
# or bash ./scripts/data-probe
```
* **Project Identity Check:** Matches `project.name` and `repository` in `.brain/brain.json` against the active project context.
* **Payload Cleanliness:** Deeply scans all `.brain/`, `templates/`, and docs for foreign project IDs, foreign URLs, or unmapped entity references.

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
   * If FTS indexes are missing, flag degradation and suggest repair: `gitnexus analyze --repair-fts`.

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
