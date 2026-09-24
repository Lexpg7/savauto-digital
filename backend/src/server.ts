import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const app = express();
const PORT = parseInt(process.env.PORT || '4000');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const DATABASE_URL = process.env.DATABASE_URL;

// ============================================
// DATABASE CONNECTION
// ============================================

let pool: pg.Pool | null = null;

if (DATABASE_URL) {
  pool = new Pool({
    connectionString: DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
  });
  
  pool.on('error', (err) => {
    console.error('❌ Database error:', err.message);
  });
  
  console.log('✅ Database connected');
} else {
  console.log('⚠️  DATABASE_URL not set — using in-memory mode');
}

// ============================================
// MIDDLEWARE
// ============================================

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGINS || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use(limiter);

app.use((req, res, next) => {
  console.log(new Date().toISOString() + ' ' + req.method + ' ' + req.path);
  next();
});

// ============================================
// IN-MEMORY DATABASE (Fallback)
// ============================================

var db = {
  users: [
    {
      id: 'u-001',
      company_id: 'comp-001',
      first_name: 'Алексей',
      last_name: 'Савельев',
      email: 'admin@savauto.ru',
      password_hash: bcrypt.hashSync('demo123', 10),
      role: 'COMPANY_ADMIN',
      is_active: true,
    },
  ],
  clients: [
    { id: 'c-001', company_id: 'comp-001', first_name: 'Андрей', last_name: 'Николаев', phone: '+7 (916) 111-22-33', email: 'andrey.n@mail.ru', telegram_user_id: '123456789', telegram_username: '@andrey_n', source: 'Telegram', manager_id: 'u-001', status: 'ACTIVE', created_at: '2024-06-01T10:00:00Z' },
    { id: 'c-002', company_id: 'comp-001', first_name: 'Ольга', last_name: 'Белова', phone: '+7 (926) 222-33-44', email: 'olga.b@gmail.com', source: 'Сайт', manager_id: 'u-001', status: 'VIP', created_at: '2024-05-15T09:00:00Z' },
  ],
  cars: [
    { id: 'car-001', company_id: 'comp-001', client_id: 'c-001', deal_id: 'd-001', make: 'Toyota', model: 'Camry', year: 2024, color: 'Белый перламутр', engine: '2.5L', transmission: 'AUTOMATIC', fuel_type: 'PETROL', drive_type: 'FWD', country: 'Корея', sale_price: 3200000, current_location: 'Владивосток → Москва', estimated_delivery_date: '2024-12-15', status: 'IN_TRANSIT', photo_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop', created_at: '2024-08-01T10:00:00Z' },
    { id: 'car-002', company_id: 'comp-001', client_id: 'c-002', deal_id: 'd-002', make: 'BMW', model: 'X5', year: 2023, color: 'Чёрный', engine: '3.0L Turbo', transmission: 'AUTOMATIC', fuel_type: 'PETROL', drive_type: 'AWD', country: 'Китай', sale_price: 7500000, current_location: 'Таможня, Москва', status: 'CUSTOMS', photo_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop', created_at: '2024-07-15T09:00:00Z' },
  ],
  deals: [
    { id: 'd-001', company_id: 'comp-001', client_id: 'c-001', manager_id: 'u-001', title: 'Toyota Camry 2024 — Корея', status: 'LOGISTICS', currency: 'RUB', estimated_amount: 3200000, created_at: '2024-08-01T10:00:00Z' },
    { id: 'd-002', company_id: 'comp-001', client_id: 'c-002', manager_id: 'u-001', title: 'BMW X5 2023 — Китай', status: 'CUSTOMS', currency: 'RUB', estimated_amount: 7500000, created_at: '2024-07-15T09:00:00Z' },
  ],
  leads: [],
  payments: [],
  tasks: [],
  notifications: [],
  timeline: [],
  documents: [],
  supportTickets: [],
  supportMessages: [],
};

// ============================================
// AUTH MIDDLEWARE
// ============================================

function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No token' } });
  }
  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = db.users.find(function(u) { return u.id === decoded.id; });
    if (!req.user) return res.status(401).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    next();
  } catch (e) {
    res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid token' } });
  }
}

function tenantFilter(req: any, res: any, next: any) {
  req.companyId = req.user.company_id;
  next();
}

// ============================================
// HEALTH
// ============================================

app.get('/health', async function(req, res) {
  let dbStatus = 'in-memory';
  if (pool) {
    try {
      await pool.query('SELECT 1');
      dbStatus = 'postgresql';
    } catch (e) {
      dbStatus = 'postgresql (error)';
    }
  }
  res.json({ status: 'ok', mode: dbStatus, time: new Date().toISOString() });
});

// ============================================
// AUTH ROUTES
// ============================================

var loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

app.post('/api/v1/auth/login', async function(req, res) {
  try {
    var parsed = loginSchema.parse(req.body);
    var email = parsed.email;
    var password = parsed.password;
    var user = db.users.find(function(u) { return u.email === email; });
    
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    var token = jwt.sign({ id: user.id, company_id: user.company_id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
       {
        accessToken: token,
        user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role },
      },
    });
  } catch (error) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid data' } });
  }
});

app.get('/api/v1/auth/me', authMiddleware, function(req: any, res) {
  var user = req.user;
  res.json({ success: true,  { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role } });
});

// ============================================
// CLIENTS
// ============================================

app.get('/api/v1/clients', authMiddleware, tenantFilter, function(req: any, res) {
  var items = db.clients.filter(function(c) { return c.company_id === req.companyId; });
  var search = req.query.search ? req.query.search.toString().toLowerCase() : '';
  var filtered = search
    ? items.filter(function(c) { return (c.first_name + ' ' + c.last_name + ' ' + c.phone + ' ' + (c.email || '')).toLowerCase().indexOf(search) !== -1; })
    : items;
  res.json({ success: true,  { items: filtered, total: filtered.length } });
});

app.get('/api/v1/clients/:id', authMiddleware, tenantFilter, function(req: any, res) {
  var client = db.clients.find(function(c) { return c.id === req.params.id && c.company_id === req.companyId; });
  if (!client) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Client not found' } });
  res.json({ success: true,  client });
});

app.post('/api/v1/clients', authMiddleware, tenantFilter, function(req: any, res) {
  var newClient = Object.assign({
    id: 'c-' + crypto.randomUUID().substring(0, 8),
    company_id: req.companyId,
    created_at: new Date().toISOString(),
  }, req.body);
  db.clients.push(newClient);
  res.status(201).json({ success: true,  newClient });
});

// ============================================
// CARS
// ============================================

app.get('/api/v1/cars', authMiddleware, tenantFilter, function(req: any, res) {
  var items = db.cars.filter(function(c) { return c.company_id === req.companyId; });
  if (req.query.status) items = items.filter(function(c) { return c.status === req.query.status; });
  res.json({ success: true,  { items: items, total: items.length } });
});

app.get('/api/v1/cars/:id', authMiddleware, tenantFilter, function(req: any, res) {
  var car = db.cars.find(function(c) { return c.id === req.params.id && c.company_id === req.companyId; });
  if (!car) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Car not found' } });
  res.json({ success: true,  car });
});

// ============================================
// DEALS
// ============================================

app.get('/api/v1/deals', authMiddleware, tenantFilter, function(req: any, res) {
  var items = db.deals.filter(function(d) { return d.company_id === req.companyId; });
  res.json({ success: true,  { items: items, total: items.length } });
});

// ============================================
// LEADS
// ============================================

app.get('/api/v1/leads', authMiddleware, tenantFilter, function(req: any, res) {
  var items = db.leads.filter(function(l) { return l.company_id === req.companyId; });
  res.json({ success: true,  { items: items, total: items.length } });
});

// ============================================
// PAYMENTS
// ============================================

app.get('/api/v1/payments', authMiddleware, tenantFilter, function(req: any, res) {
  var items = db.payments.filter(function(p) { return p.company_id === req.companyId; });
  res.json({ success: true,  { items: items, total: items.length } });
});

// ============================================
// TASKS
// ============================================

app.get('/api/v1/tasks', authMiddleware, tenantFilter, function(req: any, res) {
  var items = db.tasks.filter(function(t) { return t.company_id === req.companyId; });
  res.json({ success: true,  { items: items, total: items.length } });
});

// ============================================
// NOTIFICATIONS
// ============================================

app.get('/api/v1/notifications', authMiddleware, tenantFilter, function(req: any, res) {
  var items = db.notifications.filter(function(n) { return n.user_id === req.user.id; });
  res.json({ success: true,  { items: items, total: items.length } });
});

// ============================================
// DOCUMENTS
// ============================================

app.get('/api/v1/documents', authMiddleware, tenantFilter, function(req: any, res) {
  var items = db.documents.filter(function(d) { return d.company_id === req.companyId; });
  res.json({ success: true,  { items: items, total: items.length } });
});

// ============================================
// SUPPORT
// ============================================

app.get('/api/v1/support/tickets', authMiddleware, tenantFilter, function(req: any, res) {
  var items = db.supportTickets.filter(function(t) { return t.company_id === req.companyId; });
  res.json({ success: true,  { items: items, total: items.length } });
});

// ============================================
// DASHBOARD
// ============================================

app.get('/api/v1/dashboard', authMiddleware, tenantFilter, function(req: any, res) {
  var cars = db.cars.filter(function(c) { return c.company_id === req.companyId; });
  var payments = db.payments.filter(function(p) { return p.company_id === req.companyId; });
  
  res.json({
    success: true,
     {
      total_clients: db.clients.filter(function(c) { return c.company_id === req.companyId; }).length,
      active_deals: db.deals.filter(function(d) { return d.company_id === req.companyId && d.status !== 'COMPLETED' && d.status !== 'CANCELLED'; }).length,
      total_cars: cars.length,
      cars_in_transit: cars.filter(function(c) { return c.status === 'IN_TRANSIT' || c.status === 'SHIPPED'; }).length,
      total_revenue: payments.filter(function(p) { return p.status === 'PAID'; }).reduce(function(s, p) { return s + p.amount; }, 0),
      outstanding_payments: payments.filter(function(p) { return p.status === 'PENDING'; }).reduce(function(s, p) { return s + p.amount; }, 0),
      open_tasks: db.tasks.filter(function(t) { return t.company_id === req.companyId && t.status !== 'DONE' && t.status !== 'CANCELLED'; }).length,
    },
  });
});

// ============================================
// TELEGRAM VALIDATE
// ============================================

app.post('/api/v1/telegram/validate', function(req, res) {
  var telegram_user_id = req.body.telegram_user_id;
  var client = db.clients.find(function(c) { return c.telegram_user_id === (telegram_user_id || '').toString(); });
  
  if (!client) {
    return res.status(404).json({ error: { code: 'CLIENT_NOT_FOUND', message: 'Аккаунт не привязан' } });
  }

  var cars = db.cars.filter(function(c) { return c.client_id === client.id; });
  var payments = db.payments.filter(function(p) { return p.client_id === client.id; });
  var documents = db.documents.filter(function(d) { return d.client_id === client.id && d.is_visible_to_client; });

  res.json({
    success: true,
     { client: client, cars: cars, payments: payments, documents: documents },
  });
});

// ============================================
// 404
// ============================================

app.use(function(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route ' + req.method + ' ' + req.path + ' not found' } });
});

// ============================================
// START
// ============================================

app.listen(PORT, function() {
  console.log('');
  console.log('════════════════════════════════════════════');
  console.log('  🚀 SAVAUTO DIGITAL API');
  console.log('════════════════════════════════════════════');
  console.log('  📡 URL:     http://localhost:' + PORT);
  console.log('  🏥 Health:  http://localhost:' + PORT + '/health');
  console.log('  🔌 API:     http://localhost:' + PORT + '/api/v1');
  console.log('  💾 Mode:    ' + (pool ? 'PostgreSQL' : 'DEMO (in-memory)'));
  console.log('════════════════════════════════════════════');
  console.log('');
  console.log('  📋 Demo login:');
  console.log('     Email:    admin@savauto.ru');
  console.log('     Password: demo123');
  console.log('');
  console.log('  ✅ Ready!');
  console.log('');
});
