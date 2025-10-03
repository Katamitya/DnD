import React, { useState } from 'react'

const DiceRoller = ({ isOpen, onClose, currentPlayer, onLogRoll }) => {
  const [selectedDice, setSelectedDice] = useState([])
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [isRolling, setIsRolling] = useState(false)

  // Все доступные типы кубиков с иконками
  const diceTypes = [
    { type: 'd4', icon: '🔸', sides: 4, color: 'bg-red-600' },
    { type: 'd6', icon: '🎲', sides: 6, color: 'bg-blue-600' },
    { type: 'd8', icon: '🔷', sides: 8, color: 'bg-green-600' },
    { type: 'd10', icon: '🔶', sides: 10, color: 'bg-yellow-600' },
    { type: 'd12', icon: '🔻', sides: 12, color: 'bg-purple-600' },
    { type: 'd20', icon: '🎯', sides: 20, color: 'bg-indigo-600' },
    { type: 'd100', icon: '💯', sides: 100, color: 'bg-pink-600' }
  ]

  // Добавление кубика в выбор
  const addDice = (diceType) => {
    setSelectedDice(prev => [...prev, diceType])
  }

  // Удаление кубика из выбора
  const removeDice = (index) => {
    setSelectedDice(prev => prev.filter((_, i) => i !== index))
  }

  // Очистка выбора
  const clearSelection = () => {
    setSelectedDice([])
    setResults([])
    setTotal(0)
  }

  // Бросок выбранных кубиков
  const rollDice = () => {
    if (selectedDice.length === 0) return

    setIsRolling(true)
    
    // Имитация анимации броска
    setTimeout(() => {
      const newResults = []
      let newTotal = 0
      
      selectedDice.forEach(dice => {
        const roll = Math.floor(Math.random() * dice.sides) + 1
        newResults.push({ dice: dice, roll: roll })
        newTotal += roll
      })
      
      setResults(newResults)
      setTotal(newTotal)
      setIsRolling(false)
      
      // Логируем результат
      if (onLogRoll && currentPlayer) {
        const diceString = selectedDice.map(d => d.type).join(', ')
        onLogRoll({
          player: currentPlayer.nickname,
          dice: diceString,
          results: newResults.map(r => `${r.dice.type}: ${r.roll}`).join(', '),
          total: newTotal
        })
      }
    }, 500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-[500px] max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-fantasy text-dnd-gold">🎲 Бросок костей</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Выбор кубиков */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Выберите кубики (нажмите на иконки):
            </label>
            <div className="grid grid-cols-7 gap-2 mb-3">
              {diceTypes.map(dice => (
                <button
                  key={dice.type}
                  onClick={() => addDice(dice)}
                  className={`${dice.color} hover:opacity-80 text-white p-3 rounded-lg transition-all duration-200 transform hover:scale-105`}
                  title={`Добавить ${dice.type}`}
                >
                  <div className="text-2xl">{dice.icon}</div>
                  <div className="text-xs font-bold">{dice.type}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Выбранные кубики */}
          {selectedDice.length > 0 && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Выбранные кубики ({selectedDice.length}):
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedDice.map((dice, index) => (
                  <div
                    key={index}
                    className={`${dice.color} text-white px-3 py-2 rounded-lg flex items-center space-x-2`}
                  >
                    <span className="text-lg">{dice.icon}</span>
                    <span className="font-bold">{dice.type}</span>
                    <button
                      onClick={() => removeDice(index)}
                      className="text-white hover:text-red-200 text-sm ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Кнопки управления */}
          <div className="flex space-x-3">
            <button
              onClick={rollDice}
              disabled={selectedDice.length === 0 || isRolling}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRolling ? '🎲 Бросаем...' : '🎲 Бросить кости'}
            </button>
            <button
              onClick={clearSelection}
              className="btn-secondary flex-1"
            >
              🗑️ Очистить
            </button>
          </div>

          {/* Результаты */}
          {results.length > 0 && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Результаты броска:
              </h4>
              <div className="space-y-2 mb-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-600 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{result.dice.icon}</span>
                      <span className="text-gray-300">{result.dice.type}</span>
                    </div>
                    <span className="text-xl font-bold text-dnd-gold">
                      {result.roll}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-center border-t border-gray-600 pt-3">
                <span className="text-lg font-bold text-dnd-gold">
                  Общий результат: {total}
                </span>
              </div>
            </div>
          )}

          {/* Инструкция */}
          <div className="border-t border-gray-600 pt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Как использовать:
            </h4>
            <div className="text-xs text-gray-400 space-y-1">
              <p>• Нажмите на иконки кубиков для выбора</p>
              <p>• Можно выбрать несколько кубиков одного типа</p>
              <p>• Нажмите "Бросить кости" для броска</p>
              <p>• Результаты автоматически логируются</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiceRoller




