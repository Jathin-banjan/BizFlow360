# BizFlow 360 - Unified Application Startup Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting BizFlow 360 Platform Services..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Port Conflict Check
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    Write-Host "WARNING: Port 5000 is already in use by process ID $($port5000[0].OwningProcess)." -ForegroundColor Yellow
}

$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "WARNING: Port 5173 is already in use by process ID $($port5173[0].OwningProcess)." -ForegroundColor Yellow
}

$rootDir = (Resolve-Path "$PSScriptRoot\..").Path

# 2. Check MongoDB Daemon / Data Directory
$port27017 = Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue
if (-not $port27017) {
    Write-Host "MongoDB is not running on port 27017. Attempting to start local mongod..." -ForegroundColor Yellow
    $dbPath = Join-Path $rootDir "data\db"
    if (-not (Test-Path $dbPath)) {
        New-Item -ItemType Directory -Path $dbPath -Force | Out-Null
    }
    if (Get-Command mongod -ErrorAction SilentlyContinue) {
        Start-Process mongod -ArgumentList "--dbpath `"$dbPath`" --port 27017 --bind_ip 127.0.0.1" -WindowStyle Minimized
        Start-Sleep -Seconds 3
        Write-Host "Local MongoDB started on 127.0.0.1:27017." -ForegroundColor Green
    } else {
        Write-Host "mongod command not found. Ensure MongoDB service is running or Atlas URI is configured." -ForegroundColor Yellow
    }
} else {
    Write-Host "MongoDB is active on port 27017." -ForegroundColor Green
}

# 3. Start Backend in new process
Write-Host "Starting Express.js Backend API on http://localhost:5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\backend'; npm run dev"

# 4. Start Frontend in new process
Write-Host "Starting React / Vite Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\frontend'; npm run dev"

Start-Sleep -Seconds 4

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  BizFlow 360 is running!" -ForegroundColor Green
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:   http://localhost:5000/api/v1/health" -ForegroundColor White
Write-Host "  Demo Users:" -ForegroundColor Yellow
Write-Host "    Admin:   admin@bizflow360.com   / Admin@12345" -ForegroundColor Yellow
Write-Host "    Manager: manager@bizflow360.com / Manager@12345" -ForegroundColor Yellow
Write-Host "    Analyst: analyst@bizflow360.com / Analyst@12345" -ForegroundColor Yellow
Write-Host "  To stop:   .\scripts\stop.ps1" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
