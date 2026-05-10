require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 5000,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'traveloop_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'traveloop_refresh_secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxSizeMB: 5,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
  },

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@traveloop.com',
  },
};

module.exports = config;
