# ==============================================================================
# Anti-Workflow Ultimate - Installer for Windows (Antigravity 2.0)
# Complete Framework: AWF, Superpowers, GitNexus, CodeGraph, Guardrails & Memory
# ==============================================================================

[CmdletBinding()]
param(
    [switch]$Force
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "  >> INSTALLING ANTI-WORKFLOW ULTIMATE (ANTIGRAVITY 2.0)" -ForegroundColor Yellow
Write-Host "==============================================================================" -ForegroundColor Cyan

$userHome = [Environment]::GetFolderPath("UserProfile")
$antigravityDir = Join-Path $userHome ".gemini\antigravity"
$globalWorkflowsDir = Join-Path $antigravityDir "global_workflows"
$skillsDir = Join-Path $antigravityDir "skills"
$schemasDir = Join-Path $antigravityDir "schemas"
$templatesDir = Join-Path $antigravityDir "templates"
$scriptsDir = Join-Path $antigravityDir "scripts"

$sourceDir = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($sourceDir)) {
    $sourceDir = (Get-Location).Path
}

# 1. Create directory structure
Write-Host "`n[1/6] Initializing Antigravity directory hierarchy..." -ForegroundColor Green
$dirs = @($antigravityDir, $globalWorkflowsDir, $skillsDir, $schemasDir, $templatesDir, $scriptsDir)
foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Path $d -Force | Out-Null
    }
}

# 2. Install Global Workflows
Write-Host "[2/6] Installing Core Workflows (/init, /plan, /code, /recap...)..." -ForegroundColor Green
$sourceWorkflows = Join-Path $sourceDir "global_workflows"
if (Test-Path $sourceWorkflows) {
    Copy-Item -Path "$sourceWorkflows\*" -Destination $globalWorkflowsDir -Recurse -Force
    $wfCount = (Get-ChildItem $sourceWorkflows -Filter *.md).Count
    Write-Host "  [OK] Installed $wfCount workflows to $globalWorkflowsDir" -ForegroundColor Gray
}

# 3. Install Utility Scripts
Write-Host "[3/6] Installing Utility Scripts (Semantic Brain Query, Pre-flight Gate)..." -ForegroundColor Green
$sourceScripts = Join-Path $sourceDir "scripts"
if (Test-Path $sourceScripts) {
    Copy-Item -Path "$sourceScripts\*" -Destination $scriptsDir -Recurse -Force
    Write-Host "  [OK] Installed utility scripts to $scriptsDir" -ForegroundColor Gray
}

# 4. Install Autonomous Skills
Write-Host "[4/7] Installing Autonomous Skills (Superpowers, GitNexus, AWF)..." -ForegroundColor Green
$sourceSkills = Join-Path $sourceDir "skills"
if (Test-Path $sourceSkills) {
    Copy-Item -Path "$sourceSkills\*" -Destination $skillsDir -Recurse -Force
    Write-Host "  [OK] Installed all skills to $skillsDir" -ForegroundColor Gray
}

# 5. Install Schemas & Templates
Write-Host "[5/7] Installing Schemas and Templates..." -ForegroundColor Green
$sourceSchemas = Join-Path $sourceDir "schemas"
if (Test-Path $sourceSchemas) {
    Copy-Item -Path "$sourceSchemas\*" -Destination $schemasDir -Recurse -Force
    Write-Host "  [OK] Installed schemas to $schemasDir" -ForegroundColor Gray
}
$sourceTemplates = Join-Path $sourceDir "templates"
if (Test-Path $sourceTemplates) {
    Copy-Item -Path "$sourceTemplates\*" -Destination $templatesDir -Recurse -Force
    Write-Host "  [OK] Installed templates to $templatesDir" -ForegroundColor Gray
}

# 6. Configure MCP Servers
Write-Host "[6/7] Configuring MCP Server settings..." -ForegroundColor Green
$mcpConfigFile = Join-Path $antigravityDir "mcp_config.json"
$sourceMcp = Join-Path $sourceDir ".gemini\mcp_config.json"
if (Test-Path $sourceMcp) {
    if ((-not (Test-Path $mcpConfigFile)) -or $Force) {
        Copy-Item -Path $sourceMcp -Destination $mcpConfigFile -Force
        Write-Host "  [OK] Configured $mcpConfigFile" -ForegroundColor Gray
    } else {
        Write-Host "  [INFO] $mcpConfigFile already exists (Retaining existing config)" -ForegroundColor DarkGray
    }
}

# 7. Save Version
$versionFile = Join-Path $userHome ".gemini\awf_version"
Set-Content -Path $versionFile -Value "4.13.0-ultimate" -Encoding UTF8

Write-Host "`n==============================================================================" -ForegroundColor Cyan
Write-Host "  [OK] INSTALLATION COMPLETED SUCCESSFULLY!" -ForegroundColor Yellow
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Open Antigravity 2.0 and type in chat:" -ForegroundColor White
Write-Host "      /init" -ForegroundColor Green
Write-Host "  The autonomous 8-stage lifecycle will guide you from idea to production!" -ForegroundColor Gray
Write-Host ""
