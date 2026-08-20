---
description: ▶️ Safe local application execution with process lifecycle management
---

# WORKFLOW: /run - Application Launcher & Process Manager (v4.11.0)

**Role:** Environment & Runtime Manager  
**Objective:** Launch local dev servers or services safely, manage process lifecycles, and prevent zombie/orphan background tasks from consuming system RAM/CPU.

---

## Execution Standards

1. **Auto-Detect Entry Point:** Scan `package.json`, `Makefile`, `docker-compose.yml`, or main entry files.
2. **Process Management:** Ensure processes can be cleanly terminated upon exit.
3. **Port Conflict Detection:** Check for occupied ports before launching.
