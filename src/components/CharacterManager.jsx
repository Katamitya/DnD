import React, { useState, useRef } from 'react'
import { uploadAvatar, getDefaultAvatar, getAvatarUrl } from '../utils/avatarManager'

const CharacterManager = ({ isOpen, onClose, characters = [], onCharactersChange, sessionId }) => {
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    nickname: '',
    class: '',
    level: 1,
    race: '',
    description: ''
  })
  const [editingCharacter, setEditingCharacter] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)

  const characterClasses = [
    'Воин', 'Паладин', 'Рейнджер', 'Бард', 'Волшебник', 'Чародей', 
    'Друид', 'Жрец', 'Монах', 'Плут', 'Варвар', 'Изобретатель'
  ]

  const characterRaces = [
    'Человек', 'Эльф', 'Полуэльф', 'Полуорк', 'Гном', 'Полурослик',
    'Дварф', 'Тифлинг', 'Драконорожденный', 'Геннаси', 'Калиастар'
  ]

  const handleCreateCharacter = () => {
    if (newCharacter.name.trim() && newCharacter.nickname.trim()) {
      const character = {
        ...newCharacter,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        avatar: null
      }
      
      onCharactersChange([...characters, character])
      
      // Очищаем форму
      setNewCharacter({
        name: '',
        nickname: '',
        class: '',
        level: 1,
        race: '',
        description: ''
      })
    }
  }

  const handleEditCharacter = (character) => {
    setEditingCharacter(character)
    setNewCharacter({
      name: character.name,
      nickname: character.nickname,
      class: character.class,
      level: character.level,
      race: character.race,
      description: character.description
    })
  }

  const handleSaveEdit = () => {
    if (editingCharacter && newCharacter.name.trim() && newCharacter.nickname.trim()) {
      const updatedCharacters = characters.map(char => 
        char.id === editingCharacter.id 
          ? { ...char, ...newCharacter, updatedAt: new Date().toISOString() }
          : char
      )
      
      onCharactersChange(updatedCharacters)
      
      // Очищаем форму
      setEditingCharacter(null)
      setNewCharacter({
        name: '',
        nickname: '',
        class: '',
        level: 1,
        race: '',
        description: ''
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingCharacter(null)
    setNewCharacter({
      name: '',
      nickname: '',
      class: '',
      level: 1,
      race: '',
      description: ''
    })
  }

  const handleDeleteCharacter = (characterId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого персонажа?')) {
      const updatedCharacters = characters.filter(char => char.id !== characterId)
      onCharactersChange(updatedCharacters)
    }
  }

  const handleAvatarUpload = async (characterId, file) => {
    setIsUploading(true)
    setUploadError('')
    
    try {
      const avatar = await uploadAvatar(file)
      
      const updatedCharacters = characters.map(char => 
        char.id === characterId 
          ? { ...char, avatar, updatedAt: new Date().toISOString() }
          : char
      )
      
      onCharactersChange(updatedCharacters)
    } catch (error) {
      setUploadError(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = (characterId) => {
    const updatedCharacters = characters.map(char => 
      char.id === characterId 
        ? { ...char, avatar: null, updatedAt: new Date().toISOString() }
        : char
    )
    
    onCharactersChange(updatedCharacters)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-[800px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-fantasy text-dnd-gold">👥 Управление персонажами</h3>
          <p className="text-sm text-gray-400 mt-2">
            Новые персонажи создаются при входе в игру. Здесь можно редактировать существующих.
          </p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Форма редактирования персонажа */}
          {editingCharacter && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-dnd-gold">
                Редактировать персонажа
              </h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Имя персонажа: *
                </label>
                <input
                  type="text"
                  value={newCharacter.name}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field w-full"
                  placeholder="Введите имя персонажа..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Никнейм игрока: *
                </label>
                <input
                  type="text"
                  value={newCharacter.nickname}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, nickname: e.target.value }))}
                  className="input-field w-full"
                  placeholder="Введите никнейм игрока..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Класс:
                  </label>
                  <select
                    value={newCharacter.class}
                    onChange={(e) => setNewCharacter(prev => ({ ...prev, class: e.target.value }))}
                    className="input-field w-full"
                  >
                    <option value="">Выберите класс</option>
                    {characterClasses.map(charClass => (
                      <option key={charClass} value={charClass}>{charClass}</option>
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
                    max="20"
                    value={newCharacter.level}
                    onChange={(e) => setNewCharacter(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                    className="input-field w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Раса:
                </label>
                <select
                  value={newCharacter.race}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, race: e.target.value }))}
                  className="input-field w-full"
                >
                  <option value="">Выберите расу</option>
                  {characterRaces.map(race => (
                    <option key={race} value={race}>{race}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Описание:
                </label>
                <textarea
                  value={newCharacter.description}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field w-full h-20 resize-none"
                  placeholder="Опишите персонажа..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleSaveEdit}
                disabled={!newCharacter.name.trim() || !newCharacter.nickname.trim()}
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
            </div>
          </div>
          )}

          {/* Список существующих персонажей */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-dnd-gold">
              Существующие персонажи ({characters.length})
            </h4>
            
            {characters.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-2">👥</div>
                <p>Нет созданных персонажей</p>
                <p className="text-sm">Создайте первого персонажа слева</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {characters.map(character => (
                  <div
                    key={character.id}
                    className="bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3 mb-3">
                      {/* Аватар */}
                      <div className="relative">
                        <img
                          src={getAvatarUrl(character.avatar) || getDefaultAvatar(character.name)}
                          alt={character.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                        />
                        
                        {/* Кнопки управления аватаром */}
                        <div className="absolute -top-1 -right-1 space-y-1">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-dnd-blue text-white p-1 rounded-full text-xs hover:bg-blue-600"
                            title="Загрузить аватар"
                          >
                            📷
                          </button>
                          {character.avatar && (
                            <button
                              onClick={() => handleRemoveAvatar(character.id)}
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
                              handleAvatarUpload(character.id, e.target.files[0])
                            }
                          }}
                          className="hidden"
                        />
                      </div>
                      
                      {/* Информация о персонаже */}
                      <div className="flex-1">
                        <h5 className="font-semibold text-white text-lg">{character.name}</h5>
                        <p className="text-sm text-gray-300">Игрок: {character.nickname}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {character.class && (
                            <span className="text-xs bg-dnd-blue text-white px-2 py-1 rounded">
                              {character.class} {character.level}
                            </span>
                          )}
                          {character.race && (
                            <span className="text-xs bg-dnd-green text-white px-2 py-1 rounded">
                              {character.race}
                            </span>
                          )}
                        </div>
                        {character.description && (
                          <p className="text-xs text-gray-400 mt-2">{character.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Кнопки управления */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">
                        Создан: {new Date(character.createdAt).toLocaleDateString()}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCharacter(character)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                          title="Редактировать"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteCharacter(character.id)}
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
            <p>• <strong>Новые персонажи</strong> создаются при входе в игру</p>
            <p>• <strong>Аватары</strong> автоматически конвертируются в миниатюры</p>
            <p>• <strong>Поддерживаемые форматы</strong>: JPEG, PNG, GIF, WebP (до 5MB)</p>
            <p>• <strong>Персонажи</strong> привязаны к текущей сессии</p>
            <p>• <strong>Аватары</strong> отображаются на фишках игрового поля</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharacterManager
