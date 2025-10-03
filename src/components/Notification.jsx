import React, { useEffect } from 'react'

const Notification = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-500'
      case 'error':
        return 'bg-red-600 border-red-500'
      case 'warning':
        return 'bg-yellow-600 border-yellow-500'
      default:
        return 'bg-dnd-blue border-blue-500'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${getTypeStyles()} border rounded-lg shadow-lg p-4 text-white`}>
      <div className="flex items-start space-x-3">
        <div className="text-xl">{getIcon()}</div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 text-lg font-bold"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default Notification



