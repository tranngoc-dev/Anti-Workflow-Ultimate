---
description: 🐛 Scientific debugging, Systematic Root-Cause Tracing & Learning Synthesis
---

# WORKFLOW: /debug - Scientific Debugging & Systematic Root-Cause Tracing (v4.11.0)

**Role:** Root-Cause Investigator & Reliability Lead  
**Objective:** Classify errors (Transient vs Deterministic), trace execution paths via **GitNexus Trace**, lock regressions with targeted tests, record evidence in **Verification Ledger (`.brain/verification_ledger.json`)**, and **synthesize learnings into `.brain/learnings.md`**.

---

## 🗺️ Position in the Closed-Loop Lifecycle

```
Error Detected in [/code], [/test], or Live-Testing
   ↓
[/debug] ← YOU ARE HERE
   ├── Phase A: Error Classification & Root Cause Tracing
   ├── Phase B: Lock Regression with Failing Automated Test
   ├── Phase C: Minimal Fix & Failed-First-Fix Stop Gate
   ├── Phase D: Verification & Ledger Recording
   └── Phase E: Autonomous Learning & Skill Synthesis
   ↓
Resume [/code] or [/test]
```

---

## Phase A: Classify & Investigate

1. **Error Taxonomy:**
   * **Transient Errors (503, 429, Timeout):** Exponential backoff with jitter (max 3 retries).
   * **Deterministic Errors (Ambiguous FK, Logic, Type, 400, 401/403):** Stop retrying. Investigate root causes with runtime evidence.
2. **Hybrid Trace & Code Extraction:**
   * **Semantic Brain Query:** Run `.\scripts\brain-query.ps1 -Query "<Error Symptom>"` to check for prior proven solutions.
   * **GitNexus:** Use `gitnexus:trace` to map call paths from input to failure, and `gitnexus:impact` for blast radius.
   * **CodeGraph:** Use `codegraph explore <symbol>` for surgical line-numbered source.

---

## Phase B: Lock the Regression

* Write a minimal failing test (Unit or API Integration probe) reproducing the exact bug before altering production logic.

---

## Phase C: Minimal Fix & Failed-First-Fix Rule

* Apply the smallest clean patch addressing the confirmed cause.
* **Failed-First-Fix Rule:** If the first fix attempt fails, stop immediately, revert the patch, and return to Phase A investigation.

---

## Phase D: Verify & Record Ledger

1. Re-run tests to confirm status changed from **FAIL ➔ PASS**.
2. Record evidence in `.brain/verification_ledger.json`.
3. Auto-clean all background test processes.

---

## Phase E: Autonomous Learning & Skill Synthesis

Append to `.brain/learnings.md`:
```markdown
### [LEARNING-YYYYMMDD-INDEX] {Error Title & Classification}
- 📍 **Symptom & Category:** {Transient / Deterministic} - {Error Code / Status}
- 🔍 **Root Cause:** {Technical root cause explanation}
- 💡 **Proven Solution:** {Exact verified fix}
- 🚫 **Anti-Pattern:** {Practices to strictly avoid}
- 🛡️ **Rule Evolution:** {Proposed guardrail updates if severe}
```
