import { Router, Response } from 'express';
import { z } from 'zod';
import { query } from '../db/client.js';
import { logger } from '../logger.js';
import { authMiddleware, requirePermission, tenantMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All routes require auth + tenant isolation
router.use(authMiddleware, tenantMiddleware);

// Validation schemas
const createClientSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  middle_name: z.string().optional(),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  telegram_username: z.string().optional(),
  source: z.string().optional(),
  manager_id: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'VIP']).optional(),
  notes: z.string().optional(),
});

const updateClientSchema = createClientSchema.partial();

// GET /clients — list with pagination & filters
router.get('/', requirePermission('clients.read'), async (req: AuthRequest, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;
    
    const search = req.query.search as string;
    const status = req.query.status as string;
    const managerId = req.query.manager_id as string;

    let whereClause = 'WHERE company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR phone ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (managerId) {
      whereClause += ` AND manager_id = $${paramIndex}`;
      params.push(managerId);
      paramIndex++;
    }

    // Count total
    const countResult = await query(
      `SELECT COUNT(*) as total FROM clients ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get paginated data
    const dataResult = await query(
      `SELECT c.*, 
              u.first_name as manager_first_name, 
              u.last_name as manager_last_name
       FROM clients c
       LEFT JOIN users u ON c.manager_id = u.id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        items: dataResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error({ error }, 'List clients error');
    res.status(500).json({ 
      error: { code: 'SERVER_ERROR', message: 'Failed to list clients' } 
    });
  }
});

// GET /clients/:id — get by ID (with tenant isolation)
router.get('/:id', requirePermission('clients.read'), async (req: AuthRequest, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { id } = req.params;

    const result = await query(
      `SELECT c.*, 
              u.first_name as manager_first_name, 
              u.last_name as manager_last_name
       FROM clients c
       LEFT JOIN users u ON c.manager_id = u.id
       WHERE c.id = $1 AND c.company_id = $2`,
      [id, companyId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ 
        error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found' } 
      });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error({ error }, 'Get client error');
    res.status(500).json({ 
      error: { code: 'SERVER_ERROR', message: 'Failed to get client' } 
    });
  }
});

// POST /clients — create
router.post('/', requirePermission('clients.create'), async (req: AuthRequest, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const data = createClientSchema.parse(req.body);

    const result = await query(
      `INSERT INTO clients (company_id, first_name, last_name, middle_name, phone, email, 
                            telegram_username, source, manager_id, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        companyId, data.first_name, data.last_name, data.middle_name,
        data.phone, data.email, data.telegram_username, data.source,
        data.manager_id, data.status || 'ACTIVE', data.notes
      ]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (company_id, actor_id, action, entity_type, entity_id, new_values, ip_address)
       VALUES ($1, $2, 'CREATE', 'client', $3, $4, $5)`,
      [companyId, req.user!.id, result.rows[0].id, JSON.stringify(data), req.ip]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: { code: 'VALIDATION_ERROR', message: 'Invalid data', details: error.errors } 
      });
      return;
    }
    logger.error({ error }, 'Create client error');
    res.status(500).json({ 
      error: { code: 'SERVER_ERROR', message: 'Failed to create client' } 
    });
  }
});

// PATCH /clients/:id — update
router.patch('/:id', requirePermission('clients.update'), async (req: AuthRequest, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { id } = req.params;
    const data = updateClientSchema.parse(req.body);

    // Verify ownership
    const existing = await query(
      `SELECT * FROM clients WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );

    if (existing.rows.length === 0) {
      res.status(404).json({ 
        error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found' } 
      });
      return;
    }

    const oldValues = existing.rows[0];

    // Build dynamic update
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      res.status(400).json({ 
        error: { code: 'NO_DATA', message: 'No fields to update' } 
      });
      return;
    }

    values.push(id, companyId);
    
    const result = await query(
      `UPDATE clients SET ${fields.join(', ')} WHERE id = $${paramIndex} AND company_id = $${paramIndex + 1} RETURNING *`,
      values
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (company_id, actor_id, action, entity_type, entity_id, old_values, new_values, ip_address)
       VALUES ($1, $2, 'UPDATE', 'client', $3, $4, $5, $6)`,
      [companyId, req.user!.id, id, JSON.stringify(oldValues), JSON.stringify(data), req.ip]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: { code: 'VALIDATION_ERROR', message: 'Invalid data', details: error.errors } 
      });
      return;
    }
    logger.error({ error }, 'Update client error');
    res.status(500).json({ 
      error: { code: 'SERVER_ERROR', message: 'Failed to update client' } 
    });
  }
});

// DELETE /clients/:id — soft delete
router.delete('/:id', requirePermission('clients.delete'), async (req: AuthRequest, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { id } = req.params;

    const result = await query(
      `UPDATE clients SET status = 'INACTIVE', updated_at = NOW() 
       WHERE id = $1 AND company_id = $2 RETURNING id`,
      [id, companyId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ 
        error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found' } 
      });
      return;
    }

    // Audit log
    await query(
      `INSERT INTO audit_logs (company_id, actor_id, action, entity_type, entity_id, ip_address)
       VALUES ($1, $2, 'DELETE', 'client', $3, $4)`,
      [companyId, req.user!.id, id, req.ip]
    );

    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Delete client error');
    res.status(500).json({ 
      error: { code: 'SERVER_ERROR', message: 'Failed to delete client' } 
    });
  }
});

export default router;
