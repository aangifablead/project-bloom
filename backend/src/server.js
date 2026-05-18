const app = require('./app');
const { connectDB } = require('./config/db');
const { logger } = require('./config/logger');
const mongoose = require('mongoose');
const PORT = process.env.PORT ;

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
// TEMPORARY CLEANUP CODE
mongoose.connection.on('open', async () => {
  try {
    const admin = mongoose.connection.db.admin();
    // This removes the index that is causing the 500 error
    await mongoose.connection.db.collection('users').dropIndex('username_1');
    console.log('Successfully dropped the duplicate username index.');
  } catch (err) {
    console.log('Index already gone or error:', err.message);
  }
});
// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

      switch (error.code) {
        case 'EACCES':
          logger.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(bind + ' is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();