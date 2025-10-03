#!/bin/bash

echo "🚀 Starting DnD Sync Server..."

# Переходим в папку сервера
cd server

# Проверяем, установлены ли зависимости
if [ ! -d "node_modules" ]; then
    echo "📦 Installing server dependencies..."
    npm install
fi

# Запускаем сервер
echo "🌐 Starting server on port 3001..."
npm start
