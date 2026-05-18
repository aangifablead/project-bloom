const jwt = require('jsonwebtoken');
const { logger } = require('../config/logger');

/**
 * Generate JWT access token
 * @param {Object} payload - Data to include in the token
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRE || '15m'; // Default short life: 15 minutes

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify JWT access token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }

    return jwt.verify(token, secret);
  } catch (error) {
    logger.error('Token verification failed:', error.message);
    return null;
  }
};

/**
 * Generate long-lived secure refresh token
 * @param {Object} payload - Data to include in the token
 * @returns {string} Refresh token
 */
const generateRefreshToken = (payload) => {
  // Uses a dedicated refresh secret fallback for absolute production isolation
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRE || '7d'; // Default persistent life: 7 days

  if (!secret) {
    throw new Error('JWT refresh configuration secret is not defined');
  }

  return jwt.sign(payload, secret, { 
    expiresIn,
    issuer: 'pms-backend',
    audience: 'pms-users'
  });
};

/**
 * Verify secure refresh token matrix
 * @param {string} token - Refresh token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyRefreshToken = (token) => {
  try {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT refresh configuration secret is not defined');
    }

    return jwt.verify(token, secret);
  } catch (error) {
    logger.error('Refresh token verification failed:', error.message);
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken
};