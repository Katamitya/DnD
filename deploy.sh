#!/bin/bash

# Скрипт для деплоя DnD приложения

echo "🎮 DnD Game Deploy Script"
echo "========================="

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден. Запустите скрипт из корня проекта."
    exit 1
fi

# Функция для GitHub Pages деплоя
deploy_github() {
    echo "📦 Подготовка к деплою на GitHub Pages..."
    
    # Сборка проекта
    echo "🔨 Сборка проекта..."
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "❌ Ошибка при сборке проекта"
        exit 1
    fi
    
    # Проверяем, что Git инициализирован
    if [ ! -d ".git" ]; then
        echo "🔧 Инициализация Git..."
        git init
    fi
    
    # Добавляем все файлы
    echo "📝 Добавление файлов в Git..."
    git add .
    
    # Коммит
    echo "💾 Создание коммита..."
    git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Проверяем remote
    if ! git remote get-url origin > /dev/null 2>&1; then
        echo "⚠️  Удаленный репозиторий не настроен."
        echo "Сначала выполните:"
        echo "git remote add origin https://github.com/YOUR_USERNAME/DND.git"
        exit 1
    fi
    
    # Push
    echo "🚀 Загрузка в GitHub..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Деплой завершен!"
        echo "🌐 Ваше приложение будет доступно через несколько минут по адресу:"
        echo "   https://YOUR_USERNAME.github.io/DND/"
    else
        echo "❌ Ошибка при загрузке в GitHub"
        exit 1
    fi
}

# Функция для Vercel деплоя
deploy_vercel() {
    echo "📦 Подготовка к деплою на Vercel..."
    
    # Проверяем, установлен ли Vercel CLI
    if ! command -v vercel &> /dev/null; then
        echo "📥 Установка Vercel CLI..."
        npm install -g vercel
    fi
    
    # Деплой
    echo "🚀 Деплой на Vercel..."
    vercel --prod
    
    echo "✅ Деплой завершен!"
}

# Функция для Netlify деплоя
deploy_netlify() {
    echo "📦 Подготовка к деплою на Netlify..."
    
    # Сборка
    echo "🔨 Сборка проекта..."
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "❌ Ошибка при сборке проекта"
        exit 1
    fi
    
    # Проверяем, установлен ли Netlify CLI
    if ! command -v netlify &> /dev/null; then
        echo "📥 Установка Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Деплой
    echo "🚀 Деплой на Netlify..."
    netlify deploy --prod --dir=dist
    
    echo "✅ Деплой завершен!"
}

# Главное меню
echo ""
echo "Выберите платформу для деплоя:"
echo "1) GitHub Pages (бесплатно, через Git)"
echo "2) Vercel (бесплатно, очень просто)"
echo "3) Netlify (бесплатно, с функциями)"
echo "4) Только сборка (без деплоя)"
echo ""

read -p "Введите номер (1-4): " choice

case $choice in
    1)
        deploy_github
        ;;
    2)
        deploy_vercel
        ;;
    3)
        deploy_netlify
        ;;
    4)
        echo "🔨 Сборка проекта..."
        npm run build
        echo "✅ Сборка завершена! Файлы в папке dist/"
        ;;
    *)
        echo "❌ Неверный выбор"
        exit 1
        ;;
esac

echo ""
echo "🎉 Готово! Ваше DnD приложение развернуто в интернете!"
