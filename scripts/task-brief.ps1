[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$PlanFile,
    [Parameter(Mandatory=$true, Position=1)]
    [int]$TaskNumber,
    [Parameter(Mandatory=$false, Position=2)]
    [string]$OutFile
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

$outDir = Split-Path -Parent $OutFile
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

Set-Content -Path $OutFile -Value ($extractedLines -join "`n") -Encoding UTF8
Write-Output "wrote ${OutFile}: $($extractedLines.Count) lines"
