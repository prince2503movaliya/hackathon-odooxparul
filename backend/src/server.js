const app = require('./app');
const config = require('./config/config');
const logger = require('./utils/logger');
const prisma = require('./config/prisma');

const startServer = async () => {
  try {
    // Check DB connection
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database');

    const server = app.listen(config.port, () => {
      logger.info(`Server is running in ${config.env} mode on port ${config.port}`);
    });

    // Handle Graceful Shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Closed database connections and server');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

// Handle unhandled rejections/exceptions
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});
