/**
 * Диагностика Telegram бота
 * Запустите: node diagnose.js
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '.env') });

console.log('');
console.log('═══════════════════════════════════════');
console.log('🔍 SAVAUTO Bot — Диагностика');
console.log('═══════════════════════════════════════');
console.log('');

// 1. Проверка .env
console.log('📋 Проверка .env файла...');
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.log('❌ TELEGRAM_BOT_TOKEN не найден в .env');
  console.log('');
  console.log('📝 Что делать:');
  console.log('1. Откройте файл: bot/.env');
  console.log('2. Добавьте строку: TELEGRAM_BOT_TOKEN=ваш_токен');
  console.log('3. Токен получите у @BotFather');
  console.log('');
  process.exit(1);
}

console.log(`✅ Токен найден: ${token.substring(0, 10)}...`);

// 2. Проверка формата токена
if (!token.match(/^\d+:[A-Za-z0-9_-]+$/)) {
  console.log('❌ Неверный формат токена');
  console.log('Токен должен быть: 123456789:AAH...');
  console.log('Ваш токен: ' + token);
  process.exit(1);
}

console.log('✅ Формат токена корректный');

// 3. Проверка связи с Telegram API
console.log('');
console.log('🌐 Проверка связи с Telegram API...');

const url = `https://api.telegram.org/bot${token}/getMe`;

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      
      if (json.ok) {
        console.log('✅ Связь с Telegram установлена!');
        console.log('');
        console.log('🤖 Информация о боте:');
        console.log(`   Имя: ${json.result.first_name}`);
        console.log(`   Username: @${json.result.username}`);
        console.log(`   ID: ${json.result.id}`);
        console.log('');
        console.log('═══════════════════════════════════════');
        console.log('✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ!');
        console.log('═══════════════════════════════════════');
        console.log('');
        console.log('🚀 Теперь запустите бота:');
        console.log('   npm start');
        console.log('');
        console.log('📱 Затем откройте бота в Telegram:');
        console.log(`   https://t.me/${json.result.username}`);
        console.log('');
      } else {
        console.log('❌ Ошибка Telegram API:');
        console.log(`   ${json.description}`);
        console.log('');
        
        if (json.description.includes('Unauthorized')) {
          console.log('📝 Проблема: Неверный токен');
          console.log('   Получите новый токен у @BotFather');
        }
      }
    } catch (e) {
      console.log('❌ Не удалось разобрать ответ от Telegram');
      console.log('Ответ:', data);
    }
  });
}).on('error', (err) => {
  console.log('❌ Не удалось связаться с Telegram API');
  console.log('Ошибка:', err.message);
  console.log('');
  console.log('📝 Возможные причины:');
  console.log('   1. Нет интернета');
  console.log('   2. Telegram API заблокирован (используйте VPN)');
  console.log('   3. Проблема с firewall');
});

// 4. Проверка .env переменных
console.log('');
console.log('📋 Проверка других переменных .env...');

const miniAppUrl = process.env.MINI_APP_URL;
const adminId = process.env.ADMIN_TELEGRAM_ID;

if (miniAppUrl) {
  console.log(`✅ MINI_APP_URL: ${miniAppUrl}`);
} else {
  console.log('⚠️  MINI_APP_URL не задан (будет использован: http://localhost:3000/app)');
}

if (adminId) {
  console.log(`✅ ADMIN_TELEGRAM_ID: ${adminId}`);
} else {
  console.log('⚠️  ADMIN_TELEGRAM_ID не задан (уведомления админу отключены)');
}

console.log('');
