const { logger } = require('../config/logger');

/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const errorMiddleware = (err, req, res, next) => {
  // Log error details
  logger.error(`Error occurred: ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: err.stack
  });

  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Prepare error response
  const errorResponse = {
    status: 'error',
    message: err.isOperational ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Send response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFoundHandler = (req, res) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  
  logger.warn(`404 - Route not found: ${req.originalUrl}`, {
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    status: 'error',
    message: error.message
  });
};

/**
 * Validation error handler
 * @param {Array} errors - Array of validation errors
 * @returns {Object} Formatted error response
 */
const handleValidationErrors = (errors) => {
  const errorMessages = errors.array().map(error => ({
    field: error.param,
    message: error.msg,
    value: error.value
  }));

  const error = new Error('Validation failed');
  error.statusCode = 400;
  error.validationErrors = errorMessages;
  
  logger.warn('Validation error', { errors: errorMessages });

  return error;
};

module.exports = {
  errorMiddleware,
  notFoundHandler,
  handleValidationErrors
};