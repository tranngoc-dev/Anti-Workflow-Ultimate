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
