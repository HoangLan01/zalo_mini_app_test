# test-local.ps1 - Local Test Runner for Zalo Mini App
# Usage: .\scripts\test-local.ps1

param(
    [switch]$SkipDocker,
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$Coverage
)

$ErrorActionPreference = "Continue"
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# Resolve paths relative to this script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptDir

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Zalo Mini App - Local Test Runner" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$results = @{}
$startTime = Get-Date

# -- Step 1: Docker test DB --
if (-not $SkipDocker -and -not $FrontendOnly) {
    Write-Host "[1/4] Starting test database (Docker)..." -ForegroundColor Yellow
    $composeFile = Join-Path $root "docker-compose.test.yml"
    if (Test-Path $composeFile) {
        docker compose -f $composeFile up -d 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [PASS] Test database started (port 5433)" -ForegroundColor Green
            $results["Docker DB"] = "PASS"
            # Wait for PG to be ready
            Start-Sleep -Seconds 3
        } else {
            Write-Host "  [FAIL] Docker failed. Skipping integration tests." -ForegroundColor Yellow
            $results["Docker DB"] = "SKIP"
        }
    } else {
        Write-Host "  [WARN] docker-compose.test.yml not found." -ForegroundColor Yellow
        $results["Docker DB"] = "SKIP"
    }
} else {
    Write-Host "[1/4] Skipping Docker" -ForegroundColor Gray
    $results["Docker DB"] = "SKIP"
}

# -- Step 2: Backend tests --
if (-not $FrontendOnly) {
    Write-Host ""
    Write-Host "[2/4] Running backend tests..." -ForegroundColor Yellow

    Push-Location (Join-Path $root "backend")

    if ($Coverage) {
        npm run test:coverage 2>&1
    } else {
        npm test 2>&1
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [PASS] Backend tests passed" -ForegroundColor Green
        $results["Backend Tests"] = "PASS"
    } else {
        Write-Host "  [FAIL] Backend tests failed" -ForegroundColor Red
        $results["Backend Tests"] = "FAIL"
    }

    Pop-Location
} else {
    $results["Backend Tests"] = "SKIP"
}

# -- Step 3: Frontend tests --
if (-not $BackendOnly) {
    Write-Host ""
    Write-Host "[3/4] Running frontend tests..." -ForegroundColor Yellow

    Push-Location $root

    $testScript = (Get-Content (Join-Path $root "package.json") | ConvertFrom-Json).scripts.test
    if ($testScript) {
        if ($Coverage) {
            npm run test:coverage 2>&1
        } else {
            npm test 2>&1
        }

        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [PASS] Frontend tests passed" -ForegroundColor Green
            $results["Frontend Tests"] = "PASS"
        } else {
            Write-Host "  [FAIL] Frontend tests failed" -ForegroundColor Red
            $results["Frontend Tests"] = "FAIL"
        }
    } else {
        Write-Host "  [WARN] No frontend test script found. Skipping." -ForegroundColor Yellow
        $results["Frontend Tests"] = "SKIP"
    }

    Pop-Location
} else {
    $results["Frontend Tests"] = "SKIP"
}

# -- Step 4: Type checks --
Write-Host ""
Write-Host "[4/4] Running type checks..." -ForegroundColor Yellow

if (-not $FrontendOnly) {
    Push-Location (Join-Path $root "backend")
    npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [PASS] Backend typecheck passed" -ForegroundColor Green
        $results["Backend Typecheck"] = "PASS"
    } else {
        Write-Host "  [FAIL] Backend typecheck failed" -ForegroundColor Red
        $results["Backend Typecheck"] = "FAIL"
    }
    Pop-Location
}

if (-not $BackendOnly) {
    Push-Location $root
    npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [PASS] Frontend typecheck passed" -ForegroundColor Green
        $results["Frontend Typecheck"] = "PASS"
    } else {
        Write-Host "  [FAIL] Frontend typecheck failed" -ForegroundColor Red
        $results["Frontend Typecheck"] = "FAIL"
    }
    Pop-Location
}

# -- Summary --
$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$hasFailure = $false
foreach ($key in $results.Keys | Sort-Object) {
    $status = $results[$key]
    $color = switch ($status) {
        "PASS"  { "Green" }
        "FAIL"  { "Red"; $hasFailure = $true }
        "SKIP"  { "Yellow" }
        default { "White" }
    }
    Write-Host "  [$status] $key" -ForegroundColor $color
}

Write-Host ""
Write-Host "  Duration: $([math]::Round($duration, 1))s" -ForegroundColor Gray
Write-Host ""

if ($hasFailure) {
    Write-Host "  [FAIL] SOME TESTS FAILED - Do not deploy!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "  [PASS] ALL CHECKS PASSED - Ready to deploy!" -ForegroundColor Green
    exit 0
}
