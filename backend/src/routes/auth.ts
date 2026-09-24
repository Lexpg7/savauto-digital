import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../db/client.js';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await query(
      `SELECT id, company_id, email, role, password_hash, is_active 
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ 
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } 
      });
      return;
    }

    const user = result.rows[0];

    if (!user.is_active) {
      res.status(401).json({ 
        error: { code: 'USER_INACTIVE', message: 'Account is disabled' } 
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      res.status(401).json({ 
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } 
      });
      return;
    }

    // Generate tokens
    const tokenPayload = {
      id: user.id,
      company_id: user.company_id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(tokenPayload, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiresIn,
    });

    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    // Update last login
    await query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [user.id]);

    // Log audit
    await query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, ip_address)
       VALUES ($1, 'LOGIN', 'user', $1, $2)`,
      [user.id, req.ip]
    );

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          company_id: user.company_id,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } 
      });
      return;
    }
    logger.error({ error }, 'Login error');
    res.status(500).json({ 
      error: { code: 'LOGIN_ERROR', message: 'Login failed' } 
    });
  }
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ 
        error: { code: 'NO_TOKEN', message: 'Refresh token required' } 
      });
      return;
    }

    const decoded = jwt.verify(refreshToken, config.jwt.secret) as any;

    if (decoded.type !== 'refresh') {
      res.status(401).json({ 
        error: { code: 'INVALID_TOKEN', message: 'Invalid refresh token' } 
      });
      return;
    }

    const result = await query(
      `SELECT id, company_id, email, role, is_active FROM users WHERE id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      res.status(401).json({ 
        error: { code: 'USER_INACTIVE', message: 'User not found or inactive' } 
      });
      return;
    }

    const user = result.rows[0];

    const newAccessToken = jwt.sign(
      { id: user.id, company_id: user.company_id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiresIn }
    );

    res.json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    res.status(401).json({ 
      error: { code: 'INVALID_TOKEN', message: 'Invalid refresh token' } 
    });
  }
});

// GET /auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT id, company_id, first_name, last_name, email, phone, role, avatar_url, created_at
       FROM users WHERE id = $1`,
      [req.user!.id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error({ error }, 'Get me error');
    res.status(500).json({ 
      error: { code: 'SERVER_ERROR', message: 'Failed to get user' } 
    });
  }
});

// POST /auth/logout
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, ip_address)
       VALUES ($1, 'LOGOUT', 'user', $1, $2)`,
      [req.user!.id, req.ip]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ 
      error: { code: 'LOGOUT_ERROR', message: 'Logout failed' } 
    });
  }
});

export default router;
