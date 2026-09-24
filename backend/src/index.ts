import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { logger } from './logger.js';
import { testConnection } from './db/client.js';

// Routes
import authRoutes from './routes/auth.js';
import clientsRoutes from './routes/clients.js';
import carsRoutes from './routes/cars.js';
import telegramRoutes from './routes/telegram.js';

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet());
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
});
app.use(limiter);

// Stricter rate limit for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: { error: { code: 'RATE_LIMIT', message: 'Too many login attempts' } },
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
  }));
}

// Request ID
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  (req as any).requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
});

// ============================================
// HEALTH CHECKS
// ============================================

app.get('/health', async (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'savauto-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/ready', async (req, res) => {
  const dbOk = await testConnection();
  
  if (!dbOk) {
    res.status(503).json({ 
      status: 'not_ready', 
      checks: { database: 'failed' } 
    });
    return;
  }

  res.json({ 
    status: 'ready', 
    checks: { database: 'ok' } 
  });
});

// ============================================
// API ROUTES
// ============================================

const apiPrefix = config.apiPrefix;

// Auth (with stricter rate limit)
app.use(`${apiPrefix}/auth`, authLimiter, authRoutes);

// Protected routes
app.use(`${apiPrefix}/clients`, clientsRoutes);
app.use(`${apiPrefix}/cars`, carsRoutes);
app.use(`${apiPrefix}/telegram`, telegramRoutes);

// TODO: Add more routes
// app.use(`${apiPrefix}/deals`, dealsRoutes);
// app.use(`${apiPrefix}/leads`, leadsRoutes);
// app.use(`${apiPrefix}/payments`, paymentsRoutes);
// app.use(`${apiPrefix}/expenses`, expensesRoutes);
// app.use(`${apiPrefix}/tasks`, tasksRoutes);
// app.use(`${apiPrefix}/documents`, documentsRoutes);
// app.use(`${apiPrefix}/support`, supportRoutes);
// app.use(`${apiPrefix}/notifications`, notificationsRoutes);
// app.use(`${apiPrefix}/reports`, reportsRoutes);
// app.use(`${apiPrefix}/dashboard`, dashboardRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404
app.use((req, res) => {
  res.status(404).json({ 
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` } 
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ 
    err, 
    requestId: (req as any).requestId,
    path: req.path,
    method: req.method,
  }, 'Unhandled error');

  // Don't leak error details in production
  const message = config.nodeEnv === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(err.status || 500).json({ 
    error: { 
      code: err.code || 'SERVER_ERROR', 
      message,
      ...(config.nodeEnv !== 'production' && { stack: err.stack }),
    } 
  });
});

// ============================================
// START SERVER
// ============================================

async function start() {
  try {
    // Test database connection
    const dbOk = await testConnection();
    if (!dbOk) {
      logger.warn('Database not available — starting anyway for development');
    } else {
      logger.info('Database connected');
    }

    app.listen(config.port, () => {
      logger.info(`🚀 SAVAUTO API running on port ${config.port}`);
      logger.info(`📡 Health: http://localhost:${config.port}/health`);
      logger.info(`🔌 API: http://localhost:${config.port}${config.apiPrefix}`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
}

start();

export default app;
