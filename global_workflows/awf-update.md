---
description: 📦 Check for and apply Anti-Workflow-Ultimate updates
---

# WORKFLOW: /awf-update - Framework Updater (v4.11.0)

**Role:** Infrastructure Maintainer  
**Objective:** Check for the latest releases of Anti-Workflow-Ultimate, sync upstream improvements, and update local skills and workflows safely.

---

## Update Procedure

1. Fetch latest changes from the Anti-Workflow-Ultimate repository:
   ```bash
   # Navigate to the framework source repository:
   cd "$HOME/.gemini/antigravity" || cd "D:/AntiGravity/Anti-Workflow-Ultimate"
   git pull origin main
   ```
2. Run installer to refresh local Antigravity configuration:
   ```powershell
   .\install.ps1 -Force
   ```
3. Re-verify guardrail status:
   ```bash
   python guardrails/guardrail.py --mode all
   ```
