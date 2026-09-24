# 🚀 SAVAUTO DIGITAL - Production Deployment Guide

## 📋 Что нужно для запуска:

1. **GitHub аккаунт** (бесплатно)
2. **Railway аккаунт** (бесплатно, $5 кредит)
3. **Vercel аккаунт** (бесплатно)
4. **Telegram Bot Token** (уже есть)

---

## 🎯 Шаг 1: Подготовка проекта

### 1.1 Создайте `.env.production` для backend

```bash
cd backend
cp .env.example .env.production
```

Заполните `.env.production`:

```env
NODE_ENV=production
PORT=4000

# Database (Railway предоставит)
DATABASE_URL=postgresql://user:pass@host:port/db

# JWT
JWT_SECRET=very-long-random-string-min-32-chars

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_WEBHOOK_URL=https://your-backend-url.com/api/v1/telegram/webhook

# CORS
CORS_ORIGINS=https://your-frontend-url.vercel.app

# First Admin
FIRST_ADMIN_EMAIL=admin@savauto.ru
FIRST_ADMIN_PASSWORD=ChangeThisPassword123!
```

### 1.2 Создайте `Procfile` для Railway

```bash
echo "web: node dist/server.js" > backend/Procfile
```

---

## 🗄 Шаг 2: Настройка PostgreSQL на Railway

### 2.1 Создайте проект на Railway

1. Зайдите на https://railway.app
2. Нажмите "New Project"
3. Выберите "Deploy from GitHub repo"
4. Выберите ваш репозиторий

### 2.2 Добавьте PostgreSQL

1. В проекте нажмите "New" → "Database" → "PostgreSQL"
2. Скопируйте `DATABASE_URL` из переменных окружения
3. Вставьте в `backend/.env.production`

### 2.3 Задеплойте backend

1. Railway автоматически задеплоит из GitHub
2. Добавьте переменные окружения в Railway Dashboard:
   - `NODE_ENV=production`
   - `JWT_SECRET=...`
   - `TELEGRAM_BOT_TOKEN=...`
   - `FIRST_ADMIN_EMAIL=admin@savauto.ru`
   - `FIRST_ADMIN_PASSWORD=...`

### 2.4 Запустите миграции

В Railway Dashboard → ваш backend сервис → "Shell":

```bash
npm run db:migrate
npm run db:seed
```

---

## 🌐 Шаг 3: Деплой Frontend на Vercel

### 3.1 Создайте `.env.production` для frontend

```bash
VITE_API_URL=https://your-backend-url.up.railway.app/api/v1
```

### 3.2 Задеплойте на Vercel

1. Зайдите на https://vercel.com
2. Нажмите "New Project"
3. Импортируйте GitHub репозиторий
4. Vercel автоматически определит Vite
5. Добавьте переменную окружения:
   - `VITE_API_URL=https://your-backend-url.up.railway.app/api/v1`
6. Нажмите "Deploy"

---

## 🤖 Шаг 4: Настройка Telegram Bot

### 4.1 Обновите webhook

После деплоя backend, установите webhook:

```bash
curl -X POST https://your-backend-url.up.railway.app/api/v1/telegram/webhook
```

Или через Telegram Bot API:

```bash
curl "https://api.telegram.org/botYOUR_TOKEN/setWebhook?url=https://your-backend-url.up.railway.app/api/v1/telegram/webhook"
```

### 4.2 Обновите Mini App URL

В `bot/.env.production`:

```env
MINI_APP_URL=https://your-frontend-url.vercel.app/app
```

---

## ✅ Шаг 5: Проверка

1. **Frontend**: https://your-frontend-url.vercel.app
2. **Backend Health**: https://your-backend-url.up.railway.app/health
3. **Admin Login**: войдите с `admin@savauto.ru` / `ChangeThisPassword123!`
4. **Telegram Bot**: отправьте `/start` вашему боту
5. **Mini App**: нажмите "Открыть App" в боте

---

## 🔧 Альтернатива: Render (бесплатно)

Если хотите бесплатно:

### Frontend на Render:
1. https://render.com → "New Static Site"
2. Подключите GitHub
3. Build Command: `npm run build`
4. Publish Directory: `dist`

### Backend на Render:
1. "New Web Service"
2. Подключите GitHub
3. Build Command: `cd backend && npm install && npm run build`
4. Start Command: `cd backend && npm start`

### PostgreSQL на Render:
1. "New PostgreSQL"
2. Скопируйте connection string
3. Вставьте в backend env

**Минус**: backend засыпает через 15 мин неактивности

---

## 📊 Стоимость

| Сервис | Цена | Что включает |
|--------|------|--------------|
| **Railway** | $5/мес | Backend + PostgreSQL + Domain |
| **Vercel** | Бесплатно | Frontend + CDN |
| **Render** | Бесплатно | Frontend + Backend (засыпает) |
| **VPS** | $5-10/мес | Полный контроль |

---

## 🎯 Быстрый старт (Railway)

```bash
# 1. Запушьте код в GitHub
git add .
git commit -m "Production ready"
git push

# 2. Создайте проект на Railway
# 3. Добавьте PostgreSQL
# 4. Заполните env переменные
# 5. Запустите миграции
# 6. Задеплойте frontend на Vercel
# 7. Настройте Telegram webhook
```

---

## 📞 Поддержка

Если что-то не работает:
1. Проверьте логи в Railway Dashboard
2. Проверьте логи в Vercel Dashboard
3. Проверьте webhook через https://api.telegram.org/botTOKEN/getWebhookInfo

---

**Готово! У вас будет production-ready приложение!** 🚀
