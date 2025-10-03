import React, { useState, useEffect } from 'react'
import syncManager from '../utils/syncManager'
import cloudSync from '../utils/cloudSync'
import githubGistSync from '../utils/githubGistSync'

const SyncStatus = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [syncType, setSyncType] = useState('offline')

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsConnecting(true)
        
        // Пытаемся инициализировать GitHub Gist синхронизацию
        try {
          await githubGistSync.init()
          setSyncType('github')
          setIsConnected(true)
          return
        } catch (error) {
          console.warn('GitHub Gist sync failed, trying cloud sync:', error)
        }
        
        // Инициализируем облачную синхронизацию
        cloudSync.init()
        setSyncType('cloud')
        setIsConnected(true)
        
        // Пытаемся подключиться к серверу
        try {
          await syncManager.connect()
          if (syncManager.isConnected) {
            setSyncType('server')
          }
        } catch (error) {
          console.warn('Server sync failed, using cloud sync:', error)
        }
        
      } catch (error) {
        console.warn('Sync connection failed:', error)
        setIsConnected(false)
        setSyncType('offline')
      } finally {
        setIsConnecting(false)
      }
    }

    checkConnection()

    // Проверяем соединение каждые 30 секунд
    const interval = setInterval(checkConnection, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  if (isConnecting) {
    return (
      <div className="flex items-center space-x-2 text-sm text-yellow-500">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span>Подключение...</span>
      </div>
    )
  }

  if (isConnected) {
    const statusText = syncType === 'server' ? 'Сервер' : 
                      syncType === 'github' ? 'GitHub' : 'Облако'
    const statusColor = syncType === 'server' ? 'green' : 
                       syncType === 'github' ? 'purple' : 'blue'
    
    return (
      <div className={`flex items-center space-x-2 text-sm ${
        syncType === 'server' ? 'text-green-500' : 
        syncType === 'github' ? 'text-purple-500' : 'text-blue-500'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          syncType === 'server' ? 'bg-green-500' : 
          syncType === 'github' ? 'bg-purple-500' : 'bg-blue-500'
        }`}></div>
        <span>Синхронизировано ({statusText})</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
      <span>Офлайн режим</span>
    </div>
  )
}

export default SyncStatus
