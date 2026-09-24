import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { query } from '../db/client.js';
import { logger } from '../logger.js';

export interface AuthUser {
  id: string;
  company_id: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        error: { code: 'UNAUTHORIZED', message: 'No token provided' } 
      });
      return;
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, config.jwt.secret) as AuthUser;
    
    // Verify user still exists and is active
    const result = await query<AuthUser>(
      `SELECT id, company_id, email, role FROM users WHERE id = $1 AND is_active = true`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ 
        error: { code: 'USER_INACTIVE', message: 'User account is inactive' } 
      });
      return;
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } 
      });
      return;
    }
    
    logger.error({ error }, 'Auth middleware error');
    res.status(500).json({ 
      error: { code: 'AUTH_ERROR', message: 'Authentication error' } 
    });
  }
}

// RBAC Middleware
export function requirePermission(...permissions: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ 
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } 
        });
        return;
      }

      // Superadmin has all permissions
      if (req.user.role === 'SUPERADMIN') {
        next();
        return;
      }

      // Check if user role has required permissions
      const result = await query(
        `SELECT COUNT(*) as count FROM permissions 
         WHERE role = $1 AND permission = ANY($2)`,
        [req.user.role, permissions]
      );

      const hasPermission = parseInt(result.rows[0].count) === permissions.length;

      if (!hasPermission) {
        res.status(403).json({ 
          error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } 
        });
        return;
      }

      next();
    } catch (error) {
      logger.error({ error }, 'Permission check error');
      res.status(500).json({ 
        error: { code: 'PERMISSION_ERROR', message: 'Permission check failed' } 
      });
    }
  };
}

// Tenant isolation middleware
export function tenantMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user?.company_id) {
    res.status(400).json({ 
      error: { code: 'NO_COMPANY', message: 'User has no company' } 
    });
    return;
  }

  // Attach company_id to request for use in queries
  (req as any).companyId = req.user.company_id;
  next();
}
