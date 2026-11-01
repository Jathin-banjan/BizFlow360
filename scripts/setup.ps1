# BizFlow 360 - Automated Environment Setup Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  BizFlow 360 — Intelligent Business Operations & Analytics" -ForegroundColor Cyan
Write-Host "  Automated Setup Script (Windows 11 / PowerShell)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Node.js
Write-Host "`n[1/5] Checking Node.js installation..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node -v
    Write-Host "  PASS: Node.js is installed ($nodeVersion)" -ForegroundColor Green
} else {
    Write-Host "  FAIL: Node.js is not found in PATH. Please install Node.js LTS from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# 2. Check npm
Write-Host "`n[2/5] Checking npm package manager..." -ForegroundColor Yellow
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm -v
    Write-Host "  PASS: npm is installed ($npmVersion)" -ForegroundColor Green
} else {
    Write-Host "  FAIL: npm is not found in PATH." -ForegroundColor Red
    exit 1
}

# 3. Check MongoDB
Write-Host "`n[3/5] Checking MongoDB availability..." -ForegroundColor Yellow
if (Get-Command mongod -ErrorAction SilentlyContinue) {
    $mongoVersion = mongod --version | Select-Object -First 1
    Write-Host "  PASS: MongoDB daemon found ($mongoVersion)" -ForegroundColor Green
} else {
    Write-Host "  INFO: mongod binary not in PATH. Ensure MongoDB Community Server is installed or MongoDB Atlas URI is set in backend/.env" -ForegroundColor Yellow
}

# 4. Install Dependencies
Write-Host "`n[4/5] Installing Backend dependencies..." -ForegroundColor Yellow
Push-Location "backend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  FAIL: Backend npm install failed." -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "  PASS: Backend dependencies installed." -ForegroundColor Green
Pop-Location

Write-Host "`n[4b/5] Installing Frontend dependencies..." -ForegroundColor Yellow
Push-Location "frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  FAIL: Frontend npm install failed." -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "  PASS: Frontend dependencies installed." -ForegroundColor Green
Pop-Location

# 5. Environment configuration verification
Write-Host "`n[5/5] Verifying environment configurations..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "  Created backend\.env from example template." -ForegroundColor Green
}
if (-not (Test-Path "frontend\.env")) {
    Copy-Item "frontend\.env.example" "frontend\.env"
    Write-Host "  Created frontend\.env from example template." -ForegroundColor Green
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  BizFlow 360 Setup Completed Successfully!" -ForegroundColor Green
Write-Host "  To seed database:       npm run seed (inside backend/)" -ForegroundColor Cyan
Write-Host "  To start all services:  .\scripts\start.ps1" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
