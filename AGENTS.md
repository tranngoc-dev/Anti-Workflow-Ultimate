# AGENTS.md - Multi-Agent Directives for Anti-Workflow Ultimate

> **Core Workflow Requirement:** All agents must read and strictly adhere to [AI_CODE_WORKFLOW.md](AI_CODE_WORKFLOW.md) in full before making any modifications.

This repository operates under a unified multi-agent hierarchy combining Antigravity 2.0, Superpowers Subagents, and GitNexus Relational Intelligence.

## 1. Controller & Subagent Hierarchy

1. **Controller Agent (Orchestrator):**
   - Interacts with the user, guides them through Slash Commands (`/init` $\to$ `/deploy`).
   - Reads `.brain/preferences.json` and adjusts tone/persona (PM, Dev, Designer, QA).
   - Manages Modular Session Handover between phases to maintain a clean Context Window.
   - Enforces the Start-of-Task contract and dispatches Subagents.

2. **Implementer Subagent (Execution Worker):**
   - Dispatched per task via `subagent-driven-development`.
   - Operates in an isolated Git Worktree.
   - Enforces Strict TDD (RED-GREEN-REFACTOR) on minimal files.
   - Queries GitNexus MCP tools (`context`, `impact`, `trace`) to understand dependency relationships.
   - Never dispatches its own subagents.

3. **Task Reviewer Subagent (Independent Quality Gate):**
   - Review 1: Spec Compliance (verifies implementation matches the task brief exactly).
   - Review 2: Code Quality (adherence to clean code, no magic numbers, proper typing, no unused files).
   - Runs GitNexus `shape_check` and `detect_changes`.

## 2. GitNexus MCP Integration

Always query GitNexus MCP tools when planning or implementing changes:
- `gitnexus:impact` - Query upstream/downstream blast radius before modifying any symbol.
- `gitnexus:context` - Get 360-degree symbol view with execution flow and cluster memberships.
- `gitnexus:trace` - Find the shortest execution path between two functions during debugging.
- `gitnexus:detect_changes` - Compare working tree diff against indexed execution processes.
- `gitnexus:shape_check` - Verify API response payloads match frontend consumer expectations.

## 3. Modular Session Protocol

When a major phase completes:
1. Append progress to `.brain/session_log.txt` and update `.brain/session.json`.
2. Save artifacts into `docs/superpowers/plans/` and `docs/superpowers/specs/`.
3. Provide the user with the Handover notice to start a new chat session with `/recap`.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Anti-Workflow-Ultimate** (1871 symbols, 3231 relationships, 157 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/Anti-Workflow-Ultimate/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Anti-Workflow-Ultimate/clusters` | All functional areas |
| `gitnexus://repo/Anti-Workflow-Ultimate/processes` | All execution flows |
| `gitnexus://repo/Anti-Workflow-Ultimate/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
