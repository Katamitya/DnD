// Синхронизация через GitHub API (простое решение)
// Использует GitHub Gist для хранения сессий

class GitHubSync {
  constructor() {
    this.gistId = 'dnd-sessions-sync' // ID Gist для хранения сессий
    this.githubToken = null
    this.isEnabled = false
  }

  // Инициализация с GitHub токеном
  async init(token) {
    this.githubToken = token
    this.isEnabled = !!token
    return this.isEnabled
  }

  // Сохранение сессий в GitHub Gist
  async saveSessions(sessions) {
    if (!this.isEnabled) return false

    try {
      const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${this.githubToken}`,
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

      return response.ok
    } catch (error) {
      console.error('GitHub sync error:', error)
      return false
    }
  }

  // Загрузка сессий из GitHub Gist
  async loadSessions() {
    if (!this.isEnabled) return []

    try {
      const response = await fetch(`https://api.github.com/gists/${this.gistId}`)
      if (!response.ok) return []

      const gist = await response.json()
      const sessionsData = gist.files['sessions.json']
      
      if (!sessionsData) return []

      return JSON.parse(sessionsData.content)
    } catch (error) {
      console.error('GitHub load error:', error)
      return []
    }
  }

  // Создание нового Gist
  async createGist() {
    if (!this.isEnabled) return false

    try {
      const response = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'DnD Game Sessions Sync',
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
        return true
      }

      return false
    } catch (error) {
      console.error('GitHub create error:', error)
      return false
    }
  }

  // Проверка доступности GitHub API
  async checkConnection() {
    if (!this.isEnabled) return false

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${this.githubToken}`
        }
      })
      return response.ok
    } catch (error) {
      return false
    }
  }
}

// Создаем единственный экземпляр
const githubSync = new GitHubSync()

export default githubSync
