[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$PlanFile
)

if (-not (Test-Path -Path $PlanFile -PathType Leaf)) {
    Write-Error "No such plan file: $PlanFile"
    exit 2
}

$slug = [System.IO.Path]::GetFileNameWithoutExtension($PlanFile)
if ([string]::IsNullOrWhiteSpace($slug) -or $slug -eq "." -or $slug -eq "..") {
    Write-Error "Cannot derive a workspace name from: $PlanFile"
    exit 2
}

$root = (git rev-parse --show-toplevel).Trim()
if ([string]::IsNullOrWhiteSpace($root)) {
    Write-Error "Not inside a Git repository."
    exit 2
}

$base = Join-Path $root ".superpowers\sdd"
$dir = Join-Path $base $slug

if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

$gitignorePath = Join-Path $base ".gitignore"
if (-not (Test-Path $gitignorePath)) {
    Set-Content -Path $gitignorePath -Value "*`n" -Encoding UTF8
}

Write-Output (Resolve-Path $dir).Path
