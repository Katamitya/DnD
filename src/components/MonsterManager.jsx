import React, { useState, useRef } from 'react'
import { uploadAvatar, getDefaultAvatar, getAvatarUrl } from '../utils/avatarManager'

const MonsterManager = ({ isOpen, onClose, monsters = [], onMonstersChange, sessionId }) => {
  const [newMonster, setNewMonster] = useState({
    name: '',
    type: '',
    level: 1,
    hp: 10,
    ac: 10,
    description: '',
    color: '#FF6B6B'
  })
  const [editingMonster, setEditingMonster] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)

  const monsterTypes = [
    'Гоблин', 'Орк', 'Тролль', 'Дракон', 'Нежить', 'Демон', 
    'Элементаль', 'Великан', 'Аберрация', 'Зверь', 'Растение', 'Другой'
  ]

  const monsterColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
    '#FF8E53', '#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'
  ]

  const handleCreateMonster = () => {
    if (newMonster.name.trim() && newMonster.type.trim()) {
      const monster = {
        ...newMonster,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        avatar: null,
        gridX: 0,
        gridY: 0,
        isActive: true
      }
      
      onMonstersChange([...monsters, monster])
      
      // Очищаем форму
      setNewMonster({
        name: '',
        type: '',
        level: 1,
        hp: 10,
        ac: 10,
        description: '',
        color: '#FF6B6B'
      })
    }
  }

  const handleEditMonster = (monster) => {
    setEditingMonster(monster)
    setNewMonster({
      name: monster.name,
      type: monster.type,
      level: monster.level,
      hp: monster.hp,
      ac: monster.ac,
      description: monster.description,
      color: monster.color
    })
  }

  const handleSaveEdit = () => {
    if (editingMonster && newMonster.name.trim() && newMonster.type.trim()) {
      const updatedMonsters = monsters.map(mon => 
        mon.id === editingMonster.id 
          ? { ...mon, ...newMonster, updatedAt: new Date().toISOString() }
          : mon
      )
      
      onMonstersChange(updatedMonsters)
      
      // Очищаем форму
      setEditingMonster(null)
      setNewMonster({
        name: '',
        type: '',
        level: 1,
        hp: 10,
        ac: 10,
        description: '',
        color: '#FF6B6B'
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingMonster(null)
    setNewMonster({
      name: '',
      type: '',
      level: 1,
      hp: 10,
      ac: 10,
      description: '',
      color: '#FF6B6B'
    })
  }

  const handleDeleteMonster = (monsterId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого монстра?')) {
      const updatedMonsters = monsters.filter(mon => mon.id !== monsterId)
      onMonstersChange(updatedMonsters)
    }
  }

  const handleToggleMonster = (monsterId) => {
    const updatedMonsters = monsters.map(mon => 
      mon.id === monsterId 
        ? { ...mon, isActive: !mon.isActive }
        : mon
    )
    onMonstersChange(updatedMonsters)
  }

  const handleAvatarUpload = async (monsterId, file) => {
    setIsUploading(true)
    setUploadError('')
    
    try {
      const avatar = await uploadAvatar(file)
      
      const updatedMonsters = monsters.map(mon => 
        mon.id === monsterId 
          ? { ...mon, avatar, updatedAt: new Date().toISOString() }
          : mon
      )
      
      onMonstersChange(updatedMonsters)
    } catch (error) {
      setUploadError(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = (monsterId) => {
    const updatedMonsters = monsters.map(mon => 
      mon.id === monsterId 
        ? { ...mon, avatar: null, updatedAt: new Date().toISOString() }
        : mon
    )
    
    onMonstersChange(updatedMonsters)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-[800px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-fantasy text-dnd-gold">👹 Управление монстрами</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Форма создания/редактирования монстра */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-dnd-gold">
              {editingMonster ? 'Редактировать монстра' : 'Добавить нового монстра'}
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Имя монстра: *
                </label>
                <input
                  type="text"
                  value={newMonster.name}
                  onChange={(e) => setNewMonster(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field w-full"
                  placeholder="Введите имя монстра..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Тип: *
                  </label>
                  <select
                    value={newMonster.type}
                    onChange={(e) => setNewMonster(prev => ({ ...prev, type: e.target.value }))}
                    className="input-field w-full"
                  >
                    <option value="">Выберите тип</option>
                    {monsterTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Уровень:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newMonster.level}
                    onChange={(e) => setNewMonster(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                    className="input-field w-full"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    HP:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMonster.hp}
                    onChange={(e) => setNewMonster(prev => ({ ...prev, hp: parseInt(e.target.value) || 1 }))}
                    className="input-field w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    КД:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newMonster.ac}
                    onChange={(e) => setNewMonster(prev => ({ ...prev, ac: parseInt(e.target.value) || 10 }))}
                    className="input-field w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Цвет фишки:
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {monsterColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewMonster(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newMonster.color === color ? 'border-white' : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Описание:
                </label>
                <textarea
                  value={newMonster.description}
                  onChange={(e) => setNewMonster(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field w-full h-20 resize-none"
                  placeholder="Опишите монстра..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              {editingMonster ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    disabled={!newMonster.name.trim() || !newMonster.type.trim()}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    💾 Сохранить
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="btn-secondary flex-1"
                  >
                    ❌ Отмена
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCreateMonster}
                  disabled={!newMonster.name.trim() || !newMonster.type.trim()}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  👹 Добавить монстра
                </button>
              )}
            </div>
          </div>

          {/* Список существующих монстров */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-dnd-gold">
              Монстры на поле ({monsters.length})
            </h4>
            
            {monsters.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-2">👹</div>
                <p>Нет монстров на поле</p>
                <p className="text-sm">Добавьте монстров слева</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {monsters.map(monster => (
                  <div
                    key={monster.id}
                    className={`bg-gray-700 rounded-lg p-4 ${
                      !monster.isActive ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3 mb-3">
                      {/* Аватар */}
                      <div className="relative">
                        <div
                          className="w-16 h-16 rounded-full border-2 border-gray-600 flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: monster.color }}
                        >
                          {monster.avatar ? (
                            <img
                              src={getAvatarUrl(monster.avatar)}
                              alt={monster.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            monster.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        
                        {/* Кнопки управления аватаром */}
                        <div className="absolute -top-1 -right-1 space-y-1">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-dnd-blue text-white p-1 rounded-full text-xs hover:bg-blue-600"
                            title="Загрузить аватар"
                          >
                            📷
                          </button>
                          {monster.avatar && (
                            <button
                              onClick={() => handleRemoveAvatar(monster.id)}
                              className="bg-red-600 text-white p-1 rounded-full text-xs hover:bg-red-700"
                              title="Убрать аватар"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                        
                        {/* Скрытый input для загрузки файла */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleAvatarUpload(monster.id, e.target.files[0])
                            }
                          }}
                          className="hidden"
                        />
                      </div>
                      
                      {/* Информация о монстре */}
                      <div className="flex-1">
                        <h5 className="font-semibold text-white text-lg">{monster.name}</h5>
                        <p className="text-sm text-gray-300">Тип: {monster.type}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-dnd-blue text-white px-2 py-1 rounded">
                            Ур. {monster.level}
                          </span>
                          <span className="text-xs bg-dnd-red text-white px-2 py-1 rounded">
                            HP: {monster.hp}
                          </span>
                          <span className="text-xs bg-dnd-green text-white px-2 py-1 rounded">
                            КД: {monster.ac}
                          </span>
                        </div>
                        {monster.description && (
                          <p className="text-xs text-gray-400 mt-2">{monster.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Кнопки управления */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">
                        Создан: {new Date(monster.createdAt).toLocaleDateString()}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleMonster(monster.id)}
                          className={`text-sm px-2 py-1 rounded ${
                            monster.isActive 
                              ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                          title={monster.isActive ? 'Скрыть с поля' : 'Показать на поле'}
                        >
                          {monster.isActive ? '👁️' : '👁️‍🗨️'}
                        </button>
                        <button
                          onClick={() => handleEditMonster(monster)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                          title="Редактировать"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteMonster(monster.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ошибки загрузки */}
        {uploadError && (
          <div className="mt-4 p-3 bg-red-600 text-white rounded-lg">
            <p className="text-sm">Ошибка загрузки аватара: {uploadError}</p>
          </div>
        )}

        {/* Информация */}
        <div className="mt-6 border-t border-gray-600 pt-4">
          <div className="text-xs text-gray-400 space-y-1">
            <p>• <strong>Монстры</strong> отображаются как фишки на игровом поле</p>
            <p>• <strong>Аватары</strong> автоматически конвертируются в миниатюры</p>
            <p>• <strong>Поддерживаемые форматы</strong>: JPEG, PNG, GIF, WebP (до 5MB)</p>
            <p>• <strong>Скрытые монстры</strong> не отображаются на поле</p>
            <p>• <strong>Цвета фишек</strong> помогают различать типы монстров</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MonsterManager



