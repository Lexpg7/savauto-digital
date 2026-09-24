-- ============================================
-- SAVAUTO DIGITAL — Database Schema
-- PostgreSQL 15+
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- COMPANIES (Multi-tenancy)
-- ============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  timezone VARCHAR(50) DEFAULT 'Europe/Moscow',
  currency VARCHAR(3) DEFAULT 'RUB',
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS (Staff)
-- ============================================
CREATE TYPE user_role AS ENUM (
  'SUPERADMIN', 'COMPANY_ADMIN', 'MANAGER', 
  'LOGISTICIAN', 'ACCOUNTANT', 'EMPLOYEE'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'EMPLOYEE',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, email)
);

CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- PERMISSIONS (RBAC)
-- ============================================
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL,
  permission VARCHAR(100) NOT NULL,
  UNIQUE(role, permission)
);

-- ============================================
-- CLIENTS
-- ============================================
CREATE TYPE client_status AS ENUM ('ACTIVE', 'INACTIVE', 'VIP');

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  telegram_user_id BIGINT UNIQUE,
  telegram_username VARCHAR(100),
  source VARCHAR(100),
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status client_status DEFAULT 'ACTIVE',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_company ON clients(company_id);
CREATE INDEX idx_clients_manager ON clients(manager_id);
CREATE INDEX idx_clients_telegram ON clients(telegram_user_id);
CREATE INDEX idx_clients_phone ON clients(phone);

-- ============================================
-- LEADS
-- ============================================
CREATE TYPE lead_status AS ENUM (
  'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 
  'NEGOTIATION', 'WON', 'LOST'
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  source VARCHAR(100),
  assigned_manager UUID REFERENCES users(id) ON DELETE SET NULL,
  status lead_status DEFAULT 'NEW',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_company ON leads(company_id);
CREATE INDEX idx_leads_status ON leads(status);

-- ============================================
-- DEALS
-- ============================================
CREATE TYPE deal_status AS ENUM (
  'NEW', 'CALCULATION', 'PROPOSAL', 'CONTRACT', 'PAYMENT',
  'CAR_PURCHASE', 'LOGISTICS', 'CUSTOMS', 'READY', 
  'COMPLETED', 'CANCELLED'
);

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  status deal_status DEFAULT 'NEW',
  currency VARCHAR(3) DEFAULT 'RUB',
  estimated_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  final_amount DECIMAL(15,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

CREATE INDEX idx_deals_company ON deals(company_id);
CREATE INDEX idx_deals_client ON deals(client_id);
CREATE INDEX idx_deals_status ON deals(status);

-- ============================================
-- CARS
-- ============================================
CREATE TYPE car_status AS ENUM (
  'PURCHASED', 'INSPECTION', 'WAREHOUSE', 'PREPARING_FOR_SHIPMENT',
  'WAITING_FOR_SHIPMENT', 'SHIPPED', 'IN_TRANSIT', 'ARRIVED',
  'CUSTOMS', 'CUSTOMS_CLEARANCE', 'READY_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
);

CREATE TYPE fuel_type AS ENUM ('PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'GAS');
CREATE TYPE transmission_type AS ENUM ('AUTOMATIC', 'MANUAL', 'CVT', 'ROBOT');
CREATE TYPE drive_type AS ENUM ('FWD', 'RWD', 'AWD', '4WD');

CREATE TABLE cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  vin VARCHAR(17),
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  generation VARCHAR(100),
  year INTEGER NOT NULL,
  color VARCHAR(50),
  mileage INTEGER,
  engine VARCHAR(100),
  engine_volume INTEGER,
  fuel_type fuel_type,
  transmission transmission_type,
  drive_type drive_type,
  country VARCHAR(100) NOT NULL,
  purchase_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  purchase_currency VARCHAR(3) DEFAULT 'RUB',
  purchase_date DATE,
  delivery_price DECIMAL(15,2) DEFAULT 0,
  customs_price DECIMAL(15,2) DEFAULT 0,
  additional_cost DECIMAL(15,2) DEFAULT 0,
  sale_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  current_location VARCHAR(255),
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  status car_status DEFAULT 'PURCHASED',
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

CREATE INDEX idx_cars_company ON cars(company_id);
CREATE INDEX idx_cars_client ON cars(client_id);
CREATE INDEX idx_cars_deal ON cars(deal_id);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_vin ON cars(vin);

-- ============================================
-- TIMELINE EVENTS
-- ============================================
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  old_status car_status,
  new_status car_status,
  location VARCHAR(255),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_car ON timeline_events(car_id);
CREATE INDEX idx_timeline_company ON timeline_events(company_id);

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TYPE payment_type AS ENUM (
  'DEPOSIT', 'CAR_PAYMENT', 'DELIVERY', 'CUSTOMS',
  'COMMISSION', 'ADDITIONAL', 'REFUND', 'OTHER'
);

CREATE TYPE payment_status AS ENUM (
  'PENDING', 'PARTIAL', 'PAID', 'CANCELLED', 'REFUNDED'
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RUB',
  type payment_type NOT NULL,
  status payment_status DEFAULT 'PENDING',
  payment_date DATE NOT NULL,
  description TEXT,
  external_reference VARCHAR(255),
  idempotency_key VARCHAR(255) UNIQUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_company ON payments(company_id);
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_deal ON payments(deal_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- EXPENSES
-- ============================================
CREATE TYPE expense_category AS ENUM (
  'PURCHASE', 'TRANSPORT', 'CUSTOMS', 'STORAGE',
  'INSURANCE', 'REPAIR', 'BROKER', 'DOCUMENTS', 'COMMISSION', 'OTHER'
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RUB',
  category expense_category NOT NULL,
  description TEXT NOT NULL,
  expense_date DATE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_company ON expenses(company_id);
CREATE INDEX idx_expenses_car ON expenses(car_id);

-- ============================================
-- TASKS
-- ============================================
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'WAITING', 'DONE', 'CANCELLED');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status task_status DEFAULT 'TODO',
  priority task_priority DEFAULT 'MEDIUM',
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_company ON tasks(company_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TYPE notification_type AS ENUM (
  'STATUS_CHANGED', 'PAYMENT_CREATED', 'PAYMENT_DUE', 'PAYMENT_OVERDUE',
  'DOCUMENT_ADDED', 'TASK_ASSIGNED', 'TASK_DUE', 'SUPPORT_MESSAGE', 'SYSTEM'
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read_at);

-- ============================================
-- DOCUMENTS
-- ============================================
CREATE TYPE document_category AS ENUM (
  'CONTRACT', 'QUOTE', 'INVOICE', 'PAYMENT', 'CUSTOMS',
  'SHIPPING', 'INSURANCE', 'INSPECTION', 'VEHICLE', 'CLIENT', 'OTHER'
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  category document_category NOT NULL,
  title VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  object_key TEXT NOT NULL,
  is_visible_to_client BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_company ON documents(company_id);
CREATE INDEX idx_documents_client ON documents(client_id);

-- ============================================
-- SUPPORT TICKETS
-- ============================================
CREATE TYPE support_status AS ENUM (
  'OPEN', 'IN_PROGRESS', 'WAITING_FOR_CLIENT', 'RESOLVED', 'CLOSED'
);

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  subject VARCHAR(255) NOT NULL,
  status support_status DEFAULT 'OPEN',
  priority task_priority DEFAULT 'MEDIUM',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('client', 'staff')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_company ON support_tickets(company_id);
CREATE INDEX idx_support_tickets_client ON support_tickets(client_id);

-- ============================================
-- AUDIT LOG
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  actor_id UUID,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_company ON audit_logs(company_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================
-- EXCHANGE RATES
-- ============================================
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_currency VARCHAR(3) NOT NULL,
  quote_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(20,8) NOT NULL,
  source VARCHAR(100),
  rate_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(base_currency, quote_currency, rate_date)
);

-- ============================================
-- REFRESH TOKENS
-- ============================================
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
