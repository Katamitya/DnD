#!/usr/bin/env node

// Скрипт для автоматического обновления версии
const fs = require('fs')
const path = require('path')

// Читаем текущую версию из package.json
const packagePath = path.join(__dirname, 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

// Получаем текущую версию
const currentVersion = packageJson.version
const [major, minor] = currentVersion.split('.').map(Number)

// Увеличиваем минорную версию на 0.01
const newMinor = minor + 1
const newVersion = `${major}.${newMinor.toString().padStart(2, '0')}`

// Обновляем package.json
packageJson.version = newVersion
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))

// Обновляем version.js
const versionPath = path.join(__dirname, 'src/utils/version.js')
let versionContent = fs.readFileSync(versionPath, 'utf8')

// Заменяем версию в version.js
versionContent = versionContent.replace(
  /export const VERSION = '[^']*'/,
  `export const VERSION = '${newVersion}'`
)

// Обновляем дату сборки
const buildDate = new Date().toISOString().split('T')[0]
versionContent = versionContent.replace(
  /export const BUILD_DATE = '[^']*'/,
  `export const BUILD_DATE = '${buildDate}'`
)

fs.writeFileSync(versionPath, versionContent)

console.log(`🚀 Версия обновлена: ${currentVersion} → ${newVersion}`)
console.log(`📅 Дата сборки: ${buildDate}`)
console.log(`\n📋 Следующие шаги:`)
console.log(`1. git add .`)
console.log(`2. git commit -m "feat: Описание изменений - версия ${newVersion}"`)
console.log(`3. git push`)
