<#
.SYNOPSIS
    Truy vấn tri thức ngữ cảnh thông minh (Micro RAG) từ .brain/learnings.md
.DESCRIPTION
    Trích xuất đúng các bài học liên quan đến từ khóa/lỗi hiện tại để nạp vào context,
    tránh đọc toàn bộ file làm phình to Context Window.
.PARAMETER Query
    Từ khóa hoặc chuỗi mô tả lỗi cần tìm (vd: "Ambiguous Foreign Key", "Rate Limit")
.PARAMETER Limit
    Số lượng bài học tối đa cần lấy (mặc định: 2)
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
        Write-Output "INFO: Chưa tìm thấy file $BrainPath. Không có bài học nào được nạp."
        exit 0
    }
}

$content = Get-Content -Path $BrainPath -Raw -Encoding UTF8
if ([string]::IsNullOrWhiteSpace($content)) {
    Write-Output "INFO: File $BrainPath trống."
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
    Write-Output "=== [SEMANTIC BRAIN: $Limit BÀI HỌC MỚI NHẤT] ==="
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
    Write-Output "INFO: Không tìm thấy bài học nào khớp với từ khóa '$Query'."
    $fallback = $learnings | Select-Object -Last 1
    if ($fallback) {
        Write-Output "`n=== [FALLBACK: BÀI HỌC MỚI NHẤT] ==="
        Write-Output $fallback
    }
} else {
    Write-Output "=== [SEMANTIC BRAIN: TOP $($results.Count) BÀI HỌC KHỚP VỚI '$Query'] ==="
    foreach ($r in $results) {
        Write-Output $r.Content
        Write-Output "`n---`n"
    }
}
