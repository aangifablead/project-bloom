const path = require('path');

const loadEnv = () => {
  // Load environment variables from .env file
  require('dotenv').config({
    path: path.resolve(process.cwd(), '.env'),
  });

  // Validate required environment variables
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_EXPIRE',
    'BCRYPT_SALT_ROUNDS'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  // Set default values for optional environment variables
  process.env.PORT = process.env.PORT || '5000';
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';
  process.env.MAX_LOGIN_ATTEMPTS = process.env.MAX_LOGIN_ATTEMPTS || '5';
  process.env.LOCK_TIME = process.env.LOCK_TIME || '10m';
  process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
};

module.exports = { loadEnv };