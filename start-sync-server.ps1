# DnD Sync Server Startup Script

Write-Host "🚀 Starting DnD Sync Server..." -ForegroundColor Green

# Переходим в папку сервера
Set-Location server

# Проверяем, установлены ли зависимости
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
    npm install
}

# Запускаем сервер
Write-Host "🌐 Starting server on port 3001..." -ForegroundColor Cyan
npm start
