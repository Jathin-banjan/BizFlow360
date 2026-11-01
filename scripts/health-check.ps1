# BizFlow 360 - Environment Health Check Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  BizFlow 360 Health Verification" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. MongoDB Check
Write-Host "`n[1/3] Checking MongoDB connection..." -ForegroundColor Yellow
$mongoPort = Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue
if ($mongoPort) {
    Write-Host "  PASS: MongoDB is responding on port 27017 (PID $($mongoPort[0].OwningProcess))" -ForegroundColor Green
} else {
    Write-Host "  FAIL: Port 27017 is not open. Local MongoDB is not responding." -ForegroundColor Red
}

# 2. Backend API Health Check
Write-Host "`n[2/3] Checking Backend Health Endpoint..." -ForegroundColor Yellow
try {
    $res = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/health" -Method Get -TimeoutSec 3
    if ($res.success) {
        Write-Host "  PASS: Backend API is Healthy!" -ForegroundColor Green
        Write-Host "    Status:   $($res.status)" -ForegroundColor White
        Write-Host "    Database: $($res.database.status)" -ForegroundColor White
        Write-Host "    Uptime:   $($res.uptimeSeconds) seconds" -ForegroundColor White
    } else {
        Write-Host "  WARN: Backend returned non-success: $($res.status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  FAIL: Backend is unreachable at http://localhost:5000/api/v1/health" -ForegroundColor Red
}

# 3. Frontend Reachability Check
Write-Host "`n[3/3] Checking Frontend Dev Server..." -ForegroundColor Yellow
try {
    $res = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 3
    if ($res.StatusCode -eq 200) {
        Write-Host "  PASS: Frontend UI is live at http://localhost:5173" -ForegroundColor Green
    }
} catch {
    Write-Host "  FAIL: Frontend is unreachable at http://localhost:5173" -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
