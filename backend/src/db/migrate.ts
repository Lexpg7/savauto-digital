import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  console.log('🔄 Running migrations...\n');

  try {
    // Companies
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ companies');

    // Users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'EMPLOYEE',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ users');

    // Clients
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        telegram_user_id VARCHAR(50),
        telegram_username VARCHAR(100),
        source VARCHAR(100),
        manager_id UUID REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ clients');

    // Deals
    await pool.query(`
      CREATE TABLE IF NOT EXISTS deals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        client_id UUID REFERENCES clients(id),
        manager_id UUID REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'NEW',
        currency VARCHAR(3) DEFAULT 'RUB',
        estimated_amount DECIMAL(15,2) DEFAULT 0,
        final_amount DECIMAL(15,2),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ deals');

    // Cars
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cars (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        client_id UUID REFERENCES clients(id),
        deal_id UUID REFERENCES deals(id),
        make VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL,
        color VARCHAR(50),
        engine VARCHAR(100),
        transmission VARCHAR(50),
        fuel_type VARCHAR(50),
        drive_type VARCHAR(50),
        country VARCHAR(100),
        sale_price DECIMAL(15,2) DEFAULT 0,
        current_location VARCHAR(255),
        estimated_delivery_date DATE,
        status VARCHAR(50) DEFAULT 'PURCHASED',
        photo_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ cars');

    // Leads
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        source VARCHAR(100),
        status VARCHAR(50) DEFAULT 'NEW',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ leads');

    // Payments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        client_id UUID REFERENCES clients(id),
        deal_id UUID REFERENCES deals(id),
        car_id UUID REFERENCES cars(id),
        amount DECIMAL(15,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'RUB',
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        payment_date DATE,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ payments');

    // Tasks
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'TODO',
        priority VARCHAR(50) DEFAULT 'MEDIUM',
        creator_id UUID REFERENCES users(id),
        assignee_id UUID REFERENCES users(id),
        client_id UUID REFERENCES clients(id),
        car_id UUID REFERENCES cars(id),
        due_date DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ tasks');

    // Notifications
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        user_id UUID REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ notifications');

    // Documents
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        car_id UUID REFERENCES cars(id),
        deal_id UUID REFERENCES deals(id),
        client_id UUID REFERENCES clients(id),
        category VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size INTEGER NOT NULL,
        is_visible_to_client BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ documents');

    // Support Tickets
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        client_id UUID REFERENCES clients(id),
        car_id UUID REFERENCES cars(id),
        subject VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'OPEN',
        priority VARCHAR(50) DEFAULT 'MEDIUM',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ support_tickets');

    // Timeline
    await pool.query(`
      CREATE TABLE IF NOT EXISTS timeline_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        car_id UUID REFERENCES cars(id),
        event_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        old_status VARCHAR(50),
        new_status VARCHAR(50),
        location VARCHAR(255),
        actor_id UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ timeline_events');

    console.log('\n✅ All migrations completed!\n');
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await pool.end();
  }
}

migrate();
