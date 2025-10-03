// Система версионирования DnD приложения

export const VERSION = '1.02'
export const VERSION_NAME = 'Initial Sync Release'
export const BUILD_DATE = '2025-10-03'

// Получить полную информацию о версии
export const getVersionInfo = () => {
  return {
    version: VERSION,
    name: VERSION_NAME,
    buildDate: BUILD_DATE,
    fullVersion: `${VERSION} (${VERSION_NAME})`
  }
}

// Получить краткую версию для отображения
export const getVersionString = () => {
  return `v${VERSION}`
}

// Получить следующую версию (для автоматического обновления)
export const getNextVersion = (currentVersion) => {
  const [major, minor] = currentVersion.split('.').map(Number)
  const newMinor = minor + 1
  return `${major}.${newMinor.toString().padStart(2, '0')}`
}

// Проверить, нужно ли обновить версию
export const shouldUpdateVersion = (lastCommitDate) => {
  const lastUpdate = new Date(lastCommitDate)
  const now = new Date()
  const diffInHours = (now - lastUpdate) / (1000 * 60 * 60)
  
  // Если прошло больше 1 часа с последнего коммита, предлагаем обновить версию
  return diffInHours > 1
}

// Получить информацию о сборке
export const getBuildInfo = () => {
  return {
    version: VERSION,
    name: VERSION_NAME,
    buildDate: BUILD_DATE,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  }
}
