const winston = require('winston');
const path = require('path');
const config = require('../config/config');

const logDir = path.join(process.cwd(), 'logs');

const { combine, timestamp, printf, colorize, errors } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) =>
    stack ? `${timestamp} ${level}: ${message}\n${stack}` : `${timestamp} ${level}: ${message}`
  )
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: config.env === 'production' ? 'warn' : 'debug',
  format: config.env === 'production' ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    ...(config.env === 'production'
      ? [
          new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
          new winston.transports.File({ filename: path.join(logDir, 'combined.log') }),
        ]
      : []),
  ],
  exceptionHandlers: [new winston.transports.Console()],
  rejectionHandlers: [new winston.transports.Console()],
});

module.exports = logger;
