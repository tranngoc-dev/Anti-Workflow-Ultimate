#!/usr/bin/env python3
"""Install, chain, or uninstall the versioned guardrail hook in the current Git repository."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path


class InstallError(RuntimeError):
    pass


def _git(repo: Path, *args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(["git", *args], cwd=repo, text=True, capture_output=True, check=check, encoding="utf-8", errors="replace")


def _get_state_path(repo: Path) -> Path:
    state_rel = _git(repo, "rev-parse", "--git-path", "guardrails/previous-hooks-path").stdout.strip()
    return (repo / state_rel).resolve()


def install(repo: Path) -> Path:
    repo = repo.resolve()
    probe = _git(repo, "rev-parse", "--show-toplevel", check=False)
    if probe.returncode or Path(probe.stdout.strip()).resolve() != repo:
        raise InstallError("Run the installer from the root of a Git repository.")
    hook = repo / "guardrails" / "hooks" / "pre-commit"
    engine = repo / "guardrails" / "guardrail.py"
    policy = repo / "guardrails" / "policy.json"
    missing = [str(path.relative_to(repo)) for path in (hook, engine, policy) if not path.is_file()]
    if missing:
        raise InstallError(f"Guardrail kit is incomplete; missing: {', '.join(missing)}")
    
    state_file = _get_state_path(repo)
    state_file.parent.mkdir(parents=True, exist_ok=True)
    
    if not state_file.exists():
        raw_config = _git(repo, "config", "--local", "--get", "core.hooksPath", check=False)
        was_set = (raw_config.returncode == 0)
        value = raw_config.stdout.strip() if was_set else ""
        
        # Resolve any existing pre-commit hook
        existing_hook = None
        if was_set and value:
            cand = (repo / value / "pre-commit").resolve()
            if cand.is_file() and cand != hook.resolve():
                existing_hook = str(cand)
        else:
            default_hook_rel = _git(repo, "rev-parse", "--git-path", "hooks/pre-commit", check=False).stdout.strip()
            cand = (repo / default_hook_rel).resolve()
            if cand.is_file() and cand != hook.resolve():
                existing_hook = str(cand)
                
        state_data = {
            "was_set": was_set,
            "value": value,
            "hook": existing_hook
        }
        state_file.write_text(json.dumps(state_data, indent=2), encoding="utf-8")
        
    try:
        hook.chmod(hook.stat().st_mode | 0o111)
    except OSError:
        pass
        
    _git(repo, "config", "--local", "core.hooksPath", "guardrails/hooks")
    return state_file


def uninstall(repo: Path) -> None:
    repo = repo.resolve()
    state_file = _get_state_path(repo)
    if not state_file.is_file():
        raise InstallError("No guardrails installation state found to uninstall.")
        
    try:
        data = json.loads(state_file.read_text(encoding="utf-8"))
    except Exception:
        data = {"was_set": False, "value": ""}
        
    if data.get("was_set") and data.get("value"):
        _git(repo, "config", "--local", "core.hooksPath", data["value"])
    else:
        _git(repo, "config", "--local", "--unset-all", "core.hooksPath", check=False)
        
    state_file.unlink(missing_ok=True)


def run_previous_hook(repo: Path, argv: list[str]) -> int:
    state_file = _get_state_path(repo)
    if not state_file.is_file():
        return 0
    try:
        data = json.loads(state_file.read_text(encoding="utf-8"))
        prev = data.get("hook")
        if prev and Path(prev).is_file():
            proc = subprocess.run([prev, *argv], cwd=repo)
            return proc.returncode
    except Exception:
        pass
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--uninstall", action="store_true", help="Uninstall guardrail hooks and restore prior config")
    parser.add_argument("--run-previous-hook", action="store_true", help="Internal: execute chained previous hook")
    parser.add_argument("hook_args", nargs="*", help="Arguments forwarded to previous hook")
    
    args = parser.parse_args(argv)
    repo = Path.cwd()
    
    if args.run_previous_hook:
        return run_previous_hook(repo, args.hook_args)
        
    if args.uninstall:
        try:
            uninstall(repo)
            print("Guardrails uninstalled and prior Git configuration restored.")
            return 0
        except InstallError as exc:
            print(f"Uninstall failed: {exc}")
            return 1
            
    try:
        state = install(repo)
        print(f"Guardrails installed. Previous hook setting recorded at {state}.")
        return 0
    except InstallError as exc:
        print(f"Installation blocked: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
