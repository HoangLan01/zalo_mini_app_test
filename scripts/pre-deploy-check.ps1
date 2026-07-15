# pre-deploy-check.ps1 - Pre-production deployment checklist
# Usage: .\scripts\pre-deploy-check.ps1

$ErrorActionPreference = "Continue"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptDir
$backendDir = Join-Path $root "backend"
$adminDir = Join-Path $root "admin"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "   Pre-Production Deployment Checklist    " -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host ""

$checks = [ordered]@{}
$startTime = Get-Date

function Invoke-Check {
    param(
        [string]$Name,
        [string]$StepLabel,
        [scriptblock]$Action,
        [string]$SuccessStatus = "[PASS] PASS",
        [string]$FailureStatus = "[FAIL] FAIL"
    )

    Write-Host $StepLabel -ForegroundColor Yellow
    & $Action
    if ($LASTEXITCODE -eq 0) {
        $checks[$Name] = $SuccessStatus
    } else {
        $checks[$Name] = $FailureStatus
    }
}

function Test-ExpectedFailure {
    param(
        [string]$Name,
        [string]$StepLabel,
        [scriptblock]$Action
    )

    Write-Host $StepLabel -ForegroundColor Yellow
    & $Action
    if ($LASTEXITCODE -ne 0) {
        $checks[$Name] = "[PASS] PASS"
    } else {
        $checks[$Name] = "[FAIL] FAIL"
    }
}

function Move-EnvFilesOutOfTheWay {
    param([string]$TargetDir)

    $movedFiles = @()
    foreach ($name in @(".env", ".env.local", ".env.production", ".env.production.local")) {
        $original = Join-Path $TargetDir $name
        if (Test-Path $original) {
            $backup = "$original.predeploy.bak"
            Move-Item -LiteralPath $original -Destination $backup -Force
            $movedFiles += [pscustomobject]@{
                Original = $original
                Backup = $backup
            }
        }
    }

    return $movedFiles
}

function Restore-EnvFiles {
    param([object[]]$MovedFiles)

    foreach ($file in $MovedFiles) {
        if (Test-Path $file.Backup) {
            Move-Item -LiteralPath $file.Backup -Destination $file.Original -Force
        }
    }
}

Invoke-Check "Env Examples" "[1/12] Validating environment example files..." {
    Push-Location $root
    npm run check:env-examples 2>&1 | Out-Null
    Pop-Location
}

Invoke-Check "Secret Scan" "[2/12] Running basic tracked secret scan..." {
    Push-Location $root
    git grep -n -I -E "BEGIN (RSA|EC|OPENSSH|DSA) PRIVATE KEY|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z\\-_]{35}|sk_live_[0-9A-Za-z]+|xox[baprs]-[0-9A-Za-z-]+" -- . 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $global:LASTEXITCODE = 1
    } else {
        $global:LASTEXITCODE = 0
    }
    Pop-Location
}

Invoke-Check "Backend Audit" "[3/12] Auditing backend production dependencies..." {
    Push-Location $backendDir
    npm audit --omit=dev --audit-level=high 2>&1 | Out-Null
    Pop-Location
}

Invoke-Check "Frontend Audit" "[4/12] Auditing frontend production dependencies..." {
    Push-Location $root
    npm audit --omit=dev --audit-level=high 2>&1 | Out-Null
    Pop-Location
}

Invoke-Check "Backend Tests" "[5/12] Running backend tests with coverage..." {
    Push-Location $backendDir
    npm run test:ci 2>&1 | Out-Null
    Pop-Location
}

Invoke-Check "Backend Typecheck" "[6/12] Backend type check..." {
    Push-Location $backendDir
    npx tsc --noEmit 2>&1 | Out-Null
    Pop-Location
}

Invoke-Check "Backend Build" "[7/12] Building backend..." {
    Push-Location $backendDir
    npm run build 2>&1 | Out-Null
    Pop-Location
}

Invoke-Check "Frontend Typecheck" "[8/12] Frontend type check..." {
    Push-Location $root
    npx tsc --noEmit 2>&1 | Out-Null
    Pop-Location
}

Invoke-Check "Frontend Build" "[9/12] Building frontend with explicit production env..." {
    Push-Location $root
    $oldApiUrl = $env:VITE_API_URL
    $oldOaId = $env:VITE_ZALO_OA_ID
    $env:VITE_API_URL = "https://api.phuongtungthien.com"
    $env:VITE_ZALO_OA_ID = "example_oa_id"
    npm run build 2>&1 | Out-Null
    $env:VITE_API_URL = $oldApiUrl
    $env:VITE_ZALO_OA_ID = $oldOaId
    Pop-Location
}

Test-ExpectedFailure "Frontend Missing API Guard" "[10/12] Verifying frontend production build fails without explicit API env..." {
    Push-Location $root
    $oldApiUrl = $env:VITE_API_URL
    $oldOaId = $env:VITE_ZALO_OA_ID
    $movedFiles = Move-EnvFilesOutOfTheWay -TargetDir $root
    $env:VITE_API_URL = ""
    $env:VITE_ZALO_OA_ID = ""
    npx vite build --mode production 2>&1 | Out-Null
    Restore-EnvFiles -MovedFiles $movedFiles
    $env:VITE_API_URL = $oldApiUrl
    $env:VITE_ZALO_OA_ID = $oldOaId
    Pop-Location
}

Invoke-Check "Admin Build" "[11/12] Building admin with explicit production env..." {
    Push-Location $adminDir
    $oldApiUrl = $env:VITE_API_URL
    $env:VITE_API_URL = "https://api.phuongtungthien.com"
    npm run build 2>&1 | Out-Null
    $env:VITE_API_URL = $oldApiUrl
    Pop-Location
}

Test-ExpectedFailure "Admin Missing API Guard" "[12/12] Verifying admin production build fails without explicit API env..." {
    Push-Location $adminDir
    $oldApiUrl = $env:VITE_API_URL
    $movedFiles = Move-EnvFilesOutOfTheWay -TargetDir $adminDir
    $env:VITE_API_URL = ""
    npx vite build --mode production 2>&1 | Out-Null
    Restore-EnvFiles -MovedFiles $movedFiles
    $env:VITE_API_URL = $oldApiUrl
    Pop-Location
}

Push-Location $root
$encScript = (Get-Content (Join-Path $root "package.json") | ConvertFrom-Json).scripts."check:vi-encoding"
if ($encScript) {
    Invoke-Check "Vietnamese Encoding" "[Info] Checking Vietnamese encoding..." {
        npm run "check:vi-encoding" 2>&1 | Out-Null
    } "[PASS] PASS" "[WARN] WARN"
}
Pop-Location

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
