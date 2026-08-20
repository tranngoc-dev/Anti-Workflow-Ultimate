$projectRef = "wamdmopfyhcbljeeclph"
$sessionId  = "019e67c3-7290-7a48-bf2c-9d3e7f68a932"

$cookieHeader = "session_id=$sessionId"

$commonHeaders = @{
    "Cookie"       = $cookieHeader
    "Accept"       = "application/json"
    "Content-Type" = "application/json"
    "User-Agent"   = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    "Origin"       = "https://supabase.com"
    "Referer"      = "https://supabase.com/dashboard/project/$projectRef/sql/"
}

Write-Host "=== Step 1: Fetching access token from Supabase dashboard session ===" -ForegroundColor Cyan

$token = $null
try {
    $profileResp = Invoke-RestMethod `
        -Uri "https://api.supabase.com/v1/profile" `
        -Method Get `
        -Headers $commonHeaders `
        -ErrorAction Stop
    Write-Host "Profile OK: $($profileResp | ConvertTo-Json -Depth 2)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "Profile request status: $statusCode" -ForegroundColor Yellow
    
    # Try to read response body
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "Response body: $body" -ForegroundColor Yellow
    } catch {
        Write-Host "Could not read response body"
    }
}

Write-Host ""
Write-Host "=== Step 2: Trying SQL execution via Management API ===" -ForegroundColor Cyan

$sql = @"
SELECT current_database(), current_schema(), version();
"@

$payload = @{ query = $sql } | ConvertTo-Json

try {
    $sqlResp = Invoke-RestMethod `
        -Uri "https://api.supabase.com/v1/projects/$projectRef/database/query" `
        -Method Post `
        -Headers $commonHeaders `
        -Body $payload `
        -ErrorAction Stop
    Write-Host "SQL Result: $($sqlResp | ConvertTo-Json -Depth 5)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "SQL request status: $statusCode" -ForegroundColor Yellow
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "Response body: $body" -ForegroundColor Yellow
    } catch {}
}

Write-Host ""
Write-Host "=== Step 3: Trying via internal Supabase Studio API ===" -ForegroundColor Cyan

try {
    $studioResp = Invoke-RestMethod `
        -Uri "https://api.supabase.com/platform/projects/$projectRef" `
        -Method Get `
        -Headers $commonHeaders `
        -ErrorAction Stop
    Write-Host "Studio project info: $($studioResp | ConvertTo-Json -Depth 2)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "Studio request status: $statusCode" -ForegroundColor Yellow
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "Response: $body" -ForegroundColor Yellow
    } catch {}
}
