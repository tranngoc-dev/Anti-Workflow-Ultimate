<#
.SYNOPSIS
    Semantic / Keyword Micro RAG query for .brain/learnings.md
.DESCRIPTION
    Extracts relevant historical learnings matching current error/topic keywords,
    optimizing token usage and preventing context window bloat.
.PARAMETER Query
    Search keywords or error description (e.g., "Ambiguous Foreign Key", "Rate Limit")
.PARAMETER Limit
    Maximum number of learnings to return (default: 2)
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false, Position = 0)]
    [string]$Query,

    [Parameter(Mandatory = $false)]
    [int]$Limit = 2,

    [Parameter(Mandatory = $false)]
    [string]$BrainPath = ".brain/learnings.md"
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

if (-not (Test-Path $BrainPath)) {
    if (Test-Path "../$BrainPath") {
        $BrainPath = "../$BrainPath"
    } elseif (Test-Path "../../$BrainPath") {
        $BrainPath = "../../$BrainPath"
    } else {
        Write-Output "INFO: $BrainPath not found. No learnings loaded."
        exit 0
    }
}

$content = Get-Content -Path $BrainPath -Raw -Encoding UTF8
if ([string]::IsNullOrWhiteSpace($content)) {
    Write-Output "INFO: $BrainPath is empty."
    exit 0
}

$blocks = [System.Text.RegularExpressions.Regex]::Split($content, "(?m)^(?=###?\s+.*\[LEARNING-)")
$learnings = @()

foreach ($block in $blocks) {
    $trimmed = $block.Trim()
    if (-not [string]::IsNullOrWhiteSpace($trimmed) -and $trimmed -match "\[LEARNING-") {
        $learnings += $trimmed
    }
}

if ($learnings.Count -eq 0) {
    $blocks = [System.Text.RegularExpressions.Regex]::Split($content, "(?m)^(?=###?\s+)")
    foreach ($block in $blocks) {
        $trimmed = $block.Trim()
        if (-not [string]::IsNullOrWhiteSpace($trimmed) -and ($trimmed.StartsWith("#") -or $trimmed.StartsWith("-"))) {
            $learnings += $trimmed
        }
    }
}

if ([string]::IsNullOrWhiteSpace($Query)) {
    $latest = $learnings | Select-Object -Last $Limit
    Write-Output "=== [SEMANTIC BRAIN: $Limit MOST RECENT LEARNINGS] ==="
    foreach ($item in $latest) {
        Write-Output $item
        Write-Output "`n---`n"
    }
    exit 0
}

$keywords = $Query.ToLower().Split(" ", [System.StringSplitOptions]::RemoveEmptyEntries)
$scoredLearnings = @()

foreach ($l in $learnings) {
    $lLower = $l.ToLower()
    $score = 0
    foreach ($kw in $keywords) {
        if ($lLower.Contains($kw)) {
            $score += 1
            $firstLine = ($l -split "`n")[0].ToLower()
            if ($firstLine.Contains($kw)) {
                $score += 2
            }
        }
    }
    if ($score -gt 0) {
        $scoredLearnings += [PSCustomObject]@{
            Score = $score
            Content = $l
        }
    }
}

$results = $scoredLearnings | Sort-Object -Property Score -Descending | Select-Object -First $Limit

if ($results.Count -eq 0) {
    Write-Output "INFO: No learnings found matching query '$Query'."
    $fallback = $learnings | Select-Object -Last 1
    if ($fallback) {
        Write-Output "`n=== [FALLBACK: MOST RECENT LEARNING] ==="
        Write-Output $fallback
    }
} else {
    Write-Output "=== [SEMANTIC BRAIN: TOP $($results.Count) LEARNINGS MATCHING '$Query'] ==="
    foreach ($r in $results) {
        Write-Output $r.Content
        Write-Output "`n---`n"
    }
}
