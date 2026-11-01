# BizFlow 360 - Safe Deterministic Demo Dataset Reset
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  BizFlow 360 — Resetting Synthetic Demo Data..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Push-Location "backend"
try {
    npm run seed
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nPASS: Synthetic demonstration dataset successfully reseeded." -ForegroundColor Green
    } else {
        Write-Host "`nFAIL: Seed execution encountered an error. Check MongoDB connection." -ForegroundColor Red
    }
} finally {
    Pop-Location
}
