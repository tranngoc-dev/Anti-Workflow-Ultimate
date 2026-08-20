#!/usr/bin/env python3
"""Fail-closed checks shared by local Git hooks and CI."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class Finding:
    rule: str
    message: str
    path: str = "repository"
    line: int | None = None
    remedy: str = "Fix the reported issue, then run the guardrail again."

    def render(self) -> str:
        location = self.path + (f":{self.line}" if self.line else "")
        return f"BLOCKED [{self.rule}] {location}: {self.message}\nNext: {self.remedy}"


@dataclass(frozen=True)
class Command:
    category: str
    argv: list[str]


@dataclass
class GateResult:
    findings: list[Finding] = field(default_factory=list)

    @property
    def ok(self) -> bool:
        return not self.findings

    def render(self) -> str:
        if self.ok:
            return "Guardrail passed: every required check succeeded."
        return "\n\n".join(item.render() for item in self.findings)


def git(repo: Path, *args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(["git", *args], cwd=repo, text=True, capture_output=True, check=check)


def load_policy(repo: Path) -> dict[str, Any]:
    path = repo / "guardrails" / "policy.json"
    try:
        policy = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"Cannot read strict policy {path}: {exc}") from exc
    if not isinstance(policy.get("commands", {}), dict):
        raise ValueError("policy commands must be an object")
    if not isinstance(policy.get("allowlist", []), list):
        raise ValueError("policy allowlist must be an array")
    return policy


def integrity_findings(repo: Path) -> list[Finding]:
    findings: list[Finding] = []
    for name in ("AGENTS.md", "GEMINI.md", "AI_CODE_WORKFLOW.md"):
        if not (repo / name).is_file():
            findings.append(Finding("workflow.missing", f"Required workflow file {name} is missing.", name, remedy=f"Restore {name} at the repository root."))
    for name in ("AGENTS.md", "GEMINI.md"):
        path = repo / name
        if path.is_file() and "AI_CODE_WORKFLOW.md" not in path.read_text(encoding="utf-8", errors="replace"):
            findings.append(Finding("workflow.adapter", f"{name} does not require AI_CODE_WORKFLOW.md.", name, remedy="Restore the adapter requirement to read the core workflow in full."))
    core = repo / "AI_CODE_WORKFLOW.md"
    if core.is_file():
        text = core.read_text(encoding="utf-8", errors="replace").lower()
        required = {
            "deployment approval": ("never deploy", "explicit approval"),
            "root-cause evidence": ("root cause", "evidence"),
            "failed-first-fix stop": ("failed", "first", "investigation"),
        }
        for label, tokens in required.items():
            if not all(token in text for token in tokens):
                findings.append(Finding("workflow.core-safety", f"Core workflow is missing the essential {label} gate.", core.name, remedy="Restore the approved safety language in AI_CODE_WORKFLOW.md."))
    return findings


def current_branch(repo: Path) -> str:
    return git(repo, "branch", "--show-current").stdout.strip()


def _explicit_commands(policy: dict[str, Any]) -> tuple[list[Command], list[Finding]]:
    commands: list[Command] = []
    findings: list[Finding] = []
    for category, entries in policy.get("commands", {}).items():
        if not isinstance(entries, list) or not entries:
            findings.append(Finding("config.command", f"Command category {category!r} is empty or invalid.", "guardrails/policy.json", remedy="Declare each command as a non-empty JSON array of arguments."))
            continue
        normalized = entries if isinstance(entries[0], list) else [entries]
        for argv in normalized:
            if not isinstance(argv, list) or not argv or not all(isinstance(x, str) and x for x in argv):
                findings.append(Finding("config.command", f"Command category {category!r} contains an invalid command.", "guardrails/policy.json", remedy="Use an argument array such as [\"python3\", \"-m\", \"pytest\"]."))
            else:
                commands.append(Command(category, argv))
    return commands, findings


def resolve_commands(repo: Path, policy: dict[str, Any]) -> tuple[list[Command], list[Finding]]:
    explicit, findings = _explicit_commands(policy)
    if findings or explicit:
        return explicit, findings
    if (repo / "package.json").is_file():
        try:
            scripts = json.loads((repo / "package.json").read_text(encoding="utf-8")).get("scripts", {})
        except (json.JSONDecodeError, OSError) as exc:
            return [], [Finding("config.project", f"package.json cannot be read: {exc}", "package.json", remedy="Correct package.json, then rerun the gate.")]
        aliases = {"tests": "test", "lint": "lint", "typecheck": "typecheck", "build": "build"}
        missing = [script for script in aliases.values() if not scripts.get(script)]
        if missing:
            return [], [Finding("config.commands-missing", f"Node project does not declare required scripts: {', '.join(missing)}.", "package.json", remedy="Add the scripts or declare exact commands in guardrails/policy.json.")]
        cmds = [Command(category, ["npm", "run", script]) for category, script in aliases.items()]
        for e2e_key in ("test:e2e", "e2e"):
            if scripts.get(e2e_key):
                cmds.append(Command("e2e", ["npm", "run", e2e_key]))
                break
        return cmds, []
    if (repo / "go.mod").is_file():
        return [Command("tests", ["go", "test", "./..."]), Command("lint", ["go", "vet", "./..."]), Command("build", ["go", "build", "./..."])], []
    if (repo / "Cargo.toml").is_file():
        return [Command("tests", ["cargo", "test", "--all-targets"]), Command("lint", ["cargo", "clippy", "--all-targets", "--", "-D", "warnings"]), Command("build", ["cargo", "check", "--all-targets"])], []
    if any((repo / name).is_file() for name in ("pyproject.toml", "requirements.txt", "setup.py")):
        return [], [Finding("config.commands-ambiguous", "Python project commands cannot be inferred safely.", "guardrails/policy.json", remedy="Declare exact tests, lint, typecheck, and build commands in guardrails/policy.json.")]
    self_test_dir = repo / "guardrails" / "tests"
    if self_test_dir.is_dir():
        known_roots = {"AGENTS.md", "GEMINI.md", "AI_CODE_WORKFLOW.md", "GUARDRAILS.md"}
        files = git(repo, "ls-files", "--cached", "--others", "--exclude-standard").stdout.splitlines()
        outside_kit = [path for path in files if path not in known_roots and not path.startswith(("guardrails/", ".github/workflows/guardrails.yml", "docs/superpowers/"))]
        if not outside_kit:
            return [Command("guardrail self-tests", ["python3", "-m", "unittest", "discover", "-s", "guardrails/tests", "-v"])], []
    return [], [Finding("config.project-unknown", "Project type and required validation commands could not be determined.", "guardrails/policy.json", remedy="Declare exact validation commands in guardrails/policy.json.")]


RULES = (
    ("secret.private-key", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"), "A private key appears in staged content."),
    ("secret.credential", re.compile(r"(?:ghp_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{20,})"), "A high-confidence credential appears in staged content."),
    ("source.conflict-marker", re.compile(r"^(?:<<<<<<<|=======|>>>>>>>)", re.MULTILINE), "An unresolved merge-conflict marker is present."),
    ("test.disabled", re.compile(r"(?:@(?:unittest\.)?skip\b|\b(?:describe|it|test)\.(?:skip|only)\s*\(|\bpytest\.mark\.skip\b)"), "A newly disabled or focused test appears in staged content."),
)


def _allowed(policy: dict[str, Any], rule: str, path: str, line: int) -> bool:
    for item in policy.get("allowlist", []):
        if not isinstance(item, dict) or not item.get("reason"):
            continue
        if item.get("rule") == rule and item.get("path") == path and (item.get("line") is None or item.get("line") == line):
            return True
    return False


def _files_for_scan(repo: Path, mode: str) -> list[str]:
    args = ("diff", "--cached", "--name-only", "--diff-filter=ACMR") if mode == "staged" else ("ls-files",)
    return [line for line in git(repo, *args).stdout.splitlines() if line]


def _text_for_scan(repo: Path, path: str, mode: str) -> str | None:
    try:
        data = subprocess.run(["git", "show", f":{path}"], cwd=repo, capture_output=True, check=True).stdout if mode == "staged" else (repo / path).read_bytes()
    except (subprocess.CalledProcessError, OSError):
        return None
    if b"\x00" in data:
        return None
    return data.decode("utf-8", errors="replace")


def _staged_added_lines(repo: Path, path: str) -> set[int]:
    diff = git(repo, "diff", "--cached", "--unified=0", "--", path).stdout.splitlines()
    added: set[int] = set()
    new_line = 0
    for row in diff:
        if row.startswith("@@"):
            match = re.search(r"\+(\d+)(?:,(\d+))?", row)
            if match:
                new_line = int(match.group(1))
        elif row.startswith("+") and not row.startswith("+++"):
            added.add(new_line)
            new_line += 1
        elif row.startswith("-") and not row.startswith("---"):
            continue
        elif new_line:
            new_line += 1
    return added


def scan_repository(repo: Path, policy: dict[str, Any], mode: str) -> list[Finding]:
    findings: list[Finding] = []
    for path in _files_for_scan(repo, mode):
        text = _text_for_scan(repo, path, mode)
        if text is None:
            continue
        added_lines = _staged_added_lines(repo, path) if mode == "staged" else None
        debug_rules = [] if path == "guardrails/policy.json" else [("source.debug-marker", re.compile(re.escape(marker)), f"Configured debug marker {marker!r} is present.") for marker in policy.get("debug_markers", [])]
        rules = list(RULES) + debug_rules
        for rule, pattern, message in rules:
            for match in pattern.finditer(text):
                line = text.count("\n", 0, match.start()) + 1
                if rule in {"test.disabled", "source.debug-marker"} and added_lines is not None and line not in added_lines:
                    continue
                if not _allowed(policy, rule, path, line):
                    findings.append(Finding(rule, message, path, line, "Remove it, or add a narrow allowlist entry with this exact rule/path and a reason."))
    return findings


def _record_ledger(repo: Path, category: str, command: list[str], returncode: int, duration_ms: int) -> None:
    try:
        brain_dir = repo / ".brain"
        brain_dir.mkdir(parents=True, exist_ok=True)
        ledger_path = brain_dir / "verification_ledger.json"
        
        entries = []
        if ledger_path.is_file():
            try:
                entries = json.loads(ledger_path.read_text(encoding="utf-8"))
                if not isinstance(entries, list):
                    entries = []
            except Exception:
                entries = []
                
        import datetime
        record = {
            "type": "guardrail_verification",
            "category": category,
            "command": " ".join(command),
            "status": "PASSED" if returncode == 0 else "FAILED",
            "exit_code": returncode,
            "duration_ms": duration_ms,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        entries.append(record)
        # Giữ tối đa 100 entries gần nhất để bảo vệ dung lượng
        if len(entries) > 100:
            entries = entries[-100:]
        ledger_path.write_text(json.dumps(entries, indent=2, ensure_ascii=False), encoding="utf-8")
    except Exception:
        pass


def execute_commands(repo: Path, commands: list[Command], policy: dict[str, Any] | None = None) -> list[Finding]:
    findings: list[Finding] = []
    timeout = 120
    if policy and isinstance(policy.get("execution_isolation"), dict):
        timeout = policy["execution_isolation"].get("timeout_seconds", 120)

    import time
    for command in commands:
        argv = list(command.argv)
        if argv[0] in ("python3", "python"):
            argv[0] = sys.executable
        if shutil.which(argv[0]) is None:
            findings.append(Finding("command.unavailable", f"Required {command.category} tool {argv[0]!r} is not available.", "guardrails/policy.json", remedy=f"Install {argv[0]!r} or correct the declared command."))
            continue
        start_t = time.perf_counter()
        try:
            completed = subprocess.run(argv, cwd=repo, text=True, capture_output=True, timeout=timeout)
            dur_ms = int((time.perf_counter() - start_t) * 1000)
            _record_ledger(repo, command.category, argv, completed.returncode, dur_ms)
        except subprocess.TimeoutExpired as exc:
            dur_ms = int((time.perf_counter() - start_t) * 1000)
            _record_ledger(repo, command.category, argv, 124, dur_ms)
            findings.append(Finding("command.timeout", f"Command {command.category} ({' '.join(argv)}) timed out after {timeout} seconds.", remedy="Optimize test execution, eliminate infinite loops, and ensure processes terminate properly."))
            continue
        if completed.returncode:
            detail = (completed.stderr or completed.stdout).strip()
            if len(detail) > 800:
                detail = detail[-800:]
            findings.append(Finding("command.failed", f"Required {command.category} command failed ({' '.join(argv)}). {detail}", remedy="Run the same command locally, fix its reported failure, and rerun the guardrail."))
    return findings


def run(repo: Path, mode: str = "staged", skip_project_checks: bool = False) -> GateResult:
    repo = repo.resolve()
    findings: list[Finding] = []
    try:
        policy = load_policy(repo)
        branch = current_branch(repo)
    except (ValueError, subprocess.CalledProcessError) as exc:
        return GateResult([Finding("config.repository", str(exc), remedy="Run this command from a valid Git repository containing guardrails/policy.json.")])
    if mode == "staged" and branch in policy.get("protected_branches", ["main", "master"]):
        findings.append(Finding("git.protected-branch", f"Direct commits on protected branch {branch!r} are blocked.", remedy="Create and switch to a feature branch, then commit there."))
    findings.extend(integrity_findings(repo))
    findings.extend(scan_repository(repo, policy, mode))
    if not skip_project_checks:
        commands, command_findings = resolve_commands(repo, policy)
        findings.extend(command_findings)
        if not command_findings:
            findings.extend(execute_commands(repo, commands, policy))
    return GateResult(findings)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=("staged", "all"), default="staged")
    parser.add_argument("--skip-project-checks", action="store_true", help="For guardrail-kit self-tests only; never use for application commits or CI.")
    args = parser.parse_args(argv)
    result = run(Path.cwd(), args.mode, args.skip_project_checks)
    print(result.render())
    return 0 if result.ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
