#!/usr/bin/env bash
# ==============================================================================
# Anti-Workflow Ultimate - Installer for Linux & macOS (Antigravity 2.0)
# ==============================================================================

set -euo pipefail

echo "=============================================================================="
echo "  >> INSTALLING ANTI-WORKFLOW ULTIMATE (ANTIGRAVITY 2.0)"
echo "=============================================================================="

ANTIGRAVITY_DIR="$HOME/.gemini/antigravity"
GLOBAL_WORKFLOWS_DIR="$ANTIGRAVITY_DIR/global_workflows"
SKILLS_DIR="$ANTIGRAVITY_DIR/skills"
SCHEMAS_DIR="$ANTIGRAVITY_DIR/schemas"
TEMPLATES_DIR="$ANTIGRAVITY_DIR/templates"
SCRIPTS_DIR="$ANTIGRAVITY_DIR/scripts"

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. Create directory structure
echo "[1/6] Initializing Antigravity directory hierarchy..."
mkdir -p "$ANTIGRAVITY_DIR" "$GLOBAL_WORKFLOWS_DIR" "$SKILLS_DIR" "$SCHEMAS_DIR" "$TEMPLATES_DIR" "$SCRIPTS_DIR"

# 2. Install Global Workflows
echo "[2/6] Installing Core Workflows (/init, /plan, /code, /recap...)..."
if [ -d "$SOURCE_DIR/global_workflows" ]; then
    cp -r "$SOURCE_DIR/global_workflows/"* "$GLOBAL_WORKFLOWS_DIR/"
    echo "  [OK] Installed workflows to $GLOBAL_WORKFLOWS_DIR"
fi

# 3. Install Utility Scripts
echo "[3/6] Installing Utility Scripts..."
if [ -d "$SOURCE_DIR/scripts" ]; then
    cp -r "$SOURCE_DIR/scripts/"* "$SCRIPTS_DIR/"
    chmod +x "$SCRIPTS_DIR/"* 2>/dev/null || true
    echo "  [OK] Installed utility scripts to $SCRIPTS_DIR"
fi

# 4. Install Autonomous Skills
echo "[4/6] Installing Autonomous Skills..."
if [ -d "$SOURCE_DIR/skills" ]; then
    cp -r "$SOURCE_DIR/skills/"* "$SKILLS_DIR/"
    echo "  [OK] Installed skills to $SKILLS_DIR"
fi

# 5. MCP Server Configuration
echo "[5/6] Configuring MCP Server settings..."
if [ -f "$SOURCE_DIR/.gemini/mcp_config.json" ]; then
    cp "$SOURCE_DIR/.gemini/mcp_config.json" "$ANTIGRAVITY_DIR/mcp_config.json"
fi

# 6. Save Version
echo "4.11.0-ultimate" > "$HOME/.gemini/awf_version"

echo "=============================================================================="
echo "  [OK] INSTALLATION COMPLETED SUCCESSFULLY!"
echo "=============================================================================="
echo ""
echo "  Open Antigravity 2.0 and type in chat:"
echo "      /init"
echo ""
