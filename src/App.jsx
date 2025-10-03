import React, { useState } from 'react'
import LoginScreen from './components/LoginScreen'
import GameBoard from './components/GameBoard'
import SessionSelector from './components/SessionSelector'
import { addCharacterToSession } from './utils/sessionManager'
import './App.css'

function App() {
  const [currentPlayer, setCurrentPlayer] = useState(null)
  const [players, setPlayers] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [showSessionSelector, setShowSessionSelector] = useState(false)

  const handleLogin = (nickname, isMaster = false, session = null, existingCharacter = null) => {
    console.log('=== HANDLE LOGIN START ===')
    console.log('Parameters:', { nickname, isMaster, session, existingCharacter })
    
    try {
    if (isMaster) {
      // Создаем мастера игры
      const master = {
        id: Date.now(),
        nickname,
        isMaster: true,
        color: '#8B5CF6', // Фиолетовый цвет для мастера
        position: { x: 0, y: 0 }
      }
      
      setCurrentPlayer(master)
      setCurrentSession(session)
      
      // Мастер не имеет фишки, поэтому players остается пустым
      setPlayers([])
    } else if (existingCharacter) {
      // Вход за существующего персонажа
      const player = {
        id: existingCharacter.id,
        nickname: existingCharacter.nickname,
        name: existingCharacter.name,
        isMaster: false,
        position: { x: 0, y: 0 },
        color: getRandomPlayerColor(),
        avatar: existingCharacter.avatar,
        class: existingCharacter.class,
        level: existingCharacter.level,
        race: existingCharacter.race
      }
      
      setCurrentPlayer(player)
      setCurrentSession(session)
      
      // Создаем только текущего игрока
      const allPlayers = [
        { ...player, position: { x: 0, y: 0 } }
      ]
      
      setPlayers(allPlayers)
    } else if (existingCharacter && !isMaster) {
      // Создание нового персонажа через модал
      const newPlayer = {
        id: existingCharacter.id,
        nickname: existingCharacter.nickname,
        name: existingCharacter.name,
        isMaster: false,
        position: { x: 0, y: 0 },
        color: existingCharacter.color || getRandomPlayerColor(),
        avatar: existingCharacter.avatar,
        class: existingCharacter.class,
        level: existingCharacter.level,
        race: existingCharacter.race,
        description: existingCharacter.description,
        gridX: existingCharacter.gridX || Math.floor(15 / 2),
        gridY: existingCharacter.gridY || Math.floor(15 / 2)
      }
      
      setCurrentPlayer(newPlayer)
      setCurrentSession(session)
      
      // Создаем только текущего игрока
      const allPlayers = [
        { ...newPlayer, position: { x: 0, y: 0 } }
      ]
      
      setPlayers(allPlayers)
    } else {
      // Создание простого персонажа (fallback)
      const newPlayer = {
        id: Date.now(),
        nickname,
        isMaster: false,
        position: { x: 0, y: 0 },
        color: getRandomPlayerColor(),
        name: nickname, // Добавляем имя
        class: '', // Пустые поля для заполнения позже
        level: 1,
        race: '',
        description: '',
        avatar: null
      }
      
      setCurrentPlayer(newPlayer)
      setCurrentSession(session)
      
      // Добавляем персонажа в сессию
      if (session) {
        addCharacterToSession(session.id, newPlayer)
      }
      
      // Создаем только текущего игрока
      const allPlayers = [
        { ...newPlayer, position: { x: 0, y: 0 } }
      ]
      
      setPlayers(allPlayers)
    }
    
    console.log('=== HANDLE LOGIN SUCCESS ===')
    console.log('Current player set:', { currentPlayer: nickname, isMaster, session: session?.name })
    
    } catch (error) {
      console.error('=== HANDLE LOGIN ERROR ===')
      console.error('Error details:', error)
      console.error('Error stack:', error.stack)
    }
  }

  const getRandomPlayerColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const handleLogout = () => {
    setCurrentPlayer(null)
    setPlayers([])
    setCurrentSession(null)
  }

  console.log('=== APP RENDER ===')
  console.log('State:', { currentPlayer: !!currentPlayer, showSessionSelector, currentSession: !!currentSession })
  
  return (
    <div className="App h-screen w-screen">
      {!currentPlayer ? (
        showSessionSelector ? (
          <SessionSelector 
            onSessionSelect={(session) => {
              setCurrentSession(session)
              setShowSessionSelector(false)
            }}
            onClose={() => setShowSessionSelector(false)}
          />
        ) : currentSession ? (
          <LoginScreen 
            onLogin={handleLogin}
            currentSession={currentSession}
            onBackToSessions={() => {
              setCurrentSession(null)
              setShowSessionSelector(true)
            }}
          />
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
            <div className="max-w-md w-full space-y-8 p-8">
              <div className="text-center">
                <div className="mx-auto h-24 w-24 bg-gradient-to-r from-dnd-gold to-dnd-red rounded-full flex items-center justify-center mb-6">
                  <span className="text-4xl font-fantasy text-white">⚔️</span>
                </div>
                <h2 className="text-4xl font-fantasy text-dnd-gold mb-2">
                  DnD 5e
                </h2>
                <p className="text-xl text-gray-300 font-medieval">
                  Добро пожаловать в мир приключений
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => setShowSessionSelector(true)}
                  className="btn-primary w-full text-lg py-3"
                >
                  🎮 Начать игру
                </button>
                
                <div className="text-center text-sm text-gray-400">
                  <p>Выберите сессию или создайте новую</p>
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        <GameBoard 
          currentPlayer={currentPlayer}
          players={players}
          onLogout={handleLogout}
          currentSession={currentSession}
        />
      )}
    </div>
  )
}

export default App

