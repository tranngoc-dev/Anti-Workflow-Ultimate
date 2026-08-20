# ==============================================================================
# Anti-Workflow Ultimate - Installer cho Windows (Antigravity 2.0)
# Tich hop tron bo: AWF, Superpowers, GitNexus, Guardrails & Modular Sessions
# ==============================================================================

[CmdletBinding()]
param(
    [switch]$Force
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "  >> CAI DAT ANTI-WORKFLOW ULTIMATE (ANTIGRAVITY 2.0)" -ForegroundColor Yellow
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

# 1. Tao cac thu muc can thiet
Write-Host "`n[1/6] Dang tao cau truc thu muc Antigravity..." -ForegroundColor Green
$dirs = @($antigravityDir, $globalWorkflowsDir, $skillsDir, $schemasDir, $templatesDir, $scriptsDir)
foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Path $d -Force | Out-Null
    }
}

# 2. Cai dat Global Workflows
Write-Host "[2/6] Dang cai dat Workflows (/init, /plan, /code, /recap...)..." -ForegroundColor Green
$sourceWorkflows = Join-Path $sourceDir "global_workflows"
if (Test-Path $sourceWorkflows) {
    Copy-Item -Path "$sourceWorkflows\*" -Destination $globalWorkflowsDir -Recurse -Force
    $wfCount = (Get-ChildItem $sourceWorkflows -Filter *.md).Count
    Write-Host "  [OK] Da cai dat $wfCount workflows vao $globalWorkflowsDir" -ForegroundColor Gray
}

# 3. Cai dat Scripts (brain-query, task-brief, review-package...)
Write-Host "[3/6] Dang cai dat Scripts tien ich (Semantic Brain Query, Pre-flight Gate)..." -ForegroundColor Green
$sourceScripts = Join-Path $sourceDir "scripts"
if (Test-Path $sourceScripts) {
    Copy-Item -Path "$sourceScripts\*" -Destination $scriptsDir -Recurse -Force
    Write-Host "  [OK] Da cai dat toan bo scripts vao $scriptsDir" -ForegroundColor Gray
}

# 4. Cai dat Skills (Superpowers + GitNexus + AWF)
Write-Host "[4/6] Dang cai dat Ky nang tu tri (Superpowers, GitNexus, AWF)..." -ForegroundColor Green
$sourceSkills = Join-Path $sourceDir "skills"
if (Test-Path $sourceSkills) {
    Copy-Item -Path "$sourceSkills\*" -Destination $skillsDir -Recurse -Force
    Write-Host "  [OK] Da cai dat toan bo skills vao $skillsDir" -ForegroundColor Gray
}

# 5. Cau hinh MCP Server cho GitNexus
Write-Host "[5/6] Dang cau hinh GitNexus MCP Server..." -ForegroundColor Green
$mcpConfigFile = Join-Path $antigravityDir "mcp_config.json"
$sourceMcp = Join-Path $sourceDir ".gemini\mcp_config.json"
if (Test-Path $sourceMcp) {
    if ((-not (Test-Path $mcpConfigFile)) -or $Force) {
        Copy-Item -Path $sourceMcp -Destination $mcpConfigFile -Force
        Write-Host "  [OK] Da tao cau hinh $mcpConfigFile" -ForegroundColor Gray
    } else {
        Write-Host "  [INFO] File $mcpConfigFile da ton tai (Giu nguyen cau hinh)" -ForegroundColor DarkGray
    }
}

# 6. Luu phien ban
$versionFile = Join-Path $userHome ".gemini\awf_version"
Set-Content -Path $versionFile -Value "4.11.0-ultimate" -Encoding UTF8

Write-Host "`n==============================================================================" -ForegroundColor Cyan
Write-Host "  [OK] CAI DAT HOAN TAT THANH CONG!" -ForegroundColor Yellow
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Mo Antigravity 2.0 va go trong khung Chat:" -ForegroundColor White
Write-Host "      /init" -ForegroundColor Green
Write-Host "  Quy trinh tu tri 8 buoc se tu dong dan dat tu y tuong den ung dung hoan chinh!" -ForegroundColor Gray
Write-Host ""
