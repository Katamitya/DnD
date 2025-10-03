#!/bin/bash

# Скрипт управления Docker-контейнерами DnD Game

case "$1" in
  "start")
    echo "🚀 Запуск Docker-контейнеров DnD Game..."
    
    # Проверяем, не запущены ли уже контейнеры
    if docker ps | grep -q "dnd-game"; then
      echo "⚠️  Контейнеры уже запущены"
      docker ps | grep "dnd-game"
    else
      echo "📦 Собираем и запускаем контейнеры..."
      docker-compose up --build -d
      echo "✅ Контейнеры запущены!"
    fi
    
    echo ""
    echo "🔗 Dev: http://localhost:8080"
    echo "🔗 Prod: http://localhost:9000"
    ;;
    
  "stop")
    echo "🛑 Остановка Docker-контейнеров..."
    docker-compose down
    echo "✅ Контейнеры остановлены!"
    ;;
    
  "restart")
    echo "🔄 Перезапуск Docker-контейнеров..."
    echo "1/3: Останавливаю контейнеры..."
    docker-compose down
    echo "2/3: Жду завершения..."
    sleep 3
    echo "3/3: Запускаю контейнеры..."
    docker-compose up --build -d
    echo "✅ Контейнеры перезапущены!"
    ;;
    
  "status")
    echo "📊 Статус Docker-контейнеров DnD Game:"
    echo ""
    
    # Проверка контейнеров
    if docker ps | grep -q "dnd-game"; then
      echo "✅ Контейнеры работают:"
      docker ps | grep "dnd-game"
    else
      echo "❌ Контейнеры не запущены"
    fi
    
    echo ""
    echo "🔍 Проверка портов:"
    if ss -tlnp | grep -q ":8080"; then
      echo "✅ Порт 8080 (Dev): Открыт"
    else
      echo "❌ Порт 8080 (Dev): Закрыт"
    fi
    
    if ss -tlnp | grep -q ":9000"; then
      echo "✅ Порт 9000 (Prod): Открыт"
    else
      echo "❌ Порт 9000 (Prod): Закрыт"
    fi
    ;;
    
  "logs")
    echo "📝 Логи Docker-контейнеров:"
    echo "Нажмите Ctrl+C для выхода"
    docker-compose logs -f
    ;;
    
  "logs-dev")
    echo "📝 Логи Dev контейнера:"
    echo "Нажмите Ctrl+C для выхода"
    docker-compose logs -f dnd-game-dev
    ;;
    
  "logs-prod")
    echo "📝 Логи Prod контейнера:"
    echo "Нажмите Ctrl+C для выхода"
    docker-compose logs -f dnd-game-prod
    ;;
    
  "build")
    echo "🔨 Пересборка Docker-образов..."
    docker-compose build --no-cache
    echo "✅ Образы пересобраны!"
    ;;
    
  "clean")
    echo "🧹 Очистка Docker-ресурсов..."
    echo "Останавливаю контейнеры..."
    docker-compose down
    echo "Удаляю образы..."
    docker rmi dnd-dnd-game-dev dnd-dnd-game-prod 2>/dev/null || echo "Образы не найдены"
    echo "Очищаю неиспользуемые ресурсы..."
    docker system prune -f
    echo "✅ Очистка завершена!"
    ;;
    
  *)
    echo "🐳 DnD Game - Управление Docker-контейнерами"
    echo ""
    echo "Использование: $0 {start|stop|restart|status|logs|logs-dev|logs-prod|build|clean}"
    echo ""
    echo "Команды:"
    echo "  start      - Запустить все контейнеры"
    echo "  stop       - Остановить все контейнеры"
    echo "  restart    - Перезапустить контейнеры"
    echo "  status     - Показать статус контейнеров"
    echo "  logs       - Показать логи всех контейнеров"
    echo "  logs-dev   - Показать логи dev контейнера"
    echo "  logs-prod  - Показать логи prod контейнера"
    echo "  build      - Пересобрать образы"
    echo "  clean      - Очистить все Docker ресурсы"
    echo ""
    echo "📱 Dev сервер: http://localhost:8080"
    echo "🌐 Prod сервер: http://localhost:9000"
    ;;
esac

