import React, { useState } from 'react'
import MapEditor from './MapEditor'

const MapManager = ({ isOpen, onClose, maps = [], onMapsChange }) => {
  const [isMapEditorOpen, setIsMapEditorOpen] = useState(false)
  const [editingMap, setEditingMap] = useState(null)

  // Создание новой карты
  const handleCreateMap = () => {
    console.log('=== CREATE MAP BUTTON CLICKED ===')
    console.log('Setting editingMap to null')
    console.log('Setting isMapEditorOpen to true')
    console.log('Current isMapEditorOpen:', isMapEditorOpen)
    
    setEditingMap(null)
    setIsMapEditorOpen(true)
    
    console.log('After setState calls')
  }

  // Удаление карты
  const handleDeleteMap = (mapId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту карту?')) {
      onMapsChange(maps.filter(map => map.id !== mapId))
    }
  }

  // Переключение активности карты
  const handleToggleMapActive = (mapId) => {
    onMapsChange(maps.map(map => 
      map.id === mapId ? { ...map, isActive: !map.isActive } : map
    ))
  }

  // Редактирование карты
  const handleEditMap = (map) => {
    setEditingMap(map)
    setIsMapEditorOpen(true)
  }

  // Сохранение карты из редактора
  const handleSaveMap = (mapData) => {
    console.log('=== SAVE MAP FROM EDITOR ===')
    console.log('Map data received:', mapData)
    console.log('Editing map:', editingMap)
    console.log('Current maps:', maps)
    console.log('onMapsChange function:', typeof onMapsChange)
    
    if (editingMap) {
      // Обновляем существующую карту
      console.log('Updating existing map')
      const updatedMaps = maps.map(map => 
        map.id === editingMap.id ? mapData : map
      )
      console.log('Updated maps:', updatedMaps)
      onMapsChange(updatedMaps)
    } else {
      // Создаем новую карту
      console.log('Creating new map')
      const newMaps = [...maps, mapData]
      console.log('New maps array:', newMaps)
      onMapsChange(newMaps)
    }
    
    // Закрываем редактор
    console.log('Closing map editor')
    setIsMapEditorOpen(false)
    setEditingMap(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-[800px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-fantasy text-dnd-gold">🗺️ Управление картами</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Кнопка создания новой карты */}
          <div className="text-center">
            <button
              onClick={handleCreateMap}
              className="btn-primary px-8 py-3 text-lg"
            >
              🗺️ Создать новую карту
            </button>
            <p className="text-sm text-gray-400 mt-2">
              Создавайте клеточные карты или загружайте изображения
            </p>
          </div>

          {/* Список существующих карт */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-dnd-gold">
              Существующие карты ({maps.length})
            </h4>
            
            {maps.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-2">🗺️</div>
                <p>Пока нет созданных карт</p>
                <p className="text-sm">Создайте первую карту слева</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {maps.map(map => (
                  <div
                    key={map.id}
                    className={`bg-gray-700 rounded-lg p-4 border-l-4 ${
                      map.isActive ? 'border-green-500' : 'border-gray-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-white">{map.name}</h5>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleMapActive(map.id)}
                          className={`text-xs px-2 py-1 rounded ${
                            map.isActive 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-600 text-gray-300'
                          }`}
                          title={map.isActive ? 'Деактивировать' : 'Активировать'}
                        >
                          {map.isActive ? '✓' : '✗'}
                        </button>
                        <button
                          onClick={() => handleEditMap(map)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                          title="Редактировать"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteMap(map.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-2">{map.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Создана: {new Date(map.createdAt).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded ${
                        map.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}>
                        {map.isActive ? 'Активна' : 'Неактивна'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Информация */}
        <div className="mt-6 pt-4 border-t border-gray-600">
          <div className="text-xs text-gray-400 space-y-1">
            <p>• <strong>Активные карты</strong> доступны игрокам для просмотра</p>
            <p>• <strong>Неактивные карты</strong> скрыты от игроков</p>
            <p>• <strong>Клеточные карты</strong> создаются с помощью текстур</p>
            <p>• <strong>Изображения карт</strong> загружаются как файлы</p>
          </div>
        </div>
      </div>

      {/* Редактор карт */}
      <MapEditor
        isOpen={isMapEditorOpen}
        onClose={() => {
          setIsMapEditorOpen(false)
          setEditingMap(null)
        }}
        onSave={handleSaveMap}
        editingMap={editingMap}
      />
    </div>
  )
}

export default MapManager
