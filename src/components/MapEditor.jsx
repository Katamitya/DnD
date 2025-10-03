import React, { useState, useRef, useEffect } from 'react'
import { getAllTextures, addTexture, removeTexture, loadImageAsTexture } from '../utils/textureManager'

const MapEditor = ({ isOpen, onClose, onSave, editingMap = null }) => {
  console.log('=== MAP EDITOR RENDER ===')
  console.log('isOpen:', isOpen)
  console.log('editingMap:', editingMap)
  console.log('onSave:', typeof onSave)
  console.log('onClose:', typeof onClose)
  const [mapType, setMapType] = useState('grid') // 'grid' или 'image'
  const [mapName, setMapName] = useState(editingMap?.name || '')
  const [mapDescription, setMapDescription] = useState(editingMap?.description || '')
  const [gridSize, setGridSize] = useState(editingMap?.gridSize || 15)
  // Убираем cellSize из состояния - он будет вычисляться автоматически
  const [gridData, setGridData] = useState(editingMap?.gridData || {})
  const [selectedTexture, setSelectedTexture] = useState(null)
  const [textures, setTextures] = useState({})
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(editingMap?.image || '')
  const [hoveredCell, setHoveredCell] = useState(null)
  
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const canvasContextRef = useRef(null)

  // Автоматически вычисляем размер клетки на основе размера сетки
  const getCellSize = () => {
    // Базовый размер canvas (максимальный размер для редактора)
    const maxCanvasSize = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.6)
    // Размер клетки = размер canvas / размер сетки
    return Math.floor(maxCanvasSize / gridSize)
  }

  // Загружаем текстуры при открытии
  useEffect(() => {
    if (isOpen) {
      const allTextures = getAllTextures()
      setTextures(allTextures)
      
      // Если редактируем карту, загружаем её данные
      if (editingMap) {
        setMapType(editingMap.type || 'grid')
        setGridSize(editingMap.gridSize || 15)
        setGridData(editingMap.gridData || {})
        setImagePreview(editingMap.image || '')
      }
    }
  }, [isOpen, editingMap])

  // Создаем canvas для предпросмотра
  useEffect(() => {
    if (mapType === 'grid' && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      canvasContextRef.current = ctx
      
      // Устанавливаем размер canvas равным размеру сетки
      const cellSize = getCellSize()
      const canvasSize = gridSize * cellSize
      canvas.width = canvasSize
      canvas.height = canvasSize
      
      console.log('Canvas setup:', {
        gridSize,
        cellSize,
        canvasSize,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height
      })
      
      // Сбрасываем трансформации
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      
      // Очищаем canvas
      ctx.clearRect(0, 0, canvasSize, canvasSize)
      
      // Рисуем сетку
      drawGrid()
      
      // Рисуем данные
      drawGridData()
    }
  }, [mapType, gridSize, gridData, hoveredCell, selectedTexture, textures])

  // Рисуем сетку
  const drawGrid = () => {
    if (!canvasContextRef.current) return
    
    const ctx = canvasContextRef.current
    const cellSize = getCellSize()
    const size = gridSize * cellSize
    
    ctx.strokeStyle = '#4a5568'
    ctx.lineWidth = 1
    
    // Вертикальные линии
    for (let i = 0; i <= gridSize; i++) {
      const x = i * cellSize
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, size)
      ctx.stroke()
    }
    
    // Горизонтальные линии
    for (let i = 0; i <= gridSize; i++) {
      const y = i * cellSize
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(size, y)
      ctx.stroke()
    }
  }

  // Рисуем данные сетки
  const drawGridData = () => {
    if (!canvasContextRef.current) return
    
    const ctx = canvasContextRef.current
    const cellSize = getCellSize()
    
    console.log('Drawing grid data:', { gridData, cellSize, gridSize })
    
    // Очищаем canvas перед перерисовкой
    ctx.clearRect(0, 0, gridSize * cellSize, gridSize * cellSize)
    
    // Рисуем сетку заново
    drawGrid()
    
    // Рисуем окрашенные клетки
    Object.entries(gridData).forEach(([key, textureId]) => {
      const [x, y] = key.split(',').map(Number)
      const texture = textures[textureId]
      
      console.log(`Drawing texture ${textureId} at cell (${x}, ${y})`)
      
      if (texture) {
        if (texture.type === 'color') {
          ctx.fillStyle = texture.color
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
          console.log(`✅ Painted color ${texture.color} at (${x}, ${y})`)
        } else if (texture.type === 'image') {
          const img = new Image()
          img.onload = () => {
            ctx.drawImage(img, x * cellSize, y * cellSize, cellSize, cellSize)
            console.log(`✅ Painted image texture at (${x}, ${y})`)
          }
          img.src = texture.data
        }
      }
    })
    
    // Рисуем подсветку клетки под курсором
    if (hoveredCell && selectedTexture) {
      // Желтая рамка вокруг клетки
      ctx.strokeStyle = '#ffff00'
      ctx.lineWidth = 3
      ctx.strokeRect(
        hoveredCell.x * cellSize, 
        hoveredCell.y * cellSize, 
        cellSize, 
        cellSize
      )
      
      // Красная точка в центре клетки для отладки
      ctx.fillStyle = '#ff0000'
      ctx.beginPath()
      ctx.arc(
        hoveredCell.x * cellSize + cellSize / 2,
        hoveredCell.y * cellSize + cellSize / 2,
        3,
        0,
        2 * Math.PI
      )
      ctx.fill()
      
      // Показываем предпросмотр текстуры
      const texture = textures[selectedTexture]
      if (texture) {
        ctx.globalAlpha = 0.7
        if (texture.type === 'color') {
          ctx.fillStyle = texture.color
          ctx.fillRect(
            hoveredCell.x * cellSize, 
            hoveredCell.y * cellSize, 
            cellSize, 
            cellSize
          )
        } else if (texture.type === 'image') {
          const img = new Image()
          img.onload = () => {
            ctx.drawImage(
              img, 
              hoveredCell.x * cellSize, 
              hoveredCell.y * cellSize, 
              cellSize, 
              cellSize
            )
          }
          img.src = texture.data
        }
        ctx.globalAlpha = 1.0
      }
    }
    
    console.log('Grid data drawing completed')
  }

  // Обработка движения мыши над canvas
  const handleCanvasMouseMove = (e) => {
    if (!selectedTexture) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    // Получаем координаты мыши относительно canvas
    const canvasX = e.clientX - rect.left
    const canvasY = e.clientY - rect.top
    
    // Вычисляем координаты в сетке - используем getCellSize()
    const cellSize = getCellSize()
    const gridX = Math.round(canvasX / cellSize)
    const gridY = Math.round(canvasY / cellSize)
    
    console.log('Mouse move:', { canvasX, canvasY, cellSize, gridX, gridY })
    console.log('Raw division:', { x: canvasX / cellSize, y: canvasY / cellSize })
    console.log('Cell center offset:', { 
      x: (canvasX / cellSize - gridX) * cellSize, 
      y: (canvasY / cellSize - gridY) * cellSize 
    })
    
    // Обновляем подсвеченную клетку
    if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
      setHoveredCell({ x: gridX, y: gridY })
    } else {
      setHoveredCell(null)
    }
  }

  // Обработка клика по canvas
  const handleCanvasClick = (e) => {
    if (!selectedTexture) {
      console.log('❌ No texture selected')
      return
    }
    
    const canvas = canvasRef.current
    if (!canvas) {
      console.log('❌ Canvas not found')
      return
    }
    
    const rect = canvas.getBoundingClientRect()
    const cellSize = getCellSize()
    
    // Получаем координаты клика относительно canvas
    const canvasX = e.clientX - rect.left
    const canvasY = e.clientY - rect.top
    
    // Вычисляем координаты в сетке
    const gridX = Math.round(canvasX / cellSize)
    const gridY = Math.round(canvasY / cellSize)
    
    console.log('=== CANVAS CLICK DEBUG ===')
    console.log('Mouse position:', { clientX: e.clientX, clientY: e.clientY })
    console.log('Canvas rect:', { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom })
    console.log('Canvas coordinates:', { canvasX, canvasY })
    console.log('Canvas dimensions:', { width: canvas.width, height: canvas.height })
    console.log('Grid settings:', { gridSize, cellSize })
    console.log('Raw division:', { x: canvasX / cellSize, y: canvasY / cellSize })
    console.log('Calculated grid position:', { gridX, gridY })
    console.log('Cell center offset:', { 
      x: (canvasX / cellSize - gridX) * cellSize, 
      y: (canvasY / cellSize - gridY) * cellSize 
    })
    
    // Проверяем границы canvas
    console.log('Canvas bounds check:', {
      inBounds: canvasX >= 0 && canvasX < canvas.width && canvasY >= 0 && canvasY < canvas.height,
      canvasX, canvasY, maxX: canvas.width, maxY: canvas.height
    })
    
    if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
      const key = `${gridX},${gridY}`
      console.log(`🎯 Clicking on cell (${gridX}, ${gridY}) with texture ${selectedTexture}`)
      
      setGridData(prev => {
        const newData = { ...prev, [key]: selectedTexture }
        console.log('Updated grid data:', newData)
        return newData
      })
      
      // Принудительно перерисовываем canvas после обновления данных
      setTimeout(() => {
        if (canvasContextRef.current) {
          drawGridData()
          console.log(`✅ Canvas redrawn after applying texture to cell (${gridX}, ${gridY})`)
        }
      }, 0)
      
    } else {
      console.log(`❌ Click outside grid bounds: (${gridX}, ${gridY})`)
    }
  }

  // Обработка загрузки изображения
  const handleImageUpload = async (file) => {
    try {
      setIsUploading(true)
      setUploadError('')
      
      const texture = await loadImageAsTexture(file, file.name)
      const success = addTexture(texture)
      
      if (success) {
        setTextures(getAllTextures())
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
        console.log('Image uploaded successfully as texture')
      } else {
        setUploadError('Ошибка при сохранении текстуры')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setUploadError(error.message || 'Ошибка загрузки изображения')
    } finally {
      setIsUploading(false)
    }
  }

  // Обработка загрузки файла как карты
  const handleMapImageUpload = async (file) => {
    try {
      setIsUploading(true)
      setUploadError('')
      
      const texture = await loadImageAsTexture(file, file.name)
      const success = addTexture(texture)
      
      if (success) {
        setTextures(getAllTextures())
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
        console.log('Map image uploaded successfully')
      } else {
        setUploadError('Ошибка при сохранении изображения карты')
      }
    } catch (error) {
      console.error('Error uploading map image:', error)
      setUploadError(error.message || 'Ошибка загрузки изображения карты')
    } finally {
      setIsUploading(false)
    }
  }

  // Сохранение карты
  const handleSave = () => {
    console.log('=== SAVE MAP DEBUG ===')
    console.log('Map name:', mapName)
    console.log('Map type:', mapType)
    console.log('Grid size:', gridSize)
    console.log('Grid data:', gridData)
    console.log('Image preview:', imagePreview)
    
    if (!mapName.trim()) {
      console.log('❌ No map name provided')
      alert('Введите название карты')
      return
    }
    
    if (mapType === 'grid' && Object.keys(gridData).length === 0) {
      console.log('❌ No grid data for grid map')
      alert('Для клеточной карты нужно окрасить хотя бы одну клетку')
      return
    }
    
    if (mapType === 'image' && !imagePreview) {
      console.log('❌ No image for image map')
      alert('Для карты-изображения нужно загрузить изображение')
      return
    }
    
    const mapData = {
      id: editingMap?.id || Date.now(),
      name: mapName.trim(),
      description: mapDescription.trim(),
      type: mapType,
      isActive: true,
      createdAt: editingMap?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    if (mapType === 'grid') {
      mapData.gridSize = gridSize
      mapData.cellSize = getCellSize()
      mapData.gridData = gridData
      console.log('Grid map data:', mapData)
    } else {
      mapData.image = imagePreview
      console.log('Image map data:', mapData)
    }
    
    console.log('Final map data:', mapData)
    console.log('Calling onSave...')
    
    try {
      onSave(mapData)
      console.log('✅ Map saved successfully')
      onClose()
    } catch (error) {
      console.error('❌ Error saving map:', error)
      alert('Ошибка при сохранении карты: ' + error.message)
    }
  }

  // Очистка клетки
  const clearCell = (x, y) => {
    const key = `${x},${y}`
    setGridData(prev => {
      const newData = { ...prev }
      delete newData[key]
      return newData
    })
  }

  if (!isOpen) {
    console.log('MapEditor not rendering - isOpen is false')
    return null
  }
  
  console.log('MapEditor rendering - isOpen is true')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-[95vw] h-[95vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-fantasy text-dnd-gold">
            {editingMap ? '✏️ Редактирование карты' : '🗺️ Создание новой карты'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая панель - настройки */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-dnd-gold">Настройки карты</h4>
            
            {/* Тип карты */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Тип карты:
              </label>
              <select
                value={mapType}
                onChange={(e) => setMapType(e.target.value)}
                className="input-field w-full"
              >
                <option value="grid">Клеточная карта</option>
                <option value="image">Изображение карты</option>
              </select>
            </div>

            {/* Название */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Название карты: *
              </label>
              <input
                type="text"
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                className="input-field w-full"
                placeholder="Введите название карты..."
                required
              />
            </div>

            {/* Описание */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Описание:
              </label>
              <textarea
                value={mapDescription}
                onChange={(e) => setMapDescription(e.target.value)}
                className="input-field w-full h-20 resize-none"
                placeholder="Опишите карту..."
              />
            </div>

            {/* Настройки для клеточной карты */}
            {mapType === 'grid' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Размер сетки: {gridSize}x{gridSize}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={gridSize}
                    onChange={(e) => setGridSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>


              </>
            )}

            {/* Загрузка изображения для карты */}
            {mapType === 'image' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Изображение карты:
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleMapImageUpload(e.target.files[0])
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="btn-secondary w-full"
                >
                  {isUploading ? 'Загрузка...' : '📷 Загрузить изображение'}
                </button>
                {uploadError && (
                  <p className="text-sm text-red-400 mt-1">{uploadError}</p>
                )}
              </div>
            )}

            {/* Кнопки */}
            <div className="space-y-2 pt-4">
              <button
                onClick={handleSave}
                disabled={!mapName.trim() || (mapType === 'image' && !imagePreview)}
                className="btn-primary w-full"
              >
                💾 {editingMap ? 'Сохранить изменения' : 'Создать карту'}
              </button>
              <button
                onClick={onClose}
                className="btn-secondary w-full"
              >
                ❌ Отмена
              </button>
            </div>
          </div>

          {/* Центральная панель - редактор */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-dnd-gold">
              {mapType === 'grid' ? 'Редактор клеток' : 'Предпросмотр изображения'}
            </h4>
            
            {mapType === 'grid' ? (
              <div className="border border-gray-600 rounded-lg p-4 bg-gray-900 h-full flex flex-col">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={() => setHoveredCell(null)}
                  className="border border-gray-500 cursor-crosshair mx-auto block flex-1"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: 'calc(100vh - 300px)',
                    width: 'auto',
                    height: 'auto'
                  }}
                />
                <p className="text-sm text-gray-400 mt-2 text-center">
                  Кликните по клетке, чтобы применить выбранную текстуру
                </p>
                
                {/* Информация о позиции */}
                {hoveredCell && (
                  <div className="mt-2 text-center">
                    <div className="inline-block bg-yellow-500 text-black px-2 py-1 rounded text-xs font-mono">
                      Клетка: ({hoveredCell.x}, {hoveredCell.y})
                    </div>
                  </div>
                )}
                
                {/* Отладочная информация */}
                <div className="mt-2 text-center text-xs text-gray-400">
                  <div>Сетка: {gridSize}x{gridSize}</div>
                  <div>Размер клетки: {getCellSize()}px</div>
                  <div>Canvas: {gridSize * getCellSize()}x{gridSize * getCellSize()}px</div>
                  {hoveredCell && (
                    <div className="mt-1 text-yellow-400">
                      Курсор: ({hoveredCell.x}, {hoveredCell.y}) | 
                      Центр: ({hoveredCell.x * getCellSize() + getCellSize() / 2}, {hoveredCell.y * getCellSize() + getCellSize() / 2})
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-gray-600 rounded-lg p-4 bg-gray-900">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Предпросмотр карты"
                    className="max-w-full h-auto mx-auto block"
                  />
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    Загрузите изображение для карты
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Правая панель - текстуры */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-dnd-gold">Текстуры</h4>
            
            {/* Загрузка новой текстуры */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleImageUpload(e.target.files[0])
                  }
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="btn-secondary w-full text-sm"
              >
                {isUploading ? 'Загрузка...' : '📷 Загрузить текстуру'}
              </button>
            </div>

            {/* Список текстур */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.values(textures).map((texture) => (
                <div
                  key={texture.id}
                  className={`p-2 rounded border cursor-pointer transition-colors ${
                    selectedTexture === texture.id
                      ? 'border-dnd-gold bg-dnd-gold bg-opacity-20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedTexture(texture.id)}
                >
                  <div className="flex items-center space-x-2">
                    {texture.type === 'color' ? (
                      <div
                        className="w-6 h-6 rounded border border-gray-400"
                        style={{ backgroundColor: texture.color }}
                      />
                    ) : (
                      <img
                        src={texture.data}
                        alt={texture.name}
                        className="w-6 h-6 rounded object-cover border border-gray-400"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {texture.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {texture.type === 'color' ? 'Цвет' : 'Изображение'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Информация о выбранной текстуре */}
            {selectedTexture && (
              <div className="border border-gray-600 rounded-lg p-3 bg-gray-700">
                <h5 className="font-medium text-white mb-2">Выбранная текстура</h5>
                <p className="text-sm text-gray-300">
                  {textures[selectedTexture]?.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {textures[selectedTexture]?.description || 'Нет описания'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapEditor
