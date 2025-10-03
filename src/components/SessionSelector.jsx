import React, { useState, useEffect } from 'react'
import { getSessions, createSession } from '../utils/sessionManager'

const SessionSelector = ({ onSessionSelect, onClose }) => {
  const [sessions, setSessions] = useState([])
  const [newSessionName, setNewSessionName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = () => {
    const existingSessions = getSessions()
    setSessions(existingSessions)
  }

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      setIsCreating(true)
      
      setTimeout(() => {
        const newSession = createSession(newSessionName.trim())
        if (newSession) {
          setSessions(prev => [...prev, newSession])
          setNewSessionName('')
          setIsCreating(false)
          
          // Автоматически выбираем новую сессию
          onSessionSelect(newSession)
        }
      }, 500)
    }
  }

  const handleSelectSession = (session) => {
    setSelectedSession(session)
    // Не вызываем onSessionSelect сразу, а показываем кнопку для входа
  }

  const handleEnterSession = (session) => {
    onSessionSelect(session)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!onClose) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-fantasy text-dnd-gold">🎭 Выбор сессии</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Создание новой сессии */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-dnd-gold mb-3">
              ➕ Создать новую сессию
            </h4>
            
            <div className="flex space-x-3">
              <input
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="Название сессии..."
                className="input-field flex-1"
                maxLength={50}
              />
              <button
                onClick={handleCreateSession}
                disabled={!newSessionName.trim() || isCreating}
                className="btn-primary disabled:opacity-50"
              >
                {isCreating ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </div>

          {/* Существующие сессии */}
          <div>
            <h4 className="text-lg font-semibold text-dnd-gold mb-3">
              📚 Существующие сессии ({sessions.length})
            </h4>
            
            {sessions.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-2">📚</div>
                <p>Нет сохраненных сессий</p>
                <p className="text-sm">Создайте первую сессию выше</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sessions.map(session => (
                  <div
                    key={session.id}
                    className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-600 ${
                      selectedSession?.id === session.id ? 'ring-2 ring-dnd-gold' : ''
                    }`}
                    onClick={() => handleSelectSession(session)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-white text-lg">{session.name}</h5>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-dnd-blue text-white px-2 py-1 rounded">
                          {session.maps.filter(m => m.isActive).length} карт
                        </span>
                        <span className="text-xs bg-dnd-green text-white px-2 py-1 rounded">
                          {session.characters.length} персонажей
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-300 mb-3">
                      <p>Создана: {formatDate(session.createdAt)}</p>
                      <p>Обновлена: {formatDate(session.updatedAt)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">
                        <span>ID: {session.id.slice(-8)}</span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEnterSession(session)
                        }}
                        className="btn-primary text-sm px-3 py-1"
                      >
                        🎮 Войти в сессию
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Информация */}
          <div className="border-t border-gray-600 pt-4">
            <div className="text-xs text-gray-400 space-y-1">
              <p>• <strong>Сессии</strong> содержат все данные: карты, персонажей, настройки</p>
              <p>• <strong>Персонажи</strong> привязаны к конкретной сессии</p>
              <p>• <strong>Карты</strong> можно активировать/деактивировать для игроков</p>
              <p>• <strong>Данные</strong> сохраняются локально в браузере</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionSelector
