import bcrypt from 'bcrypt';
import { pool, query } from './client.js';
import { config } from '../config.js';
import { logger } from '../logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  try {
    logger.info('🌱 Starting database seed...');

    // 1. Run schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(schema);
    logger.info('✅ Schema created');

    // 2. Create default company
    const companyResult = await query(
      `INSERT INTO companies (name, slug, email, phone)
       VALUES ('SAVAUTO', 'savauto', 'info@savauto.ru', '+7 (495) 123-45-67')
       ON CONFLICT (slug) DO NOTHING
       RETURNING id`
    );
    
    let companyId: string;
    if (companyResult.rows.length > 0) {
      companyId = companyResult.rows[0].id;
      logger.info(`✅ Company created: ${companyId}`);
    } else {
      const existing = await query(`SELECT id FROM companies WHERE slug = 'savauto'`);
      companyId = existing.rows[0].id;
      logger.info(`✅ Company exists: ${companyId}`);
    }

    // 3. Create permissions
    const roles = ['SUPERADMIN', 'COMPANY_ADMIN', 'MANAGER', 'LOGISTICIAN', 'ACCOUNTANT', 'EMPLOYEE'];
    const allPermissions = [
      'clients.read', 'clients.create', 'clients.update', 'clients.delete',
      'leads.read', 'leads.create', 'leads.update', 'leads.delete',
      'deals.read', 'deals.create', 'deals.update', 'deals.delete',
      'cars.read', 'cars.create', 'cars.update', 'cars.delete', 'cars.change_status',
      'payments.read', 'payments.create', 'payments.update', 'payments.delete',
      'expenses.read', 'expenses.create', 'expenses.update', 'expenses.delete',
      'documents.read', 'documents.create', 'documents.delete',
      'media.read', 'media.create', 'media.delete',
      'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete',
      'users.read', 'users.create', 'users.update', 'users.delete',
      'reports.read', 'audit.read',
      'support.read', 'support.respond',
      'settings.read', 'settings.update',
    ];

    // Superadmin gets all
    for (const perm of allPermissions) {
      await query(
        `INSERT INTO permissions (role, permission) VALUES ('SUPERADMIN', $1) ON CONFLICT DO NOTHING`,
        [perm]
      );
    }

    // Company admin gets most
    const adminPerms = allPermissions.filter(p => !p.startsWith('settings.'));
    for (const perm of adminPerms) {
      await query(
        `INSERT INTO permissions (role, permission) VALUES ('COMPANY_ADMIN', $1) ON CONFLICT DO NOTHING`,
        [perm]
      );
    }

    // Manager gets client/deal/car related
    const managerPerms = allPermissions.filter(p => 
      p.startsWith('clients.') || p.startsWith('leads.') || p.startsWith('deals.') || 
      p.startsWith('cars.') || p.startsWith('payments.') || p.startsWith('tasks.') ||
      p.startsWith('documents.') || p.startsWith('support.')
    );
    for (const perm of managerPerms) {
      await query(
        `INSERT INTO permissions (role, permission) VALUES ('MANAGER', $1) ON CONFLICT DO NOTHING`,
        [perm]
      );
    }

    logger.info('✅ Permissions created');

    // 4. Create users
    const users = [
      { first: 'Алексей', last: 'Савельев', email: config.firstAdmin.email, role: 'COMPANY_ADMIN' },
      { first: 'Мария', last: 'Козлова', email: 'maria@savauto.ru', role: 'MANAGER' },
      { first: 'Дмитрий', last: 'Волков', email: 'dmitry@savauto.ru', role: 'LOGISTICIAN' },
      { first: 'Елена', last: 'Петрова', email: 'elena@savauto.ru', role: 'ACCOUNTANT' },
    ];

    const passwordHash = await bcrypt.hash('demo123', 12);

    for (const user of users) {
      await query(
        `INSERT INTO users (company_id, first_name, last_name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (company_id, email) DO NOTHING`,
        [companyId, user.first, user.last, user.email, passwordHash, user.role]
      );
    }
    logger.info('✅ Users created');

    // 5. Create demo clients
    const clients = [
      { first: 'Андрей', last: 'Николаев', phone: '+79161112233', telegram: 123456789 },
      { first: 'Ольга', last: 'Белова', phone: '+79262223344' },
      { first: 'Виктор', last: 'Морозов', phone: '+79033334455' },
    ];

    for (const client of clients) {
      await query(
        `INSERT INTO clients (company_id, first_name, last_name, phone, telegram_user_id, source, status)
         VALUES ($1, $2, $3, $4, $5, 'Telegram', 'ACTIVE')
         ON CONFLICT DO NOTHING`,
        [companyId, client.first, client.last, client.phone, client.telegram || null]
      );
    }
    logger.info('✅ Demo clients created');

    logger.info('\n🎉 Seed completed successfully!');
    logger.info('\n📋 Demo credentials:');
    logger.info(`   Email: ${config.firstAdmin.email}`);
    logger.info(`   Password: demo123`);
    logger.info(`\n📋 Other users (same password: demo123):`);
    for (const user of users) {
      logger.info(`   ${user.email} (${user.role})`);
    }

  } catch (error) {
    logger.error({ error }, 'Seed failed');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
