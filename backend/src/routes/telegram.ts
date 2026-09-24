import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { query } from '../db/client.js';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { authMiddleware, tenantMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /telegram/validate — validate Telegram WebApp initData
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      res.status(400).json({ 
        error: { code: 'VALIDATION_ERROR', message: 'initData is required' } 
      });
      return;
    }

    // Parse initData
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    
    if (!hash) {
      res.status(400).json({ 
        error: { code: 'VALIDATION_ERROR', message: 'Hash is missing' } 
      });
      return;
    }

    // Check auth_date (prevent replay attacks — max 24 hours)
    const authDate = parseInt(params.get('auth_date') || '0');
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      res.status(401).json({ 
        error: { code: 'AUTH_EXPIRED', message: 'Authentication data expired' } 
      });
      return;
    }

    // Verify hash
    params.delete('hash');
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(config.telegram.botToken)
      .digest();

    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (computedHash !== hash) {
      res.status(401).json({ 
        error: { code: 'INVALID_HASH', message: 'Invalid authentication data' } 
      });
      return;
    }

    // Parse user
    const userStr = params.get('user');
    if (!userStr) {
      res.status(400).json({ 
        error: { code: 'NO_USER', message: 'No user in initData' } 
      });
      return;
    }

    const telegramUser = JSON.parse(userStr);
    const telegramId = telegramUser.id;

    // Find linked client
    const clientResult = await query(
      `SELECT id, first_name, last_name, phone, email, company_id 
       FROM clients WHERE telegram_user_id = $1`,
      [telegramId]
    );

    if (clientResult.rows.length === 0) {
      res.status(404).json({ 
        error: { 
          code: 'CLIENT_NOT_FOUND', 
          message: 'Ваш Telegram аккаунт не привязан к клиенту. Обратитесь к менеджеру.' 
        } 
      });
      return;
    }

    const client = clientResult.rows[0];

    // Get client's cars
    const carsResult = await query(
      `SELECT id, make, model, year, status, current_location, 
              estimated_delivery_date, photo_url, sale_price
       FROM cars WHERE client_id = $1 AND company_id = $2 AND status != 'CANCELLED'
       ORDER BY created_at DESC`,
      [client.id, client.company_id]
    );

    // Get client's payments
    const paymentsResult = await query(
      `SELECT id, amount, currency, type, status, payment_date, description
       FROM payments WHERE client_id = $1 AND company_id = $2
       ORDER BY payment_date DESC`,
      [client.id, client.company_id]
    );

    // Get client-visible documents
    const docsResult = await query(
      `SELECT id, title, category, filename, created_at
       FROM documents WHERE client_id = $1 AND company_id = $2 AND is_visible_to_client = true
       ORDER BY created_at DESC`,
      [client.id, client.company_id]
    );

    res.json({
      success: true,
      data: {
        client: {
          id: client.id,
          first_name: client.first_name,
          last_name: client.last_name,
          phone: client.phone,
          email: client.email,
          telegram_username: telegramUser.username,
        },
        cars: carsResult.rows,
        payments: paymentsResult.rows,
        documents: docsResult.rows,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Telegram validate error');
    res.status(500).json({ 
      error: { code: 'SERVER_ERROR', message: 'Validation failed' } 
    });
  }
});

// POST /telegram/webhook — Telegram Bot webhook
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    // Verify webhook secret
    const secretHeader = req.headers['x-telegram-bot-api-secret-token'];
    if (config.telegram.webhookSecret && secretHeader !== config.telegram.webhookSecret) {
      res.status(403).json({ error: 'Invalid webhook secret' });
      return;
    }

    const update = req.body;
    
    // Handle message
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || '';
      const telegramId = update.message.from.id;

      logger.info({ chatId, text, telegramId }, 'Telegram message received');

      // Process command
      if (text.startsWith('/start')) {
        // Find client by telegram_id
        const clientResult = await query(
          `SELECT id, first_name FROM clients WHERE telegram_user_id = $1`,
          [telegramId]
        );

        if (clientResult.rows.length > 0) {
          const client = clientResult.rows[0];
          // Send welcome with Mini App button
          // In production, use node-telegram-bot-api
          logger.info({ clientId: client.id }, 'Client found for /start');
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    logger.error({ error }, 'Telegram webhook error');
    res.sendStatus(500);
  }
});

// POST /telegram/link — link Telegram account to client (staff only)
router.post('/link', authMiddleware, tenantMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { client_id, telegram_user_id } = req.body;

    if (!client_id || !telegram_user_id) {
      res.status(400).json({ 
        error: { code: 'VALIDATION_ERROR', message: 'client_id and telegram_user_id required' } 
      });
      return;
    }

    // Check if telegram_user_id is already linked
    const existingLink = await query(
      `SELECT id, first_name, last_name FROM clients WHERE telegram_user_id = $1 AND company_id = $2`,
      [telegram_user_id, companyId]
    );

    if (existingLink.rows.length > 0 && existingLink.rows[0].id !== client_id) {
      res.status(409).json({ 
        error: { 
          code: 'TELEGRAM_ALREADY_LINKED', 
          message: `Этот Telegram уже привязан к клиенту ${existingLink.rows[0].first_name} ${existingLink.rows[0].last_name}` 
        } 
      });
      return;
    }

    // Verify client belongs to company
    const clientResult = await query(
      `SELECT id FROM clients WHERE id = $1 AND company_id = $2`,
      [client_id, companyId]
    );

    if (clientResult.rows.length === 0) {
      res.status(404).json({ 
        error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found' } 
      });
      return;
    }

    // Link
    await query(
      `UPDATE clients SET telegram_user_id = $1 WHERE id = $2 AND company_id = $3`,
      [telegram_user_id, client_id, companyId]
    );

    // Audit
    await query(
      `INSERT INTO audit_logs (company_id, actor_id, action, entity_type, entity_id, new_values, ip_address)
       VALUES ($1, $2, 'TELEGRAM_LINK', 'client', $3, $4, $5)`,
      [companyId, req.user!.id, client_id, JSON.stringify({ telegram_user_id }), req.ip]
    );

    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Telegram link error');
    res.status(500).json({ 
      error: { code: 'SERVER_ERROR', message: 'Failed to link Telegram' } 
    });
  }
});

export default router;
