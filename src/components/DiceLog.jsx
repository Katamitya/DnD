import React from 'react'

const DiceLog = ({ logs, isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-[600px] max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-fantasy text-dnd-gold">📋 История бросков</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-2">🎲</div>
              <p>Пока нет бросков кубиков</p>
              <p className="text-sm">Бросьте кубики, чтобы увидеть историю</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="bg-gray-700 rounded-lg p-4 border-l-4 border-dnd-gold"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-dnd-blue">{log.player}</span>
                    <span className="text-sm text-gray-400">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300">Кубики:</span>
                      <span className="font-mono bg-gray-600 px-2 py-1 rounded text-sm">
                        {log.dice}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300">Результаты:</span>
                      <span className="font-mono bg-gray-600 px-2 py-1 rounded text-sm">
                        {log.results}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300">Сумма:</span>
                      <span className="text-xl font-bold text-dnd-gold">
                        {log.total}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {logs.length > 0 && (
            <div className="border-t border-gray-600 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  Всего бросков: {logs.length}
                </span>
                <button
                  onClick={() => window.print()}
                  className="btn-secondary text-sm"
                >
                  🖨️ Печать
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DiceLog



