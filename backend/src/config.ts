import dotenv from 'dotenv';
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000'),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),

  database: {
    url: process.env.DATABASE_URL || 'postgresql://savauto:savauto_dev_password@localhost:5432/savauto',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || '',
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || '',
    botUsername: process.env.TELEGRAM_BOT_USERNAME || '',
    miniAppUrl: process.env.MINI_APP_URL || 'http://localhost:3000/app',
  },

  s3: {
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    accessKey: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.S3_SECRET_KEY || 'minioadmin',
    bucket: process.env.S3_BUCKET || 'savauto',
    region: process.env.S3_REGION || 'us-east-1',
    usePathStyle: process.env.S3_USE_PATH_STYLE === 'true',
  },

  firstAdmin: {
    email: process.env.FIRST_ADMIN_EMAIL || 'admin@savauto.ru',
    password: process.env.FIRST_ADMIN_PASSWORD || 'ChangeThisPassword123!',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  logLevel: process.env.LOG_LEVEL || 'info',
};
