$ErrorActionPreference = 'Stop'

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Invoke-Step {
  param(
    [string]$Label,
    [string]$WorkingDirectory,
    [string]$Command
  )

  Write-Step $Label
  Push-Location $WorkingDirectory
  try {
    & powershell -NoProfile -ExecutionPolicy Bypass -Command $Command
    if ($LASTEXITCODE -ne 0) {
      throw "Command failed with exit code $LASTEXITCODE"
    }
  }
  finally {
    Pop-Location
  }
}

function Wait-ForHttp {
  param(
    [string]$Url,
    [int]$TimeoutSeconds = 30
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  do {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
      return $response
    }
    catch {
      Start-Sleep -Seconds 1
    }
  } while ((Get-Date) -lt $deadline)

  throw "Timed out waiting for $Url"
}

function Stop-ProcessSafe {
  param($Process)

  if ($null -ne $Process -and -not $Process.HasExited) {
    Stop-Process -Id $Process.Id -Force
    $Process.WaitForExit()
  }
}

function Remove-FileIfExists {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    return
  }

  try {
    Remove-Item $Path -Force
  }
  catch {
    Write-Host "Skip deleting in-use log: $Path" -ForegroundColor Yellow
  }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root 'backend'
$adminDir = Join-Path $root 'admin'
$logDir = Join-Path $root '.check-logs'
$runId = Get-Date -Format 'yyyyMMdd-HHmmss'
$backendOutLog = Join-Path $logDir "check-backend-$runId.out.log"
$backendErrLog = Join-Path $logDir "check-backend-$runId.err.log"
$adminOutLog = Join-Path $logDir "check-admin-preview-$runId.out.log"
$adminErrLog = Join-Path $logDir "check-admin-preview-$runId.err.log"

$backendProcess = $null
$adminProcess = $null

try {
  if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
  }

  Invoke-Step -Label 'Run backend test suite' -WorkingDirectory $backendDir -Command 'npm test'
  Invoke-Step -Label 'Build backend' -WorkingDirectory $backendDir -Command 'npm run build'
  Invoke-Step -Label 'Build admin' -WorkingDirectory $adminDir -Command 'npm run build'

  Write-Step 'Start backend dev server'
  $backendProcess = Start-Process -FilePath 'npm.cmd' `
    -ArgumentList 'run', 'dev' `
    -WorkingDirectory $backendDir `
    -RedirectStandardOutput $backendOutLog `
    -RedirectStandardError $backendErrLog `
    -WindowStyle Hidden `
    -PassThru

  $health = Wait-ForHttp -Url 'http://localhost:3001/health'
  Write-Host "Backend health check: $($health.StatusCode)" -ForegroundColor Green

  Write-Step 'Start admin preview server'
  $adminProcess = Start-Process -FilePath 'npm.cmd' `
    -ArgumentList 'run', 'preview' `
    -WorkingDirectory $adminDir `
    -RedirectStandardOutput $adminOutLog `
    -RedirectStandardError $adminErrLog `
    -WindowStyle Hidden `
    -PassThru

  $adminHome = Wait-ForHttp -Url 'http://localhost:3101/'
  Write-Host "Admin preview check: $($adminHome.StatusCode)" -ForegroundColor Green

  Write-Step 'Smoke check admin API guard'
  try {
    Invoke-WebRequest -Uri 'http://localhost:3001/api/admin/feedbacks' -UseBasicParsing -TimeoutSec 5 | Out-Null
    throw 'Admin endpoint unexpectedly allowed anonymous access.'
  }
  catch {
    $statusCode = $null
    if ($_.Exception.Response) {
      $statusCode = [int]$_.Exception.Response.StatusCode
    }

    if ($statusCode -ne 401) {
      throw "Expected admin API to return 401, got $statusCode"
    }

    Write-Host 'Admin API guard check: 401' -ForegroundColor Green
  }

  Write-Step 'All checks passed'
  Write-Host 'Backend tests/build, admin build, preview, and smoke checks completed successfully.' -ForegroundColor Green
}
finally {
  Write-Step 'Cleanup background processes'
  Stop-ProcessSafe $adminProcess
  Stop-ProcessSafe $backendProcess
  Remove-FileIfExists $adminOutLog
  Remove-FileIfExists $adminErrLog
  Remove-FileIfExists $backendOutLog
  Remove-FileIfExists $backendErrLog
}
