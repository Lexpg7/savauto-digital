/**
 * SAVAUTO DIGITAL — Telegram Bot
 * Простая и рабочая версия
 */

import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загрузка .env
config({ path: join(__dirname, '.env') });

// ============================================
// ПРОВЕРКА ТОКЕНА
// ============================================

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
  console.error('');
  console.error('❌ ОШИБКА: TELEGRAM_BOT_TOKEN не установлен!');
  console.error('');
  console.error('📝 Что делать:');
  console.error('1. Откройте файл bot/.env');
  console.error('2. Добавьте строку: TELEGRAM_BOT_TOKEN=ваш_токен');
  console.error('3. Токен получите у @BotFather в Telegram');
  console.error('');
  process.exit(1);
}

// Проверка формата токена
if (!TOKEN.match(/^\d+:[A-Za-z0-9_-]+$/)) {
  console.error('');
  console.error('❌ ОШИБКА: Неверный формат токена!');
  console.error('Токен должен выглядеть как: 123456789:AAH...');
  console.error('Ваш токен: ' + TOKEN.substring(0, 20) + '...');
  console.error('');
  process.exit(1);
}

console.log('✅ Токен получен: ' + TOKEN.substring(0, 10) + '...');

// ============================================
// КОНФИГУРАЦИЯ
// ============================================

const PORT = process.env.PORT || 3001;
const MINI_APP_URL = process.env.MINI_APP_URL || 'http://localhost:3000/app';
const ADMIN_ID = process.env.ADMIN_TELEGRAM_ID;

// ============================================
// ДЕМО ДАННЫЕ
// ============================================

const demoClient = {
  id: 'c-001',
  first_name: 'Андрей',
  last_name: 'Николаев',
  phone: '+7 (916) 111-22-33',
  cars: [
    {
      id: 'car-001',
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      status: 'IN_TRANSIT',
      status_label: '🚛 В пути',
      location: 'Владивосток → Москва',
      estimated_delivery: '15 декабря 2024',
      photo: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
      paid: 2500000,
      total: 3200000,
    },
    {
      id: 'car-005',
      make: 'Kia',
      model: 'K5',
      year: 2023,
      status: 'DELIVERED',
      status_label: '✅ Выдан',
      location: 'Москва',
      estimated_delivery: '15 сентября 2024',
      photo: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400',
      paid: 2550000,
      total: 2550000,
    }
  ]
};

// ============================================
// СОЗДАНИЕ БОТА
// ============================================

console.log('🤖 Запускаю бота...');

const bot = new TelegramBot(TOKEN, { 
  polling: {
    params: {
      timeout: 10,
    },
    interval: 100,
  }
});

console.log('✅ Бот создан, слушаю сообщения...');

// ============================================
// ОБРАБОТКА /start
// ============================================

bot.onText(/\/start/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'друг';
    
    console.log(`📩 /start от ${userName} (ID: ${msg.from.id})`);
    
    const welcomeText = `👋 Здравствуйте, ${userName}!

Добро пожаловать в <b>SAVAUTO DIGITAL</b> — ваш персональный помощник по импорту автомобилей.

🚗 Отслеживайте статус ваших авто
💰 Контролируйте платежи  
📄 Получайте документы
💬 Связывайтесь с менеджером

Выберите действие:`;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '🚗 Открыть SAVAUTO App',
            web_app: { url: MINI_APP_URL }
          }
        ],
        [
          { text: '📊 Мои авто', callback_data: 'my_cars' },
          { text: '💰 Платежи', callback_data: 'payments' }
        ],
        [
          { text: '📞 Поддержка', callback_data: 'support' },
          { text: 'ℹ️ Помощь', callback_data: 'help' }
        ]
      ]
    };

    await bot.sendMessage(chatId, welcomeText, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
    
    console.log(`✅ Ответ отправлен ${userName}`);
    
  } catch (error) {
    console.error('❌ Ошибка в /start:', error.message);
  }
});

// ============================================
// ОБРАБОТКА /mycars
// ============================================

bot.onText(/\/mycars/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    console.log(`📩 /mycars от ${msg.from.first_name}`);
    
    for (const car of demoClient.cars) {
      const paidPercent = Math.round((car.paid / car.total) * 100);
      
      const text = `
🚗 <b>${car.make} ${car.model} ${car.year}</b>

${car.status_label}
📍 ${car.location}
📅 Ожидается: ${car.estimated_delivery}

💰 Оплата: ${paidPercent}%
   Оплачено: ${formatMoney(car.paid)}
   Всего: ${formatMoney(car.total)}
      `;

      const keyboard = {
        inline_keyboard: [
          [
            { 
              text: '📱 Подробнее в App', 
              web_app: { url: `${MINI_APP_URL}/cars/${car.id}` } 
            }
          ]
        ]
      };

      await bot.sendPhoto(chatId, car.photo, {
        caption: text,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
    }
    
    console.log('✅ Список авто отправлен');
    
  } catch (error) {
    console.error('❌ Ошибка в /mycars:', error.message);
    await bot.sendMessage(msg.chat.id, '❌ Ошибка при получении списка авто');
  }
});

// ============================================
// ОБРАБОТКА /payments
// ============================================

bot.onText(/\/payments/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    console.log(`📩 /payments от ${msg.from.first_name}`);
    
    let text = '💰 <b>Ваши платежи:</b>\n\n';
    
    for (const car of demoClient.cars) {
      text += `🚗 <b>${car.make} ${car.model}</b>\n`;
      text += `   ✅ Оплачено: ${formatMoney(car.paid)}\n`;
      text += `   📋 Всего: ${formatMoney(car.total)}\n`;
      const remaining = car.total - car.paid;
      if (remaining > 0) {
        text += `   ⏳ Остаток: ${formatMoney(remaining)}\n`;
      }
      text += '\n';
    }

    await bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
    console.log('✅ Платежи отправлены');
    
  } catch (error) {
    console.error('❌ Ошибка в /payments:', error.message);
  }
});

// ============================================
// ОБРАБОТКА /help
// ============================================

bot.onText(/\/help/, async (msg) => {
  try {
    const text = `
📖 <b>Команды SAVAUTO DIGITAL:</b>

/start — Начать работу
/mycars — Мои автомобили
/payments — История платежей
/support — Связаться с поддержкой
/help — Эта справка

💡 Также вы можете использовать Mini App — нажмите кнопку в меню.
    `;

    await bot.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' });
    console.log('✅ Помощь отправлена');
    
  } catch (error) {
    console.error('❌ Ошибка в /help:', error.message);
  }
});

// ============================================
// ОБРАБОТКА /support
// ============================================

bot.onText(/\/support/, async (msg) => {
  try {
    const keyboard = {
      inline_keyboard: [
        [
          { text: '💬 Написать менеджеру', callback_data: 'contact_manager' }
        ],
        [
          { 
            text: '📱 Открыть чат в App', 
            web_app: { url: `${MINI_APP_URL}/support` } 
          }
        ]
      ]
    };

    await bot.sendMessage(msg.chat.id, 
      '📞 <b>Поддержка SAVAUTO</b>\n\nМы на связи с 9:00 до 21:00.\nСреднее время ответа: 15 минут.\n\nВыберите способ связи:',
      { parse_mode: 'HTML', reply_markup: keyboard }
    );
    console.log('✅ Поддержка отправлена');
    
  } catch (error) {
    console.error('❌ Ошибка в /support:', error.message);
  }
});

// ============================================
// ОБРАБОТКА КНОПОК
// ============================================

bot.on('callback_query', async (query) => {
  try {
    const chatId = query.message.chat.id;
    const data = query.data;
    
    console.log(`🔘 Кнопка: ${data} от ${query.from.first_name}`);
    
    // Убираем "часики"
    await bot.answerCallbackQuery(query.id);

    switch (data) {
      case 'my_cars':
        await bot.sendMessage(chatId, '📊 Используйте команду /mycars для просмотра автомобилей');
        break;

      case 'payments':
        await bot.sendMessage(chatId, '💰 Используйте команду /payments для просмотра платежей');
        break;

      case 'support':
        await bot.sendMessage(chatId, '📞 Используйте команду /support для связи с поддержкой');
        break;

      case 'help':
        await bot.sendMessage(chatId, 'ℹ️ Используйте команду /help для списка команд');
        break;

      case 'contact_manager':
        await bot.sendMessage(chatId, 
          '💬 Напишите ваш вопрос, и мы перешлём его менеджеру.\n\nИли позвоните: +7 (495) 123-45-67'
        );
        break;

      default:
        await bot.sendMessage(chatId, 'Команда не распознана');
    }
    
  } catch (error) {
    console.error('❌ Ошибка в callback:', error.message);
  }
});

// ============================================
// ОБРАБОТКА ТЕКСТА (для поддержки)
// ============================================

bot.on('message', async (msg) => {
  // Пропускаем команды
  if (msg.text?.startsWith('/')) return;
  if (msg.callback_query) return;
  if (!msg.text) return;

  try {
    const chatId = msg.chat.id;
    
    console.log(`💬 Сообщение от ${msg.from.first_name}: "${msg.text}"`);
    
    await bot.sendMessage(chatId, 
      `💬 Ваше сообщение получено!\n\nМенеджер ответит в течение 15 минут.\n\nВы написали: "${msg.text}"`
    );
    
    // Уведомить админа
    if (ADMIN_ID) {
      await bot.sendMessage(ADMIN_ID, 
        `📨 Новое сообщение от клиента:\n\n` +
        `👤 ${msg.from.first_name} ${msg.from.last_name || ''}\n` +
        `💬 "${msg.text}"`
      );
    }
    
  } catch (error) {
    console.error('❌ Ошибка обработки сообщения:', error.message);
  }
});

// ============================================
// УТИЛИТЫ
// ============================================

function formatMoney(amount) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(amount);
}

// ============================================
// EXPRESS СЕРВЕР (health check)
// ============================================

const app = express();

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    bot: 'running',
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('🚀 SAVAUTO DIGITAL Bot запущен!');
  console.log('═══════════════════════════════════════');
  console.log(`📡 Health: http://localhost:${PORT}/health`);
  console.log(`🤖 Bot: @${TOKEN.split(':')[0]}`);
  console.log('');
  console.log('✅ Бот готов к работе!');
  console.log('📱 Откройте бота в Telegram и отправьте /start');
  console.log('═══════════════════════════════════════');
  console.log('');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGINT', () => {
  console.log('\n🛑 Остановка бота...');
  bot.stopPolling();
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
});
