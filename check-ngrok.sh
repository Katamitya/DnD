#!/bin/bash

echo "🌍 Проверка и настройка ngrok для DnD приложения"
echo "=================================================="

# Проверяем, установлен ли ngrok
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok не установлен"
    echo "📥 Устанавливаем ngrok..."
    
    cd /workspace
    
    # Скачиваем ngrok v3
    echo "📥 Скачиваем ngrok v3..."
    wget -q https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
    
    if [ $? -eq 0 ]; then
        echo "✅ ngrok скачан успешно"
        
        # Распаковываем
        echo "📦 Распаковываем ngrok..."
        tar -xzf ngrok-v3-stable-linux-amd64.tgz
        
        # Делаем исполняемым
        chmod +x ngrok
        
        # Перемещаем в /usr/local/bin
        sudo mv ngrok /usr/local/bin/
        
        echo "✅ ngrok установлен в /usr/local/bin/"
    else
        echo "❌ Ошибка при скачивании ngrok"
        exit 1
    fi
else
    echo "✅ ngrok уже установлен"
    ngrok version
fi

# Проверяем версию
echo ""
echo "📋 Информация о ngrok:"
ngrok version

# Проверяем конфигурацию
echo ""
echo "🔧 Проверка конфигурации:"
if [ -f ~/.config/ngrok/ngrok.yml ]; then
    echo "✅ Конфигурационный файл найден"
    echo "📁 Расположение: ~/.config/ngrok/ngrok.yml"
else
    echo "⚠️ Конфигурационный файл не найден"
    echo "💡 Выполните: ngrok config add-authtoken YOUR_TOKEN"
fi

# Проверяем, работает ли DnD сервер
echo ""
echo "🔍 Проверка DnD сервера на порту 8082:"
if curl -s http://localhost:8082 > /dev/null; then
    echo "✅ DnD сервер работает на порту 8082"
else
    echo "❌ DnD сервер не отвечает на порту 8082"
    echo "💡 Убедитесь, что сервер запущен: cd DND && npm run dev"
fi

# Инструкции по запуску ngrok
echo ""
echo "🚀 Инструкции по запуску ngrok:"
echo "=================================="
echo "1. Откройте новый терминал"
echo "2. Выполните: ngrok http 8082"
echo "3. Скопируйте HTTPS URL (например: https://abc123.ngrok.io)"
echo "4. Поделитесь этим URL с внешними игроками"
echo ""
echo "🌐 Для тестирования откройте: http://localhost:8082/ngrok-test.html"
echo "🎮 Основное приложение: http://localhost:8082"

# Проверяем, запущен ли уже ngrok
echo ""
echo "🔍 Проверка запущенных процессов ngrok:"
if pgrep -f "ngrok http 8082" > /dev/null; then
    echo "✅ ngrok уже запущен для порта 8082"
    echo "📋 Активные туннели:"
    curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | cut -d'"' -f4
else
    echo "⏳ ngrok не запущен для порта 8082"
    echo "💡 Запустите: ngrok http 8082"
fi

echo ""
echo "✨ Настройка завершена!"


