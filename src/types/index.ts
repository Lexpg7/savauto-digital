// ===== CORE TYPES =====
export type UUID = string;

export type Role = 'SUPERADMIN' | 'COMPANY_ADMIN' | 'MANAGER' | 'LOGISTICIAN' | 'ACCOUNTANT' | 'EMPLOYEE' | 'CLIENT';

export type Currency = 'RUB' | 'USD' | 'CNY' | 'KRW' | 'JPY' | 'EUR';

// ===== AUTH =====
export interface User {
  id: UUID;
  company_id: UUID;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: Role;
  avatar?: string;
  is_active: boolean;
  created_at: string;
}

// ===== CRM =====
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

export interface Lead {
  id: UUID;
  company_id: UUID;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  source: string;
  assigned_manager?: UUID;
  status: LeadStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: UUID;
  company_id: UUID;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone: string;
  email?: string;
  telegram_user_id?: string;
  telegram_username?: string;
  source: string;
  manager_id?: UUID;
  status: 'ACTIVE' | 'INACTIVE' | 'VIP';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ===== DEALS =====
export type DealStatus = 'NEW' | 'CALCULATION' | 'PROPOSAL' | 'CONTRACT' | 'PAYMENT' | 'CAR_PURCHASE' | 'LOGISTICS' | 'CUSTOMS' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface Deal {
  id: UUID;
  company_id: UUID;
  client_id: UUID;
  manager_id?: UUID;
  title: string;
  status: DealStatus;
  currency: Currency;
  estimated_amount: number;
  final_amount?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ===== CARS =====
export type CarStatus = 'PURCHASED' | 'INSPECTION' | 'WAREHOUSE' | 'PREPARING_FOR_SHIPMENT' | 'WAITING_FOR_SHIPMENT' | 'SHIPPED' | 'IN_TRANSIT' | 'ARRIVED' | 'CUSTOMS' | 'CUSTOMS_CLEARANCE' | 'READY_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export type FuelType = 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC' | 'GAS';
export type Transmission = 'AUTOMATIC' | 'MANUAL' | 'CVT' | 'ROBOT';
export type DriveType = 'FWD' | 'RWD' | 'AWD' | '4WD';

export interface Car {
  id: UUID;
  company_id: UUID;
  client_id: UUID;
  deal_id: UUID;
  vin?: string;
  make: string;
  model: string;
  generation?: string;
  year: number;
  color?: string;
  mileage?: number;
  engine?: string;
  engine_volume?: number;
  fuel_type?: FuelType;
  transmission?: Transmission;
  drive_type?: DriveType;
  country: string;
  purchase_price: number;
  purchase_currency: Currency;
  purchase_date?: string;
  delivery_price?: number;
  customs_price?: number;
  additional_cost?: number;
  sale_price: number;
  current_location?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  status: CarStatus;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

// ===== TIMELINE =====
export interface TimelineEvent {
  id: UUID;
  company_id: UUID;
  car_id: UUID;
  event_type: string;
  title: string;
  description?: string;
  old_status?: CarStatus;
  new_status?: CarStatus;
  location?: string;
  actor_id?: UUID;
  created_at: string;
}

// ===== PAYMENTS =====
export type PaymentType = 'DEPOSIT' | 'CAR_PAYMENT' | 'DELIVERY' | 'CUSTOMS' | 'COMMISSION' | 'ADDITIONAL' | 'REFUND' | 'OTHER';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'CANCELLED' | 'REFUNDED';

export interface Payment {
  id: UUID;
  company_id: UUID;
  client_id: UUID;
  deal_id: UUID;
  car_id?: UUID;
  amount: number;
  currency: Currency;
  type: PaymentType;
  status: PaymentStatus;
  payment_date: string;
  description?: string;
  created_at: string;
}

// ===== EXPENSES =====
export type ExpenseCategory = 'PURCHASE' | 'TRANSPORT' | 'CUSTOMS' | 'STORAGE' | 'INSURANCE' | 'REPAIR' | 'BROKER' | 'DOCUMENTS' | 'COMMISSION' | 'OTHER';

export interface Expense {
  id: UUID;
  company_id: UUID;
  car_id?: UUID;
  deal_id?: UUID;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  description: string;
  expense_date: string;
  created_at: string;
}

// ===== TASKS =====
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'WAITING' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: UUID;
  company_id: UUID;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  creator_id: UUID;
  assignee_id?: UUID;
  client_id?: UUID;
  car_id?: UUID;
  deal_id?: UUID;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// ===== NOTIFICATIONS =====
export type NotificationType = 'STATUS_CHANGED' | 'PAYMENT_CREATED' | 'PAYMENT_DUE' | 'PAYMENT_OVERDUE' | 'DOCUMENT_ADDED' | 'TASK_ASSIGNED' | 'TASK_DUE' | 'SUPPORT_MESSAGE' | 'SYSTEM';

export interface Notification {
  id: UUID;
  company_id: UUID;
  user_id: UUID;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read_at?: string;
  created_at: string;
}

// ===== SUPPORT =====
export type SupportStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_CLIENT' | 'RESOLVED' | 'CLOSED';

export interface SupportTicket {
  id: UUID;
  company_id: UUID;
  client_id: UUID;
  car_id?: UUID;
  deal_id?: UUID;
  subject: string;
  status: SupportStatus;
  priority: TaskPriority;
  assigned_to?: UUID;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: UUID;
  ticket_id: UUID;
  sender_id: UUID;
  sender_type: 'client' | 'staff';
  message: string;
  created_at: string;
}

// ===== DOCUMENTS =====
export type DocumentCategory = 'CONTRACT' | 'QUOTE' | 'INVOICE' | 'PAYMENT' | 'CUSTOMS' | 'SHIPPING' | 'INSURANCE' | 'INSPECTION' | 'VEHICLE' | 'CLIENT' | 'OTHER';

export interface Document {
  id: UUID;
  company_id: UUID;
  car_id?: UUID;
  deal_id?: UUID;
  client_id?: UUID;
  category: DocumentCategory;
  title: string;
  filename: string;
  mime_type: string;
  size: number;
  is_visible_to_client: boolean;
  created_at: string;
}

// ===== DASHBOARD =====
export interface DashboardStats {
  total_clients: number;
  active_deals: number;
  total_cars: number;
  cars_in_transit: number;
  cars_ready: number;
  total_revenue: number;
  outstanding_payments: number;
  total_expenses: number;
  estimated_profit: number;
  open_tasks: number;
  overdue_tasks: number;
  open_support: number;
}

// ===== CAR STATUS LABELS =====
export const CAR_STATUS_LABELS: Record<CarStatus, string> = {
  PURCHASED: 'Куплен',
  INSPECTION: 'Осмотр',
  WAREHOUSE: 'На складе',
  PREPARING_FOR_SHIPMENT: 'Подготовка к отправке',
  WAITING_FOR_SHIPMENT: 'Ожидает отправки',
  SHIPPED: 'Отправлен',
  IN_TRANSIT: 'В пути',
  ARRIVED: 'Прибыл',
  CUSTOMS: 'На таможне',
  CUSTOMS_CLEARANCE: 'Таможенная очистка',
  READY_FOR_DELIVERY: 'Готов к выдаче',
  DELIVERED: 'Выдан',
  CANCELLED: 'Отменён',
};

export const CAR_STATUS_COLORS: Record<CarStatus, string> = {
  PURCHASED: 'bg-green-100 text-green-800',
  INSPECTION: 'bg-blue-100 text-blue-800',
  WAREHOUSE: 'bg-indigo-100 text-indigo-800',
  PREPARING_FOR_SHIPMENT: 'bg-purple-100 text-purple-800',
  WAITING_FOR_SHIPMENT: 'bg-amber-100 text-amber-800',
  SHIPPED: 'bg-cyan-100 text-cyan-800',
  IN_TRANSIT: 'bg-orange-100 text-orange-800',
  ARRIVED: 'bg-teal-100 text-teal-800',
  CUSTOMS: 'bg-red-100 text-red-800',
  CUSTOMS_CLEARANCE: 'bg-rose-100 text-rose-800',
  READY_FOR_DELIVERY: 'bg-emerald-100 text-emerald-800',
  DELIVERED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-gray-300 text-gray-600',
};

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  NEW: 'Новая',
  CALCULATION: 'Расчёт',
  PROPOSAL: 'Предложение',
  CONTRACT: 'Договор',
  PAYMENT: 'Оплата',
  CAR_PURCHASE: 'Покупка авто',
  LOGISTICS: 'Логистика',
  CUSTOMS: 'Таможня',
  READY: 'Готов',
  COMPLETED: 'Завершена',
  CANCELLED: 'Отменена',
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'Новый',
  CONTACTED: 'Контакт установлен',
  QUALIFIED: 'Квалифицирован',
  PROPOSAL: 'Предложение',
  NEGOTIATION: 'Переговоры',
  WON: 'Выигран',
  LOST: 'Потерян',
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  RUB: '₽',
  USD: '$',
  CNY: '¥',
  KRW: '₩',
  JPY: '¥',
  EUR: '€',
};
