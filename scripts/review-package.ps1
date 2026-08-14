[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$PlanFile,
    [Parameter(Mandatory=$true, Position=1)]
    [string]$Base,
    [Parameter(Mandatory=$true, Position=2)]
    [string]$Head,
    [Parameter(Mandatory=$false, Position=3)]
    [string]$OutFile
)

if (-not (Test-Path -Path $PlanFile -PathType Leaf)) {
    Write-Error "No such plan file: $PlanFile"
    exit 2
}

git rev-parse --verify --quiet $Base | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Error "bad BASE: $Base"
    exit 2
}

git rev-parse --verify --quiet $Head | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Error "bad HEAD: $Head"
    exit 2
}

if ([string]::IsNullOrWhiteSpace($OutFile)) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $sddWorkspaceScript = Join-Path $scriptDir "sdd-workspace.ps1"
    $workspaceDir = & $sddWorkspaceScript -PlanFile $PlanFile
    $baseShort = (git rev-parse --short $Base).Trim()
    $headShort = (git rev-parse --short $Head).Trim()
    $OutFile = Join-Path $workspaceDir "review-$baseShort..$headShort.diff"
}

$sb = [System.Text.StringBuilder]::new()
$sb.AppendLine("# Review package: $Base..$Head") | Out-Null
$sb.AppendLine("") | Out-Null
$sb.AppendLine("## Commits") | Out-Null
$commitsLog = git log --oneline "$Base..$Head"
$sb.AppendLine(($commitsLog -join "`n")) | Out-Null
$sb.AppendLine("") | Out-Null
$sb.AppendLine("## Files changed") | Out-Null
$diffStat = git diff --stat "$Base..$Head"
$sb.AppendLine(($diffStat -join "`n")) | Out-Null
$sb.AppendLine("") | Out-Null
$sb.AppendLine("## Diff") | Out-Null
$diffFull = git diff -U10 "$Base..$Head"
$sb.AppendLine(($diffFull -join "`n")) | Out-Null

$outDir = Split-Path -Parent $OutFile
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

Set-Content -Path $OutFile -Value $sb.ToString() -Encoding UTF8
$commitsCount = (git rev-list --count "$Base..$Head").Trim()
$bytesCount = (Get-Item $OutFile).Length
Write-Output "wrote ${OutFile}: $commitsCount commit(s), $bytesCount bytes"
