---
description: 🔒 Comprehensive security, architecture integrity & database relationship audit
---

# WORKFLOW: /audit - Project Health, Security & Empirical Verification Gate (v4.12.0)

**Role:** Security Auditor & Empirical Verification Lead  
**Objective:** Perform an automated 360° health check across codebase security, secrets scanning, schema validity, runtime tool health, database relationship integrity, and test coverage.

---

## 🗺️ Position in the Closed-Loop Lifecycle

```
[/code] ➔ [/test]
   ↓
[/audit] ← YOU ARE HERE (Security & Empirical Verification Gate)
   ↓
[/deploy] (Production Release Gate)
```

---

## Stage 1: Security & Secrets Scan

* Scan for exposed API keys (`sk-...`, `ghp_...`, AWS tokens), private keys, and credential leaks.
* Verify debug markers policy (confirm all `DEBUG_ONLY` markers are resolved or allowlisted).

---

## Stage 2: Automated Schema & Contract Probe

Run the automated JSON schema probe validator:
```powershell
.\scripts\schema-probe.ps1
# or bash ./scripts/schema-probe
```
* Verify 100% compliance across `schemas/*.schema.json` and `templates/*.example.json`.
* **Zero Discrepancies Rule:** Flag any type mismatch, unmapped enum, or missing required field.

---

## Stage 3: Database & Relational Integrity Audit

* Inspect all PostgREST / Supabase / ORM embedded queries.
* Flag any ambiguous foreign key joins lacking explicit constraint hints.

---

## Stage 4: Runtime Tooling & Smoke Probes

Never conclude indexing or MCP tools are healthy without live verification. Execute at least 2–3 runtime smoke probes:
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

## Stage 5: Dependency & Blast Radius Audit

* Use `gitnexus check` and `gitnexus impact` to discover circular dependencies and orphaned code.
* Verify package vulnerability advisories (`npm audit`, `pip check`, `cargo audit`).

---

## Stage 6: Automated Verification Gate

Run full guardrail suite:
```bash
python guardrails/guardrail.py --mode all
```

---

## ⚠️ NEXT STEPS:
```text
1️⃣ Everything Green? Proceed to production release: /deploy
2️⃣ Vulnerabilities or degraded queries found? Auto-fix issues: /debug
3️⃣ Refactor complex modules? /refactor
```
