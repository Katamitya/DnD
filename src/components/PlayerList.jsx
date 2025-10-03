import React from 'react'

const PlayerList = ({ players, currentPlayer, onPlayerSelect, selectedPlayer }) => {
  const getPlayerStatus = (player) => {
    if (player.id === currentPlayer.id) {
      return { text: 'Вы', color: 'text-dnd-gold', bgColor: 'bg-dnd-gold bg-opacity-20' }
    }
    if (player.nickname === 'Мастер') {
      return { text: 'DM', color: 'text-dnd-purple', bgColor: 'bg-dnd-purple bg-opacity-20' }
    }
    return { text: 'Игрок', color: 'text-dnd-blue', bgColor: 'bg-dnd-blue bg-opacity-20' }
  }

  const getPlayerPosition = (player) => {
    if (player.id === currentPlayer.id) {
      return 'Центр поля'
    }
    return 'Позиция не определена'
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-fantasy text-dnd-gold mb-2">
          Участники партии
        </h3>
        <p className="text-sm text-gray-400">
          {players.length} игроков
        </p>
      </div>

      <div className="space-y-3">
        {players.map((player) => {
          const status = getPlayerStatus(player)
          const position = getPlayerPosition(player)
          const isSelected = selectedPlayer && selectedPlayer.id === player.id
          
          return (
            <div
              key={player.id}
              onClick={() => onPlayerSelect(player)}
              className={`player-list-item cursor-pointer p-3 rounded-lg border transition-all duration-200 ${
                isSelected 
                  ? 'border-dnd-gold bg-dnd-gold bg-opacity-20' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Цветной индикатор игрока */}
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white"
                  style={{ backgroundColor: player.color }}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white truncate">
                      {player.nickname}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${status.bgColor} ${status.color}`}>
                      {status.text}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-1">
                    {position}
                  </p>
                </div>
              </div>
              
              {/* Дополнительная информация при выборе */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="text-xs text-gray-300 space-y-1">
                    <p><span className="text-gray-400">ID:</span> {player.id}</p>
                    <p><span className="text-gray-400">Цвет:</span> 
                      <span 
                        className="inline-block w-3 h-3 rounded-full ml-2 border border-white"
                        style={{ backgroundColor: player.color }}
                      />
                    </p>
                    <p><span className="text-gray-400">Позиция:</span> {position}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Информация о партии */}
      <div className="mt-6 p-3 bg-gray-700 rounded-lg">
        <h4 className="text-sm font-semibold text-dnd-gold mb-2">
          Информация о партии
        </h4>
        <div className="text-xs text-gray-300 space-y-1">
          <p>• Текущий игрок: {currentPlayer.nickname}</p>
          <p>• Позиция: Центр поля</p>
          <p>• Статус: Готов к игре</p>
        </div>
      </div>
    </div>
  )
}

export default PlayerList

