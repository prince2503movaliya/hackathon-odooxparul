const logger = require('../utils/logger');

/**
 * Global error handler - must be last middleware in Express stack.
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message, errors, stack } = err;

  // Prisma known errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = `${err.meta?.target?.join(', ') ?? 'Field'} already in use`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  } else if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Invalid reference – related record does not exist';
  }

  // Log server errors
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} → ${statusCode}: ${message}`, { stack });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} → ${statusCode}: ${message}`);
  }

  const payload = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack }),
  };

  res.status(statusCode).json(payload);
};

/**
 * 404 handler - catches unmatched routes.
 */
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

module.exports = { errorHandler, notFound };
