#!/usr/bin/env bash
# ==============================================================================
# Anti-Workflow Ultimate - Installer cho Linux / macOS (Antigravity 2.0)
# ==============================================================================
set -euo pipefail

echo "=============================================================================="
echo "  🚀 CÀI ĐẶT ANTI-WORKFLOW ULTIMATE (ANTIGRAVITY 2.0)"
echo "=============================================================================="

USER_HOME="$HOME"
ANTIGRAVITY_DIR="$USER_HOME/.gemini/antigravity"
GLOBAL_WORKFLOWS_DIR="$ANTIGRAVITY_DIR/global_workflows"
SKILLS_DIR="$ANTIGRAVITY_DIR/skills"
SCHEMAS_DIR="$ANTIGRAVITY_DIR/schemas"
TEMPLATES_DIR="$ANTIGRAVITY_DIR/templates"

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$ANTIGRAVITY_DIR" "$GLOBAL_WORKFLOWS_DIR" "$SKILLS_DIR" "$SCHEMAS_DIR" "$TEMPLATES_DIR"

echo "[1/4] Sao chép Global Workflows..."
if [ -d "$SOURCE_DIR/global_workflows" ]; then
    cp -r "$SOURCE_DIR/global_workflows/"* "$GLOBAL_WORKFLOWS_DIR/"
fi

echo "[2/4] Sao chép Kỹ năng (Superpowers, GitNexus, AWF)..."
if [ -d "$SOURCE_DIR/skills" ]; then
    cp -r "$SOURCE_DIR/skills/"* "$SKILLS_DIR/"
fi

echo "[3/4] Cấu hình MCP Server..."
if [ -f "$SOURCE_DIR/.gemini/mcp_config.json" ] && [ ! -f "$ANTIGRAVITY_DIR/mcp_config.json" ]; then
    cp "$SOURCE_DIR/.gemini/mcp_config.json" "$ANTIGRAVITY_DIR/mcp_config.json"
fi

echo "4.9.0-ultimate" > "$USER_HOME/.gemini/awf_version"

echo "=============================================================================="
echo "  ✨ CÀI ĐẶT HOÀN TẤT THÀNH CÔNG!"
echo "  Mở Antigravity 2.0 và gõ: /init"
echo "=============================================================================="
