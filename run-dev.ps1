<#
.SYNOPSIS
    Starts the GitMaps development environment (FastAPI backend + Next.js frontend).

.DESCRIPTION
    Loads .env from the repo root, launches uvicorn and next dev in separate
    PowerShell windows, and prints the URLs.

.EXAMPLE
    .\run-dev.ps1
#>

$ErrorActionPreference = 'Stop'
$RepoRoot = $PSScriptRoot

# ── Preflight checks ──────────────────────────────────────────────────────

$envFile = Join-Path $RepoRoot '.env'
if (-not (Test-Path $envFile)) {
    Write-Error ".env file not found at $envFile`nCopy .env.example to .env and fill in your values."
    exit 1
}

$uvicorn = Get-Command uvicorn -ErrorAction SilentlyContinue
if (-not $uvicorn) {
    Write-Error "uvicorn not found. Install it: pip install uvicorn"
    exit 1
}

$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) {
    Write-Error "npm not found. Install Node.js from https://nodejs.org"
    exit 1
}

# ── Load .env into this process so child windows inherit the variables ─────

Write-Host "Loading .env ..." -ForegroundColor Cyan
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    # Skip comments and blanks
    if ($line -match '^#' -or $line -eq '') { return }

    # Split on first '=' only (values may contain '=')
    $key, $value = $line -split '=', 2
    $key = $key.Trim()
    $value = $value.Trim().Trim('"').Trim("'")

    # Remove surrounding quotes if present
    if ($value -match '^"(.*)"$') { $value = $Matches[1] }
    if ($value -match "^'(.*)'$") { $value = $Matches[1] }

    [Environment]::SetEnvironmentVariable($key, $value, 'Process')
}
Write-Host "  Done." -ForegroundColor Green

# ── Start backend in a new window ─────────────────────────────────────────

Write-Host "Starting FastAPI backend on http://localhost:8000 ..." -ForegroundColor Cyan
$backendCmd = "cd '$RepoRoot'; uvicorn gitmaps.api.main:create_app --factory --port 8000 --reload"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal

# ── Start frontend in a new window ────────────────────────────────────────

$frontendDir = Join-Path $RepoRoot 'frontend'
Write-Host "Starting Next.js frontend on http://localhost:3000 ..." -ForegroundColor Cyan
$frontendCmd = "cd '$frontendDir'; npm run dev"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal

# ── Print summary ─────────────────────────────────────────────────────────

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " GitMaps dev environment is starting"    -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "  Backend:   http://localhost:8000" -ForegroundColor Yellow
Write-Host "  API docs:  http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "Close the two PowerShell windows to stop." -ForegroundColor DarkGray
