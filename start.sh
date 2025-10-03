#!/bin/bash

echo "🚀 Запуск DnD Game Application..."
echo "📦 Установка зависимостей..."
npm install

echo "🔨 Сборка приложения..."
npm run build

echo "🌐 Запуск сервера..."
echo "Приложение будет доступно по адресу: http://localhost:3000"
echo "Нажмите Ctrl+C для остановки"

npx serve -s dist -l 9000

