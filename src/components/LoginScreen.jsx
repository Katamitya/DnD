import React, { useState, useEffect } from 'react'
import { getSessions, addCharacterToSession, getSession } from '../utils/sessionManager'
import CharacterCreationModal from './CharacterCreationModal'

const LoginScreen = ({ onLogin, currentSession, onBackToSessions }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [loginMode, setLoginMode] = useState('new') // 'new' или 'existing'
  const [isCharacterCreationOpen, setIsCharacterCreationOpen] = useState(false)

  useEffect(() => {
    console.log('=== LOGINSCREEN USEEFFECT ===')
    console.log('currentSession:', currentSession)
    
    if (currentSession) {
      // Если сессия уже выбрана, используем её
      console.log('Using currentSession:', currentSession.name)
      setSelectedSession(currentSession)
      setSessions([currentSession])
    } else {
      // Иначе загружаем все сессии
      const existingSessions = getSessions()
      console.log('Loaded sessions:', existingSessions.length)
      setSessions(existingSessions)
    }
  }, [currentSession])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (loginMode === 'existing' && selectedCharacter) {
      // Вход за существующего персонажа
      setIsSubmitting(true)
      setTimeout(() => {
        onLogin(selectedCharacter.nickname, false, selectedSession, selectedCharacter)
        setIsSubmitting(false)
      }, 500)
    }
  }

    const handleCharacterCreate = (character) => {
    console.log('=== HANDLE CHARACTER CREATE START ===')
    console.log('Character data:', character)
    
    try {
      // Простые проверки
      if (!character || !character.name) {
        console.error('Invalid character data')
        return
      }
      
      console.log('Character validation passed')
      
      // Получаем сессию
      const session = currentSession || selectedSession
      console.log('Session found:', session)
      
      if (!session || !session.id) {
        console.error('No valid session found')
        return
      }
      
      console.log('Adding character to session...')
      
      // Добавляем персонажа в сессию
      const success = addCharacterToSession(session.id, character)
      console.log('Add character result:', success)
      
      if (!success) {
        console.error('Failed to add character to session')
        return
      }
      
      console.log('Character added to session successfully')
      
      // Обновляем сессию
      const updatedSession = getSession(session.id)
      if (updatedSession) {
        console.log('Session updated successfully')
        console.log('Updated session:', updatedSession)
        console.log('Characters in updated session:', updatedSession.characters)
        console.log('Characters length:', updatedSession.characters.length)
        
        // Обновляем состояние сессии
        // currentSession - это пропс, мы не можем его изменять
        // Просто обновляем selectedSession
        setSelectedSession(updatedSession)
        console.log('selectedSession state updated')
        
        // Обновляем список сессий
        setSessions(prevSessions => {
          console.log('Previous sessions:', prevSessions)
          const index = prevSessions.findIndex(s => s.id === updatedSession.id)
          console.log('Session index in list:', index)
          
          if (index !== -1) {
            const newSessions = [...prevSessions]
            newSessions[index] = updatedSession
            console.log('Updated existing session in list')
            return newSessions
          } else {
            // Если сессии нет в списке, добавляем её
            console.log('Added new session to list')
            return [...prevSessions, updatedSession]
          }
        })
        
        console.log('Sessions state updated')
      } else {
        console.error('Failed to get updated session')
      }
      
      // Переключаемся в режим существующего персонажа
      setLoginMode('existing')
      setSelectedCharacter(character)
      
      console.log('Switched to existing character mode')
      console.log('Selected character:', character)
      
      // НЕ входим в игру сразу - даем пользователю выбрать персонажа
      console.log('Character created successfully, ready for selection')
      
      // Закрываем модал создания персонажа
      setIsCharacterCreationOpen(false)
      
      console.log('=== HANDLE CHARACTER CREATE SUCCESS ===')
      
    } catch (error) {
      console.error('=== HANDLE CHARACTER CREATE ERROR ===')
      console.error('Error details:', error)
      console.error('Error stack:', error.stack)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center relative">
          {/* Кнопка возврата к сессиям */}
          {onBackToSessions && (
            <button
              onClick={onBackToSessions}
              className="absolute left-0 top-0 text-dnd-gold hover:text-white transition-colors"
              title="Вернуться к выбору сессии"
            >
              ← Назад к сессиям
            </button>
          )}
          
          <div className="mx-auto h-24 w-24 bg-gradient-to-r from-dnd-gold to-dnd-red rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl font-fantasy text-white">⚔️</span>
          </div>
          <h2 className="text-4xl font-fantasy text-dnd-gold mb-2">
            DnD 5e
          </h2>
          <p className="text-xl text-gray-300 font-medieval">
            Войди в мир приключений
          </p>
          {currentSession && (
            <p className="text-sm text-dnd-gold mt-2">
              Сессия: {currentSession.name}
            </p>
          )}
        </div>
        
        {/* Переключатель режимов входа */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            type="button"
            onClick={() => setLoginMode('new')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              loginMode === 'new'
                ? 'bg-dnd-gold text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ➕ Новый персонаж
          </button>
          <button
            type="button"
            onClick={() => setLoginMode('existing')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              loginMode === 'existing'
                ? 'bg-dnd-gold text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            👤 Существующий персонаж
          </button>
        </div>
        
        {/* Кнопка входа мастера */}
        <div className="text-center mb-6">
          <button
            type="button"
            onClick={() => {
              if (sessions.length > 0) {
                // Если есть сессии, выбираем первую и входим как мастер
                const firstSession = sessions[0]
                console.log('=== MASTER QUICK LOGIN ===')
                console.log('Quick master login for session:', firstSession.name)
                
                setIsSubmitting(true)
                setTimeout(() => {
                  onLogin('Мастер игры', true, firstSession, null)
                  setIsSubmitting(false)
                }, 500)
              } else {
                // Если сессий нет, показываем сообщение
                alert('Сначала создайте сессию!')
              }
            }}
            disabled={sessions.length === 0 || isSubmitting}
            className="bg-dnd-purple text-white px-6 py-3 rounded-lg font-medium transition-colors hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-dnd-gold"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Вход...
              </span>
            ) : (
              '🧙‍♂️ Войти как мастер'
            )}
          </button>
          <p className="text-sm text-dnd-gold mt-2">
            Мастер игры может управлять картами, монстрами и персонажами
          </p>
        </div>



        <div className="mt-8 space-y-6">
          {loginMode === 'new' ? (
            <>
              {/* Выбор сессии для нового персонажа */}
              {!currentSession && sessions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Выберите сессию:
                  </label>
                  <select
                    value={selectedSession?.id || ''}
                    onChange={(e) => {
                      const session = sessions.find(s => s.id === e.target.value)
                      setSelectedSession(session)
                    }}
                    className="input-field w-full text-lg text-center"
                    required
                  >
                    <option value="">Выберите сессию...</option>
                    {sessions.map(session => (
                      <option key={session.id} value={session.id}>
                        {session.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Кнопка создания персонажа */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsCharacterCreationOpen(true)}
                  disabled={!currentSession && !selectedSession}
                  className="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🎭 Создать персонажа
                </button>
                {!currentSession && !selectedSession && (
                  <p className="text-sm text-gray-400 mt-2">
                    Сначала выберите сессию для создания персонажа
                  </p>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Выбор сессии для существующего персонажа */}
              {!currentSession && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Выберите сессию:
                  </label>
                  <select
                    value={selectedSession?.id || ''}
                    onChange={(e) => {
                      const session = sessions.find(s => s.id === e.target.value)
                      setSelectedSession(session)
                      setSelectedCharacter(null)
                    }}
                    className="input-field w-full text-lg text-center"
                    required
                  >
                    <option value="">Выберите сессию...</option>
                    {sessions.map(session => (
                      <option key={session.id} value={session.id}>
                        {session.name} ({session.characters.length} персонажей)
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Выбор персонажа */}
              {(currentSession || selectedSession) && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Выберите персонажа:
                  </label>
                  {(() => {
                    const session = currentSession || selectedSession
                    console.log('=== DROPDOWN RENDER ===')
                    console.log('Session for dropdown:', session)
                    console.log('Characters in session:', session.characters)
                    console.log('Characters length:', session.characters.length)
                    
                    return (
                      <select
                        value={selectedCharacter?.id || ''}
                        onChange={(e) => {
                          const character = session.characters.find(c => c.id === e.target.value)
                          console.log('Character selected:', character)
                          setSelectedCharacter(character)
                        }}
                        className="input-field w-full text-lg text-center"
                        required
                      >
                        <option value="">Выберите персонажа... ({session.characters.length} доступно)</option>
                        {session.characters.map(character => (
                          <option key={character.id} value={character.id}>
                            {character.name} ({character.nickname})
                          </option>
                        ))}
                      </select>
                    )
                  })()}
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={!selectedCharacter || isSubmitting}
                  className="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Вход...
                    </span>
                  ) : (
                    'Войти за персонажа'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
        
        <div className="text-center text-sm text-gray-400">
          {loginMode === 'new' ? (
            <p>Создайте нового персонажа и присоединитесь к партии</p>
          ) : (
            <p>Выберите существующего персонажа для входа в игру</p>
          )}
        </div>
      </div>

      {/* Модал создания персонажа */}
      <CharacterCreationModal
        isOpen={isCharacterCreationOpen}
        onClose={() => {
          console.log('Closing character creation modal')
          setIsCharacterCreationOpen(false)
        }}
        onCharacterCreate={(character) => {
          console.log('=== CHARACTER CREATION CALLBACK ===')
          console.log('Character received:', character)
          console.log('Callback type:', typeof handleCharacterCreate)
          
          try {
            console.log('Calling handleCharacterCreate...')
            handleCharacterCreate(character)
            console.log('handleCharacterCreate completed successfully')
          } catch (error) {
            console.error('=== CHARACTER CREATION CALLBACK ERROR ===')
            console.error('Error details:', error)
            console.error('Error stack:', error.stack)
            setIsSubmitting(false)
          }
        }}
        currentSession={currentSession || selectedSession}
      />
    </div>
  )
}

export default LoginScreen




