import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  console.log('🔄 Running database migrations...\n');

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Execute schema
    await pool.query(schema);
    console.log('✅ Schema created successfully\n');

    // Create indexes
    console.log('📊 Creating indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company_id);
      CREATE INDEX IF NOT EXISTS idx_clients_manager ON clients(manager_id);
      CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id);
      CREATE INDEX IF NOT EXISTS idx_deals_client ON deals(client_id);
      CREATE INDEX IF NOT EXISTS idx_cars_company ON cars(company_id);
      CREATE INDEX IF NOT EXISTS idx_cars_client ON cars(client_id);
      CREATE INDEX IF NOT EXISTS idx_cars_deal ON cars(deal_id);
      CREATE INDEX IF NOT EXISTS idx_payments_company ON payments(company_id);
      CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_company ON tasks(company_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
    `);
    console.log('✅ Indexes created\n');

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
