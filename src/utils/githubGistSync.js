// Синхронизация через GitHub Gist API
// Работает между всеми устройствами через GitHub

class GitHubGistSync {
  constructor() {
    this.gistId = 'dnd-sessions-sync' // ID Gist для хранения сессий
    this.githubToken = null
    this.isEnabled = false
    this.syncInterval = 10000 // 10 секунд
    this.listeners = new Map()
  }

  // Инициализация (без токена, используем публичный Gist)
  async init() {
    this.isEnabled = true
    
    // Периодическая синхронизация
    setInterval(() => {
      this.syncSessions()
    }, this.syncInterval)

    // Синхронизация при загрузке
    await this.syncSessions()
  }

  // Получение публичного Gist
  async getPublicGist() {
    try {
      const response = await fetch(`https://api.github.com/gists/${this.gistId}`)
      if (!response.ok) {
        // Если Gist не существует, создаем его
        return await this.createPublicGist()
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching public gist:', error)
      return null
    }
  }

  // Создание публичного Gist
  async createPublicGist() {
    try {
      const response = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'DnD Game Sessions Sync (Public)',
          public: true,
          files: {
            'sessions.json': {
              content: JSON.stringify([], null, 2)
            }
          }
        })
      })

      if (response.ok) {
        const gist = await response.json()
        this.gistId = gist.id
        return gist
      }
      return null
    } catch (error) {
      console.error('Error creating public gist:', error)
      return null
    }
  }

  // Загрузка сессий из Gist
  async loadSessions() {
    if (!this.isEnabled) return []

    try {
      const gist = await this.getPublicGist()
      if (!gist || !gist.files['sessions.json']) return []

      const sessionsData = gist.files['sessions.json']
      const sessions = JSON.parse(sessionsData.content)
      
      // Сохраняем локально для быстрого доступа
      localStorage.setItem('dnd-github-sessions', JSON.stringify(sessions))
      
      return sessions
    } catch (error) {
      console.error('Error loading sessions from GitHub:', error)
      // Fallback на локальное хранение
      const localSessions = localStorage.getItem('dnd-github-sessions')
      return localSessions ? JSON.parse(localSessions) : []
    }
  }

  // Сохранение сессий в Gist
  async saveSessions(sessions) {
    if (!this.isEnabled) return false

    try {
      // Сначала загружаем текущие данные
      const gist = await this.getPublicGist()
      if (!gist) return false

      const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: {
            'sessions.json': {
              content: JSON.stringify(sessions, null, 2)
            }
          }
        })
      })

      if (response.ok) {
        // Сохраняем локально
        localStorage.setItem('dnd-github-sessions', JSON.stringify(sessions))
        this.emit('sessionsUpdated', sessions)
        return true
      }
      return false
    } catch (error) {
      console.error('Error saving sessions to GitHub:', error)
      return false
    }
  }

  // Добавление сессии
  async addSession(session) {
    const sessions = await this.loadSessions()
    const existingIndex = sessions.findIndex(s => s.id === session.id)
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = { ...session, updatedAt: new Date().toISOString() }
    } else {
      sessions.push({ ...session, updatedAt: new Date().toISOString() })
    }
    
    return await this.saveSessions(sessions)
  }

  // Обновление сессии
  async updateSession(sessionId, updates) {
    const sessions = await this.loadSessions()
    const sessionIndex = sessions.findIndex(s => s.id === sessionId)
    
    if (sessionIndex >= 0) {
      sessions[sessionIndex] = { 
        ...sessions[sessionIndex], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      }
      return await this.saveSessions(sessions)
    }
    
    return false
  }

  // Удаление сессии
  async removeSession(sessionId) {
    const sessions = await this.loadSessions()
    const filteredSessions = sessions.filter(s => s.id !== sessionId)
    return await this.saveSessions(filteredSessions)
  }

  // Синхронизация сессий
  async syncSessions() {
    if (!this.isEnabled) return

    try {
      const sessions = await this.loadSessions()
      this.emit('sessionsUpdated', sessions)
    } catch (error) {
      console.error('Sync error:', error)
    }
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

  // Получение статуса
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      gistId: this.gistId,
      syncInterval: this.syncInterval
    }
  }
}

// Создаем единственный экземпляр
const githubGistSync = new GitHubGistSync()

export default githubGistSync
