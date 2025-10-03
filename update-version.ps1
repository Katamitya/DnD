# Скрипт для обновления версии DnD приложения

Write-Host "🚀 Обновление версии DnD приложения..." -ForegroundColor Green

# Запускаем скрипт обновления версии
node update-version.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Версия успешно обновлена!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Следующие шаги:" -ForegroundColor Yellow
    Write-Host "1. git add ." -ForegroundColor Cyan
    Write-Host "2. git commit -m 'feat: Описание изменений - версия X.XX'" -ForegroundColor Cyan
    Write-Host "3. git push" -ForegroundColor Cyan
} else {
    Write-Host "❌ Ошибка при обновлении версии" -ForegroundColor Red
}
