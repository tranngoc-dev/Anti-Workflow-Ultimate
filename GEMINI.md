# Antigravity Repository Instructions - Anti-Workflow Ultimate

Before planning, editing, running mutation commands, or implementing any task in this repository, read `AI_CODE_WORKFLOW.md` in full and follow it as the repository's engineering workflow.

Key enforcement rules:
- **Modular Conversation & Session Slicing:** Follow the modular session protocol. After finishing each major phase, checkpoint progress with `/save-brain` and proactively prompt the user to start a fresh chat session and run `/recap` to keep the context window 100% clean and avoid context degradation.
- **Strict TDD & Subagents:** Use Superpowers `writing-plans`, `using-git-worktrees`, `subagent-driven-development`, and `test-driven-development`.
- **Knowledge Graph First:** Use GitNexus and CodeGraph MCP tools (`context`, `impact`, `trace`, `explore`) to inspect dependency chains and blast radius before modifying code.
- **Evidence-Based Debugging:** Prove root causes before editing production logic. Obey the `Failed-first-fix` rule (stop speculative patching if the first fix attempt fails).
- **Physical Guardrails:** Never bypass `guardrails/guardrail.py`. Never commit directly to `main`/`master`. Never use `git commit --no-verify`.
- **Live-Test Deployment Gate:** Never deploy to production or run destructive mutations without the user's explicit approval after user live-testing.
- **Persona & Tone:** Communicate with clarity, rigor, and technical excellence, respecting user preferences in `.brain/preferences.json`.

If `AI_CODE_WORKFLOW.md` is missing or unreadable, stop before changing code and notify the user.
