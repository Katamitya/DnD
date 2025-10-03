# DnD Game Deploy Script для Windows PowerShell

Write-Host "🎮 DnD Game Deploy Script" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# Проверяем, что мы в правильной директории
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Ошибка: package.json не найден. Запустите скрипт из корня проекта." -ForegroundColor Red
    exit 1
}

# Функция для GitHub Pages деплоя
function Deploy-GitHub {
    Write-Host "📦 Подготовка к деплою на GitHub Pages..." -ForegroundColor Yellow
    
    # Сборка проекта
    Write-Host "🔨 Сборка проекта..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка при сборке проекта" -ForegroundColor Red
        exit 1
    }
    
    # Проверяем, что Git инициализирован
    if (-not (Test-Path ".git")) {
        Write-Host "🔧 Инициализация Git..." -ForegroundColor Yellow
        git init
    }
    
    # Добавляем все файлы
    Write-Host "📝 Добавление файлов в Git..." -ForegroundColor Yellow
    git add .
    
    # Коммит
    Write-Host "💾 Создание коммита..." -ForegroundColor Yellow
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Deploy: $timestamp"
    
    # Проверяем remote
    try {
        git remote get-url origin | Out-Null
    } catch {
        Write-Host "⚠️  Удаленный репозиторий не настроен." -ForegroundColor Yellow
        Write-Host "Сначала выполните:" -ForegroundColor Yellow
        Write-Host "git remote add origin https://github.com/YOUR_USERNAME/DND.git" -ForegroundColor Cyan
        exit 1
    }
    
    # Push
    Write-Host "🚀 Загрузка в GitHub..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Деплой завершен!" -ForegroundColor Green
        Write-Host "🌐 Ваше приложение будет доступно через несколько минут по адресу:" -ForegroundColor Green
        Write-Host "   https://YOUR_USERNAME.github.io/DND/" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Ошибка при загрузке в GitHub" -ForegroundColor Red
        exit 1
    }
}

# Функция для Vercel деплоя
function Deploy-Vercel {
    Write-Host "📦 Подготовка к деплою на Vercel..." -ForegroundColor Yellow
    
    # Проверяем, установлен ли Vercel CLI
    try {
        vercel --version | Out-Null
    } catch {
        Write-Host "📥 Установка Vercel CLI..." -ForegroundColor Yellow
        npm install -g vercel
    }
    
    # Деплой
    Write-Host "🚀 Деплой на Vercel..." -ForegroundColor Yellow
    vercel --prod
    
    Write-Host "✅ Деплой завершен!" -ForegroundColor Green
}

# Функция для Netlify деплоя
function Deploy-Netlify {
    Write-Host "📦 Подготовка к деплою на Netlify..." -ForegroundColor Yellow
    
    # Сборка
    Write-Host "🔨 Сборка проекта..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка при сборке проекта" -ForegroundColor Red
        exit 1
    }
    
    # Проверяем, установлен ли Netlify CLI
    try {
        netlify --version | Out-Null
    } catch {
        Write-Host "📥 Установка Netlify CLI..." -ForegroundColor Yellow
        npm install -g netlify-cli
    }
    
    # Деплой
    Write-Host "🚀 Деплой на Netlify..." -ForegroundColor Yellow
    netlify deploy --prod --dir=dist
    
    Write-Host "✅ Деплой завершен!" -ForegroundColor Green
}

# Главное меню
Write-Host ""
Write-Host "Выберите платформу для деплоя:" -ForegroundColor Cyan
Write-Host "1) GitHub Pages (бесплатно, через Git)" -ForegroundColor White
Write-Host "2) Vercel (бесплатно, очень просто)" -ForegroundColor White
Write-Host "3) Netlify (бесплатно, с функциями)" -ForegroundColor White
Write-Host "4) Только сборка (без деплоя)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Введите номер (1-4)"

switch ($choice) {
    "1" {
        Deploy-GitHub
    }
    "2" {
        Deploy-Vercel
    }
    "3" {
        Deploy-Netlify
    }
    "4" {
        Write-Host "🔨 Сборка проекта..." -ForegroundColor Yellow
        npm run build
        Write-Host "✅ Сборка завершена! Файлы в папке dist/" -ForegroundColor Green
    }
    default {
        Write-Host "❌ Неверный выбор" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🎉 Готово! Ваше DnD приложение развернуто в интернете!" -ForegroundColor Green
