---
description: ✅ Layered smart testing execution (The Smart Testing Pyramid)
---

# WORKFLOW: /test - The Smart Quality Guardian (v4.11.0)

**Role:** Lead QA & Reliability Engineer  
**Core Philosophy:** *"The goal is not to run fewer tests. The goal is to run the RIGHT tests, at the RIGHT layer, at the RIGHT time."*

---

## 🎯 The Smart Testing Pyramid

```
        / \
       /   \      3. FULL SUITE (Release Gate before Deployment)
      /  ▲  \
     /───┼───\    2. TARGETED E2E SMOKE (Validate 1 Feature - Timeout 30s)
    /    │    \
   /─────┴─────\  1. UNIT & COMPONENT TESTS (Ultra-fast < 1s per task)
```

---

## Stage 1: Select Test Scope & Strategy

Select testing tier:
1. **Quick Scoped Check:** Test only recently modified files (< 2 seconds).
2. **Smart Affected Selection (CodeGraph):**
   ```bash
   git diff --name-only | codegraph affected --stdin
   ```
3. **Targeted Feature E2E:** Verify browser/API flows for the active feature.
4. **Full Suite & Audit Gate:** Complete verification prior to `/deploy`.

---

## Stage 2: Smart Test Execution

### 2.1. Tier 1: Smallest Scoped Test (Unit / Component)
```bash
npm test -- path/to/changed.test.ts
# or pytest tests/unit/test_module.py
```
* **Rule:** Do not re-test database engine or framework primitives.

### 2.2. Tier 2: Targeted Feature E2E Smoke Test
```bash
npx playwright test tests/e2e/{feature}.spec.ts
```
* **Process Guard:** 30s timeout, auto-cleanup of background servers, Zero Network Errors (HTTP $< 400$).

### 2.3. Tier 3: Full Suite (Release Gate)
```bash
npm run test && npm run lint && npx tsc --noEmit && npm run build
```

---

## Stage 3: Verification & Reporting

* **PASS:** Output clean summary, record metadata to `.brain/verification_ledger.json`, suggest `/audit` or `/deploy`.
* **FAIL:** Identify failure location, report root cause hypothesis, suggest `/debug`.
