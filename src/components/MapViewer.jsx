import React, { useState } from 'react'

const MapViewer = ({ isOpen, onClose, maps = [], currentPlayer, onMapSelect, selectedMap: externalSelectedMap }) => {
  const [selectedMap, setSelectedMap] = useState(null)
  const [zoom, setZoom] = useState(1)

  // Функция для получения цвета текстуры
  const getTextureColor = (textureId) => {
    // Базовые цвета для стандартных текстур
    const defaultColors = {
      'grass': '#4ade80',    // Зеленый
      'stone': '#6b7280',    // Серый
      'water': '#3b82f6',    // Синий
      'dirt': '#92400e',     // Коричневый
      'sand': '#fbbf24',     // Желтый
      'snow': '#f8fafc',     // Белый
      'lava': '#dc2626',     // Красный
      'ice': '#7dd3fc'       // Голубой
    };
    
    return defaultColors[textureId] || '#6b7280'; // По умолчанию серый
  }

  // Фильтруем карты: для мастера показываем все, для игроков только активные
  const availableMaps = currentPlayer?.isMaster ? maps : maps.filter(map => map.isActive)
  
  // Отладочная информация
  console.log('=== MAP VIEWER DEBUG ===')
  console.log('Maps received:', maps)
  console.log('Current player:', currentPlayer)
  console.log('Available maps:', availableMaps)
  console.log('Selected map:', selectedMap)
  console.log('Selected map data:', availableMaps.find(m => m.id === selectedMap))
  
  // Устанавливаем первую доступную карту при открытии или используем внешнюю
  React.useEffect(() => {
    if (isOpen && availableMaps.length > 0) {
      if (externalSelectedMap) {
        setSelectedMap(externalSelectedMap.id)
      } else if (!selectedMap) {
        setSelectedMap(availableMaps[0].id)
      }
    }
  }, [isOpen, availableMaps, selectedMap, externalSelectedMap])

  // Обработчик выбора карты
  const handleMapSelect = (mapId) => {
    console.log('=== MAP VIEWER: MAP SELECTION ===')
    console.log('Selecting map ID:', mapId)
    
    setSelectedMap(mapId)
    
    // Уведомляем родительский компонент о выборе карты
    if (onMapSelect) {
      onMapSelect(mapId)
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5))
  }

  const resetZoom = () => {
    setZoom(1)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg w-11/12 h-5/6 max-w-6xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-600">
          <h3 className="text-xl font-fantasy text-dnd-gold">🗺️ Карта</h3>
          <div className="flex items-center space-x-3">
            {/* Элементы управления картой */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                className="btn-secondary text-sm px-2 py-1"
                title="Уменьшить"
              >
                🔍-
              </button>
              <span className="text-sm text-gray-300 min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="btn-secondary text-sm px-2 py-1"
                title="Увеличить"
              >
                🔍+
              </button>
              <button
                onClick={resetZoom}
                className="btn-secondary text-sm px-2 py-1"
                title="Сбросить масштаб"
              >
                🔄
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Боковая панель с выбором карт */}
          <div className="w-64 bg-gray-700 border-r border-gray-600 p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">
              Доступные карты:
            </h4>
            <div className="space-y-2">
              {availableMaps.length === 0 ? (
                <div className="text-center text-gray-400 py-4">
                  <p>Нет доступных карт</p>
                </div>
              ) : (
                availableMaps.map((map) => (
                  <div
                    key={map.id}
                    onClick={() => handleMapSelect(map.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedMap === map.id
                        ? 'bg-dnd-blue text-white'
                        : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                    }`}
                  >
                    <h5 className="font-semibold">{map.name}</h5>
                    <p className="text-xs opacity-80">{map.description}</p>
                    {!map.isActive && (
                      <span className="text-xs text-yellow-400 bg-yellow-900 px-2 py-1 rounded mt-1 inline-block">
                        Неактивна
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Легенда */}
            <div className="mt-6 p-3 bg-gray-600 rounded-lg">
              <h5 className="text-sm font-medium text-gray-200 mb-2">Легенда:</h5>
              <div className="text-xs space-y-1">
                {(() => {
                  const map = availableMaps.find(m => m.id === selectedMap);
                  if (!map || map.type !== 'grid') {
                    return (
                      <div className="text-gray-400">
                        Выберите клеточную карту для отображения легенды
                      </div>
                    );
                  }
                  
                  const gridData = map.gridData || {};
                  const uniqueTextures = [...new Set(Object.values(gridData))];
                  
                  if (uniqueTextures.length === 0) {
                    return (
                      <div className="text-gray-400">
                        Карта не содержит текстур
                      </div>
                    );
                  }
                  
                  return uniqueTextures.map(textureId => (
                    <div key={textureId} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: getTextureColor(textureId) }}
                      ></div>
                      <span className="capitalize">{textureId}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* Основная область карты */}
          <div className="flex-1 p-4">
            <div className="bg-gray-900 border border-gray-600 rounded-lg h-full flex items-center justify-center overflow-hidden">
              {selectedMap ? (
                <div className="w-full h-full overflow-auto">
                  {(() => {
                    const map = availableMaps.find(m => m.id === selectedMap);
                    if (!map) return null;
                    
                    if (map.type === 'grid') {
                      // Отображение клеточной карты
                      const cellSize = map.cellSize || 30;
                      const gridSize = map.gridSize || 15;
                      const gridData = map.gridData || {};
                      
                      return (
                        <div 
                          className="relative"
                          style={{
                            width: gridSize * cellSize,
                            height: gridSize * cellSize,
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top left',
                            transition: 'transform 0.2s ease'
                          }}
                        >
                          {/* Сетка */}
                          <div className="absolute inset-0">
                            {Array.from({ length: gridSize + 1 }, (_, i) => (
                              <React.Fragment key={i}>
                                {/* Вертикальные линии */}
                                <div
                                  className="absolute bg-gray-600 opacity-30"
                                  style={{
                                    left: i * cellSize,
                                    top: 0,
                                    width: 1,
                                    height: gridSize * cellSize
                                  }}
                                />
                                {/* Горизонтальные линии */}
                                <div
                                  className="absolute bg-gray-600 opacity-30"
                                  style={{
                                    left: 0,
                                    top: i * cellSize,
                                    width: gridSize * cellSize,
                                    height: 1
                                  }}
                                />
                              </React.Fragment>
                            ))}
                          </div>
                          
                          {/* Клетки с текстурами */}
                          {Object.entries(gridData).map(([key, textureId]) => {
                            const [x, y] = key.split(',').map(Number);
                            return (
                              <div
                                key={key}
                                className="absolute"
                                style={{
                                  left: x * cellSize,
                                  top: y * cellSize,
                                  width: cellSize,
                                  height: cellSize,
                                  backgroundColor: getTextureColor(textureId),
                                  border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                                title={`Клетка (${x}, ${y}): ${textureId}`}
                              />
                            );
                          })}
                        </div>
                      );
                    } else if (map.type === 'image' && map.image) {
                      // Отображение карты-изображения
                      return (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: 'center',
                            transition: 'transform 0.2s ease'
                          }}
                        >
                          <img
                            src={map.image}
                            alt={map.name}
                            className="max-w-full max-h-full object-contain"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%'
                            }}
                          />
                        </div>
                      );
                    } else {
                      // Заглушка для неизвестного типа карты
                      return (
                        <div className="text-center text-white">
                          <div className="text-6xl mb-4">❓</div>
                          <h2 className="text-2xl font-fantasy mb-2">
                            Неизвестный тип карты
                          </h2>
                          <p className="text-gray-300">
                            Тип: {map.type || 'не указан'}
                          </p>
                        </div>
                      );
                    }
                  })()}
                </div>
              ) : (
                // Заглушка когда карта не выбрана
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h2 className="text-2xl font-fantasy mb-2">
                    Выберите карту
                  </h2>
                  <p className="text-gray-300">
                    Выберите карту из списка слева для просмотра
                  </p>
                  <p className="text-sm text-gray-400 mt-4">
                    Масштаб: {Math.round(zoom * 100)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapViewer




