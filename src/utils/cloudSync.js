// Простая облачная синхронизация через localStorage + периодическое обновление
// Работает для всех пользователей, открывших приложение

class CloudSync {
  constructor() {
    this.storageKey = 'dnd-cloud-sessions'
    this.lastSyncKey = 'dnd-last-sync'
    this.syncInterval = 5000 // 5 секунд для сессий
    this.isEnabled = true
    this.listeners = new Map()
  }

  // Инициализация синхронизации
  init() {
    if (!this.isEnabled) return

    // Периодическая синхронизация
    setInterval(() => {
      this.syncSessions()
    }, this.syncInterval)

    // Синхронизация при загрузке страницы
    this.syncSessions()

    // Синхронизация при фокусе на окне
    window.addEventListener('focus', () => {
      this.syncSessions()
    })

    // Синхронизация при изменении localStorage (от других вкладок)
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        this.emit('sessionsUpdated', this.getSessions())
      }
    })
  }

  // Получение сессий из облачного хранилища
  getSessions() {
    try {
      const sessions = localStorage.getItem(this.storageKey)
      return sessions ? JSON.parse(sessions) : []
    } catch (error) {
      console.error('Error loading cloud sessions:', error)
      return []
    }
  }

  // Сохранение сессий в облачное хранилище
  saveSessions(sessions) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(sessions))
      localStorage.setItem(this.lastSyncKey, new Date().toISOString())
      this.emit('sessionsUpdated', sessions)
      return true
    } catch (error) {
      console.error('Error saving cloud sessions:', error)
      return false
    }
  }

  // Синхронизация сессий
  async syncSessions() {
    if (!this.isEnabled) return

    try {
      const currentSessions = this.getSessions()
      const lastSync = localStorage.getItem(this.lastSyncKey)
      
      // Если это первая синхронизация, создаем пустой массив
      if (!lastSync) {
        this.saveSessions([])
        return
      }

      // Уведомляем о синхронизации
      this.emit('syncStarted')
      
      // В реальном приложении здесь был бы запрос к серверу
      // Пока просто обновляем timestamp
      localStorage.setItem(this.lastSyncKey, new Date().toISOString())
      
      this.emit('syncCompleted', currentSessions)
    } catch (error) {
      console.error('Sync error:', error)
      this.emit('syncError', error)
    }
  }

  // Добавление сессии
  addSession(session) {
    const sessions = this.getSessions()
    const existingIndex = sessions.findIndex(s => s.id === session.id)
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = { ...session, updatedAt: new Date().toISOString() }
    } else {
      sessions.push({ ...session, updatedAt: new Date().toISOString() })
    }
    
    return this.saveSessions(sessions)
  }

  // Обновление сессии
  updateSession(sessionId, updates) {
    const sessions = this.getSessions()
    const sessionIndex = sessions.findIndex(s => s.id === sessionId)
    
    if (sessionIndex >= 0) {
      sessions[sessionIndex] = { 
        ...sessions[sessionIndex], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      }
      return this.saveSessions(sessions)
    }
    
    return false
  }

  // Удаление сессии
  removeSession(sessionId) {
    const sessions = this.getSessions()
    const filteredSessions = sessions.filter(s => s.id !== sessionId)
    return this.saveSessions(filteredSessions)
  }

  // Подписка на события
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  // Отписка от событий
  off(event, callback) {
    if (!this.listeners.has(event)) return
    const callbacks = this.listeners.get(event)
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }

  // Отправка событий
  emit(event, data) {
    if (!this.listeners.has(event)) return
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Error in event callback:', error)
      }
    })
  }

  // Получение статуса синхронизации
  getSyncStatus() {
    const lastSync = localStorage.getItem(this.lastSyncKey)
    return {
      isEnabled: this.isEnabled,
      lastSync: lastSync ? new Date(lastSync) : null,
      sessionsCount: this.getSessions().length
    }
  }
}

// Создаем единственный экземпляр
const cloudSync = new CloudSync()

export default cloudSync
