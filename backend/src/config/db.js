const mongoose = require('mongoose');
const { logger } = require('./logger');

let dbConnection = null;

const connectDB = async () => {
  if (dbConnection) {
    logger.info('Database connection already established');
    return dbConnection;
  }

  const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pms';

  try {
    const conn = await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    dbConnection = conn;
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Handle database connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      if (dbConnection) {
        await dbConnection.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      }
    });

    return conn;
  } catch (error) {
    logger.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };