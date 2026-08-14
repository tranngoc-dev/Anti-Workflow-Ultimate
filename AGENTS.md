# Codex Repository Instructions

Before planning, editing, running mutation commands, or implementing any task in this repository, read `AI_CODE_WORKFLOW.md` in full and follow it as the repository's engineering workflow.

Key enforcement rules:

- Apply `AI_CODE_WORKFLOW.md` to every addition, modification, deletion, refactor, bug fix, configuration change, dependency change, database change, and deployment-related task.
- After the user confirms desired product behavior, work autonomously to a verified, ready-for-user-test state unless a mandatory stop condition in the core workflow is reached.
- Use GitNexus as required by the core workflow; do not assume its index is current after structural changes.
- For bugs, prove the root cause before changing production logic. If the first fix fails, stop patching and return to investigation.
- Keep changes minimal and reversible; do not perform unrelated refactors or hide unknown causes with fallbacks.
- Explain important risk immediately in plain language. Summarize routine technical decisions at handoff.
- Never deploy or mutate production without the user's explicit approval after live testing.

If `AI_CODE_WORKFLOW.md` is missing or unreadable, stop before changing code and tell the user that the repository's core workflow is unavailable.

