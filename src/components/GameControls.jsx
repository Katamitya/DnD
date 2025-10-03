import React, { useState } from 'react'
import DiceRoller from './DiceRoller'
import MapViewer from './MapViewer'
import Settings from './Settings'

const GameControls = ({ 
  gridSize, 
  cellSize, 
  onGridSizeChange, 
  onCellSizeChange,
  onOpenDiceRoller,
  onOpenDiceLog,
  onOpenMapManager,
  currentPlayer,
  maps = [],
  onMapSelect,
  selectedMap
}) => {
  // Отладочная информация
  console.log('=== GAME CONTROLS DEBUG ===')
  console.log('Maps received in GameControls:', maps)
  console.log('Current player:', currentPlayer)
  const [isMapViewerOpen, setIsMapViewerOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const gridSizeOptions = [8, 12, 15, 18, 20, 25]
  const cellSizeOptions = [30, 35, 40, 45, 50, 60]

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
              <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Настройка размера сетки - только для мастера */}
            {currentPlayer?.isMaster && (
              <>
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-300">
                    Размер сетки:
                  </label>
                  <select
                    value={gridSize}
                    onChange={(e) => onGridSizeChange(parseInt(e.target.value))}
                    className="input-field text-sm py-1 px-2"
                  >
                    {gridSizeOptions.map(size => (
                      <option key={size} value={size}>
                        {size}×{size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Настройка размера ячейки - только для мастера */}
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-300">
                    Размер ячейки:
                  </label>
                  <select
                    value={cellSize}
                    onChange={(e) => onCellSizeChange(parseInt(e.target.value))}
                    className="input-field text-sm py-1 px-2"
                  >
                    {cellSizeOptions.map(size => (
                      <option key={size} value={size}>
                        {size}px
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Информация о поле */}
            <div className="text-sm text-gray-400">
              Поле: {gridSize}×{gridSize} ячеек
            </div>
          </div>

        {/* Кнопки управления */}
        <div className="flex items-center space-x-3">
          <button 
            className="btn-secondary text-sm py-1 px-3"
            onClick={onOpenDiceRoller}
          >
            <span className="flex items-center space-x-1">
              <span>🎲</span>
              <span>Бросить кости</span>
            </span>
          </button>
          
          <button 
            className="btn-secondary text-sm py-1 px-3"
            onClick={onOpenDiceLog}
          >
            <span className="flex items-center space-x-1">
              <span>📋</span>
              <span>История</span>
            </span>
          </button>
          
          {/* Кнопка управления картами только для мастера */}
          {currentPlayer?.isMaster && (
            <button 
              onClick={onOpenMapManager}
              className="btn-secondary text-sm py-1 px-3 bg-dnd-purple hover:bg-purple-600"
            >
              <span className="flex items-center space-x-1">
                <span>🗺️</span>
                <span>Управление картами</span>
              </span>
            </button>
          )}
          
          <button 
            className="btn-secondary text-sm py-1 px-3"
            onClick={() => setIsMapViewerOpen(true)}
          >
            <span className="flex items-center space-x-1">
              <span>🗺️</span>
              <span>Карта</span>
            </span>
          </button>
          
          <button 
            className="btn-secondary text-sm py-1 px-3"
            onClick={() => setIsSettingsOpen(true)}
          >
            <span className="flex items-center space-x-1">
              <span>⚙️</span>
              <span>Настройки</span>
            </span>
          </button>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span>• Перетаскивайте фишку мышью для перемещения</span>
            <span>• Фишка автоматически привязывается к ячейкам сетки</span>
            <span>• Используйте настройки для изменения размера поля</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-dnd-gold rounded-full"></span>
            <span>Текущий игрок</span>
          </div>
        </div>
      </div>
      
      {/* Модальное окно для просмотра карты */}
      <MapViewer 
        isOpen={isMapViewerOpen}
        onClose={() => setIsMapViewerOpen(false)}
        maps={maps}
        currentPlayer={currentPlayer}
        onMapSelect={onMapSelect}
        selectedMap={selectedMap}
      />
      
      {/* Модальное окно настроек */}
      <Settings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}

export default GameControls
