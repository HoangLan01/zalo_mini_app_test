# pre-deploy-check.ps1 - Pre-production deployment checklist
# Usage: .\scripts\pre-deploy-check.ps1

$ErrorActionPreference = "Continue"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptDir

Write-Host ""
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "   Pre-Production Deployment Checklist    " -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host ""

$checks = [ordered]@{}
$startTime = Get-Date

# -- 1. Backend Tests --
Write-Host "[1/7] Running backend tests with coverage..." -ForegroundColor Yellow
Push-Location (Join-Path $root "backend")
npm run test:ci 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    $checks["Backend Tests"] = "[PASS] PASS"
} else {
    $checks["Backend Tests"] = "[FAIL] FAIL"
}
Pop-Location

# -- 2. Backend Typecheck --
Write-Host "[2/7] Backend type check..." -ForegroundColor Yellow
Push-Location (Join-Path $root "backend")
npx tsc --noEmit 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    $checks["Backend Typecheck"] = "[PASS] PASS"
} else {
    $checks["Backend Typecheck"] = "[FAIL] FAIL"
}
Pop-Location

# -- 3. Backend Build --
Write-Host "[3/7] Building backend..." -ForegroundColor Yellow
Push-Location (Join-Path $root "backend")
npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    $checks["Backend Build"] = "[PASS] PASS"
} else {
    $checks["Backend Build"] = "[FAIL] FAIL"
}
Pop-Location

# -- 4. Frontend Typecheck --
Write-Host "[4/7] Frontend type check..." -ForegroundColor Yellow
Push-Location $root
npx tsc --noEmit 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    $checks["Frontend Typecheck"] = "[PASS] PASS"
} else {
    $checks["Frontend Typecheck"] = "[FAIL] FAIL"
}
Pop-Location

# -- 5. Frontend Build --
Write-Host "[5/7] Building frontend..." -ForegroundColor Yellow
Push-Location $root
npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    $checks["Frontend Build"] = "[PASS] PASS"
} else {
    $checks["Frontend Build"] = "[FAIL] FAIL"
}
Pop-Location

# -- 6. Admin Build --
Write-Host "[6/7] Building admin panel..." -ForegroundColor Yellow
$adminDir = Join-Path $root "admin"
if (Test-Path $adminDir) {
    Push-Location $adminDir
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $checks["Admin Build"] = "[PASS] PASS"
    } else {
        $checks["Admin Build"] = "[FAIL] FAIL"
    }
    Pop-Location
} else {
    $checks["Admin Build"] = "[SKIP] SKIP"
}

# -- 7. Vietnamese Encoding --
Write-Host "[7/7] Checking Vietnamese encoding..." -ForegroundColor Yellow
Push-Location $root
$encScript = (Get-Content (Join-Path $root "package.json") | ConvertFrom-Json).scripts."check:vi-encoding"
if ($encScript) {
    npm run "check:vi-encoding" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $checks["Vietnamese Encoding"] = "[PASS] PASS"
    } else {
        $checks["Vietnamese Encoding"] = "[WARN] WARN"
    }
} else {
    $checks["Vietnamese Encoding"] = "[SKIP] SKIP"
}
Pop-Location

# -- Summary --
$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host ""
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "   Deployment Checklist Results           " -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host ""

$hasFailure = $false
foreach ($key in $checks.Keys) {
    $value = $checks[$key]
    if ($value -match "FAIL") { $hasFailure = $true }
    Write-Host "  $value  $key"
}

Write-Host ""
Write-Host "  Duration: $([math]::Round($duration, 1))s" -ForegroundColor Gray
Write-Host ""

if ($hasFailure) {
    Write-Host "  [FAIL] DEPLOYMENT BLOCKED - Fix issues above first!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "  [PASS] ALL CHECKS PASSED - Safe to deploy!" -ForegroundColor Green
    exit 0
}
