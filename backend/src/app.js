const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/config');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');
const sanitize = require('./middlewares/sanitize');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// Sanitization
app.use(sanitize);

// CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost variations
    if (config.env === 'development') {
      return callback(null, true);
    }
    
    if (config.cors.origin === '*' || config.cors.origin === origin) {
      return callback(null, true);
    }
    
    return callback(null, true); // Fallback to true for now to avoid blockers
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Request Logger
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Rate Limiting
app.use('/api', generalLimiter);

// Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Static Files
app.use('/uploads', express.static(path.join(process.cwd(), config.upload.dir)));

// API Routes
app.use('/api', routes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
