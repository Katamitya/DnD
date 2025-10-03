import { io } from 'socket.io-client'

class SyncManager {
  constructor() {
    this.socket = null
    this.isConnected = false
    // Определяем URL сервера в зависимости от окружения
    this.serverUrl = this.getServerUrl()
    this.listeners = new Map()
  }

  // Определение URL сервера
  getServerUrl() {
    // В production (GitHub Pages) используем развернутый сервер
    if (process.env.NODE_ENV === 'production') {
      // Пока используем локальный сервер, позже заменим на развернутый
      return 'http://localhost:3001'
    }
    
    // В development используем локальный сервер
    return 'http://localhost:3001'
  }

  // Подключение к серверу
  connect() {
    if (this.socket) return Promise.resolve()

    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling']
      })

      this.socket.on('connect', () => {
        console.log('🟢 Connected to sync server')
        this.isConnected = true
        resolve()
      })

      this.socket.on('disconnect', () => {
        console.log('🔴 Disconnected from sync server')
        this.isConnected = false
      })

      this.socket.on('connect_error', (error) => {
        console.warn('⚠️ Sync server connection failed:', error.message)
        console.warn('🔄 Falling back to local storage mode')
        this.isConnected = false
        // Не отклоняем промис, чтобы приложение работало в офлайн режиме
        resolve()
      })

      // Обработчики событий синхронизации
      this.setupEventHandlers()
    })
  }

  // Настройка обработчиков событий
  setupEventHandlers() {
    this.socket.on('sessionCreated', (session) => {
      this.emit('sessionCreated', session)
    })

    this.socket.on('sessionUpdated', (session) => {
      this.emit('sessionUpdated', session)
    })

    this.socket.on('characterAdded', (data) => {
      this.emit('characterAdded', data)
    })

    this.socket.on('characterUpdated', (character) => {
      this.emit('characterUpdated', character)
    })
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

  // Присоединение к сессии
  joinSession(sessionId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinSession', sessionId)
    }
  }

  // Покидание сессии
  leaveSession(sessionId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leaveSession', sessionId)
    }
  }

  // API методы
  async getSessions() {
    try {
      const response = await fetch(`${this.serverUrl}/api/sessions`)
      if (!response.ok) throw new Error('Failed to fetch sessions')
      return await response.json()
    } catch (error) {
      console.error('Error fetching sessions:', error)
      return []
    }
  }

  async createSession(name, masterId) {
    try {
      const response = await fetch(`${this.serverUrl}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, masterId })
      })
      if (!response.ok) throw new Error('Failed to create session')
      return await response.json()
    } catch (error) {
      console.error('Error creating session:', error)
      return null
    }
  }

  async getSession(sessionId) {
    try {
      const response = await fetch(`${this.serverUrl}/api/sessions/${sessionId}`)
      if (!response.ok) throw new Error('Session not found')
      return await response.json()
    } catch (error) {
      console.error('Error fetching session:', error)
      return null
    }
  }

  async updateSession(sessionId, updates) {
    try {
      const response = await fetch(`${this.serverUrl}/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      if (!response.ok) throw new Error('Failed to update session')
      return await response.json()
    } catch (error) {
      console.error('Error updating session:', error)
      return null
    }
  }

  async addCharacter(sessionId, character) {
    try {
      const response = await fetch(`${this.serverUrl}/api/sessions/${sessionId}/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(character)
      })
      if (!response.ok) throw new Error('Failed to add character')
      return await response.json()
    } catch (error) {
      console.error('Error adding character:', error)
      return null
    }
  }

  async updateCharacter(characterId, updates) {
    try {
      const response = await fetch(`${this.serverUrl}/api/characters/${characterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      if (!response.ok) throw new Error('Failed to update character')
      return await response.json()
    } catch (error) {
      console.error('Error updating character:', error)
      return null
    }
  }

  // Отключение
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }
}

// Создаем единственный экземпляр
const syncManager = new SyncManager()

export default syncManager
