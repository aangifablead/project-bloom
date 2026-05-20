const app = require('./app');
const { connectDB } = require('./config/db');
const { logger } = require('./config/logger');
const mongoose = require('mongoose');
const http = require('http');
const { initSocket } = require('./socket');
const PORT = process.env.PORT;

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

const startServer = async () => {
  try {
    await connectDB();
    const server = http.createServer(app);
    const io = initSocket(server);
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();