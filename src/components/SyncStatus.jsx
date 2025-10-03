import React, { useState, useEffect } from 'react'
import syncManager from '../utils/syncManager'
import cloudSync from '../utils/cloudSync'

const SyncStatus = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [syncType, setSyncType] = useState('offline')

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsConnecting(true)
        
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
    const statusText = syncType === 'server' ? 'Сервер' : 'Облако'
    const statusColor = syncType === 'server' ? 'green' : 'blue'
    
    return (
      <div className={`flex items-center space-x-2 text-sm text-${statusColor}-500`}>
        <div className={`w-2 h-2 bg-${statusColor}-500 rounded-full`}></div>
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
