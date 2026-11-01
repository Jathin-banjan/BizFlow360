# BizFlow 360 - Clean Shutdown Script
Write-Host "Stopping BizFlow 360 processes..." -ForegroundColor Cyan

# Stop Backend (Port 5000)
$backendConns = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($backendConns) {
    foreach ($conn in $backendConns) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped Backend API process (PID $($conn.OwningProcess))" -ForegroundColor Green
    }
} else {
    Write-Host "No backend process found listening on port 5000." -ForegroundColor Gray
}

# Stop Frontend (Port 5173)
$frontendConns = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontendConns) {
    foreach ($conn in $frontendConns) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped Frontend Vite process (PID $($conn.OwningProcess))" -ForegroundColor Green
    }
} else {
    Write-Host "No frontend process found listening on port 5173." -ForegroundColor Gray
}

Write-Host "BizFlow 360 services stopped successfully." -ForegroundColor Green
