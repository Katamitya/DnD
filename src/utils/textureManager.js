// Утилита для управления текстурами карт
const TEXTURE_STORAGE_KEY = 'dnd-map-textures'

// Базовые текстуры по умолчанию
const DEFAULT_TEXTURES = {
  grass: {
    id: 'grass',
    name: 'Трава',
    color: '#4ade80',
    type: 'color',
    description: 'Зеленый цвет для травы'
  },
  water: {
    id: 'water',
    name: 'Вода',
    color: '#3b82f6',
    type: 'color',
    description: 'Синий цвет для воды'
  },
  stone: {
    id: 'stone',
    name: 'Камень',
    color: '#6b7280',
    type: 'color',
    description: 'Серый цвет для камня'
  },
  sand: {
    id: 'sand',
    name: 'Песок',
    color: '#fbbf24',
    type: 'color',
    description: 'Желтый цвет для песка'
  },
  forest: {
    id: 'forest',
    name: 'Лес',
    color: '#059669',
    type: 'color',
    description: 'Темно-зеленый цвет для леса'
  },
  mountain: {
    id: 'mountain',
    name: 'Горы',
    color: '#7c3aed',
    type: 'color',
    description: 'Фиолетовый цвет для гор'
  },
  lava: {
    id: 'lava',
    name: 'Лава',
    color: '#dc2626',
    type: 'color',
    description: 'Красный цвет для лавы'
  },
  ice: {
    id: 'ice',
    name: 'Лед',
    color: '#93c5fd',
    type: 'color',
    description: 'Светло-синий цвет для льда'
  }
}

// Получить все текстуры
export const getAllTextures = () => {
  try {
    const savedTextures = localStorage.getItem(TEXTURE_STORAGE_KEY)
    if (savedTextures) {
      const parsed = JSON.parse(savedTextures)
      // Объединяем базовые текстуры с сохраненными
      return { ...DEFAULT_TEXTURES, ...parsed }
    }
    return DEFAULT_TEXTURES
  } catch (error) {
    console.error('Error loading textures:', error)
    return DEFAULT_TEXTURES
  }
}

// Сохранить текстуры
export const saveTextures = (textures) => {
  try {
    // Сохраняем только пользовательские текстуры (не базовые)
    const userTextures = {}
    Object.keys(textures).forEach(key => {
      if (!DEFAULT_TEXTURES[key]) {
        userTextures[key] = textures[key]
      }
    })
    localStorage.setItem(TEXTURE_STORAGE_KEY, JSON.stringify(userTextures))
    return true
  } catch (error) {
    console.error('Error saving textures:', error)
    return false
  }
}

// Добавить новую текстуру
export const addTexture = (texture) => {
  try {
    const textures = getAllTextures()
    const newTexture = {
      ...texture,
      id: texture.id || `texture_${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    
    textures[newTexture.id] = newTexture
    saveTextures(textures)
    return true
  } catch (error) {
    console.error('Error adding texture:', error)
    return false
  }
}

// Удалить текстуру
export const removeTexture = (textureId) => {
  try {
    // Нельзя удалить базовые текстуры
    if (DEFAULT_TEXTURES[textureId]) {
      console.warn('Cannot remove default texture:', textureId)
      return false
    }
    
    const textures = getAllTextures()
    delete textures[textureId]
    saveTextures(textures)
    return true
  } catch (error) {
    console.error('Error removing texture:', error)
    return false
  }
}

// Обновить текстуру
export const updateTexture = (textureId, updates) => {
  try {
    const textures = getAllTextures()
    if (textures[textureId]) {
      textures[textureId] = {
        ...textures[textureId],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      saveTextures(textures)
      return true
    }
    return false
  } catch (error) {
    console.error('Error updating texture:', error)
    return false
  }
}

// Получить текстуру по ID
export const getTexture = (textureId) => {
  const textures = getAllTextures()
  return textures[textureId] || null
}

// Загрузить изображение как текстуру
export const loadImageAsTexture = async (file, name) => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const texture = {
          id: `img_${Date.now()}`,
          name: name || file.name,
          type: 'image',
          data: e.target.result,
          fileSize: file.size,
          mimeType: file.type,
          createdAt: new Date().toISOString()
        }
        
        resolve(texture)
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  } catch (error) {
    console.error('Error loading image as texture:', error)
    throw error
  }
}

// Сбросить все текстуры к базовым
export const resetToDefaultTextures = () => {
  try {
    localStorage.removeItem(TEXTURE_STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Error resetting textures:', error)
    return false
  }
}

// Получить статистику текстур
export const getTextureStats = () => {
  const textures = getAllTextures()
  const defaultCount = Object.keys(DEFAULT_TEXTURES).length
  const userCount = Object.keys(textures).length - defaultCount
  
  return {
    total: Object.keys(textures).length,
    default: defaultCount,
    user: userCount,
    colors: Object.values(textures).filter(t => t.type === 'color').length,
    images: Object.values(textures).filter(t => t.type === 'image').length
  }
}



