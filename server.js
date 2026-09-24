import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DIST = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  
  // Пробуем найти файл
  let filePath = path.join(DIST, url);
  
  // Если это директория — ищем index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  
  // Если файл не найден — возвращаем index.html (SPA fallback)
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST, 'index.html');
  }
  
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ✅ SAVAUTO Server запущен!');
  console.log('  📡 http://localhost:' + PORT);
  console.log('  📱 Mini App: http://localhost:' + PORT + '/app');
  console.log('');
});
