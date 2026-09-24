import pg from 'pg';
import { config } from '../config.js';
import { logger } from '../logger.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.database.url,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected error on idle database client');
});

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  
  if (config.nodeEnv === 'development') {
    logger.debug({ duration, rows: result.rowCount }, `Query: ${text.substring(0, 100)}`);
  }
  
  return { rows: result.rows, rowCount: result.rowCount };
}

export async function transaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    logger.error({ error }, 'Database connection test failed');
    return false;
  }
}
