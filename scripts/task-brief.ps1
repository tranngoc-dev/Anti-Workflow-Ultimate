[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$PlanFile,
    [Parameter(Mandatory=$true, Position=1)]
    [int]$TaskNumber,
    [Parameter(Mandatory=$false, Position=2)]
    [string]$OutFile,
    [Parameter(Mandatory=$false)]
    [switch]$Validate
)

if (-not (Test-Path -Path $PlanFile -PathType Leaf)) {
    Write-Error "No such plan file: $PlanFile"
    exit 2
}

if ([string]::IsNullOrWhiteSpace($OutFile)) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $sddWorkspaceScript = Join-Path $scriptDir "sdd-workspace.ps1"
    $workspaceDir = & $sddWorkspaceScript -PlanFile $PlanFile
    $OutFile = Join-Path $workspaceDir "task-$TaskNumber-brief.md"
}

$lines = Get-Content -Path $PlanFile
$inFence = $false
$inTask = $false
$extractedLines = [System.Collections.Generic.List[string]]::new()

foreach ($line in $lines) {
    if ($line -match '^```') {
        $inFence = -not $inFence
    }
    if (-not $inFence -and $line -match '^#+\s+Task\s+(\d+)') {
        $matchedNum = [int]$Matches[1]
        $inTask = ($matchedNum -eq $TaskNumber)
    }
    if ($inTask) {
        $extractedLines.Add($line)
    }
}

if ($extractedLines.Count -eq 0) {
    Write-Error "Task $TaskNumber not found in $PlanFile"
    exit 3
}

$taskText = $extractedLines -join "`n"

# PRE-FLIGHT TASK CONTRACT VALIDATION (Học hỏi từ Dify Pre-flight Gate)
$hasGoal = ($taskText -match "(?i)Goal|Mục tiêu|Description|Mô tả")
$hasCriteria = ($taskText -match "(?i)Acceptance|Tiêu chí|Nghiệm thu|Verify|Kiểm tra|Test")
$hasScope = ($taskText -match "(?i)Files|File|Scope|Path")

if ($Validate -or ($hasGoal -and $hasCriteria)) {
    Write-Host "🛡️ [PRE-FLIGHT GATE] Validating Task $TaskNumber contract..." -ForegroundColor Cyan
    if (-not $hasCriteria) {
        Write-Warning "⚠️ Task $TaskNumber thiếu Acceptance Criteria (tiêu chí nghiệm thu rõ ràng). Subagent có thể bị lạc hướng!"
    } else {
        Write-Host "  ✅ Contract Valid: Goal & Acceptance criteria detected." -ForegroundColor Green
    }
}

$outDir = Split-Path -Parent $OutFile
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

Set-Content -Path $OutFile -Value $taskText -Encoding UTF8
Write-Output "wrote ${OutFile}: $($extractedLines.Count) lines (Pre-flight Gate Checked ✅)"
