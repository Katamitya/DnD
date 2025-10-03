// Real-time синхронизация для игровых действий
// Использует localStorage events для мгновенной синхронизации

class RealtimeSync {
  constructor() {
    this.storageKey = 'dnd-realtime-sync'
    this.listeners = new Map()
    this.isEnabled = true
    this.debounceTime = 100 // 100ms debounce для предотвращения спама
    this.debounceTimers = new Map()
  }

  // Инициализация real-time синхронизации
  init() {
    if (!this.isEnabled) return

    // Слушаем изменения localStorage от других вкладок
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        this.handleStorageChange(e.newValue)
      }
    })

    // Слушаем изменения в той же вкладке
    this.setupLocalListener()
  }

  // Настройка локального слушателя
  setupLocalListener() {
    const originalSetItem = localStorage.setItem
    const self = this

    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, arguments)
      if (key === self.storageKey) {
        self.handleStorageChange(value)
      }
    }
  }

  // Обработка изменений в хранилище
  handleStorageChange(newValue) {
    try {
      if (!newValue) return

      const data = JSON.parse(newValue)
      const { type, payload, timestamp, sessionId } = data

      // Игнорируем собственные изменения
      if (this.isOwnChange(timestamp)) return

      // Эмитим событие с задержкой для предотвращения спама
      this.debounceEmit(type, payload, sessionId)
    } catch (error) {
      console.error('Error handling storage change:', error)
    }
  }

  // Проверка, является ли изменение собственным
  isOwnChange(timestamp) {
    const now = Date.now()
    const timeDiff = Math.abs(now - timestamp)
    return timeDiff < 50 // Если меньше 50ms, считаем собственным
  }

  // Debounced emit для предотвращения спама
  debounceEmit(type, payload, sessionId) {
    const key = `${type}-${sessionId}`
    
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key))
    }

    const timer = setTimeout(() => {
      this.emit(type, payload, sessionId)
      this.debounceTimers.delete(key)
    }, this.debounceTime)

    this.debounceTimers.set(key, timer)
  }

  // Отправка события
  emit(type, payload, sessionId) {
    if (!this.listeners.has(type)) return

    this.listeners.get(type).forEach(callback => {
      try {
        callback(payload, sessionId)
      } catch (error) {
        console.error('Error in realtime callback:', error)
      }
    })
  }

  // Публикация события
  publish(type, payload, sessionId) {
    if (!this.isEnabled) return

    const data = {
      type,
      payload,
      sessionId,
      timestamp: Date.now(),
      source: 'realtime-sync'
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Error publishing realtime event:', error)
    }
  }

  // Подписка на события
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type).push(callback)
  }

  // Отписка от событий
  off(type, callback) {
    if (!this.listeners.has(type)) return
    const callbacks = this.listeners.get(type)
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }

  // Специфичные методы для игровых действий

  // Синхронизация перемещения фишки
  syncTokenMove(tokenId, newPosition, sessionId) {
    this.publish('tokenMove', {
      tokenId,
      position: newPosition
    }, sessionId)
  }

  // Синхронизация броска кубика
  syncDiceRoll(diceResult, playerId, sessionId) {
    this.publish('diceRoll', {
      result: diceResult,
      playerId,
      timestamp: Date.now()
    }, sessionId)
  }

  // Синхронизация добавления персонажа
  syncCharacterAdd(character, sessionId) {
    this.publish('characterAdd', character, sessionId)
  }

  // Синхронизация обновления персонажа
  syncCharacterUpdate(characterId, updates, sessionId) {
    this.publish('characterUpdate', {
      characterId,
      updates
    }, sessionId)
  }

  // Синхронизация изменения настроек сессии
  syncSessionUpdate(updates, sessionId) {
    this.publish('sessionUpdate', updates, sessionId)
  }

  // Синхронизация сообщений в чате
  syncChatMessage(message, playerId, sessionId) {
    this.publish('chatMessage', {
      message,
      playerId,
      timestamp: Date.now()
    }, sessionId)
  }

  // Получение статуса синхронизации
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      listenersCount: Array.from(this.listeners.values()).reduce((sum, arr) => sum + arr.length, 0),
      debounceTimersCount: this.debounceTimers.size
    }
  }

  // Очистка всех таймеров
  cleanup() {
    this.debounceTimers.forEach(timer => clearTimeout(timer))
    this.debounceTimers.clear()
  }
}

// Создаем единственный экземпляр
const realtimeSync = new RealtimeSync()

export default realtimeSync
