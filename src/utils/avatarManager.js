// Утилиты для управления аватарами персонажей

// Конвертация файла изображения в base64
export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      resolve(e.target.result)
    }
    
    reader.onerror = () => {
      reject(new Error('Ошибка чтения файла изображения'))
    }
    
    reader.readAsDataURL(file)
  })
}

// Валидация файла изображения
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Поддерживаются только изображения: JPEG, PNG, GIF, WebP'
    }
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Размер файла не должен превышать 5MB'
    }
  }
  
  return { valid: true }
}

// Создание миниатюры изображения
export const createThumbnail = (base64Image, maxWidth = 100, maxHeight = 100) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Вычисляем размеры миниатюры
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // Рисуем миниатюру
      ctx.drawImage(img, 0, 0, width, height)
      
      // Конвертируем в base64 с качеством 0.8
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
      resolve(thumbnail)
    }
    
    img.src = base64Image
  })
}

// Создание круглой миниатюры для фишки
export const createCircularThumbnail = (base64Image, size = 60) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      canvas.width = size
      canvas.height = size
      
      // Создаем круглую маску
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI)
      ctx.clip()
      
      // Рисуем изображение по центру
      const scale = Math.max(size / img.width, size / img.height)
      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale
      const x = (size - scaledWidth) / 2
      const y = (size - scaledHeight) / 2
      
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
      
      const thumbnail = canvas.toDataURL('image/jpeg', 0.9)
      resolve(thumbnail)
    }
    
    img.src = base64Image
  })
}

// Загрузка аватара с валидацией и созданием миниатюр
export const uploadAvatar = async (file) => {
  try {
    // Валидируем файл
    const validation = validateImageFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }
    
    // Конвертируем в base64
    const base64Image = await convertImageToBase64(file)
    
    // Создаем миниатюры
    const thumbnail = await createThumbnail(base64Image, 100, 100)
    const circularThumbnail = await createCircularThumbnail(base64Image, 60)
    
    return {
      original: base64Image,
      thumbnail,
      circularThumbnail,
      filename: file.name,
      size: file.size,
      type: file.type
    }
  } catch (error) {
    throw new Error(`Ошибка загрузки аватара: ${error.message}`)
  }
}

// Получение аватара по умолчанию
export const getDefaultAvatar = (characterName) => {
  // Создаем простой аватар с инициалами
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const size = 60
  
  canvas.width = size
  canvas.height = size
  
  // Фон
  ctx.fillStyle = '#4B5563'
  ctx.fillRect(0, 0, size, size)
  
  // Инициалы
  const initials = characterName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
  
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 20px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(initials, size / 2, size / 2)
  
  return canvas.toDataURL()
}

// Проверка существования аватара
export const avatarExists = (avatar) => {
  return avatar && avatar.original && avatar.original.startsWith('data:image')
}

// Получение URL аватара для отображения
export const getAvatarUrl = (avatar, type = 'circular') => {
  if (!avatarExists(avatar)) {
    return null
  }
  
  switch (type) {
    case 'original':
      return avatar.original
    case 'thumbnail':
      return avatar.thumbnail || avatar.original
    case 'circular':
    default:
      return avatar.circularThumbnail || avatar.thumbnail || avatar.original
  }
}



