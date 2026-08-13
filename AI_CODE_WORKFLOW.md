# AI Code Workflow

This file is the single source of truth for AI agents working in this repository. It applies to every code change: new features, behavior changes, bug fixes, deletions, refactors, configuration, dependencies, database changes, and deployment-related work.

## 1. Operating model

- The user owns product intent: desired behavior, user experience, priorities, and acceptance of visible risks.
- The AI owns technical execution: investigation, architecture, implementation, tests, verification, and rollback planning.
- Do not ask the user to choose between technical options they cannot reasonably evaluate. Select the safest reversible option and explain its product effect in plain language.
- After the user confirms the desired product behavior, work autonomously until the change is ready for the user's live test, unless a mandatory stop condition is reached.
- Report noteworthy risk immediately. Summarize ordinary, reversible technical decisions at handoff.

## 2. Instruction priority

Follow higher-priority platform and user instructions first. Within repository instructions, this file governs the engineering workflow. More specific nested instructions may add constraints but must not silently weaken the safety gates here. If two instructions conflict, stop and explain the conflict plainly.

## 3. Non-negotiable rules

1. Understand the requested behavior and define observable acceptance criteria before changing code.
2. Inspect the existing implementation and follow established project patterns before proposing a new structure.
3. Prefer the smallest change that solves the confirmed problem and preserves unrelated behavior.
4. Do not refactor unrelated code, create speculative abstractions, add defensive fallbacks that hide an unknown cause, or upgrade dependencies without demonstrated need.
5. Never change or remove a valid test merely to make an incorrect implementation pass. Tests may change only when the user-approved product behavior has changed; explain why.
6. Never claim success without fresh evidence from relevant tests, checks, and a review of the final diff.
7. Never deploy or perform a production mutation without the user's explicit approval after the user has live-tested the change.
8. When automated guardrails are present, install and run them as documented. Agents must not bypass, disable, weaken, or falsely satisfy those gates; a gate failure is evidence to investigate, not an obstacle to route around.

## 4. Start-of-task contract

Convert the user's request into a short internal contract:

- **Goal:** the user-visible result.
- **Acceptance criteria:** observable conditions that mean it works.
- **Out of scope:** behavior that must remain unchanged.
- **Risk level:** routine, noteworthy, or irreversible/production-sensitive.
- **Verification:** how the AI and then the user can prove the result.

If the desired behavior is materially ambiguous, ask one product-language question at a time. Do not ask for technical preferences unless the choice changes product behavior, cost, security, data, or reversibility.

## 5. Change classification and workflow

### 5.1 Feature, behavior change, or deletion

1. Trace the relevant current behavior and dependencies.
2. Define acceptance criteria and behaviors that must remain unchanged.
3. Use GitNexus when available and relevant to inspect execution flow, callers, callees, dependencies, and blast radius.
4. Choose the smallest safe design consistent with existing patterns.
5. Add or update tests that prove the requested behavior.
6. Implement in small, coherent steps.
7. Run focused tests, then the broader relevant suite and project checks.
8. Review the final diff for scope creep, duplication, unnecessary files, dead code, and hidden fallbacks.
9. Prepare a plain-language handoff for the user's live test.

### 5.2 Bug fix

Use distinct phases. The AI may work autonomously within a phase, but must not turn failed implementation into repeated speculative patching.

#### Phase A — Reproduce and investigate

- Reproduce the symptom reliably or document why reproduction is currently impossible.
- Trace the input-to-failure execution path.
- Use GitNexus when available and relevant to inspect callers, callees, dependencies, and blast radius.
- Form no more than three ranked hypotheses.
- Confirm or reject hypotheses with evidence such as logs, focused tests, runtime inspection, or a minimal reproduction.
- Do not change production logic before the root cause is supported by evidence. Temporary instrumentation is allowed and must be removed before handoff.

#### Phase B — Lock the regression

- Add a failing automated test that reproduces the confirmed bug.
- If an automated test is genuinely impractical, create a deterministic script or an exact manual checklist with observable expected and actual results.
- Do not weaken existing assertions to manufacture a passing result.

#### Phase C — Implement the smallest fix

- Change only the files needed to address the confirmed cause.
- Preserve explicitly out-of-scope behavior.
- Avoid new dependencies, broad abstractions, compatibility layers, and fallback branches unless evidence shows they are required.
- Keep a clear rollback path.

#### Phase D — Verify

- Run the regression test and relevant existing tests.
- Run the repository's relevant type, lint, build, migration, or integration checks.
- Review the final diff and GitNexus blast radius when relevant.
- Confirm that temporary logs, debug flags, bypasses, and test data are removed.

#### Failed-first-fix rule

If the first implementation attempt does not fix the symptom or breaks another valid test:

1. Stop implementation.
2. Revert or isolate the failed attempt when safe.
3. Return to Phase A with the new evidence.
4. Do not add a second speculative patch, extra fallback, wrapper, or abstraction on top of the failed attempt.
5. Explain the blocker in plain language if a mandatory stop condition is reached.

### 5.3 Refactor

- A refactor must have a stated, current need and must preserve observable behavior.
- Establish characterization tests before changing structure when behavior is not already protected.
- Keep the refactor separate from unrelated feature or bug work whenever practical.
- Do not use a small request as permission for repository-wide cleanup.

## 6. GitNexus protocol

When GitNexus is installed and the task touches non-trivial flows or relationships:

- Before changing code, use it to inspect execution flow, callers, callees, dependencies, and likely blast radius.
- Treat GitNexus as evidence about relationships, not proof that a proposed change is necessary or correct.
- If files, symbols, imports, exports, or component relationships change, assume the index may be stale. Re-index before relying on GitNexus for the next structural analysis.
- Re-index after the completed structural change and re-check impact before handoff.
- If the index appears inconsistent with the current working tree, stop relying on it until it is refreshed.
- In the handoff, state briefly how GitNexus affected the scope decision; do not dump raw query output unless requested.

If GitNexus is unavailable, do not pretend it was used. Use repository search, references, tests, and runtime evidence, and disclose the limitation only when it materially reduces confidence.

## 7. Autonomy and mandatory stop conditions

For routine, reversible technical decisions, choose the safest minimal option and continue. Explain those decisions at handoff.

Stop before acting and ask for user confirmation when any of the following is required:

- Deployment, publication, production configuration, or any production mutation.
- Destructive or difficult-to-reverse database/schema migration.
- Deletion, overwrite, transformation, or migration of user or production data.
- Security, authentication, authorization, permissions, secrets, or privacy behavior with material risk.
- A change that can create meaningful external cost, paid resource usage, or vendor lock-in.
- A change outside the confirmed product scope.
- A new major dependency, framework migration, or large abstraction whose maintenance cost is material.
- GitNexus or repository inspection shows a substantially larger blast radius than expected.
- A valid existing test fails and the safe resolution is not clear.
- The root cause of a bug cannot be supported by evidence.
- The first bug-fix implementation fails and the next step would be speculative.
- Relevant verification cannot be performed in an environment sufficiently close to production.
- The change cannot be rolled back safely.

When stopped, explain:

1. What happened, in plain language.
2. Why continuing could be unsafe or wasteful.
3. The safest recommended next action.
4. What the user or users would observe.
5. Remaining risk and rollback implications.

If a safe, reversible action can gather more evidence without expanding scope, take it first and then report the result.

## 8. Scope and codebase-growth controls

Before handoff, inspect the diff and reject unnecessary growth. Specifically check for:

- Files changed without a direct connection to acceptance criteria.
- Duplicate logic or multiple competing implementations.
- New wrappers, services, helpers, or configuration layers used only once without a concrete need.
- Catch-all error handling or fallback paths that conceal failures.
- Dead code, commented-out code, temporary compatibility paths, debug logs, and unused dependencies.
- Renames or formatting churn mixed into functional changes.
- Tests that assert implementation details instead of product behavior.

If the diff has expanded materially beyond the initial scope, stop, explain why, and reduce it or obtain confirmation before continuing.

## 9. Verification gate

Verification must match the change. Use the repository's existing commands and conventions. At minimum:

1. Prove each acceptance criterion with a test, deterministic check, or clearly identified user live-test step.
2. Run focused tests for the changed behavior.
3. Run the broader relevant test suite and applicable type, lint, build, migration, security, or integration checks.
4. Inspect the full final diff and working-tree status.
5. Confirm no temporary instrumentation, secret, bypass, or unintended generated artifact remains.
6. Record the exact commands run and their outcomes.

A passing test suite does not by itself prove production readiness. State any environment gap, untested integration, migration risk, or manual verification still required.

## 10. Handoff format

When the change is ready for the user's live test, report concisely in plain language:

### What changed

- Describe the user-visible result, not just filenames or technical mechanisms.

### Why this approach

- Explain the chosen solution and why it was the safest small, reversible option.

### Evidence

- List the checks and tests actually run and their outcomes.
- For bug fixes, name the demonstrated root cause and the regression evidence.
- Mention relevant GitNexus blast-radius findings or disclose if it was not available and that matters.

### How the user should test

- Give numbered, product-level steps with expected outcomes.

### Remaining risk and rollback

- State known gaps or say that none were found within the verified scope.
- Explain how to return to the previous state.

### Deployment gate

- State explicitly: **Not deployed. Waiting for the user's live-test confirmation and explicit permission to deploy.**

Do not describe work as complete if verification is incomplete. Say exactly what is verified and what remains.

## 11. Definition of ready for user test

A change is ready for the user's live test only when:

- Acceptance criteria are addressed.
- Relevant automated checks pass, or failures are clearly disclosed and block handoff when material.
- The final diff is minimal and reviewed.
- No known unrelated behavior was intentionally changed.
- Temporary debug artifacts are removed.
- Risks and environment gaps are documented plainly.
- Rollback is understood.
- No deployment or production mutation has occurred without explicit approval.
