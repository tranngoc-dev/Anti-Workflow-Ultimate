# Knowledge & Learnings Base - Anti-Workflow Ultimate

### [LEARNING-20260821-01] Two-Way Lifecycle & Non-Destructive Hook Chaining
- 📍 **Classification:** Architecture & Git Governance - Hook Overwrite Prevention
- 🔍 **Root Cause:** Standard installers overwrite `core.hooksPath` or pre-existing pre-commit scripts, discarding user hooks.
- 💡 **Proven Fix:** Record previous hook state in JSON at `.git/guardrails/previous-hooks-path`. Implement `--run-previous-hook` in pre-commit wrapper and `--uninstall` to restore `core.hooksPath` byte-for-byte.
- 🚫 **Anti-Pattern:** Never overwrite Git configuration without providing idempotent installation and atomic uninstallation.

### [LEARNING-20260821-02] Live State vs Template Schema Validation (No False Greens)
- 📍 **Classification:** Quality Assurance & Empirical Probing - False Green Elimination
- 🔍 **Root Cause:** Validating only static templates (`templates/*.example.json`) creates false positives while live `.brain/*.json` state suffers from schema drift.
- 💡 **Proven Fix:** Implement multi-target schema validation in `scripts/schema-probe.py` to assert Draft7 compliance across BOTH demo templates and active live runtime artifacts.
- 🚫 **Anti-Pattern:** Never declare an audit passed based solely on template files without validating actual repository state.

### [LEARNING-20260821-03] Process Tree Isolation & POSIX Group Signal Safety
- 📍 **Classification:** Process Guard & System Signal Safety
- 🔍 **Root Cause:** Calling `os.killpg(proc.pid)` on POSIX when the child process was not spawned with `start_new_session=True` can terminate the parent CI runner or developer shell.
- 💡 **Proven Fix:** Use `start_new_session=True` on POSIX and `CREATE_NEW_PROCESS_GROUP` on Windows during `subprocess.Popen`, ensuring timeout signals kill only the spawned process tree.
- 🚫 **Anti-Pattern:** Never kill process groups without establishing dedicated session boundaries at spawn time.
