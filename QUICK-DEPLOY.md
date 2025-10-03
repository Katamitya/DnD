# 🚀 Быстрый деплой DnD приложения

## Самый простой способ (5 минут)

### 1. GitHub Pages (Рекомендуется)

```bash
# 1. Создайте репозиторий на GitHub.com
# 2. Выполните команды:

git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/DND.git
git branch -M main
git push -u origin main

# 3. В настройках репозитория включите GitHub Pages
# 4. Ваше приложение: https://YOUR_USERNAME.github.io/DND/
```

### 2. Vercel (Еще проще)

```bash
# 1. Установите Vercel CLI
npm install -g vercel

# 2. Деплой
vercel

# 3. Следуйте инструкциям в терминале
```

### 3. Автоматический скрипт

**Windows:**
```powershell
.\deploy.ps1
```

**Linux/Mac:**
```bash
./deploy.sh
```

## Что нужно сделать перед деплоем

1. **Убедитесь, что проект собирается:**
   ```bash
   npm install
   npm run build
   ```

2. **Проверьте, что все работает локально:**
   ```bash
   npm run dev
   ```

## После деплоя

- ✅ Приложение доступно в интернете
- ✅ Автоматическое обновление при каждом push
- ✅ HTTPS сертификат включен
- ✅ Быстрая загрузка по всему миру

## Проблемы?

- **Ошибка сборки:** Проверьте `npm run build`
- **Не работает после деплоя:** Проверьте `base: '/DND/'` в `vite.config.js`
- **Git ошибки:** Убедитесь, что репозиторий создан на GitHub

## Следующие шаги

1. Настройте кастомный домен (опционально)
2. Добавьте аналитику (Google Analytics)
3. Настройте CI/CD для автоматического тестирования
