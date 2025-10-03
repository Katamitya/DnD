FROM node:20-alpine

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Устанавливаем serve для раздачи статических файлов
RUN npm install -g serve

# Открываем порт
EXPOSE 9000

# Запускаем приложение
CMD ["serve", "-s", "dist", "-l", "9000"]

