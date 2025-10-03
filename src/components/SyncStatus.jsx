import React, { useState, useEffect } from 'react'
import syncManager from '../utils/syncManager'

const SyncStatus = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsConnecting(true)
        await syncManager.connect()
        setIsConnected(syncManager.isConnected)
      } catch (error) {
        console.warn('Sync connection failed:', error)
        setIsConnected(false)
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
    return (
      <div className="flex items-center space-x-2 text-sm text-green-500">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>Синхронизировано</span>
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
