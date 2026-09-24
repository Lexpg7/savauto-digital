import { Router, Response } from 'express';
import { z } from 'zod';
import { query, transaction } from '../db/client.js';
import { logger } from '../logger.js';
import { authMiddleware, requirePermission, tenantMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware, tenantMiddleware);

// Car status state machine — allowed transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  PURCHASED: ['INSPECTION', 'CANCELLED'],
  INSPECTION: ['WAREHOUSE', 'CANCELLED'],
  WAREHOUSE: ['PREPARING_FOR_SHIPMENT', 'CANCELLED'],
  PREPARING_FOR_SHIPMENT: ['WAITING_FOR_SHIPMENT', 'CANCELLED'],
  WAITING_FOR_SHIPMENT: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['ARRIVED', 'CANCELLED'],
  ARRIVED: ['CUSTOMS', 'CANCELLED'],
  CUSTOMS: ['CUSTOMS_CLEARANCE', 'CANCELLED'],
  CUSTOMS_CLEARANCE: ['READY_FOR_DELIVERY', 'CANCELLED'],
  READY_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

// POST /cars/:id/transition — change status (state machine)
router.post('/:id/transition', requirePermission('cars.change_status'), async (req: AuthRequest, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { id } = req.params;
    const { new_status, location, description } = req.body;

    if (!new_status) {
      res.status(400).json({ 
        error: { code: 'VALIDATION_ERROR', message: 'new_status is required' } 
      });
      return;
    }

    // Use transaction for atomic operation
    const result = await transaction(async (client) => {
      // 1. Get current car with optimistic lock
      const carResult = await client.query(
        `SELECT * FROM cars WHERE id = $1 AND company_id = $2 FOR UPDATE`,
        [id, companyId]
      );

      if (carResult.rows.length === 0) {
        throw new Error('CAR_NOT_FOUND');
      }

      const car = carResult.rows[0];
      const oldStatus = car.status;

      // 2. Validate transition
      const allowedTransitions = STATUS_TRANSITIONS[oldStatus] || [];
      if (!allowedTransitions.includes(new_status)) {
        throw new Error('INVALID_TRANSITION');
      }

      // 3. Update car status
      await client.query(
        `UPDATE cars SET status = $1, current_location = COALESCE($2, current_location), 
                updated_at = NOW(), version = version + 1
         WHERE id = $3 AND company_id = $4`,
        [new_status, location || car.current_location, id, companyId]
      );

      // 4. Create timeline event
      await client.query(
        `INSERT INTO timeline_events (company_id, car_id, event_type, title, description, 
                                      old_status, new_status, location, actor_id)
         VALUES ($1, $2, 'STATUS_CHANGE', $3, $4, $5, $6, $7, $8)`,
        [
          companyId, id,
          `Статус изменён: ${oldStatus} → ${new_status}`,
          description || '',
          oldStatus, new_status,
          location || car.current_location,
          req.user!.id
        ]
      );

      // 5. Create audit log
      await client.query(
        `INSERT INTO audit_logs (company_id, actor_id, action, entity_type, entity_id, 
                                 old_values, new_values, ip_address)
         VALUES ($1, $2, 'STATUS_CHANGE', 'car', $3, $4, $5, $6)`,
        [
          companyId, req.user!.id, id,
          JSON.stringify({ status: oldStatus }),
          JSON.stringify({ status: new_status }),
          req.ip
        ]
      );

      // 6. Create notification for client
      await client.query(
        `INSERT INTO notifications (company_id, user_id, type, title, body, data)
         SELECT $1, u.id, 'STATUS_CHANGED', 
                'Статус автомобиля изменён',
                $2 || ' ' || $3 || ': ' || $4,
                json_build_object('car_id', $5, 'old_status', $6, 'new_status', $7)
         FROM users u
         WHERE u.company_id = $1 AND u.role IN ('COMPANY_ADMIN', 'MANAGER')
         LIMIT 5`,
        [
          companyId,
          car.make + ' ' + car.model,
          `(${old_status} → ${new_status})`,
          description || '',
          id, oldStatus, new_status
        ]
      );

      return { oldStatus, newStatus: new_status };
    });

    res.json({ 
      success: true, 
      data: { 
        old_status: result.oldStatus, 
        new_status: result.newStatus 
      } 
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'CAR_NOT_FOUND') {
        res.status(404).json({ 
          error: { code: 'CAR_NOT_FOUND', message: 'Car not found' } 
        });
        return;
      }
      if (error.message === 'INVALID_TRANSITION') {
        res.status(400).json({ 
          error: { code: 'INVALID_TRANSITION', message: 'This status transition is not allowed' } 
        });
        return;
      }
    }
    logger.error({ error }, 'Car transition error');
    res.status(500).json({ 
      error: { code: 'SERVER_ERROR', message: 'Failed to change car status' } 
    });
  }
});

// GET /cars/:id/timeline
router.get('/:id/timeline', requirePermission('cars.read'), async (req: AuthRequest, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { id } = req.params;

    // Verify car belongs to company
    const carResult = await query(
      `SELECT id FROM cars WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );

    if (carResult.rows.length === 0) {
      res.status(404).json({ 
        error: { code: 'CAR_NOT_FOUND', message: 'Car not found' } 
      });
      return;
    }

    const result = await query(
      `SELECT te.*, u.first_name as actor_first_name, u.last_name as actor_last_name
       FROM timeline_events te
       LEFT JOIN users u ON te.actor_id = u.id
       WHERE te.car_id = $1 AND te.company_id = $2
       ORDER BY te.created_at DESC`,
      [id, companyId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error({ error }, 'Get timeline error');
    res.status(500).json({ 
      error: { code: 'SERVER_ERROR', message: 'Failed to get timeline' } 
    });
  }
});

// GET /cars — list
router.get('/', requirePermission('cars.read'), async (req: AuthRequest, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    let whereClause = 'WHERE c.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (status) {
      whereClause += ` AND c.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM cars c ${whereClause}`,
      params
    );

    const result = await query(
      `SELECT c.*, cl.first_name as client_first_name, cl.last_name as client_last_name
       FROM cars c
       LEFT JOIN clients cl ON c.client_id = cl.id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        items: result.rows,
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].total),
        },
      },
    });
  } catch (error) {
    logger.error({ error }, 'List cars error');
    res.status(500).json({ 
      error: { code: 'SERVER_ERROR', message: 'Failed to list cars' } 
    });
  }
});

export default router;
