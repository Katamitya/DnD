import React, { useEffect, useRef, useState } from 'react'
import * as PIXI from 'pixi.js'
import PlayerList from './PlayerList'
import GameControls from './GameControls'
import DiceRoller from './DiceRoller'
import DiceLog from './DiceLog'
import Notification from './Notification'
import MapManager from './MapManager'
import CharacterManager from './CharacterManager'
import MonsterManager from './MonsterManager'
import SyncStatus from './SyncStatus'
import { 
  updateSession, 
  addDiceLogToSession, 
  addCharacterToSession,
  updateCharacterInSession,
  removeCharacterFromSession
} from '../utils/sessionManager'

const GameBoard = ({ currentPlayer, players, onLogout, currentSession }) => {
  const canvasRef = useRef(null)
  const appRef = useRef(null)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [gridSize, setGridSize] = useState(15) // Размер сетки
  const [cellSize, setCellSize] = useState(40) // Размер ячейки
  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState(false)
  const [isDiceLogOpen, setIsDiceLogOpen] = useState(false)
  const [diceLogs, setDiceLogs] = useState([])
  const [notification, setNotification] = useState(null)
  const [isMapManagerOpen, setIsMapManagerOpen] = useState(false)
  const [isCharacterManagerOpen, setIsCharacterManagerOpen] = useState(false)
  const [isMonsterManagerOpen, setIsMonsterManagerOpen] = useState(false)
  const [maps, setMaps] = useState(currentSession?.maps || [])
  const [characters, setCharacters] = useState(currentSession?.characters || [])
  const [monsters, setMonsters] = useState(currentSession?.monsters || [])
  const [selectedMap, setSelectedMap] = useState(null) // Выбранная карта для отображения

  // Синхронизация с сессией
  useEffect(() => {
    if (currentSession) {
      setMaps(currentSession.maps || [])
      setCharacters(currentSession.characters || [])
      setMonsters(currentSession.monsters || [])
    }
  }, [currentSession])

  // Периодическая синхронизация для обновления данных от других игроков
  useEffect(() => {
    if (!currentSession) return

    const syncInterval = setInterval(() => {
      // Получаем актуальные данные сессии
      const updatedSession = JSON.parse(localStorage.getItem('dnd_sessions') || '[]')
        .find(s => s.id === currentSession.id)
      
      if (updatedSession) {
        // Обновляем состояние только если данные изменились
        if (JSON.stringify(updatedSession.maps) !== JSON.stringify(maps)) {
          setMaps(updatedSession.maps || [])
        }
        if (JSON.stringify(updatedSession.characters) !== JSON.stringify(characters)) {
          setCharacters(updatedSession.characters || [])
        }
        if (JSON.stringify(updatedSession.monsters) !== JSON.stringify(monsters)) {
          setMonsters(updatedSession.monsters || [])
        }
      }
    }, 1000) // Синхронизация каждую секунду

    return () => clearInterval(syncInterval)
  }, [currentSession, maps, characters, monsters])

  useEffect(() => {
    if (!canvasRef.current) return

    // Создаем PixiJS приложение
    const canvasWidth = Math.min(1200, window.innerWidth - 300) // Учитываем левую панель
    const canvasHeight = Math.min(800, window.innerHeight - 200) // Учитываем заголовок и панель управления
    
    const app = new PIXI.Application({
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: 0x2d3748,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    })

    canvasRef.current.appendChild(app.view)
    appRef.current = app

    // Создаем игровое поле
    createGameBoard(app)
    
    // Создаем фишки игроков и монстров
    createTokens(app)

    // Обработчик изменения размера окна
    const handleResize = () => {
      const newWidth = Math.min(1200, window.innerWidth - 300)
      const newHeight = Math.min(800, window.innerHeight - 200)
      
      app.renderer.resize(newWidth, newHeight)
      
      // Пересоздаем поле с новыми размерами
      app.stage.removeChildren()
      // Сбрасываем ссылку на подсветку
      app.gridHighlight = null
      createGameBoard(app)
      createTokens(app)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (app) {
        app.destroy(true)
      }
    }
  }, [players, gridSize, cellSize])

  // Обновляем токены при изменении персонажей или монстров
  // Но только если действительно нужно (не при каждом рендере)
  useEffect(() => {
    if (appRef.current) {
      console.log('=== TOKENS UPDATE EFFECT ===')
      console.log('Characters changed:', characters.length)
      console.log('Monsters changed:', monsters.length)
      console.log('Current player:', currentPlayer?.nickname)
      
      // Проверяем, действительно ли нужно обновлять токены
      const currentTokens = appRef.current.stage.children.filter(child => 
        child.name === 'playerToken' || child.name === 'monsterToken'
      )
      
      console.log('Current tokens on stage:', currentTokens.length)
      
      // Обновляем токены только если количество изменилось
      if (currentTokens.length !== (characters.length + monsters.filter(m => m.isActive).length)) {
        console.log('Token count changed, recreating tokens...')
        createTokens(appRef.current)
      } else {
        console.log('Token count unchanged, skipping recreation')
      }
    }
  }, [characters.length, monsters.filter(m => m.isActive).length, currentPlayer?.id])

  const createGameBoard = (app) => {
    const graphics = new PIXI.Graphics()
    
    // Вычисляем размеры поля
    const fieldWidth = gridSize * cellSize
    const fieldHeight = gridSize * cellSize
    
    // Центрируем поле на canvas
    const offsetX = (app.screen.width - fieldWidth) / 2
    const offsetY = (app.screen.height - fieldHeight) / 2
    
    // Рисуем сетку
    graphics.lineStyle(1, 0x4a5568, 0.5)
    
    for (let i = 0; i <= gridSize; i++) {
      // Вертикальные линии
      graphics.moveTo(offsetX + i * cellSize, offsetY)
      graphics.lineTo(offsetX + i * cellSize, offsetY + fieldHeight)
      
      // Горизонтальные линии
      graphics.moveTo(offsetX, offsetY + i * cellSize)
      graphics.lineTo(offsetX + fieldWidth, offsetY + i * cellSize)
    }
    
    // Сохраняем смещения для использования в других функциях
    app.fieldOffsetX = offsetX
    app.fieldOffsetY = offsetY
    
    // Отладочная информация для создания поля
    console.log('Game board created:', {
      canvasWidth: app.screen.width,
      canvasHeight: app.screen.height,
      fieldWidth,
      fieldHeight,
      offsetX,
      offsetY,
      gridSize,
      cellSize
    })
    
    app.stage.addChild(graphics)
    
    // Если есть выбранная карта, применяем её
    if (selectedMap) {
      console.log('Applying selected map to new game board:', selectedMap)
      updateGameBoardWithMap(app, selectedMap)
    }
  }

  // Функция для обновления игрового поля с картой
  const updateGameBoardWithMap = (app, mapData) => {
    console.log('=== UPDATING GAME BOARD WITH MAP ===')
    console.log('Map data:', mapData)
    console.log('Current field settings:', { gridSize, cellSize })
    
    // Удаляем старые текстуры карты
    app.stage.children = app.stage.children.filter(child => 
      child.name !== 'mapTexture'
    )
    
    if (mapData.type === 'grid') {
      // Применяем клеточную карту
      const mapGridSize = mapData.gridSize || gridSize
      const mapCellSize = mapData.cellSize || cellSize
      const gridData = mapData.gridData || {}
      
      console.log('Applying grid map:', { mapGridSize, mapCellSize, gridData })
      console.log('Field offsets:', { offsetX: app.fieldOffsetX, offsetY: app.fieldOffsetY })
      
      // Создаем текстуры для каждой клетки
      Object.entries(gridData).forEach(([key, textureId]) => {
        const [x, y] = key.split(',').map(Number)
        
        // Создаем графический объект для текстуры
        const textureGraphics = new PIXI.Graphics()
        textureGraphics.name = 'mapTexture'
        
        // Определяем цвет текстуры
        const textureColor = getTextureColor(textureId)
        
        // Рисуем клетку с текстурой - используем размеры карты
        const cellX = app.fieldOffsetX + x * mapCellSize
        const cellY = app.fieldOffsetY + y * mapCellSize
        
        console.log(`Drawing texture at (${x}, ${y}):`, { 
          textureId, 
          cellX, 
          cellY, 
          mapCellSize,
          color: textureColor.toString(16)
        })
        
        textureGraphics.beginFill(textureColor)
        textureGraphics.drawRect(cellX, cellY, mapCellSize, mapCellSize)
        textureGraphics.endFill()
        
        // Добавляем тонкую границу
        textureGraphics.lineStyle(1, 0xffffff, 0.2)
        textureGraphics.drawRect(cellX, cellY, mapCellSize, mapCellSize)
        
        app.stage.addChild(textureGraphics)
      })
      
      console.log('Grid map applied successfully')
      
    } else if (mapData.type === 'image' && mapData.image) {
      // Применяем карту-изображение как фон
      console.log('Applying image map:', mapData.image)
      
      // Создаем спрайт с изображением
      const mapSprite = new PIXI.Sprite.from(mapData.image)
      mapSprite.name = 'mapTexture'
      
      // Масштабируем изображение под размер поля
      const fieldWidth = gridSize * cellSize
      const fieldHeight = gridSize * cellSize
      
      const scaleX = fieldWidth / mapSprite.width
      const scaleY = fieldHeight / mapSprite.height
      const scale = Math.min(scaleX, scaleY)
      
      mapSprite.scale.set(scale)
      
      // Центрируем изображение
      mapSprite.x = app.fieldOffsetX + (fieldWidth - mapSprite.width * scale) / 2
      mapSprite.y = app.fieldOffsetY + (fieldHeight - mapSprite.height * scale) / 2
      
      // Размещаем под сеткой
      app.stage.addChildAt(mapSprite, 0)
      
      console.log('Image map applied successfully')
    }
  }

  // Функция для получения цвета текстуры
  const getTextureColor = (textureId) => {
    const defaultColors = {
      'grass': 0x4ade80,    // Зеленый
      'stone': 0x6b7280,    // Серый
      'water': 0x3b82f6,    // Синий
      'dirt': 0x92400e,     // Коричневый
      'sand': 0xfbbf24,     // Желтый
      'snow': 0xf8fafc,     // Белый
      'lava': 0xdc2626,     // Красный
      'ice': 0x7dd3fc       // Голубой
    };
    
    return defaultColors[textureId] || 0x6b7280; // По умолчанию серый
  }

  const createTokens = (app) => {
    console.log('Creating tokens for:', { characters, monsters, currentPlayer })
    console.log('Current field settings for tokens:', { gridSize, cellSize })
    
    // Удаляем старые фишки
    app.stage.children = app.stage.children.filter(child => 
      child.name !== 'playerToken' && child.name !== 'monsterToken'
    )
    
    // Если это мастер, создаем фишки монстров И игроков
    if (currentPlayer.isMaster) {
      console.log('Master mode: creating monster tokens and player tokens')
      
      // Создаем фишки монстров для мастера
      monsters.filter(m => m.isActive).forEach((monster) => {
        // Используем сохраненную позицию или создаем новую
        const gridX = monster.gridX !== undefined ? monster.gridX : 2
        const gridY = monster.gridY !== undefined ? monster.gridY : 2
        createMonsterToken(app, monster, gridX, gridY)
      })
      
      // Мастер также видит фишки игроков для управления
      console.log('Master can see player tokens for management')
      const activeCharacters = characters.filter(character => 
        players.some(player => player.id === character.id)
      )
      
      activeCharacters.forEach((character, index) => {
        console.log('Creating player token for master to see:', character)
        
        // Используем сохраненную позицию или позицию по умолчанию
        let gridX, gridY
        
        if (character.gridX !== undefined && character.gridY !== undefined) {
          gridX = character.gridX
          gridY = character.gridY
        } else {
          // Если позиция не задана, размещаем по умолчанию
          if (index === 0) {
            // Первый активный персонаж - в центре
            gridX = Math.floor(gridSize / 2)
            gridY = Math.floor(gridSize / 2)
          } else {
            // Остальные активные персонажи - по углам
            const positions = [
              { x: 1, y: 1 },           // Левый верхний
              { x: gridSize - 2, y: 1 }, // Правый верхний
              { x: 1, y: gridSize - 2 }, // Левый нижний
              { x: gridSize - 2, y: gridSize - 2 } // Правый нижний
            ]
            const pos = positions[(index - 1) % positions.length]
            gridX = pos.x
            gridY = pos.y
          }
        }
        
        // Создаем объект игрока для фишки
        const playerData = {
          id: character.id,
          nickname: character.nickname,
          name: character.name,
          color: character.color || getRandomPlayerColor(),
          avatar: character.avatar,
          class: character.class,
          level: character.level,
          race: character.race,
          gridX: gridX,
          gridY: gridY
        }
        
        console.log('Player data for master token:', playerData)
        createPlayerToken(app, playerData, gridX, gridY, false) // false = не текущий игрок для мастера
      })
      
      return
    }
    
    console.log('Player mode: creating player tokens for active players')
    console.log('Active players:', players)
    console.log('All characters in session:', characters)
    
    // Создаем фишки только для активных игроков в сети
    // Фильтруем персонажей, которые соответствуют активным игрокам
    const activeCharacters = characters.filter(character => 
      players.some(player => player.id === character.id)
    )
    
    console.log('Active characters to display:', activeCharacters)
    
    activeCharacters.forEach((character, index) => {
      console.log('Creating token for active character:', character)
      
      // Используем сохраненную позицию или позицию по умолчанию
      let gridX, gridY
      
      if (character.gridX !== undefined && character.gridY !== undefined) {
        gridX = character.gridX
        gridY = character.gridY
      } else {
        // Если позиция не задана, размещаем по умолчанию
        if (index === 0) {
          // Первый активный персонаж - в центре
          gridX = Math.floor(gridSize / 2)
          gridY = Math.floor(gridSize / 2)
        } else {
          // Остальные активные персонажи - по углам
          const positions = [
            { x: 1, y: 1 },           // Левый верхний
            { x: gridSize - 2, y: 1 }, // Правый верхний
            { x: 1, y: gridSize - 2 }, // Левый нижний
            { x: gridSize - 2, y: gridSize - 2 } // Правый нижний
          ]
          const pos = positions[(index - 1) % positions.length]
          gridX = pos.x
          gridY = pos.y
        }
      }
      
      const isCurrentPlayer = character.id === currentPlayer.id
      
      // Создаем объект игрока для фишки
      const playerData = {
        id: character.id,
        nickname: character.nickname,
        name: character.name,
        color: character.color || getRandomPlayerColor(),
        avatar: character.avatar,
        class: character.class,
        level: character.level,
        race: character.race,
        gridX: gridX,
        gridY: gridY
      }
      
      console.log('Player data for token:', playerData)
      createPlayerToken(app, playerData, gridX, gridY, isCurrentPlayer)
    })
    
    // Игроки видят фишки монстров, но не могут их перетаскивать
    console.log('Player mode: creating monster tokens for players to see')
    monsters.filter(m => m.isActive).forEach((monster) => {
      // Используем сохраненную позицию или создаем новую
      const gridX = monster.gridX !== undefined ? monster.gridX : 3
      const gridY = monster.gridY !== undefined ? monster.gridY : 3
      console.log('Creating monster token for player to see:', monster)
      createMonsterToken(app, monster, gridX, gridY)
    })
  }

  const createMonsterToken = (app, monster, gridX, gridY) => {
    const token = new PIXI.Container()
    
    // Используем смещения поля для правильного позиционирования
    const offsetX = app.fieldOffsetX || 0
    const offsetY = app.fieldOffsetY || 0
    
    const x = offsetX + gridX * cellSize + cellSize / 2
    const y = offsetY + gridY * cellSize + cellSize / 2
    const radius = cellSize / 3
    
    // Создаем фон фишки монстра
    const background = new PIXI.Graphics()
    background.beginFill(parseInt(monster.color.replace('#', '0x')))
    background.drawCircle(0, 0, radius)
    background.endFill()
    
    // Добавляем обводку
    background.lineStyle(2, 0x000000, 1)
    background.drawCircle(0, 0, radius)
    
    token.addChild(background)
    
    // Если есть аватар, создаем спрайт
    if (monster.avatar && monster.avatar.circularThumbnail) {
      try {
        const avatarTexture = PIXI.Texture.from(monster.avatar.circularThumbnail)
        const avatarSprite = new PIXI.Sprite(avatarTexture)
        
        // Масштабируем аватар под размер фишки
        const avatarSize = radius * 1.5
        avatarSprite.width = avatarSize
        avatarSprite.height = avatarSize
        
        // Центрируем аватар
        avatarSprite.anchor.set(0.5)
        avatarSprite.x = 0
        avatarSprite.y = 0
        
        token.addChild(avatarSprite)
      } catch (error) {
        console.warn('Ошибка загрузки аватара монстра:', error)
      }
    }
    
    token.x = x
    token.y = y
    token.name = 'monsterToken'
    token.monsterData = monster
    
    // Добавляем текст с именем монстра
    const text = new PIXI.Text(monster.name, {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0xffffff,
      stroke: 0x000000,
      strokeThickness: 2
    })
    text.anchor.set(0.5, 1)
    text.y = radius + 12
    token.addChild(text)
    
    // Добавляем интерактивность для мастера
    if (currentPlayer.isMaster) {
      token.eventMode = 'static'
      token.cursor = 'pointer'
      
      token.on('pointerdown', onMonsterDragStart)
      token.on('pointerup', onMonsterDragEnd)
      token.on('pointerupoutside', onMonsterDragEnd)
      token.on('pointermove', onMonsterDragMove)
    }
    
    app.stage.addChild(token)
  }

  const createPlayerToken = (app, player, gridX, gridY, isCurrentPlayer) => {
    console.log('Creating player token:', { player, gridX, gridY, isCurrentPlayer })
    
    const token = new PIXI.Container()
    
    // Используем смещения поля для правильного позиционирования
    const offsetX = app.fieldOffsetX || 0
    const offsetY = app.fieldOffsetY || 0
    
    const x = offsetX + gridX * cellSize + cellSize / 2
    const y = offsetY + gridY * cellSize + cellSize / 2
    const radius = cellSize / 3
    
    // Отладочная информация для создания фишки
    console.log('Player token created:', {
      player: player.nickname,
      gridX,
      gridY,
      offsetX,
      offsetY,
      cellSize,
      finalX: x,
      finalY: y
    })
    
    // Создаем фон фишки
    const background = new PIXI.Graphics()
    background.beginFill(parseInt(player.color.replace('#', '0x')))
    background.drawCircle(0, 0, radius)
    background.endFill()
    
    // Добавляем обводку
    background.lineStyle(2, 0xffffff, 1)
    background.drawCircle(0, 0, radius)
    
    if (isCurrentPlayer) {
      // Выделяем текущего игрока
      background.lineStyle(3, 0xFFD700, 1)
      background.drawCircle(0, 0, radius + 2)
    }
    
    token.addChild(background)
    
    // Если есть аватар, создаем спрайт
    if (player.avatar && player.avatar.circularThumbnail) {
      try {
        const avatarTexture = PIXI.Texture.from(player.avatar.circularThumbnail)
        const avatarSprite = new PIXI.Sprite(avatarTexture)
        
        // Масштабируем аватар под размер фишки
        const avatarSize = radius * 1.5
        avatarSprite.width = avatarSize
        avatarSprite.height = avatarSize
        
        // Центрируем аватар
        avatarSprite.anchor.set(0.5)
        avatarSprite.x = 0
        avatarSprite.y = 0
        
        token.addChild(avatarSprite)
      } catch (error) {
        console.warn('Ошибка загрузки аватара:', error)
      }
    }
    
    token.x = x
    token.y = y
    token.name = 'playerToken'
    token.playerData = player
    
    // Добавляем текст с ником
    const text = new PIXI.Text(player.nickname, {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xffffff,
      stroke: 0x000000,
      strokeThickness: 2
    })
    text.anchor.set(0.5, 1)
    text.y = radius + 15
    token.addChild(text)
    
    // Добавляем интерактивность для текущего игрока И для мастера
    if (isCurrentPlayer || currentPlayer.isMaster) {
      token.eventMode = 'static'
      token.cursor = 'pointer'
      
      token.on('pointerdown', onTokenDragStart)
      token.on('pointerup', onTokenDragEnd)
      token.on('pointerupoutside', onTokenDragEnd)
      token.on('pointermove', onTokenDragMove)
      
      console.log(`Token ${player.nickname} made interactive for ${isCurrentPlayer ? 'current player' : 'master'}`)
    }
    
    app.stage.addChild(token)
  }

  const onTokenDragStart = (event) => {
    const token = event.currentTarget
    token.dragging = true
    token.data = event.data
    
    // Поднимаем фишку наверх при начале перетаскивания
    if (token.parent) {
      token.parent.addChild(token)
    }
  }

  const onMonsterDragStart = (event) => {
    const token = event.currentTarget
    token.dragging = true
    token.data = event.data
    
    // Поднимаем фишку наверх при начале перетаскивания
    if (token.parent) {
      token.parent.addChild(token)
    }
  }

  const onTokenDragEnd = (event) => {
    const token = event.currentTarget
    token.dragging = false
    token.data = null
    
    // Получаем смещения поля
    const offsetX = appRef.current.fieldOffsetX || 0
    const offsetY = appRef.current.fieldOffsetY || 0
    
    // Привязываем к ближайшей ячейке сетки с учетом смещений
    const relativeX = token.x - offsetX
    const relativeY = token.y - offsetY
    
    // Улучшенная привязка к сетке - используем Math.floor для более точного позиционирования
    const gridX = Math.max(0, Math.min(gridSize - 1, Math.floor(relativeX / cellSize)))
    const gridY = Math.max(0, Math.min(gridSize - 1, Math.floor(relativeY / cellSize)))
    
    // Отладочная информация
    console.log('Token drag end:', {
      tokenX: token.x,
      tokenY: token.y,
      offsetX,
      offsetY,
      relativeX,
      relativeY,
      cellSize,
      gridX,
      gridY,
      finalX: offsetX + gridX * cellSize + cellSize / 2,
      finalY: offsetY + gridY * cellSize + cellSize / 2
    })
    
    // Проверяем, что фишка не выходит за границы поля
    if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
      // Устанавливаем позицию точно по центру ячейки
      token.x = offsetX + gridX * cellSize + cellSize / 2
      token.y = offsetY + gridY * cellSize + cellSize / 2
      
      // Обновляем данные игрока с новой позицией
      if (token.playerData) {
        token.playerData.gridX = gridX
        token.playerData.gridY = gridY
        
        // Синхронизируем позицию между мастером и игроками
        syncTokenPositions(token.playerData.id, gridX, gridY, 'player')
      }
    } else {
      // Если фишка вышла за границы, возвращаем в последнюю валидную позицию
      const lastValidX = Math.max(0, Math.min(gridSize - 1, gridX))
      const lastValidY = Math.max(0, Math.min(gridSize - 1, gridY))
      
      token.x = offsetX + lastValidX * cellSize + cellSize / 2
      token.y = offsetY + lastValidY * cellSize + cellSize / 2
      
      if (token.playerData) {
        token.playerData.gridX = lastValidX
        token.playerData.gridY = lastValidY
      }
    }
    
    // Убираем подсветку сетки
    if (appRef.current.gridHighlight) {
      appRef.current.stage.removeChild(appRef.current.gridHighlight)
      appRef.current.gridHighlight = null
    }
  }

  const onMonsterDragEnd = (event) => {
    const token = event.currentTarget
    token.dragging = false
    token.data = null
    
    // Получаем смещения поля
    const offsetX = appRef.current.fieldOffsetX || 0
    const offsetY = appRef.current.fieldOffsetY || 0
    
    // Привязываем к ближайшей ячейке сетки с учетом смещений
    const relativeX = token.x - offsetX
    const relativeY = token.y - offsetY
    
    // Улучшенная привязка к сетке - используем Math.floor для более точного позиционирования
    const gridX = Math.max(0, Math.min(gridSize - 1, Math.floor(relativeX / cellSize)))
    const gridY = Math.max(0, Math.min(gridSize - 1, Math.floor(relativeY / cellSize)))
    
    // Отладочная информация
    console.log('Monster drag end:', {
      tokenX: token.x,
      tokenY: token.y,
      offsetX,
      offsetY,
      relativeX,
      relativeY,
      gridX,
      gridY
    })
    
    // Обновляем позицию в данных монстра
    if (token.monsterData) {
      token.monsterData.gridX = gridX
      token.monsterData.gridY = gridY
      
      // Синхронизируем позицию между мастером и игроками
      syncTokenPositions(token.monsterData.id, gridX, gridY, 'monster')
    }
    
    // Привязываем к сетке
    token.x = offsetX + gridX * cellSize + cellSize / 2
    token.y = offsetY + gridY * cellSize + cellSize / 2
    
    // Убираем подсветку сетки
    if (appRef.current.gridHighlight) {
      appRef.current.stage.removeChild(appRef.current.gridHighlight)
      appRef.current.gridHighlight = null
    }
  }

  const onTokenDragMove = (event) => {
    if (event.currentTarget.dragging) {
      const token = event.currentTarget
      
      // Получаем позицию курсора относительно stage
      const newPosition = event.data.getLocalPosition(appRef.current.stage)
      
      // Ограничиваем перетаскивание границами поля
      const offsetX = appRef.current.fieldOffsetX || 0
      const offsetY = appRef.current.fieldOffsetY || 0
      const fieldWidth = gridSize * cellSize
      const fieldHeight = gridSize * cellSize
      
      // Вычисляем границы для фишки
      const tokenRadius = cellSize / 3
      const minX = offsetX + tokenRadius
      const maxX = offsetX + fieldWidth - tokenRadius
      const minY = offsetY + tokenRadius
      const maxY = offsetY + fieldHeight - tokenRadius
      
      // Ограничиваем позицию границами поля
      token.x = Math.max(minX, Math.min(maxX, newPosition.x))
      token.y = Math.max(minY, Math.min(maxY, newPosition.y))
      
      // Добавляем визуальную обратную связь - показываем ближайшую ячейку
      showGridHighlight(token)
    }
  }

  const onMonsterDragMove = (event) => {
    if (event.currentTarget.dragging) {
      const token = event.currentTarget
      
      // Получаем позицию курсора относительно stage
      const newPosition = event.data.getLocalPosition(appRef.current.stage)
      
      // Ограничиваем перетаскивание границами поля
      const offsetX = appRef.current.fieldOffsetX || 0
      const offsetY = appRef.current.fieldOffsetY || 0
      const fieldWidth = gridSize * cellSize
      const fieldHeight = gridSize * cellSize
      
      // Вычисляем границы для фишки
      const tokenRadius = cellSize / 3
      const minX = offsetX + tokenRadius
      const maxX = offsetX + fieldWidth - tokenRadius
      const minY = offsetY + tokenRadius
      const maxY = offsetY + fieldHeight - tokenRadius
      
      // Ограничиваем позицию границами поля
      token.x = Math.max(minX, Math.min(maxX, newPosition.x))
      token.y = Math.max(minY, Math.min(maxY, newPosition.y))
      
      // Добавляем визуальную обратную связь - показываем ближайшую ячейку
      showGridHighlight(token)
    }
  }

  const showGridHighlight = (token) => {
    // Удаляем предыдущую подсветку
    if (appRef.current.gridHighlight) {
      appRef.current.stage.removeChild(appRef.current.gridHighlight)
    }
    
    // Создаем подсветку для ближайшей ячейки
    const offsetX = appRef.current.fieldOffsetX || 0
    const offsetY = appRef.current.fieldOffsetY || 0
    
    const relativeX = token.x - offsetX
    const relativeY = token.y - offsetY
    
    // Используем ту же логику, что и в onTokenDragEnd
    const gridX = Math.max(0, Math.min(gridSize - 1, Math.floor(relativeX / cellSize)))
    const gridY = Math.max(0, Math.min(gridSize - 1, Math.floor(relativeY / cellSize)))
    
    // Отладочная информация для подсветки
    console.log('Grid highlight:', {
      tokenX: token.x,
      tokenY: token.y,
      relativeX,
      relativeY,
      gridX,
      gridY,
      highlightX: offsetX + gridX * cellSize,
      highlightY: offsetY + gridY * cellSize
    })
    
    const highlight = new PIXI.Graphics()
    highlight.beginFill(0x00ff00, 0.3)
    highlight.drawRect(
      offsetX + gridX * cellSize,
      offsetY + gridY * cellSize,
      cellSize,
      cellSize
    )
    highlight.endFill()
    
    highlight.name = 'gridHighlight'
    appRef.current.gridHighlight = highlight
    appRef.current.stage.addChild(highlight)
  }

  const handleGridSizeChange = (newSize) => {
    setGridSize(newSize)
  }

  const handleCellSizeChange = (newSize) => {
    setCellSize(newSize)
  }

  // Функция для логирования бросков кубиков
  const handleDiceRoll = (rollData) => {
    // Броски мастера не логируются и не показывают уведомления
    if (currentPlayer.isMaster) {
      return
    }
    
    const newLog = {
      ...rollData,
      timestamp: new Date().toISOString(),
      id: Date.now()
    }
    setDiceLogs(prev => [newLog, ...prev].slice(0, 50)) // Храним последние 50 бросков
    
    // Сохраняем лог в сессии
    if (currentSession) {
      addDiceLogToSession(currentSession.id, newLog)
    }
    
    // Показываем уведомление о броске
    setNotification({
      message: `${rollData.player} бросил ${rollData.dice} = ${rollData.total}`,
      type: 'success',
      duration: 4000
    })
  }

  // Функции для управления персонажами
  const handleCharactersChange = (newCharacters) => {
    setCharacters(newCharacters)
    
    // Сохраняем изменения в сессии
    if (currentSession) {
      updateSession(currentSession.id, { characters: newCharacters })
    }
  }

  const handleMapsChange = (newMaps) => {
    setMaps(newMaps)
    
    // Сохраняем изменения в сессии
    if (currentSession) {
      updateSession(currentSession.id, { maps: newMaps })
    }
  }

  const handleMonstersChange = (newMonsters) => {
    setMonsters(newMonsters)
    
    // Сохраняем изменения в сессии
    if (currentSession) {
      updateSession(currentSession.id, { monsters: newMonsters })
    }
  }

  // Обработчик выбора карты
  const handleMapSelect = (mapId) => {
    console.log('=== MAP SELECTION DEBUG ===')
    console.log('Selecting map with ID:', mapId)
    console.log('Available maps:', maps)
    
    const selectedMapData = maps.find(map => map.id === mapId)
    console.log('Selected map data:', selectedMapData)
    
    setSelectedMap(selectedMapData)
    
    // Автоматически подстраиваем размер поля под выбранную карту
    if (selectedMapData && selectedMapData.type === 'grid') {
      const newGridSize = selectedMapData.gridSize || gridSize
      const newCellSize = selectedMapData.cellSize || cellSize
      
      console.log('Auto-adjusting field size:', { 
        oldGridSize: gridSize, 
        newGridSize, 
        oldCellSize: cellSize, 
        newCellSize 
      })
      
      // Обновляем размеры поля
      setGridSize(newGridSize)
      setCellSize(newCellSize)
      
      // Пересоздаем игровое поле с новыми размерами
      if (appRef.current) {
        // Удаляем старое поле
        appRef.current.stage.removeChildren()
        
        // Создаем новое поле с правильными размерами
        createGameBoard(appRef.current)
        
        // Создаем фишки заново
        createTokens(appRef.current)
      }
    } else {
      // Для карт-изображений просто обновляем текстуры
      if (appRef.current && selectedMapData) {
        updateGameBoardWithMap(appRef.current, selectedMapData)
      }
    }
  }

  // Функция для синхронизации позиций фишек между мастером и игроками
  const syncTokenPositions = (tokenId, newGridX, newGridY, tokenType = 'player') => {
    console.log('=== SYNC TOKEN POSITIONS ===')
    console.log('Syncing token:', { tokenId, newGridX, newGridY, tokenType })
    
    if (tokenType === 'player') {
      // Обновляем позицию персонажа в сессии
      const updatedCharacters = characters.map(char => 
        char.id === tokenId 
          ? { ...char, gridX: newGridX, gridY: newGridY }
          : char
      )
      setCharacters(updatedCharacters)
      
      // Сохраняем изменения в сессии
      if (currentSession) {
        updateSession(currentSession.id, { characters: updatedCharacters })
      }
      
      console.log('Player token position synced to session')
      
    } else if (tokenType === 'monster') {
      // Обновляем позицию монстра в сессии
      const updatedMonsters = monsters.map(monster => 
        monster.id === tokenId 
          ? { ...monster, gridX: newGridX, gridY: newGridY }
          : monster
      )
      setMonsters(updatedMonsters)
      
      // Сохраняем изменения в сессии
      if (currentSession) {
        updateSession(currentSession.id, { monsters: updatedMonsters })
      }
      
      console.log('Monster token position synced to session')
    }
  }

  // Функция для генерации случайного цвета игрока
  const getRandomPlayerColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  console.log('=== GAMEBOARD RENDER ===')
  console.log('Props:', { currentPlayer, players, currentSession })

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Заголовок */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-fantasy text-dnd-gold">
              DnD 5e - {currentPlayer.isMaster ? 'Панель мастера' : 'Игровое поле'}
          </h1>
          <SyncStatus />
            {currentPlayer.isMaster && (
              <span className="bg-dnd-purple text-white px-3 py-1 rounded-full text-sm font-semibold">
                🧙‍♂️ Мастер игры
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">
              {currentPlayer.isMaster ? 'Мастер' : 'Игрок'}: <span className="text-dnd-blue font-semibold">{currentPlayer.nickname}</span>
            </span>
            <button
              onClick={onLogout}
              className="btn-secondary"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 flex">
        {/* Левая панель - список игроков или панель мастера */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          {currentPlayer.isMaster ? (
            <div className="space-y-4">
              <h3 className="text-lg font-fantasy text-dnd-gold border-b border-gray-600 pb-2">
                🧙‍♂️ Панель мастера
              </h3>
              
              <div className="space-y-3">
                <div className="bg-gray-700 rounded-lg p-3">
                  <h4 className="font-semibold text-white mb-2">Управление картами</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Создавайте и управляйте картами для игроков
                  </p>
                  <button
                    onClick={() => setIsMapManagerOpen(true)}
                    className="btn-primary w-full text-sm"
                  >
                    🗺️ Управление картами
                  </button>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-3">
                  <h4 className="font-semibold text-white mb-2">Управление персонажами</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Редактируйте существующих персонажей игроков
                  </p>
                  <button
                    onClick={() => setIsCharacterManagerOpen(true)}
                    className="btn-primary w-full text-sm"
                  >
                    👥 Управление персонажами
                  </button>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-3">
                  <h4 className="font-semibold text-white mb-2">Управление монстрами</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Добавляйте и управляйте монстрами на поле
                  </p>
                  <button
                    onClick={() => setIsMonsterManagerOpen(true)}
                    className="btn-secondary w-full text-sm"
                  >
                    👹 Управление монстрами
                  </button>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-3">
                  <h4 className="font-semibold text-white mb-2">Броски кубиков</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Броски мастера не логируются в общий лог
                  </p>
                  <button
                    onClick={() => setIsDiceRollerOpen(true)}
                    className="btn-secondary w-full text-sm"
                  >
                    🎲 Бросить кубики
                  </button>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-3">
                  <h4 className="font-semibold text-white mb-2">Статистика</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>Всего карт: {maps.length}</p>
                    <p>Активных карт: {maps.filter(m => m.isActive).length}</p>
                    <p>Персонажей: {characters.length}</p>
                    <p>Монстров: {monsters.filter(m => m.isActive).length}</p>
                    <p>Игроков: {players.length}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
          <PlayerList 
            players={players}
            currentPlayer={currentPlayer}
            onPlayerSelect={setSelectedPlayer}
            selectedPlayer={selectedPlayer}
          />
          )}
        </div>

        {/* Центральная область - игровое поле */}
        <div className="flex-1 flex flex-col">
          {/* Панель управления */}
          <GameControls
            gridSize={gridSize}
            cellSize={cellSize}
            onGridSizeChange={handleGridSizeChange}
            onCellSizeChange={handleCellSizeChange}
            onOpenDiceRoller={() => setIsDiceRollerOpen(true)}
            onOpenDiceLog={() => setIsDiceLogOpen(true)}
            onOpenMapManager={() => setIsMapManagerOpen(true)}
            currentPlayer={currentPlayer}
            maps={maps}
            onMapSelect={handleMapSelect}
            selectedMap={selectedMap}
          />
          
          {/* Canvas для PixiJS */}
          <div className="flex-1 flex items-center justify-center p-4 relative">
            <div 
              ref={canvasRef}
              className="border-2 border-gray-600 rounded-lg shadow-lg"
            />
            
            {/* Кнопка быстрого доступа к кубикам в правом нижнем углу (только для игроков) */}
            {!currentPlayer.isMaster && (
              <div className="absolute bottom-6 right-6">
                <button
                  onClick={() => setIsDiceRollerOpen(true)}
                  className="bg-dnd-gold hover:bg-yellow-500 text-gray-900 font-bold p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                  title="Бросить кубики"
                >
                  <div className="text-2xl">🎲</div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Модальное окно для броска костей */}
      <DiceRoller
        isOpen={isDiceRollerOpen}
        onClose={() => setIsDiceRollerOpen(false)}
        currentPlayer={currentPlayer}
        onLogRoll={handleDiceRoll}
      />
      
      {/* Модальное окно для просмотра логов */}
      <DiceLog
        logs={diceLogs}
        isOpen={isDiceLogOpen}
        onClose={() => setIsDiceLogOpen(false)}
      />
      
      {/* Уведомления */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* Модальное окно управления картами для мастера */}
      <MapManager
        isOpen={isMapManagerOpen}
        onClose={() => setIsMapManagerOpen(false)}
        maps={maps}
        onMapsChange={handleMapsChange}
      />
      
      {/* Модальное окно управления персонажами для мастера */}
      <CharacterManager
        isOpen={isCharacterManagerOpen}
        onClose={() => setIsCharacterManagerOpen(false)}
        characters={characters}
        onCharactersChange={handleCharactersChange}
        sessionId={currentSession?.id}
      />
      
      {/* Модальное окно управления монстрами для мастера */}
      <MonsterManager
        isOpen={isMonsterManagerOpen}
        onClose={() => setIsMonsterManagerOpen(false)}
        monsters={monsters}
        onMonstersChange={handleMonstersChange}
        sessionId={currentSession?.id}
      />
    </div>
  )
}

export default GameBoard
