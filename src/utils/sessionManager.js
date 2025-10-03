// Утилиты для управления сессиями D&D

// Структура сессии
const createDefaultSession = (name) => ({
  id: Date.now().toString(),
  name,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  maps: [
    {
      id: 1,
      name: 'Таверна "Драконья Голова"',
      description: 'Уютная таверна в центре города, где собираются искатели приключений',
      image: '/tavern.jpg',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Подземелье Гоблинов',
      description: 'Темные пещеры, населенные гоблинами и другими монстрами',
      image: '/dungeon.jpg',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  characters: [],
  monsters: [],
  diceLogs: [],
  settings: {
    gridSize: 15,
    cellSize: 40
  }
})

// Сохранение сессии в localStorage
export const saveSession = (session) => {
  try {
    const sessions = getSessions()
    const existingIndex = sessions.findIndex(s => s.id === session.id)
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = { ...session, updatedAt: new Date().toISOString() }
    } else {
      sessions.push({ ...session, updatedAt: new Date().toISOString() })
    }
    
    localStorage.setItem('dnd-sessions', JSON.stringify(sessions))
    return true
  } catch (error) {
    console.error('Ошибка сохранения сессии:', error)
    return false
  }
}

// Загрузка всех сессий
export const getSessions = () => {
  try {
    const sessions = localStorage.getItem('dnd-sessions')
    return sessions ? JSON.parse(sessions) : []
  } catch (error) {
    console.error('Ошибка загрузки сессий:', error)
    return []
  }
}

// Загрузка конкретной сессии
export const getSession = (sessionId) => {
  const sessions = getSessions()
  return sessions.find(s => s.id === sessionId) || null
}

// Удаление сессии
export const deleteSession = (sessionId) => {
  try {
    const sessions = getSessions()
    const filteredSessions = sessions.filter(s => s.id !== sessionId)
    localStorage.setItem('dnd-sessions', JSON.stringify(filteredSessions))
    return true
  } catch (error) {
    console.error('Ошибка удаления сессии:', error)
    return false
  }
}

// Создание новой сессии
export const createSession = (name) => {
  const newSession = createDefaultSession(name)
  if (saveSession(newSession)) {
    return newSession
  }
  return null
}

// Обновление сессии
export const updateSession = (sessionId, updates) => {
  const session = getSession(sessionId)
  if (!session) return false
  
  const updatedSession = { ...session, ...updates, updatedAt: new Date().toISOString() }
  return saveSession(updatedSession)
}

// Управление персонажами в сессии
export const addCharacterToSession = (sessionId, character) => {
  const session = getSession(sessionId)
  if (!session) return false
  
  // Проверяем, есть ли уже персонаж с таким ID
  const existingCharacterIndex = session.characters.findIndex(c => c.id === character.id)
  
  if (existingCharacterIndex !== -1) {
    // Обновляем существующего персонажа
    session.characters[existingCharacterIndex] = {
      ...session.characters[existingCharacterIndex],
      ...character,
      updatedAt: new Date().toISOString()
    }
  } else {
    // Добавляем нового персонажа
    const newCharacter = {
      ...character,
      createdAt: new Date().toISOString()
    }
    session.characters.push(newCharacter)
  }
  
  return saveSession(session)
}

export const updateCharacterInSession = (sessionId, characterId, updates) => {
  const session = getSession(sessionId)
  if (!session) return false
  
  const characterIndex = session.characters.findIndex(c => c.id === characterId)
  if (characterIndex === -1) return false
  
  session.characters[characterIndex] = { 
    ...session.characters[characterIndex], 
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  return saveSession(session)
}

export const removeCharacterFromSession = (sessionId, characterId) => {
  const session = getSession(sessionId)
  if (!session) return false
  
  session.characters = session.characters.filter(c => c.id !== characterId)
  return saveSession(session)
}

// Управление картами в сессии
export const addMapToSession = (sessionId, map) => {
  const session = getSession(sessionId)
  if (!session) return false
  
  const newMap = {
    ...map,
    id: Date.now(),
    createdAt: new Date().toISOString()
  }
  
  session.maps.push(newMap)
  return saveSession(session)
}

export const updateMapInSession = (sessionId, mapId, updates) => {
  const session = getSession(sessionId)
  if (!session) return false
  
  const mapIndex = session.maps.findIndex(m => m.id === mapId)
  if (mapIndex === -1) return false
  
  session.maps[mapIndex] = { 
    ...session.maps[mapIndex], 
    ...updates 
  }
  
  return saveSession(session)
}

export const removeMapFromSession = (sessionId, mapId) => {
  const session = getSession(sessionId)
  if (!session) return false
  
  session.maps = session.maps.filter(m => m.id !== mapId)
  return saveSession(session)
}

// Управление логами бросков в сессии
export const addDiceLogToSession = (sessionId, log) => {
  const session = getSession(sessionId)
  if (!session) return false
  
  const newLog = {
    ...log,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  }
  
  session.diceLogs.unshift(newLog)
  // Храним только последние 100 бросков
  session.diceLogs = session.diceLogs.slice(0, 100)
  
  return saveSession(session)
}

// Получение активных карт для сессии
export const getActiveMaps = (sessionId) => {
  const session = getSession(sessionId)
  if (!session) return []
  
  return session.maps.filter(map => map.isActive)
}

// Получение персонажей для сессии
export const getSessionCharacters = (sessionId) => {
  const session = getSession(sessionId)
  if (!session) return []
  
  return session.characters
}

// Управление монстрами в сессии
export const addMonsterToSession = (sessionId, monster) => {
  const session = getSession(sessionId)
  if (!session) return false
  
  const newMonster = {
    ...monster,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  }
  
  session.monsters.push(newMonster)
  return saveSession(session)
}

export const updateMonsterInSession = (sessionId, monsterId, updates) => {
  const session = getSession(sessionId)
  if (!session) return null
  
  const monsterIndex = session.monsters.findIndex(m => m.id === monsterId)
  if (monsterIndex === -1) return null
  
  session.monsters[monsterIndex] = { 
    ...session.monsters[monsterIndex], 
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  return saveSession(session)
}

export const removeMonsterFromSession = (sessionId, monsterId) => {
  const session = getSession(sessionId)
  if (!session) return false
  
  session.monsters = session.monsters.filter(m => m.id !== monsterId)
  return null
}

// Экспорт сессии в файл
export const exportSession = (sessionId) => {
  const session = getSession(sessionId)
  if (!session) return null
  
  const dataStr = JSON.stringify(session, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `dnd-session-${session.name}-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  return true
}

// Импорт сессии из файла
export const importSession = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const session = JSON.parse(e.target.result)
        
        // Проверяем структуру сессии
        if (!session.id || !session.name || !session.maps || !session.characters) {
          reject(new Error('Неверный формат файла сессии'))
          return
        }
        
        // Генерируем новый ID для импортированной сессии
        session.id = Date.now().toString()
        session.importedAt = new Date().toISOString()
        
        if (saveSession(session)) {
          resolve(session)
        } else {
          reject(new Error('Ошибка сохранения импортированной сессии'))
        }
      } catch (error) {
        reject(new Error('Ошибка парсинга файла: ' + error.message))
      }
    }
    
    reader.onerror = () => reject(new Error('Ошибка чтения файла'))
    reader.readAsText(file)
  })
}
