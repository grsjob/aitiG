# Тестовое задание AitiGuru

## Запуск проекта

### Режим разработки (Dev mode)

1. Клонировать репозиторий
```bash
   git clone url
   cd название-проекта
```
2. Установить зависимости
```bash
   npm install
```
3. Запустить dev сервер
```bash
    npm run dev
```

### Режим продакшена (Prod mode)
Запуск через Docker
1. Собрать Docker образ
```bash
   docker build -t aitiguru .
```
2. Запустить контейнер
```bash
   docker run -p 3000:80 aitiguru
```

### Приложение будет доступно: http://localhost:3000
