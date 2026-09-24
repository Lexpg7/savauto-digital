import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const app = express();
const PORT = 4000;
const JWT_SECRET = 'savauto-dev-secret-key-change-in-production';

// ============================================
// MIDDLEWARE
// ============================================

app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
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
// IN-MEMORY DATABASE (Demo Mode)
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
    {
      id: 'u-002',
      company_id: 'comp-001',
      first_name: 'Мария',
      last_name: 'Козлова',
      email: 'maria@savauto.ru',
      password_hash: bcrypt.hashSync('demo123', 10),
      role: 'MANAGER',
      is_active: true,
    },
  ],
  clients: [
    { id: 'c-001', company_id: 'comp-001', first_name: 'Андрей', last_name: 'Николаев', phone: '+7 (916) 111-22-33', email: 'andrey.n@mail.ru', telegram_user_id: '123456789', telegram_username: '@andrey_n', source: 'Telegram', manager_id: 'u-002', status: 'ACTIVE', created_at: '2024-06-01T10:00:00Z' },
    { id: 'c-002', company_id: 'comp-001', first_name: 'Ольга', last_name: 'Белова', phone: '+7 (926) 222-33-44', email: 'olga.b@gmail.com', source: 'Сайт', manager_id: 'u-002', status: 'VIP', created_at: '2024-05-15T09:00:00Z' },
    { id: 'c-003', company_id: 'comp-001', first_name: 'Виктор', last_name: 'Морозов', phone: '+7 (903) 333-44-55', email: 'viktor.m@yandex.ru', source: 'Рекомендация', manager_id: 'u-002', status: 'ACTIVE', created_at: '2024-07-10T12:00:00Z' },
    { id: 'c-004', company_id: 'comp-001', first_name: 'Наталья', last_name: 'Кузнецова', phone: '+7 (915) 444-55-66', email: 'natalia.k@mail.ru', source: 'Instagram', manager_id: 'u-002', status: 'ACTIVE', created_at: '2024-08-05T08:00:00Z' },
    { id: 'c-005', company_id: 'comp-001', first_name: 'Сергей', last_name: 'Попов', phone: '+7 (977) 555-66-77', email: 'sergey.p@gmail.com', source: 'Telegram', manager_id: 'u-002', status: 'ACTIVE', created_at: '2024-09-20T14:00:00Z' },
  ],
  cars: [
    { id: 'car-001', company_id: 'comp-001', client_id: 'c-001', deal_id: 'd-001', make: 'Toyota', model: 'Camry', year: 2024, color: 'Белый перламутр', engine: '2.5L', transmission: 'AUTOMATIC', fuel_type: 'PETROL', drive_type: 'FWD', country: 'Корея', sale_price: 3200000, current_location: 'Владивосток → Москва', estimated_delivery_date: '2024-12-15', status: 'IN_TRANSIT', photo_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop', created_at: '2024-08-01T10:00:00Z' },
    { id: 'car-002', company_id: 'comp-001', client_id: 'c-002', deal_id: 'd-002', make: 'BMW', model: 'X5', year: 2023, color: 'Чёрный', engine: '3.0L Turbo', transmission: 'AUTOMATIC', fuel_type: 'PETROL', drive_type: 'AWD', country: 'Китай', sale_price: 7500000, current_location: 'Таможня, Москва', status: 'CUSTOMS', photo_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop', created_at: '2024-07-15T09:00:00Z' },
    { id: 'car-003', company_id: 'comp-001', client_id: 'c-003', deal_id: 'd-003', make: 'Hyundai', model: 'Sonata', year: 2024, color: 'Серый металлик', engine: '2.5L', transmission: 'AUTOMATIC', fuel_type: 'PETROL', drive_type: 'FWD', country: 'Корея', sale_price: 2800000, current_location: 'Пусан, Корея', status: 'PURCHASED', photo_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop', created_at: '2024-09-10T12:00:00Z' },
    { id: 'car-004', company_id: 'comp-001', client_id: 'c-004', deal_id: 'd-004', make: 'Geely', model: 'Monjaro', year: 2024, color: 'Синий', engine: '2.0T', transmission: 'AUTOMATIC', fuel_type: 'PETROL', drive_type: 'AWD', country: 'Китай', sale_price: 3500000, current_location: 'Море, порт Нябо', status: 'SHIPPED', photo_url: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=400&h=300&fit=crop', created_at: '2024-08-20T08:00:00Z' },
    { id: 'car-005', company_id: 'comp-001', client_id: 'c-001', deal_id: 'd-006', make: 'Kia', model: 'K5', year: 2023, color: 'Серебристый', engine: '2.0L', transmission: 'AUTOMATIC', fuel_type: 'PETROL', drive_type: 'FWD', country: 'Корея', sale_price: 2550000, current_location: 'Москва', status: 'DELIVERED', photo_url: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=300&fit=crop', created_at: '2024-05-01T10:00:00Z' },
  ],
  deals: [
    { id: 'd-001', company_id: 'comp-001', client_id: 'c-001', manager_id: 'u-002', title: 'Toyota Camry 2024 — Корея', status: 'LOGISTICS', currency: 'RUB', estimated_amount: 3200000, created_at: '2024-08-01T10:00:00Z' },
    { id: 'd-002', company_id: 'comp-001', client_id: 'c-002', manager_id: 'u-002', title: 'BMW X5 2023 — Китай', status: 'CUSTOMS', currency: 'RUB', estimated_amount: 7500000, created_at: '2024-07-15T09:00:00Z' },
    { id: 'd-003', company_id: 'comp-001', client_id: 'c-003', manager_id: 'u-002', title: 'Hyundai Sonata 2024 — Корея', status: 'CAR_PURCHASE', currency: 'RUB', estimated_amount: 2800000, created_at: '2024-09-10T12:00:00Z' },
    { id: 'd-004', company_id: 'comp-001', client_id: 'c-004', manager_id: 'u-002', title: 'Geely Monjaro 2024 — Китай', status: 'LOGISTICS', currency: 'RUB', estimated_amount: 3500000, created_at: '2024-08-20T08:00:00Z' },
    { id: 'd-005', company_id: 'comp-001', client_id: 'c-005', manager_id: 'u-002', title: 'Honda CR-V 2023 — Япония', status: 'CALCULATION', currency: 'RUB', estimated_amount: 4200000, created_at: '2024-11-01T14:00:00Z' },
  ],
  leads: [
    { id: 'l-001', company_id: 'comp-001', first_name: 'Максим', last_name: 'Фёдоров', phone: '+7 (916) 777-88-99', source: 'Telegram', status: 'NEW', created_at: '2024-11-20T09:00:00Z' },
    { id: 'l-002', company_id: 'comp-001', first_name: 'Анна', last_name: 'Смирнова', phone: '+7 (926) 888-99-00', source: 'Сайт', status: 'CONTACTED', created_at: '2024-11-18T14:00:00Z' },
    { id: 'l-003', company_id: 'comp-001', first_name: 'Роман', last_name: 'Козлов', phone: '+7 (903) 999-00-11', source: 'VK', status: 'QUALIFIED', created_at: '2024-11-15T11:00:00Z' },
  ],
  payments: [
    { id: 'p-001', company_id: 'comp-001', client_id: 'c-001', deal_id: 'd-001', car_id: 'car-001', amount: 1000000, currency: 'RUB', type: 'DEPOSIT', status: 'PAID', payment_date: '2024-08-05', description: 'Первоначальный взнос' },
    { id: 'p-002', company_id: 'comp-001', client_id: 'c-001', deal_id: 'd-001', car_id: 'car-001', amount: 1500000, currency: 'RUB', type: 'CAR_PAYMENT', status: 'PAID', payment_date: '2024-09-01', description: 'Оплата покупки авто' },
    { id: 'p-003', company_id: 'comp-001', client_id: 'c-002', deal_id: 'd-002', car_id: 'car-002', amount: 2000000, currency: 'RUB', type: 'DEPOSIT', status: 'PAID', payment_date: '2024-07-20', description: 'Первоначальный взнос' },
    { id: 'p-004', company_id: 'comp-001', client_id: 'c-002', deal_id: 'd-002', car_id: 'car-002', amount: 3000000, currency: 'RUB', type: 'CAR_PAYMENT', status: 'PAID', payment_date: '2024-08-20', description: 'Оплата покупки авто' },
    { id: 'p-005', company_id: 'comp-001', client_id: 'c-002', deal_id: 'd-002', car_id: 'car-002', amount: 2500000, currency: 'RUB', type: 'CUSTOMS', status: 'PENDING', payment_date: '2024-11-25', description: 'Таможенные платежи' },
  ],
  tasks: [
    { id: 't-001', company_id: 'comp-001', title: 'Позвонить клиенту по BMW X5', status: 'IN_PROGRESS', priority: 'HIGH', creator_id: 'u-001', assignee_id: 'u-002', client_id: 'c-002', due_date: '2024-11-25', created_at: '2024-11-20T09:00:00Z' },
    { id: 't-002', company_id: 'comp-001', title: 'Оформить документы на Sonata', status: 'TODO', priority: 'MEDIUM', creator_id: 'u-001', assignee_id: 'u-002', client_id: 'c-003', due_date: '2024-11-28', created_at: '2024-11-18T10:00:00Z' },
    { id: 't-003', company_id: 'comp-001', title: 'Отследить доставку Geely', status: 'WAITING', priority: 'MEDIUM', creator_id: 'u-001', assignee_id: 'u-002', car_id: 'car-004', due_date: '2024-12-10', created_at: '2024-11-10T08:00:00Z' },
    { id: 't-004', company_id: 'comp-001', title: 'Подготовить КП для Сергея', status: 'TODO', priority: 'HIGH', creator_id: 'u-001', assignee_id: 'u-002', client_id: 'c-005', due_date: '2024-11-24', created_at: '2024-11-22T10:00:00Z' },
  ],
  notifications: [
    { id: 'n-001', company_id: 'comp-001', user_id: 'u-001', type: 'STATUS_CHANGED', title: 'Статус авто изменён', body: 'BMW X5 — на таможне', created_at: '2024-11-20T11:00:00Z' },
    { id: 'n-002', company_id: 'comp-001', user_id: 'u-001', type: 'PAYMENT_DUE', title: 'Платёж ожидается', body: 'Ольга Белова — 2 500 000 руб до 25 ноября', created_at: '2024-11-20T09:00:00Z' },
    { id: 'n-003', company_id: 'comp-001', user_id: 'u-001', type: 'TASK_ASSIGNED', title: 'Новая задача', body: 'Подготовить КП для Сергея Попова', created_at: '2024-11-22T10:00:00Z' },
  ],
  timeline: [
    { id: 'te-001', company_id: 'comp-001', car_id: 'car-001', event_type: 'STATUS_CHANGE', title: 'Автомобиль отправлен', description: 'Контейнер загружен на судно в порту Пусан', old_status: 'WAREHOUSE', new_status: 'SHIPPED', location: 'Пусан, Корея', created_at: '2024-10-20T08:00:00Z' },
    { id: 'te-002', company_id: 'comp-001', car_id: 'car-001', event_type: 'STATUS_CHANGE', title: 'В пути', description: 'Судно следует во Владивосток', old_status: 'SHIPPED', new_status: 'IN_TRANSIT', location: 'Японское море', created_at: '2024-10-25T12:00:00Z' },
    { id: 'te-003', company_id: 'comp-001', car_id: 'car-002', event_type: 'STATUS_CHANGE', title: 'Прибыл на таможню', description: 'Автомобиль поступил на СВХ', old_status: 'ARRIVED', new_status: 'CUSTOMS', location: 'Москва', created_at: '2024-11-15T10:00:00Z' },
    { id: 'te-004', company_id: 'comp-001', car_id: 'car-004', event_type: 'STATUS_CHANGE', title: 'Отправлен морем', description: 'Контейнер MSKU1234567 загружен', old_status: 'PREPARING_FOR_SHIPMENT', new_status: 'SHIPPED', location: 'Шанхай, Китай', created_at: '2024-11-05T09:00:00Z' },
    { id: 'te-005', company_id: 'comp-001', car_id: 'car-005', event_type: 'STATUS_CHANGE', title: 'Автомобиль выдан клиенту', description: 'Клиент подписал акт приёма-передачи', old_status: 'READY_FOR_DELIVERY', new_status: 'DELIVERED', location: 'Москва', created_at: '2024-09-15T16:00:00Z' },
  ],
  documents: [
    { id: 'doc-001', company_id: 'comp-001', deal_id: 'd-001', client_id: 'c-001', category: 'CONTRACT', title: 'Договор №001/2024', filename: 'contract_001.pdf', mime_type: 'application/pdf', size: 245000, is_visible_to_client: true, created_at: '2024-08-01T10:00:00Z' },
    { id: 'doc-002', company_id: 'comp-001', deal_id: 'd-002', client_id: 'c-002', category: 'CONTRACT', title: 'Договор №002/2024', filename: 'contract_002.pdf', mime_type: 'application/pdf', size: 312000, is_visible_to_client: true, created_at: '2024-07-15T09:00:00Z' },
    { id: 'doc-003', company_id: 'comp-001', car_id: 'car-001', category: 'INSPECTION', title: 'Фотоотчёт осмотра Toyota', filename: 'inspection_toyota.pdf', mime_type: 'application/pdf', size: 1500000, is_visible_to_client: true, created_at: '2024-09-02T14:00:00Z' },
    { id: 'doc-004', company_id: 'comp-001', car_id: 'car-002', category: 'CUSTOMS', title: 'ГТД BMW X5', filename: 'gtd_bmw.pdf', mime_type: 'application/pdf', size: 890000, is_visible_to_client: true, created_at: '2024-11-15T11:00:00Z' },
  ],
  supportTickets: [
    { id: 'st-001', company_id: 'comp-001', client_id: 'c-004', car_id: 'car-004', subject: 'Когда приедет машина?', status: 'OPEN', priority: 'MEDIUM', created_at: '2024-11-21T15:00:00Z' },
    { id: 'st-002', company_id: 'comp-001', client_id: 'c-001', car_id: 'car-001', subject: 'Вопрос по документам', status: 'IN_PROGRESS', priority: 'LOW', created_at: '2024-11-19T10:00:00Z' },
  ],
  supportMessages: [
    { id: 'sm-001', ticket_id: 'st-001', sender_id: 'c-004', sender_type: 'client', message: 'Здравствуйте! Подскажите, когда примерно приедет мой Geely?', created_at: '2024-11-21T15:00:00Z' },
    { id: 'sm-002', ticket_id: 'st-001', sender_id: 'u-002', sender_type: 'staff', message: 'Добрый день, Наталья! Ваш автомобиль сейчас в пути. Ориентировочная дата прибытия — 10 декабря.', created_at: '2024-11-21T16:00:00Z' },
    { id: 'sm-003', ticket_id: 'st-002', sender_id: 'c-001', sender_type: 'client', message: 'Добрый день! Нужен ли мне ПТС для получения авто?', created_at: '2024-11-19T10:00:00Z' },
    { id: 'sm-004', ticket_id: 'st-002', sender_id: 'u-002', sender_type: 'staff', message: 'Андрей, добрый день! Да, ПТС будет готов к моменту выдачи.', created_at: '2024-11-20T14:00:00Z' },
  ],
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

app.get('/health', function(req, res) {
  res.json({ status: 'ok', mode: 'demo (in-memory)', time: new Date().toISOString() });
});

app.get('/ready', function(req, res) {
  res.json({ status: 'ready', checks: { database: 'in-memory (demo mode)' } });
});

// ============================================
// AUTH ROUTES
// ============================================

var loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

app.post('/api/v1/auth/login', function(req, res) {
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
      data: {
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
  res.json({ success: true, data: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role } });
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
  res.json({ success: true, data: { items: filtered, total: filtered.length } });
});

app.get('/api/v1/clients/:id', authMiddleware, tenantFilter, function(req: any, res) {
  var client = db.clients.find(function(c) { return c.id === req.params.id && c.company_id === req.companyId; });
  if (!client) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Client not found' } });
  res.json({ success: true, data: client });
});

app.post('/api/v1/clients', authMiddleware, tenantFilter, function(req: any, res) {
  var newClient = Object.assign({
    id: 'c-' + crypto.randomUUID().substring(0, 8),
    company_id: req.companyId,
    created_at: new Date().toISOString(),
  }, req.body);
  db.clients.push(newClient);
  res.status(201).json({ success: true, data: newClient });
});

app.patch('/api/v1/clients/:id', authMiddleware, tenantFilter, function(req: any, res) {
  var idx = db.clients.findIndex(function(c) { return c.id === req.params.id && c.company_id === req.companyId; });
  if (idx === -1) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Client not found' } });
  db.clients[idx] = Object.assign({}, db.clients[idx], req.body, { updated_at: new Date().toISOString() });
  res.json({ success: true, data: db.clients[idx] });
});

app.delete('/api/v1/clients/:id', authMiddleware, tenantFilter, function(req: any, res) {
  var idx = db.clients.findIndex(function(c) { return c.id === req.params.id && c.company_id === req.companyId; });
  if (idx === -1) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Client not found' } });
  db.clients.splice(idx, 1);
  res.json({ success: true });
});

// ============================================
// CARS
// ============================================

var STATUS_TRANSITIONS: Record<string, string[]> = {
  PURCHASED: ['INSPECTION', 'CANCELLED'],
  INSPECTION: ['WAREHOUSE', 'CANCELLED'],
  WAREHOUSE: ['PREPARING_FOR_SHIPMENT', 'CANCELLED'],
  PREPARING_FOR_SHIPMENT: ['WAITING_FOR_SHIPMENT', 'CANCELLED'],
  WAITING_FOR_SHIPMENT: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['ARRIVED', 'CANCELLED'],
  ARRIVED: ['CUSTOMS', 'CANCELLED'],
  CUSTOMS: ['CUSTOMS_CLEARANCE', 'CANCELLED'],
  CUSTOMS_CLEARANCE: ['READY_FOR_DELIVERY', 'CANCELLED'],
  READY_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

app.get('/api/v1/cars', authMiddleware, tenantFilter, function(req: any, res) {
  var items = db.cars.filter(function(c) { return c.company_id === req.companyId; });
  if (req.query.status) items = items.filter(function(c) { return c.status === req.query.status; });
  res.json({ success: true, data: { items: items, total: items.length } });
});

app.get('/api/v1/cars/:id', authMiddleware, tenantFilter, function(req: any, res) {
  var car = db.cars.find(function(c) { return c.id === req.params.id && c.company_id === req.companyId; });
  if (!car) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Car not found' } });
  res.json({ success: true, data: car });
});

app.post('/api/v1/cars/:id/transition', authMiddleware, tenantFilter, function(req: any, res) {
  var car = db.cars.find(function(c) { return c.id === req.params.id && c.company_id === req.companyId; });
  if (!car) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Car not found' } });

  var new_status = req.body.new_status;
  var location = req.body.location;
  var description = req.body.description;
  var allowed = STATUS_TRANSITIONS[car.status] || [];
  if (allowed.indexOf(new_status) === -1) {
    return res.status(400).json({ error: { code: 'INVALID_TRANSITION', message: 'Cannot transition from ' + car.status + ' to ' + new_status } });
  }

  var oldStatus = car.status;
  car.status = new_status;
  if (location) car.current_location = location;

  db.timeline.unshift({
    id: 'te-' + crypto.randomUUID().substring(0, 8),
    company_id: req.companyId,
    car_id: car.id,
    event_type: 'STATUS_CHANGE',
    title: 'Статус изменён: ' + oldStatus + ' → ' + new_status,
    description: description || '',
    old_status: oldStatus,
    new_status: new_status,
    location: location || car.current_location,
    actor_id: req.user.id,
    created_at: new Date().toISOString(),
  });

  res.json({ success: true, data: { old_status: oldStatus, new_status: new_status, car: car } });
});

app.get('/api/v1/cars/:id/timeline', authMiddleware, tenantFilter, function(req: any, res) {
  var events = db.timeline.filter(function(t) { return t.car_id === req.params.id && t.company_id === req.companyId; });
  res.json({ success: true, data: events });
});

// ============================================
// DEALS
// ============================================

app.get('/api/v1/deals', authMiddleware, tenantFilter, function(req: any, res) {
  var items = db.deals.filter(function(d) { return d.company_id === req.companyId; });
  res.json({ success: true, data: { items: items, total: items.length } });
});

// ============================================
// LEADS
// ============================================

app.get('/api/v1/leads', authMiddleware, tenantFilter, function(req: any, res) {
  var items = db.leads.filter(function(l) { return l.company_id === req.companyId; });
  res.json({ success: true, data: { items: items, total: items.length } });
});

// ============================================
// PAYMENTS
// ============================================

app.get('/api/v1/payments', authMiddleware, tenantFilter, function(req: any, res) {
  var items = db.payments.filter(function(p) { return p.company_id === req.companyId; });
  res.json({ success: true, data: { items: items, total: items.length } });
});

// ============================================
// TASKS
// ============================================

app.get('/api/v1/tasks', authMiddleware, tenantFilter, function(req: any, res) {
  var items = db.tasks.filter(function(t) { return t.company_id === req.companyId; });
  res.json({ success: true, data: { items: items, total: items.length } });
});

// ============================================
// NOTIFICATIONS
// ============================================

app.get('/api/v1/notifications', authMiddleware, tenantFilter, function(req: any, res) {
  var items = db.notifications.filter(function(n) { return n.user_id === req.user.id; });
  res.json({ success: true, data: { items: items, total: items.length } });
});

// ============================================
// DOCUMENTS
// ============================================

app.get('/api/v1/documents', authMiddleware, tenantFilter, function(req: any, res) {
  var items = db.documents.filter(function(d) { return d.company_id === req.companyId; });
  res.json({ success: true, data: { items: items, total: items.length } });
});

// ============================================
// SUPPORT
// ============================================

app.get('/api/v1/support/tickets', authMiddleware, tenantFilter, function(req: any, res) {
  var items = db.supportTickets.filter(function(t) { return t.company_id === req.companyId; });
  res.json({ success: true, data: { items: items, total: items.length } });
});

app.get('/api/v1/support/tickets/:id/messages', authMiddleware, tenantFilter, function(req: any, res) {
  var items = db.supportMessages.filter(function(m) { return m.ticket_id === req.params.id; });
  res.json({ success: true, data: items });
});

// ============================================
// DASHBOARD
// ============================================

app.get('/api/v1/dashboard', authMiddleware, tenantFilter, function(req: any, res) {
  var cars = db.cars.filter(function(c) { return c.company_id === req.companyId; });
  var payments = db.payments.filter(function(p) { return p.company_id === req.companyId; });
  
  res.json({
    success: true,
    data: {
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
    data: { client: client, cars: cars, payments: payments, documents: documents },
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
  console.log('  💾 Mode:    DEMO (in-memory, no DB needed)');
  console.log('════════════════════════════════════════════');
  console.log('');
  console.log('  📋 Demo login:');
  console.log('     Email:    admin@savauto.ru');
  console.log('     Password: demo123');
  console.log('');
  console.log('  ✅ Ready!');
  console.log('');
});
