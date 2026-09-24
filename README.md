# 🚗 SAVAUTO DIGITAL

Платформа для импорта автомобилей из Китая, Кореи, Японии.

**Admin Panel** для сотрудников + **Telegram Mini App** для клиентов.

---

## 📦 Что внутри

```
savauto-digital/
├── 📱 Frontend (React + TypeScript)
│   ├── Admin Panel — CRM для сотрудников
│   └── Mini App — для клиентов в Telegram
│
├── 🖥 Backend (Node.js + Express)
│   ├── REST API
│   ├── JWT Authentication
│   ├── PostgreSQL
│   └── RBAC (роли и права)
│
├── 🤖 Telegram Bot
│   ├── Команды: /start, /mycars, /payments
│   ├── Mini App интеграция
│   └── Уведомления
│
└── 🐳 Docker Compose
    ├── PostgreSQL
    └── Redis
```

---

## 🚀 Быстрый старт

### 1. Установите зависимости

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

**Bot:**
```bash
cd bot
npm install
cd ..
```

### 2. Настройте базу данных

**Вариант A: Docker (проще)**
```bash
docker compose up postgres redis -d
```

**Вариант B: Локальный PostgreSQL**
```sql
CREATE DATABASE savauto;
CREATE USER savauto WITH PASSWORD 'savauto_dev_password';
GRANT ALL PRIVILEGES ON DATABASE savauto TO savauto;
```

### 3. Запустите backend

```bash
cd backend
copy .env.example .env
npm run db:seed
npm run dev
```

Должно появиться: `🚀 SAVAUTO API running on port 4000`

### 4. Запустите frontend

В новом окне PowerShell:
```bash
npm run dev
```

Должно появиться: `http://localhost:3000`

### 5. Откройте админку

```
http://localhost:3000
```

**Вход:**
- Email: `admin@savauto.ru`
- Пароль: `demo123`

---

## 🤖 Telegram Bot

### 1. Создайте бота

1. Откройте @BotFather в Telegram
2. Отправьте `/newbot`
3. Придумайте имя и username
4. Скопируйте токен

### 2. Настройте бота

```bash
cd bot
copy .env.example .env
notepad .env
```

Заполните:
```env
TELEGRAM_BOT_TOKEN=ваш_токен_от_BotFather
MINI_APP_URL=http://localhost:3000/app
PORT=3001
```

### 3. Запустите бота

```bash
npm start
```

### 4. Проверьте

1. Откройте вашего бота в Telegram
2. Отправьте `/start`
3. Должны получить ответ с кнопками

---

## 📱 Разделы

### Admin Panel (http://localhost:3000)

| URL | Раздел |
|-----|--------|
| `/dashboard` | Дашборд с аналитикой |
| `/clients` | Клиенты |
| `/leads` | Лиды |
| `/deals` | Сделки |
| `/cars` | Автомобили |
| `/cars/kanban` | Канбан-доска |
| `/payments` | Платежи |
| `/tasks` | Задачи |
| `/documents` | Документы |
| `/support` | Поддержка |
| `/notifications` | Уведомления |
| `/settings` | Настройки |

### Telegram Mini App

| URL | Раздел |
|-----|--------|
| `/app` | Главная |
| `/app/cars` | Мои автомобили |
| `/app/notifications` | Уведомления |
| `/app/support` | Поддержка |
| `/app/profile` | Профиль |

---

## 🛠 Технологии

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS 4
- React Router 6
- Recharts (графики)
- Lucide React (иконки)

**Backend:**
- Node.js + Express
- TypeScript
- PostgreSQL
- JWT (аутентификация)
- RBAC (роли и права)
- Zod (валидация)

**Bot:**
- node-telegram-bot-api
- Express (health check)

---

## 📊 Структура проекта

```
src/
├── App.tsx                 # Роутер
├── main.tsx                # Точка входа
├── index.css               # Стили
├── types/                  # TypeScript типы
│   └── index.ts
├── data/                   # Mock-данные
│   └── mockData.ts
├── layouts/                # Layouts
│   ├── AdminLayout.tsx
│   └── MiniAppLayout.tsx
└── pages/
    ├── LoginPage.tsx
    ├── admin/              # Админка
    │   ├── DashboardPage.tsx
    │   ├── ClientsPage.tsx
    │   ├── CarsPage.tsx
    │   └── ...
    └── miniapp/            # Mini App
        ├── MiniAppHome.tsx
        ├── MiniAppCars.tsx
        └── ...

backend/
├── src/
│   ├── index.ts            # Сервер
│   ├── config.ts           # Конфигурация
│   ├── db/                 # База данных
│   │   ├── schema.sql      # Схема
│   │   ├── seed.ts         # Демо-данные
│   │   └── client.ts       # Подключение
│   ├── routes/             # API endpoints
│   │   ├── auth.ts
│   │   ├── clients.ts
│   │   ├── cars.ts
│   │   └── telegram.ts
│   └── middleware/         # Auth, RBAC
│       └── auth.ts
└── .env.example

bot/
├── bot.js                  # Бот
├── diagnose.js             # Диагностика
└── .env.example
```

---

## 🔐 Безопасность

✅ JWT tokens (access + refresh)  
✅ Password hashing (bcrypt)  
✅ RBAC (роли и права)  
✅ Multi-tenancy (изоляция компаний)  
✅ IDOR protection  
✅ Rate limiting  
✅ Telegram WebApp validation  
✅ Audit logging  
✅ Input validation (Zod)  
✅ SQL injection protection  

---

## 📡 API Endpoints

```
POST /api/v1/auth/login          # Войти
POST /api/v1/auth/refresh        # Обновить токен
GET  /api/v1/auth/me             # Текущий пользователь

GET    /api/v1/clients           # Список клиентов
POST   /api/v1/clients           # Создать
PATCH  /api/v1/clients/:id       # Обновить
DELETE /api/v1/clients/:id       # Удалить

GET    /api/v1/cars              # Список авто
POST   /api/v1/cars/:id/transition  # Изменить статус
GET    /api/v1/cars/:id/timeline    # Timeline

POST /api/v1/telegram/validate   # Валидация Mini App
POST /api/v1/telegram/webhook    # Webhook
POST /api/v1/telegram/link       # Привязать Telegram
```

---

## 🐛 Troubleshooting

### Бот не отвечает

1. Проверьте токен в `bot/.env`
2. Запустите диагностику: `node bot/diagnose.js`
3. Проверьте логи в PowerShell

### Frontend не открывается

1. Проверьте что `npm run dev` запущен
2. Откройте http://localhost:3000
3. Посмотрите ошибки в консоли браузера (F12)

### Backend не подключается к БД

1. Проверьте что PostgreSQL запущен
2. Проверьте `DATABASE_URL` в `backend/.env`
3. Проверьте что база `savauto` создана

### Порт занят

```powershell
# Найти процесс
netstat -ano | findstr :3000

# Убить
taskkill /PID 12345 /F
```

---

## 📚 Документация

- `bot/README.md` — Telegram Bot
- `bot/TROUBLESHOOTING.md` — Проблемы с ботом

---

## 🎯 Следующие шаги

**Phase 1 (MVP) — ✅ Готово**
- [x] Frontend (Admin + Mini App)
- [x] Backend API (auth, clients, cars)
- [x] Database schema
- [x] Telegram Bot

**Phase 2 (Production)**
- [ ] Payments (Stripe/ЮKassa)
- [ ] Email notifications (SendGrid)
- [ ] File storage (MinIO/S3)
- [ ] Reports & analytics

---

## 💡 Демо-доступ

**Admin Panel:**
- URL: http://localhost:3000
- Email: `admin@savauto.ru`
- Password: `demo123`

**Telegram Bot:**
- Найдите вашего бота в Telegram
- Отправьте `/start`

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в PowerShell
2. Запустите `node bot/diagnose.js`
3. Проверьте `.env` файлы
4. Перезапустите компоненты

---

## 🎉 Готово!

Теперь у вас есть полноценная платформа для импорта автомобилей:
- ✅ CRM для сотрудников
- ✅ Mini App для клиентов
- ✅ Telegram Bot
- ✅ Backend API
- ✅ База данных

**Запускайте и работайте!** 🚗💨

---

**Версия:** 1.0.0  
**Лицензия:** © SAVAUTO DIGITAL
#   s a v a u t o - d i g i t a l 2  
 