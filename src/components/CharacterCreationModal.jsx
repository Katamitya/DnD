import React, { useState, useRef } from 'react'
import { uploadAvatar, getDefaultAvatar, getAvatarUrl } from '../utils/avatarManager'

const CharacterCreationModal = ({ isOpen, onClose, onCharacterCreate, currentSession }) => {
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    class: '',
    level: 1,
    race: '',
    description: '',
    color: '#FF6B6B'
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  const characterClasses = [
    'Воин', 'Паладин', 'Рейнджер', 'Бард', 'Волшебник', 'Чародей', 
    'Друид', 'Жрец', 'Монах', 'Плут', 'Варвар', 'Изобретатель'
  ]

  const characterRaces = [
    'Человек', 'Эльф', 'Полуэльф', 'Полуорк', 'Гном', 'Полурослик',
    'Дварф', 'Тифлинг', 'Драконорожденный', 'Геннаси', 'Калиастар'
  ]

  const characterColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
    '#FF8E53', '#FF6B9D', '#9B59B6', '#E74C3C', '#F39C12', '#1ABC9C'
  ]

  const handleAvatarUpload = async (file) => {
    try {
      setIsUploading(true)
      setUploadError('')
      
      console.log('Uploading avatar file:', file)
      
      const avatar = await uploadAvatar(file)
      console.log('Avatar uploaded successfully:', avatar)
      
      setNewCharacter(prev => ({ ...prev, avatar }))
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setUploadError(error.message || 'Ошибка загрузки аватара')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = () => {
    setNewCharacter(prev => ({ ...prev, avatar: null }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    console.log('=== FORM SUBMIT START ===')
    console.log('Form data:', newCharacter)
    
    try {
      // Простая проверка имени
      if (!newCharacter.name || newCharacter.name.trim() === '') {
        console.warn('Character name is empty')
        return
      }
      
      console.log('Creating character object...')
      
      // Создаем простой объект персонажа
      const character = {
        name: newCharacter.name.trim(),
        nickname: newCharacter.name.trim(),
        class: newCharacter.class || '',
        level: newCharacter.level || 1,
        race: newCharacter.race || '',
        description: newCharacter.description || '',
        color: newCharacter.color || '#FF6B6B',
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        gridX: 7,
        gridY: 7
      }
      
      console.log('Character object created:', character)
      
      // Проверяем callback
      if (typeof onCharacterCreate !== 'function') {
        console.error('onCharacterCreate is not a function!')
        console.error('Type:', typeof onCharacterCreate)
        console.error('Value:', onCharacterCreate)
        return
      }
      
      console.log('Calling onCharacterCreate...')
      
      // Вызываем callback
      onCharacterCreate(character)
      
      console.log('onCharacterCreate called successfully')
      
      // Очищаем форму
      setNewCharacter({
        name: '',
        class: '',
        level: 1,
        race: '',
        description: '',
        color: '#FF6B6B'
      })
      
      // Закрываем модал
      onClose()
      
      console.log('=== FORM SUBMIT SUCCESS ===')
      
    } catch (error) {
      console.error('=== FORM SUBMIT ERROR ===')
      console.error('Error details:', error)
      console.error('Error stack:', error.stack)
      console.error('Error message:', error.message)
    }
  }

  const handleCancel = () => {
    // Очищаем форму при отмене
    setNewCharacter({
      name: '',
      class: '',
      level: 1,
      race: '',
      description: '',
      color: '#FF6B6B'
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-fantasy text-dnd-gold">➕ Создание персонажа</h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {currentSession && (
          <div className="mb-4 p-3 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-300">
              <span className="text-dnd-gold">Сессия:</span> {currentSession.name}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Основная информация */}
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
              required
            />
          </div>

          {/* Класс и уровень */}
          <div className="grid grid-cols-2 gap-4">
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

          {/* Раса и цвет */}
          <div className="grid grid-cols-2 gap-4">
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
                Цвет фишки:
              </label>
              <div className="grid grid-cols-6 gap-2">
                {characterColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCharacter(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newCharacter.color === color ? 'border-white' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Описание */}
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

          {/* Аватар */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Аватар:
            </label>
            <div className="flex items-center space-x-4">
              {/* Превью аватара */}
              <div className="relative">
                <img
                  src={getAvatarUrl(newCharacter.avatar) || getDefaultAvatar(newCharacter.name)}
                  alt="Аватар"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                />
                
                {/* Кнопки управления аватаром */}
                <div className="absolute -top-1 -right-1 space-y-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-dnd-blue text-white p-1 rounded-full text-xs hover:bg-blue-600"
                    title="Загрузить аватар"
                  >
                    📷
                  </button>
                  {newCharacter.avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
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
                      handleAvatarUpload(e.target.files[0])
                    }
                  }}
                  className="hidden"
                />
              </div>
              
              <div className="flex-1">
                <p className="text-xs text-gray-400">
                  Поддерживаемые форматы: JPEG, PNG, GIF, WebP (до 5MB)
                </p>
                {uploadError && (
                  <p className="text-xs text-red-400 mt-1">{uploadError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={!newCharacter.name.trim() || isSubmitting}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Создание...
                </span>
              ) : (
                '🎭 Создать персонажа'
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary flex-1"
            >
              ❌ Отмена
            </button>
          </div>
        </form>

        {/* Информация */}
        <div className="mt-6 border-t border-gray-600 pt-4">
          <div className="text-xs text-gray-400 space-y-1">
            <p>• <strong>Имя персонажа</strong> - как зовут вашего героя в игре (будет использоваться как никнейм)</p>
            <p>• <strong>Класс и раса</strong> - определяют способности персонажа</p>
            <p>• <strong>Аватар</strong> - изображение персонажа на фишке</p>
            <p>• <strong>Цвет фишки</strong> - помогает различать персонажей на поле</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharacterCreationModal
