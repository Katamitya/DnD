import React, { useState } from 'react'
import { getVersionInfo, getVersionString } from '../utils/version'

const VersionInfo = ({ showDetails = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const versionInfo = getVersionInfo()

  if (!showDetails) {
    return (
      <div className="text-xs text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
           onClick={() => setIsExpanded(!isExpanded)}
           title="Нажмите для подробностей">
        {getVersionString()}
      </div>
    )
  }

  return (
    <div className="relative">
      <div 
        className="text-xs text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Информация о версии"
      >
        {getVersionString()}
      </div>
      
      {isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg z-50 min-w-64">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-dnd-gold">DnD 5e Game</span>
              <button 
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Версия:</span>
                <span className="text-white font-mono">{versionInfo.version}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Название:</span>
                <span className="text-white">{versionInfo.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Сборка:</span>
                <span className="text-white">{versionInfo.buildDate}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Режим:</span>
                <span className="text-white">{process.env.NODE_ENV || 'development'}</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-600">
              <div className="text-xs text-gray-500">
                🚀 Синхронизация между пользователями
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VersionInfo
