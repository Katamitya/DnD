#!/bin/bash

# Скрипт управления серверами DnD Game

case "$1" in
  "start")
    echo "🚀 Запуск серверов DnD Game..."
    
    # Проверяем, не запущены ли уже серверы
    if ss -tlnp | grep -q ":8080"; then
      echo "⚠️  Dev сервер уже запущен на порту 8080"
    else
      echo "📱 Запуск dev сервера на порту 8080..."
      npm run dev > /dev/null 2>&1 &
      echo "✅ Dev сервер запущен"
    fi
    
    if ss -tlnp | grep -q ":9000"; then
      echo "⚠️  Prod сервер уже запущен на порту 9000"
    else
      echo "🌐 Запуск продакшен сервера на порту 9000..."
      npx serve -s dist -l 9000 > /dev/null 2>&1 &
      echo "✅ Prod сервер запущен"
    fi
    
    echo ""
    echo "🔗 Dev: http://localhost:8080"
    echo "🔗 Prod: http://localhost:9000"
    ;;
    
  "stop")
    echo "🛑 Остановка всех серверов..."
    
    # Останавливаем процессы по портам
    echo "Останавливаю dev сервер (порт 8080)..."
    if ss -tlnp | grep -q ":8080"; then
      # Находим PID процесса на порту 8080
      PID=$(ss -tlnp | grep ":8080" | awk '{print $7}' | cut -d',' -f1 | cut -d'=' -f2 | head -1)
      if [ ! -z "$PID" ]; then
        kill -9 $PID 2>/dev/null && echo "Dev сервер остановлен (PID: $PID)" || echo "Ошибка остановки dev сервера"
      else
        echo "Не удалось найти PID dev сервера"
      fi
    else
      echo "Dev сервер не запущен"
    fi
    
    echo "Останавливаю prod сервер (порт 9000)..."
    if ss -tlnp | grep -q ":9000"; then
      # Находим PID процесса на порту 9000
      PID=$(ss -tlnp | grep ":9000" | awk '{print $7}' | cut -d',' -f1 | cut -d'=' -f2 | head -1)
      if [ ! -z "$PID" ]; then
        kill -9 $PID 2>/dev/null && echo "Prod сервер остановлен (PID: $PID)" || echo "Ошибка остановки prod сервера"
      else
        echo "Не удалось найти PID prod сервера"
      fi
    else
      echo "Prod сервер не запущен"
    fi
    
    # Дополнительная очистка процессов
    echo "Очистка процессов..."
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "serve" 2>/dev/null || true
    
    echo "✅ Все серверы остановлены!"
    ;;
    
  "status")
    echo "📊 Статус серверов DnD Game:"
    echo ""
    
    # Проверка портов
    if ss -tlnp | grep -q ":8080"; then
      echo "✅ Dev сервер (8080): Работает"
    else
      echo "❌ Dev сервер (8080): Остановлен"
    fi
    
    if ss -tlnp | grep -q ":9000"; then
      echo "✅ Prod сервер (9000): Работает"
    else
      echo "❌ Prod сервер (9000): Остановлен"
    fi
    
    echo ""
    echo "🔍 Детальная информация:"
    ss -tlnp | grep -E "(8080|9000)"
    ;;
    
  "restart")
    echo "🔄 Перезапуск серверов..."
    echo "1/3: Останавливаю серверы..."
    $0 stop
    echo "2/3: Жду завершения процессов..."
    sleep 5
    echo "3/3: Запускаю серверы..."
    $0 start
    ;;
    
  "clean")
    echo "🧹 Очистка портов и процессов..."
    
    echo "Проверяю занятые порты..."
    if ss -tlnp | grep -q ":8080"; then
      echo "⚠️  Порт 8080 занят"
      ss -tlnp | grep ":8080"
    else
      echo "✅ Порт 8080 свободен"
    fi
    
    if ss -tlnp | grep -q ":9000"; then
      echo "⚠️  Порт 9000 занят"
      ss -tlnp | grep ":9000"
    else
      echo "✅ Порт 9000 свободен"
    fi
    
    echo ""
    echo "Очистка завершена!"
    ;;
    
  "force-stop")
    echo "💥 Принудительная остановка всех серверов..."
    
    # Принудительно освобождаем порты
    echo "Освобождаю порт 8080..."
    if ss -tlnp | grep -q ":8080"; then
      PID=$(ss -tlnp | grep ":8080" | awk '{print $7}' | cut -d',' -f1 | cut -d'=' -f2 | head -1)
      if [ ! -z "$PID" ]; then
        kill -9 $PID 2>/dev/null && echo "Порт 8080 освобожден (PID: $PID)" || echo "Ошибка освобождения порта 8080"
      fi
    else
      echo "Порт 8080 свободен"
    fi
    
    echo "Освобождаю порт 9000..."
    if ss -tlnp | grep -q ":9000"; then
      PID=$(ss -tlnp | grep ":9000" | awk '{print $7}' | cut -d',' -f1 | cut -d'=' -f2 | head -1)
      if [ ! -z "$PID" ]; then
        kill -9 $PID 2>/dev/null && echo "Порт 9000 освобожден (PID: $PID)" || echo "Ошибка освобождения порта 9000"
      fi
    else
      echo "Порт 9000 свободен"
    fi
    
    # Очищаем все связанные процессы
    echo "Очистка процессов..."
    pkill -f "npm" 2>/dev/null || true
    pkill -f "serve" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    
    echo "✅ Все серверы принудительно остановлены!"
    ;;
    
  "logs")
    echo "📝 Логи серверов:"
    echo "Нажмите Ctrl+C для выхода"
    tail -f /var/log/syslog | grep -E "(npm|serve|vite)" 2>/dev/null || echo "Логи недоступны"
    ;;
    
  *)
    echo "🎮 DnD Game - Управление серверами"
    echo ""
    echo "Использование: $0 {start|stop|status|restart|clean|force-stop|logs}"
    echo ""
    echo "Команды:"
    echo "  start      - Запустить все серверы"
    echo "  stop       - Остановить все серверы"
    echo "  status     - Показать статус серверов"
    echo "  restart    - Перезапустить серверы"
    echo "  clean      - Проверить и очистить порты"
    echo "  force-stop - Принудительно остановить все серверы"
    echo "  logs       - Показать логи"
    echo ""
    echo "📱 Dev сервер: http://localhost:8080"
    echo "🌐 Prod сервер: http://localhost:9000"
    ;;
esac

