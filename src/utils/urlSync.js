// Синхронизация через URL параметры
// Позволяет делиться сессиями через ссылки

class URLSync {
  constructor() {
    this.storageKey = 'dnd-url-sessions'
    this.isEnabled = true
  }

  // Инициализация
  init() {
    if (!this.isEnabled) return

    // Проверяем URL параметры при загрузке
    this.checkURLParams()
  }

  // Проверка URL параметров
  checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search)
    const sessionData = urlParams.get('session')
    
    if (sessionData) {
      try {
        const session = JSON.parse(decodeURIComponent(sessionData))
        this.importSession(session)
      } catch (error) {
        console.error('Error parsing session from URL:', error)
      }
    }
  }

  // Импорт сессии из URL
  importSession(session) {
    try {
      const sessions = this.getSessions()
      const existingIndex = sessions.findIndex(s => s.id === session.id)
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = { ...session, updatedAt: new Date().toISOString() }
      } else {
        sessions.push({ ...session, updatedAt: new Date().toISOString() })
      }
      
      this.saveSessions(sessions)
      
      // Очищаем URL параметры
      const url = new URL(window.location)
      url.searchParams.delete('session')
      window.history.replaceState({}, '', url)
      
      return true
    } catch (error) {
      console.error('Error importing session:', error)
      return false
    }
  }

  // Экспорт сессии в URL
  exportSession(session) {
    try {
      const sessionData = encodeURIComponent(JSON.stringify(session))
      const url = new URL(window.location)
      url.searchParams.set('session', sessionData)
      
      // Копируем ссылку в буфер обмена
      navigator.clipboard.writeText(url.toString()).then(() => {
        console.log('Session link copied to clipboard')
      }).catch(() => {
        // Fallback - показываем ссылку
        prompt('Скопируйте эту ссылку для отправки сессии:', url.toString())
      })
      
      return url.toString()
    } catch (error) {
      console.error('Error exporting session:', error)
      return null
    }
  }

  // Получение сессий
  getSessions() {
    try {
      const sessions = localStorage.getItem(this.storageKey)
      return sessions ? JSON.parse(sessions) : []
    } catch (error) {
      console.error('Error loading URL sessions:', error)
      return []
    }
  }

  // Сохранение сессий
  saveSessions(sessions) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(sessions))
      return true
    } catch (error) {
      console.error('Error saving URL sessions:', error)
      return false
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

  // Получение статуса
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      sessionsCount: this.getSessions().length
    }
  }
}

// Создаем единственный экземпляр
const urlSync = new URLSync()

export default urlSync
