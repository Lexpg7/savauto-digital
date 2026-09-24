import type { User, Client, Lead, Deal, Car, Payment, Expense, Task, Notification, SupportTicket, SupportMessage, Document, TimelineEvent, DashboardStats } from '../types';

export const currentUser: User = {
  id: 'u-001',
  company_id: 'comp-001',
  first_name: 'Алексей',
  last_name: 'Савельев',
  email: 'alex@savauto.ru',
  phone: '+7 (999) 123-45-67',
  role: 'COMPANY_ADMIN',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
};

export const users: User[] = [
  currentUser,
  { id: 'u-002', company_id: 'comp-001', first_name: 'Мария', last_name: 'Козлова', email: 'maria@savauto.ru', phone: '+7 (999) 234-56-78', role: 'MANAGER', is_active: true, created_at: '2024-01-15T00:00:00Z' },
  { id: 'u-003', company_id: 'comp-001', first_name: 'Дмитрий', last_name: 'Волков', email: 'dmitry@savauto.ru', phone: '+7 (999) 345-67-89', role: 'LOGISTICIAN', is_active: true, created_at: '2024-02-01T00:00:00Z' },
  { id: 'u-004', company_id: 'comp-001', first_name: 'Елена', last_name: 'Петрова', email: 'elena@savauto.ru', phone: '+7 (999) 456-78-90', role: 'ACCOUNTANT', is_active: true, created_at: '2024-02-15T00:00:00Z' },
  { id: 'u-005', company_id: 'comp-001', first_name: 'Игорь', last_name: 'Сидоров', email: 'igor@savauto.ru', phone: '+7 (999) 567-89-01', role: 'EMPLOYEE', is_active: true, created_at: '2024-03-01T00:00:00Z' },
];

export const clients: Client[] = [
  { id: 'c-001', company_id: 'comp-001', first_name: 'Андрей', last_name: 'Николаев', middle_name: 'Сергеевич', phone: '+7 (916) 111-22-33', email: 'andrey.n@mail.ru', telegram_username: '@andrey_n', source: 'Telegram', manager_id: 'u-002', status: 'ACTIVE', created_at: '2024-06-01T10:00:00Z', updated_at: '2024-11-15T14:30:00Z' },
  { id: 'c-002', company_id: 'comp-001', first_name: 'Ольга', last_name: 'Белова', phone: '+7 (926) 222-33-44', email: 'olga.b@gmail.com', telegram_username: '@olga_b', source: 'Сайт', manager_id: 'u-002', status: 'VIP', created_at: '2024-05-15T09:00:00Z', updated_at: '2024-11-20T11:00:00Z' },
  { id: 'c-003', company_id: 'comp-001', first_name: 'Виктор', last_name: 'Морозов', phone: '+7 (903) 333-44-55', email: 'viktor.m@yandex.ru', source: 'Рекомендация', manager_id: 'u-002', status: 'ACTIVE', created_at: '2024-07-10T12:00:00Z', updated_at: '2024-11-18T16:00:00Z' },
  { id: 'c-004', company_id: 'comp-001', first_name: 'Наталья', last_name: 'Кузнецова', phone: '+7 (915) 444-55-66', email: 'natalia.k@mail.ru', telegram_username: '@nat_k', source: 'Instagram', manager_id: 'u-002', status: 'ACTIVE', created_at: '2024-08-05T08:00:00Z', updated_at: '2024-11-10T09:30:00Z' },
  { id: 'c-005', company_id: 'comp-001', first_name: 'Сергей', last_name: 'Попов', phone: '+7 (977) 555-66-77', email: 'sergey.p@gmail.com', source: 'Telegram', manager_id: 'u-002', status: 'ACTIVE', created_at: '2024-09-20T14:00:00Z', updated_at: '2024-11-22T10:00:00Z' },
  { id: 'c-006', company_id: 'comp-001', first_name: 'Татьяна', last_name: 'Лебедева', phone: '+7 (925) 666-77-88', email: 'tatiana.l@yandex.ru', source: 'Сайт', manager_id: 'u-002', status: 'INACTIVE', created_at: '2024-04-10T11:00:00Z', updated_at: '2024-10-05T15:00:00Z' },
];

export const leads: Lead[] = [
  { id: 'l-001', company_id: 'comp-001', first_name: 'Максим', last_name: 'Фёдоров', phone: '+7 (916) 777-88-99', email: 'max.f@mail.ru', source: 'Telegram', status: 'NEW', created_at: '2024-11-20T09:00:00Z', updated_at: '2024-11-20T09:00:00Z' },
  { id: 'l-002', company_id: 'comp-001', first_name: 'Анна', last_name: 'Смирнова', phone: '+7 (926) 888-99-00', email: 'anna.s@gmail.com', source: 'Сайт', assigned_manager: 'u-002', status: 'CONTACTED', created_at: '2024-11-18T14:00:00Z', updated_at: '2024-11-19T10:00:00Z' },
  { id: 'l-003', company_id: 'comp-001', first_name: 'Роман', last_name: 'Козлов', phone: '+7 (903) 999-00-11', source: 'VK', assigned_manager: 'u-002', status: 'QUALIFIED', notes: 'Интересуется Toyota Camry из Кореи', created_at: '2024-11-15T11:00:00Z', updated_at: '2024-11-17T16:00:00Z' },
  { id: 'l-004', company_id: 'comp-001', first_name: 'Екатерина', last_name: 'Новикова', phone: '+7 (915) 000-11-22', email: 'kate.n@mail.ru', source: 'Рекомендация', assigned_manager: 'u-002', status: 'NEGOTIATION', notes: 'Обсуждаем BMW X5 из Китая', created_at: '2024-11-10T08:00:00Z', updated_at: '2024-11-21T12:00:00Z' },
  { id: 'l-005', company_id: 'comp-001', first_name: 'Павел', last_name: 'Волков', phone: '+7 (977) 111-22-33', source: 'Telegram', status: 'LOST', notes: 'Купил у конкурентов', created_at: '2024-10-25T10:00:00Z', updated_at: '2024-11-05T09:00:00Z' },
];

export const deals: Deal[] = [
  { id: 'd-001', company_id: 'comp-001', client_id: 'c-001', manager_id: 'u-002', title: 'Toyota Camry 2024 — Корея', status: 'LOGISTICS', currency: 'RUB', estimated_amount: 3200000, created_at: '2024-08-01T10:00:00Z', updated_at: '2024-11-15T14:30:00Z' },
  { id: 'd-002', company_id: 'comp-001', client_id: 'c-002', manager_id: 'u-002', title: 'BMW X5 2023 — Китай', status: 'CUSTOMS', currency: 'RUB', estimated_amount: 7500000, created_at: '2024-07-15T09:00:00Z', updated_at: '2024-11-20T11:00:00Z' },
  { id: 'd-003', company_id: 'comp-001', client_id: 'c-003', manager_id: 'u-002', title: 'Hyundai Sonata 2024 — Корея', status: 'CAR_PURCHASE', currency: 'RUB', estimated_amount: 2800000, created_at: '2024-09-10T12:00:00Z', updated_at: '2024-11-18T16:00:00Z' },
  { id: 'd-004', company_id: 'comp-001', client_id: 'c-004', manager_id: 'u-002', title: 'Geely Monjaro 2024 — Китай', status: 'LOGISTICS', currency: 'RUB', estimated_amount: 3500000, final_amount: 3450000, created_at: '2024-08-20T08:00:00Z', updated_at: '2024-11-10T09:30:00Z' },
  { id: 'd-005', company_id: 'comp-001', client_id: 'c-005', manager_id: 'u-002', title: 'Honda CR-V 2023 — Япония', status: 'CALCULATION', currency: 'RUB', estimated_amount: 4200000, created_at: '2024-11-01T14:00:00Z', updated_at: '2024-11-22T10:00:00Z' },
  { id: 'd-006', company_id: 'comp-001', client_id: 'c-001', manager_id: 'u-002', title: 'Kia K5 2023 — Корея', status: 'COMPLETED', currency: 'RUB', estimated_amount: 2600000, final_amount: 2550000, created_at: '2024-05-01T10:00:00Z', updated_at: '2024-09-15T16:00:00Z' },
];

export const cars: Car[] = [
  { id: 'car-001', company_id: 'comp-001', client_id: 'c-001', deal_id: 'd-001', vin: 'KNABE41A5L6******', make: 'Toyota', model: 'Camry', generation: 'XV70', year: 2024, color: 'Белый перламутр', mileage: 0, engine: '2.5L', engine_volume: 2487, fuel_type: 'PETROL', transmission: 'AUTOMATIC', drive_type: 'FWD', country: 'Корея', purchase_price: 24500000, purchase_currency: 'KRW', purchase_date: '2024-09-01', delivery_price: 350000, customs_price: 420000, additional_cost: 50000, sale_price: 3200000, current_location: 'Владивосток → Москва', estimated_delivery_date: '2024-12-15', status: 'IN_TRANSIT', photo_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop', created_at: '2024-08-01T10:00:00Z', updated_at: '2024-11-15T14:30:00Z' },
  { id: 'car-002', company_id: 'comp-001', client_id: 'c-002', deal_id: 'd-002', vin: 'WBAPH5C55BA******', make: 'BMW', model: 'X5', generation: 'G05', year: 2023, color: 'Чёрный', mileage: 12000, engine: '3.0L Turbo', engine_volume: 2998, fuel_type: 'PETROL', transmission: 'AUTOMATIC', drive_type: 'AWD', country: 'Китай', purchase_price: 320000, purchase_currency: 'CNY', purchase_date: '2024-08-15', delivery_price: 450000, customs_price: 890000, additional_cost: 80000, sale_price: 7500000, current_location: 'Таможня, Москва', estimated_delivery_date: '2024-12-01', status: 'CUSTOMS', photo_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop', created_at: '2024-07-15T09:00:00Z', updated_at: '2024-11-20T11:00:00Z' },
  { id: 'car-003', company_id: 'comp-001', client_id: 'c-003', deal_id: 'd-003', vin: 'KMH**************', make: 'Hyundai', model: 'Sonata', generation: 'DN8', year: 2024, color: 'Серый металлик', mileage: 0, engine: '2.5L', engine_volume: 2497, fuel_type: 'PETROL', transmission: 'AUTOMATIC', drive_type: 'FWD', country: 'Корея', purchase_price: 22000000, purchase_currency: 'KRW', purchase_date: '2024-10-15', sale_price: 2800000, current_location: 'Пусан, Корея', estimated_delivery_date: '2024-12-25', status: 'PURCHASED', photo_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop', created_at: '2024-09-10T12:00:00Z', updated_at: '2024-11-18T16:00:00Z' },
  { id: 'car-004', company_id: 'comp-001', client_id: 'c-004', deal_id: 'd-004', vin: 'L6T**************', make: 'Geely', model: 'Monjaro', year: 2024, color: 'Синий', mileage: 0, engine: '2.0T', engine_volume: 1969, fuel_type: 'PETROL', transmission: 'AUTOMATIC', drive_type: 'AWD', country: 'Китай', purchase_price: 185000, purchase_currency: 'CNY', purchase_date: '2024-09-20', delivery_price: 380000, customs_price: 520000, sale_price: 3500000, current_location: 'Море, порт Нябо', estimated_delivery_date: '2024-12-10', status: 'SHIPPED', photo_url: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=400&h=300&fit=crop', created_at: '2024-08-20T08:00:00Z', updated_at: '2024-11-10T09:30:00Z' },
  { id: 'car-005', company_id: 'comp-001', client_id: 'c-001', deal_id: 'd-006', vin: 'KNABE41A5L5******', make: 'Kia', model: 'K5', generation: 'DL3', year: 2023, color: 'Серебристый', mileage: 5000, engine: '2.0L', engine_volume: 1999, fuel_type: 'PETROL', transmission: 'AUTOMATIC', drive_type: 'FWD', country: 'Корея', purchase_price: 20000000, purchase_currency: 'KRW', purchase_date: '2024-06-01', delivery_price: 300000, customs_price: 380000, additional_cost: 30000, sale_price: 2550000, current_location: 'Москва', actual_delivery_date: '2024-09-15', status: 'DELIVERED', photo_url: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=300&fit=crop', created_at: '2024-05-01T10:00:00Z', updated_at: '2024-09-15T16:00:00Z' },
];

export const payments: Payment[] = [
  { id: 'p-001', company_id: 'comp-001', client_id: 'c-001', deal_id: 'd-001', car_id: 'car-001', amount: 1000000, currency: 'RUB', type: 'DEPOSIT', status: 'PAID', payment_date: '2024-08-05', description: 'Первоначальный взнос', created_at: '2024-08-05T10:00:00Z' },
  { id: 'p-002', company_id: 'comp-001', client_id: 'c-001', deal_id: 'd-001', car_id: 'car-001', amount: 1500000, currency: 'RUB', type: 'CAR_PAYMENT', status: 'PAID', payment_date: '2024-09-01', description: 'Оплата покупки авто', created_at: '2024-09-01T12:00:00Z' },
  { id: 'p-003', company_id: 'comp-001', client_id: 'c-002', deal_id: 'd-002', car_id: 'car-002', amount: 2000000, currency: 'RUB', type: 'DEPOSIT', status: 'PAID', payment_date: '2024-07-20', description: 'Первоначальный взнос', created_at: '2024-07-20T09:00:00Z' },
  { id: 'p-004', company_id: 'comp-001', client_id: 'c-002', deal_id: 'd-002', car_id: 'car-002', amount: 3000000, currency: 'RUB', type: 'CAR_PAYMENT', status: 'PAID', payment_date: '2024-08-20', description: 'Оплата покупки авто', created_at: '2024-08-20T14:00:00Z' },
  { id: 'p-005', company_id: 'comp-001', client_id: 'c-002', deal_id: 'd-002', car_id: 'car-002', amount: 2500000, currency: 'RUB', type: 'CUSTOMS', status: 'PENDING', payment_date: '2024-11-25', description: 'Таможенные платежи', created_at: '2024-11-20T11:00:00Z' },
  { id: 'p-006', company_id: 'comp-001', client_id: 'c-003', deal_id: 'd-003', car_id: 'car-003', amount: 500000, currency: 'RUB', type: 'DEPOSIT', status: 'PAID', payment_date: '2024-09-15', description: 'Первоначальный взнос', created_at: '2024-09-15T10:00:00Z' },
  { id: 'p-007', company_id: 'comp-001', client_id: 'c-004', deal_id: 'd-004', car_id: 'car-004', amount: 1000000, currency: 'RUB', type: 'DEPOSIT', status: 'PAID', payment_date: '2024-08-25', description: 'Первоначальный взнос', created_at: '2024-08-25T08:00:00Z' },
  { id: 'p-008', company_id: 'comp-001', client_id: 'c-004', deal_id: 'd-004', car_id: 'car-004', amount: 2000000, currency: 'RUB', type: 'CAR_PAYMENT', status: 'PAID', payment_date: '2024-09-25', description: 'Оплата покупки авто', created_at: '2024-09-25T12:00:00Z' },
  { id: 'p-009', company_id: 'comp-001', client_id: 'c-001', deal_id: 'd-006', car_id: 'car-005', amount: 2550000, currency: 'RUB', type: 'CAR_PAYMENT', status: 'PAID', payment_date: '2024-09-10', description: 'Полная оплата', created_at: '2024-09-10T16:00:00Z' },
];

export const expenses: Expense[] = [
  { id: 'e-001', company_id: 'comp-001', car_id: 'car-001', deal_id: 'd-001', amount: 350000, currency: 'RUB', category: 'TRANSPORT', description: 'Доставка Корея-Владивосток', expense_date: '2024-09-10', created_at: '2024-09-10T10:00:00Z' },
  { id: 'e-002', company_id: 'comp-001', car_id: 'car-001', deal_id: 'd-001', amount: 420000, currency: 'RUB', category: 'CUSTOMS', description: 'Таможенные платежи', expense_date: '2024-10-05', created_at: '2024-10-05T12:00:00Z' },
  { id: 'e-003', company_id: 'comp-001', car_id: 'car-002', deal_id: 'd-002', amount: 450000, currency: 'RUB', category: 'TRANSPORT', description: 'Доставка Китай-Москва', expense_date: '2024-09-20', created_at: '2024-09-20T09:00:00Z' },
  { id: 'e-004', company_id: 'comp-001', car_id: 'car-002', deal_id: 'd-002', amount: 890000, currency: 'RUB', category: 'CUSTOMS', description: 'Таможенная очистка', expense_date: '2024-11-15', created_at: '2024-11-15T14:00:00Z' },
  { id: 'e-005', company_id: 'comp-001', car_id: 'car-004', deal_id: 'd-004', amount: 380000, currency: 'RUB', category: 'TRANSPORT', description: 'Морская доставка', expense_date: '2024-10-01', created_at: '2024-10-01T08:00:00Z' },
  { id: 'e-006', company_id: 'comp-001', car_id: 'car-004', deal_id: 'd-004', amount: 520000, currency: 'RUB', category: 'CUSTOMS', description: 'Таможенные платежи', expense_date: '2024-11-01', created_at: '2024-11-01T10:00:00Z' },
  { id: 'e-007', company_id: 'comp-001', amount: 150000, currency: 'RUB', category: 'BROKER', description: 'Услуги брокера', expense_date: '2024-11-01', created_at: '2024-11-01T09:00:00Z' },
];

export const tasks: Task[] = [
  { id: 't-001', company_id: 'comp-001', title: 'Позвонить клиенту по BMW X5', description: 'Уточнить детали по таможне', status: 'IN_PROGRESS', priority: 'HIGH', creator_id: 'u-001', assignee_id: 'u-002', client_id: 'c-002', deal_id: 'd-002', due_date: '2024-11-25', created_at: '2024-11-20T09:00:00Z', updated_at: '2024-11-20T09:00:00Z' },
  { id: 't-002', company_id: 'comp-001', title: 'Оформить документы на Sonata', status: 'TODO', priority: 'MEDIUM', creator_id: 'u-001', assignee_id: 'u-002', client_id: 'c-003', deal_id: 'd-003', due_date: '2024-11-28', created_at: '2024-11-18T10:00:00Z', updated_at: '2024-11-18T10:00:00Z' },
  { id: 't-003', company_id: 'comp-001', title: 'Отследить доставку Geely', description: 'Контейнер MSKU1234567', status: 'WAITING', priority: 'MEDIUM', creator_id: 'u-003', assignee_id: 'u-003', car_id: 'car-004', due_date: '2024-12-10', created_at: '2024-11-10T08:00:00Z', updated_at: '2024-11-15T14:00:00Z' },
  { id: 't-004', company_id: 'comp-001', title: 'Подготовить КП для Сергея', status: 'TODO', priority: 'HIGH', creator_id: 'u-001', assignee_id: 'u-002', client_id: 'c-005', deal_id: 'd-005', due_date: '2024-11-24', created_at: '2024-11-22T10:00:00Z', updated_at: '2024-11-22T10:00:00Z' },
  { id: 't-005', company_id: 'comp-001', title: 'Проверить фото Toyota Camry', status: 'DONE', priority: 'LOW', creator_id: 'u-002', assignee_id: 'u-005', car_id: 'car-001', completed_at: '2024-11-16T15:00:00Z', created_at: '2024-11-15T09:00:00Z', updated_at: '2024-11-16T15:00:00Z' },
  { id: 't-006', company_id: 'comp-001', title: 'Связаться с брокером по BMW', status: 'TODO', priority: 'URGENT', creator_id: 'u-001', assignee_id: 'u-003', deal_id: 'd-002', due_date: '2024-11-23', created_at: '2024-11-21T11:00:00Z', updated_at: '2024-11-21T11:00:00Z' },
];

export const notifications: Notification[] = [
  { id: 'n-001', company_id: 'comp-001', user_id: 'u-001', type: 'STATUS_CHANGED', title: 'Статус авто изменён', body: 'BMW X5 — на таможне', created_at: '2024-11-20T11:00:00Z' },
  { id: 'n-002', company_id: 'comp-001', user_id: 'u-001', type: 'PAYMENT_DUE', title: 'Платёж ожидается', body: 'Ольга Белова — 2 500 000 ₽ до 25 ноября', created_at: '2024-11-20T09:00:00Z' },
  { id: 'n-003', company_id: 'comp-001', user_id: 'u-001', type: 'TASK_ASSIGNED', title: 'Новая задача', body: 'Подготовить КП для Сергея Попова', created_at: '2024-11-22T10:00:00Z' },
  { id: 'n-004', company_id: 'comp-001', user_id: 'u-001', type: 'SUPPORT_MESSAGE', title: 'Новое обращение', body: 'Наталья Кузнецова: "Когда приедет машина?"', created_at: '2024-11-21T15:00:00Z' },
  { id: 'n-005', company_id: 'comp-001', user_id: 'u-001', type: 'SYSTEM', title: 'Обновление системы', body: 'Добавлен модуль отчётов', read_at: '2024-11-19T08:00:00Z', created_at: '2024-11-19T08:00:00Z' },
];

export const supportTickets: SupportTicket[] = [
  { id: 'st-001', company_id: 'comp-001', client_id: 'c-004', car_id: 'car-004', deal_id: 'd-004', subject: 'Когда приедет машина?', status: 'OPEN', priority: 'MEDIUM', created_at: '2024-11-21T15:00:00Z', updated_at: '2024-11-21T15:00:00Z' },
  { id: 'st-002', company_id: 'comp-001', client_id: 'c-001', car_id: 'car-001', deal_id: 'd-001', subject: 'Вопрос по документам', status: 'IN_PROGRESS', priority: 'LOW', assigned_to: 'u-002', created_at: '2024-11-19T10:00:00Z', updated_at: '2024-11-20T14:00:00Z' },
];

export const supportMessages: SupportMessage[] = [
  { id: 'sm-001', ticket_id: 'st-001', sender_id: 'c-004', sender_type: 'client', message: 'Здравствуйте! Подскажите, когда примерно приедет мой Geely?', created_at: '2024-11-21T15:00:00Z' },
  { id: 'sm-002', ticket_id: 'st-001', sender_id: 'u-002', sender_type: 'staff', message: 'Добрый день, Наталья! Ваш автомобиль сейчас в пути. Ориентировочная дата прибытия — 10 декабря.', created_at: '2024-11-21T16:00:00Z' },
  { id: 'sm-003', ticket_id: 'st-002', sender_id: 'c-001', sender_type: 'client', message: 'Добрый день! Нужен ли мне ПТС для получения авто?', created_at: '2024-11-19T10:00:00Z' },
  { id: 'sm-004', ticket_id: 'st-002', sender_id: 'u-002', sender_type: 'staff', message: 'Андрей, добрый день! Да, ПТС будет готов к моменту выдачи. Мы пришлём вам уведомление.', created_at: '2024-11-20T14:00:00Z' },
];

export const documents: Document[] = [
  { id: 'doc-001', company_id: 'comp-001', deal_id: 'd-001', client_id: 'c-001', category: 'CONTRACT', title: 'Договор №001/2024', filename: 'contract_001.pdf', mime_type: 'application/pdf', size: 245000, is_visible_to_client: true, created_at: '2024-08-01T10:00:00Z' },
  { id: 'doc-002', company_id: 'comp-001', deal_id: 'd-002', client_id: 'c-002', category: 'CONTRACT', title: 'Договор №002/2024', filename: 'contract_002.pdf', mime_type: 'application/pdf', size: 312000, is_visible_to_client: true, created_at: '2024-07-15T09:00:00Z' },
  { id: 'doc-003', company_id: 'comp-001', car_id: 'car-001', category: 'INSPECTION', title: 'Фотоотчёт осмотра Toyota', filename: 'inspection_toyota.pdf', mime_type: 'application/pdf', size: 1500000, is_visible_to_client: true, created_at: '2024-09-02T14:00:00Z' },
  { id: 'doc-004', company_id: 'comp-001', car_id: 'car-002', category: 'CUSTOMS', title: 'ГТД BMW X5', filename: 'gtd_bmw.pdf', mime_type: 'application/pdf', size: 890000, is_visible_to_client: true, created_at: '2024-11-15T11:00:00Z' },
  { id: 'doc-005', company_id: 'comp-001', deal_id: 'd-001', client_id: 'c-001', category: 'INVOICE', title: 'Счёт на оплату №001', filename: 'invoice_001.pdf', mime_type: 'application/pdf', size: 120000, is_visible_to_client: true, created_at: '2024-08-01T10:00:00Z' },
  { id: 'doc-006', company_id: 'comp-001', car_id: 'car-004', category: 'SHIPPING', title: 'Коносамент Geely', filename: 'bill_of_lading_geely.pdf', mime_type: 'application/pdf', size: 450000, is_visible_to_client: false, created_at: '2024-10-05T09:00:00Z' },
];

export const timelineEvents: TimelineEvent[] = [
  { id: 'te-001', company_id: 'comp-001', car_id: 'car-001', event_type: 'STATUS_CHANGE', title: 'Автомобиль отправлен', description: 'Контейнер загружен на судно в порту Пусан', old_status: 'WAREHOUSE', new_status: 'SHIPPED', location: 'Пусан, Корея', created_at: '2024-10-20T08:00:00Z' },
  { id: 'te-002', company_id: 'comp-001', car_id: 'car-001', event_type: 'STATUS_CHANGE', title: 'В пути', description: 'Судно следует во Владивосток', old_status: 'SHIPPED', new_status: 'IN_TRANSIT', location: 'Японское море', created_at: '2024-10-25T12:00:00Z' },
  { id: 'te-003', company_id: 'comp-001', car_id: 'car-002', event_type: 'STATUS_CHANGE', title: 'Прибыл на таможню', description: 'Автомобиль поступил на СВХ', old_status: 'ARRIVED', new_status: 'CUSTOMS', location: 'Москва', created_at: '2024-11-15T10:00:00Z' },
  { id: 'te-004', company_id: 'comp-001', car_id: 'car-004', event_type: 'STATUS_CHANGE', title: 'Отправлен морем', description: 'Контейнер MSKU1234567 загружен', old_status: 'PREPARING_FOR_SHIPMENT', new_status: 'SHIPPED', location: 'Шанхай, Китай', created_at: '2024-11-05T09:00:00Z' },
  { id: 'te-005', company_id: 'comp-001', car_id: 'car-005', event_type: 'STATUS_CHANGE', title: 'Автомобиль выдан клиенту', description: 'Клиент подписал акт приёма-передачи', old_status: 'READY_FOR_DELIVERY', new_status: 'DELIVERED', location: 'Москва', created_at: '2024-09-15T16:00:00Z' },
];

export const dashboardStats: DashboardStats = {
  total_clients: 6,
  active_deals: 5,
  total_cars: 5,
  cars_in_transit: 2,
  cars_ready: 0,
  total_revenue: 19500000,
  outstanding_payments: 2500000,
  total_expenses: 3160000,
  estimated_profit: 4340000,
  open_tasks: 4,
  overdue_tasks: 1,
  open_support: 2,
};

export const revenueByMonth = [
  { month: 'Июн', revenue: 2550000, expenses: 1200000 },
  { month: 'Июл', revenue: 0, expenses: 800000 },
  { month: 'Авг', revenue: 0, expenses: 1500000 },
  { month: 'Сен', revenue: 2550000, expenses: 900000 },
  { month: 'Окт', revenue: 0, expenses: 750000 },
  { month: 'Ноя', revenue: 0, expenses: 1400000 },
];

export const carsByStatus = [
  { status: 'Куплен', count: 1, color: '#10b981' },
  { status: 'Отправлен', count: 1, color: '#06b6d4' },
  { status: 'В пути', count: 1, color: '#f97316' },
  { status: 'Таможня', count: 1, color: '#ef4444' },
  { status: 'Выдан', count: 1, color: '#6b7280' },
];
