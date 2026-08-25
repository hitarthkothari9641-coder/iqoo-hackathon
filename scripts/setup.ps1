# College OS PowerShell Setup Script
Write-Host "🚀 Initializing College OS Development Environment..." -ForegroundColor Green

if (-not (Test-Path ".env")) {
    Write-Host "📄 Copying .env.example to .env..." -ForegroundColor Yellow
    Copy-Item .env.example .env
}

if (-not (Test-Path "backend\.env")) {
    Copy-Item .env.example backend\.env
}

if (-not (Test-Path "admin\.env")) {
    Copy-Item .env.example admin\.env
}

Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install
npx prisma generate
Set-Location ..

Write-Host "📦 Installing admin dependencies..." -ForegroundColor Cyan
Set-Location admin
npm install
Set-Location ..

Write-Host "✅ Environment setup complete!" -ForegroundColor Green
