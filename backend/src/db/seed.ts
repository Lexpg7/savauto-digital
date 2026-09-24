import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  console.log('🌱 Seeding database...\n');

  try {
    // Create company
    const companyResult = await pool.query(`
      INSERT INTO companies (name, slug, email, phone)
      VALUES ('SAVAUTO', 'savauto', 'info@savauto.ru', '+7 (495) 123-45-67')
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `);
    
    let companyId: string;
    if (companyResult.rows.length > 0) {
      companyId = companyResult.rows[0].id;
      console.log('✅ Company created:', companyId);
    } else {
      const existing = await pool.query(`SELECT id FROM companies WHERE slug = 'savauto'`);
      companyId = existing.rows[0].id;
      console.log('✅ Company exists:', companyId);
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('demo123', 10);
    const userResult = await pool.query(`
      INSERT INTO users (company_id, first_name, last_name, email, password_hash, role)
      VALUES ($1, 'Алексей', 'Савельев', 'admin@savauto.ru', $2, 'COMPANY_ADMIN')
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [companyId, passwordHash]);
    
    let userId: string;
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
      console.log('✅ Admin user created:', userId);
    } else {
      const existing = await pool.query(`SELECT id FROM users WHERE email = 'admin@savauto.ru'`);
      userId = existing.rows[0].id;
      console.log('✅ Admin user exists:', userId);
    }

    // Create clients
    const clients = [
      { first_name: 'Андрей', last_name: 'Николаев', phone: '+7 (916) 111-22-33', email: 'andrey.n@mail.ru', telegram_user_id: '123456789', telegram_username: '@andrey_n', source: 'Telegram' },
      { first_name: 'Ольга', last_name: 'Белова', phone: '+7 (926) 222-33-44', email: 'olga.b@gmail.com', source: 'Сайт' },
      { first_name: 'Виктор', last_name: 'Морозов', phone: '+7 (903) 333-44-55', email: 'viktor.m@yandex.ru', source: 'Рекомендация' },
      { first_name: 'Наталья', last_name: 'Кузнецова', phone: '+7 (915) 444-55-66', email: 'natalia.k@mail.ru', source: 'Instagram' },
      { first_name: 'Сергей', last_name: 'Попов', phone: '+7 (977) 555-66-77', email: 'sergey.p@gmail.com', source: 'Telegram' },
    ];

    for (const client of clients) {
      await pool.query(`
        INSERT INTO clients (company_id, first_name, last_name, phone, email, telegram_user_id, telegram_username, source, manager_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE')
        ON CONFLICT DO NOTHING
      `, [companyId, client.first_name, client.last_name, client.phone, client.email, client.telegram_user_id, client.telegram_username, client.source, userId]);
    }
    console.log('✅ Clients created:', clients.length);

    // Get client IDs
    const clientIds = await pool.query(`SELECT id, first_name FROM clients WHERE company_id = $1`, [companyId]);
    
    // Create deals
    const deals = [
      { client_id: clientIds.rows[0].id, title: 'Toyota Camry 2024 — Корея', status: 'LOGISTICS', estimated_amount: 3200000 },
      { client_id: clientIds.rows[1].id, title: 'BMW X5 2023 — Китай', status: 'CUSTOMS', estimated_amount: 7500000 },
      { client_id: clientIds.rows[2].id, title: 'Hyundai Sonata 2024 — Корея', status: 'CAR_PURCHASE', estimated_amount: 2800000 },
      { client_id: clientIds.rows[3].id, title: 'Geely Monjaro 2024 — Китай', status: 'LOGISTICS', estimated_amount: 3500000 },
      { client_id: clientIds.rows[4].id, title: 'Honda CR-V 2023 — Япония', status: 'CALCULATION', estimated_amount: 4200000 },
    ];

    for (const deal of deals) {
      await pool.query(`
        INSERT INTO deals (company_id, client_id, manager_id, title, status, currency, estimated_amount)
        VALUES ($1, $2, $3, $4, $5, 'RUB', $6)
      `, [companyId, deal.client_id, userId, deal.title, deal.status, deal.estimated_amount]);
    }
    console.log('✅ Deals created:', deals.length);

    // Get deal IDs
    const dealIds = await pool.query(`SELECT id, client_id FROM deals WHERE company_id = $1`, [companyId]);

    // Create cars
    const cars = [
      { client_id: clientIds.rows[0].id, deal_id: dealIds.rows[0].id, make: 'Toyota', model: 'Camry', year: 2024, color: 'Белый перламутр', engine: '2.5L', transmission: 'AUTOMATIC', fuel_type: 'PETROL', drive_type: 'FWD', country: 'Корея', sale_price: 3200000, current_location: 'Владивосток → Москва', estimated_delivery_date: '2024-12-15', status: 'IN_TRANSIT', photo_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop' },
      { client_id: clientIds.rows[1].id, deal_id: dealIds.rows[1].id, make: 'BMW', model: 'X5', year: 2023, color: 'Чёрный', engine: '3.0L Turbo', transmission: 'AUTOMATIC', fuel_type: 'PETROL', drive_type: 'AWD', country: 'Китай', sale_price: 7500000, current_location: 'Таможня, Москва', status: 'CUSTOMS', photo_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop' },
      { client_id: clientIds.rows[2].id, deal_id: dealIds.rows[2].id, make: 'Hyundai', model: 'Sonata', year: 2024, color: 'Серый металлик', engine: '2.5L', transmission: 'AUTOMATIC', fuel_type: 'PETROL', drive_type: 'FWD', country: 'Корея', sale_price: 2800000, current_location: 'Пусан, Корея', status: 'PURCHASED', photo_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop' },
      { client_id: clientIds.rows[3].id, deal_id: dealIds.rows[3].id, make: 'Geely', model: 'Monjaro', year: 2024, color: 'Синий', engine: '2.0T', transmission: 'AUTOMATIC', fuel_type: 'PETROL', drive_type: 'AWD', country: 'Китай', sale_price: 3500000, current_location: 'Море, порт Нябо', status: 'SHIPPED', photo_url: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=400&h=300&fit=crop' },
      { client_id: clientIds.rows[4].id, deal_id: dealIds.rows[4].id, make: 'Honda', model: 'CR-V', year: 2023, color: 'Серебристый', engine: '2.0L', transmission: 'AUTOMATIC', fuel_type: 'PETROL', drive_type: 'AWD', country: 'Япония', sale_price: 4200000, current_location: 'Токио, Япония', status: 'CALCULATION', photo_url: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=300&fit=crop' },
    ];

    for (const car of cars) {
      await pool.query(`
        INSERT INTO cars (company_id, client_id, deal_id, make, model, year, color, engine, transmission, fuel_type, drive_type, country, sale_price, current_location, estimated_delivery_date, status, photo_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `, [companyId, car.client_id, car.deal_id, car.make, car.model, car.year, car.color, car.engine, car.transmission, car.fuel_type, car.drive_type, car.country, car.sale_price, car.current_location, car.estimated_delivery_date, car.status, car.photo_url]);
    }
    console.log('✅ Cars created:', cars.length);

    // Create leads
    const leads = [
      { first_name: 'Максим', last_name: 'Фёдоров', phone: '+7 (916) 777-88-99', source: 'Telegram' },
      { first_name: 'Анна', last_name: 'Смирнова', phone: '+7 (926) 888-99-00', source: 'Сайт' },
      { first_name: 'Роман', last_name: 'Козлов', phone: '+7 (903) 999-00-11', source: 'VK' },
    ];

    for (const lead of leads) {
      await pool.query(`
        INSERT INTO leads (company_id, first_name, last_name, phone, source, status)
        VALUES ($1, $2, $3, $4, $5, 'NEW')
      `, [companyId, lead.first_name, lead.last_name, lead.phone, lead.source]);
    }
    console.log('✅ Leads created:', leads.length);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📋 Login credentials:');
    console.log('   Email: admin@savauto.ru');
    console.log('   Password: demo123\n');
  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await pool.end();
  }
}

seed();
