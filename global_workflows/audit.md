---
description: 🔒 Comprehensive security, architecture integrity & database relationship audit
---

# WORKFLOW: /audit - Project Health & Security Audit Gate (v4.11.0)

**Role:** Security Auditor & Architecture Reviewer  
**Objective:** Perform an automated 360° health check across codebase security, secrets scanning, database relationship integrity, circular dependencies, and test coverage.

---

## 🗺️ Position in the Closed-Loop Lifecycle

```
[/code] ➔ [/test]
   ↓
[/audit] ← YOU ARE HERE (Security & Architecture Gate)
   ↓
[/deploy] (Production Release Gate)
```

---

## Stage 1: Security & Secrets Scan

* Scan for exposed API keys (`sk-...`, `ghp_...`, AWS tokens), private keys, and credential leaks.
* Verify debug markers policy (confirm all `DEBUG_ONLY` markers are resolved or allowlisted).

---

## Stage 2: Database & Relational Integrity Audit

* Inspect all PostgREST / Supabase / ORM embedded queries.
* Flag any ambiguous foreign key joins lacking explicit constraint hints.

---

## Stage 3: Dependency & Blast Radius Audit

* Use `gitnexus check` and `gitnexus impact` to discover circular dependencies and orphaned code.
* Verify package vulnerability advisories (`npm audit`, `pip check`, `cargo audit`).

---

## Stage 4: Automated Verification Gate

Run full guardrail suite:
```bash
python guardrails/guardrail.py --mode all
```

---

## ⚠️ NEXT STEPS:
```text
1️⃣ Everything Green? Proceed to production release: /deploy
2️⃣ Vulnerabilities found? Auto-fix issues: /debug
3️⃣ Refactor complex modules? /refactor
```
