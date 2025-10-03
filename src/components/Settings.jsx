import React, { useState } from 'react'

const Settings = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    musicEnabled: false,
    volume: 50,
    theme: 'dark',
    language: 'ru',
    autoSave: true,
    gridSnap: true,
    showCoordinates: false
  })

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const resetSettings = () => {
    setSettings({
      soundEnabled: true,
      musicEnabled: false,
      volume: 50,
      theme: 'dark',
      language: 'ru',
      autoSave: true,
      gridSnap: true,
      showCoordinates: false
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg w-96 max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-600">
          <h3 className="text-xl font-fantasy text-dnd-gold">⚙️ Настройки</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Звук и музыка */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">🔊 Звук</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-200">Звуковые эффекты</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dnd-blue"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-200">Фоновая музыка</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.musicEnabled}
                    onChange={(e) => handleSettingChange('musicEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dnd-blue"></div>
                </label>
              </div>
              
              <div>
                <span className="text-sm text-gray-200">Громкость</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume}
                  onChange={(e) => handleSettingChange('volume', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-gray-400 text-center">{settings.volume}%</div>
              </div>
            </div>
          </div>

          {/* Внешний вид */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">🎨 Внешний вид</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-200 mb-2">Тема</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="dark">Темная</option>
                  <option value="light">Светлая</option>
                  <option value="auto">Авто</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-200 mb-2">Язык</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Игровые настройки */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">🎮 Игра</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-200">Автосохранение</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dnd-blue"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-200">Привязка к сетке</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.gridSnap}
                    onChange={(e) => handleSettingChange('gridSnap', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dnd-blue"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-200">Показывать координаты</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showCoordinates}
                    onChange={(e) => handleSettingChange('showCoordinates', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dnd-blue"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex space-x-3 pt-4 border-t border-gray-600">
            <button
              onClick={resetSettings}
              className="btn-secondary flex-1"
            >
              🔄 Сбросить
            </button>
            <button
              onClick={onClose}
              className="btn-primary flex-1"
            >
              ✅ Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings




