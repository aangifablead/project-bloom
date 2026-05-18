const { validationResult } = require('express-validator');
const { handleValidationErrors } = require('./error.middleware');

/**
 * Validation middleware to check for validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationError = handleValidationErrors(errors);
    return next(validationError);
  }
  
  next();
};

/**
 * Validation middleware for checking required fields
 * @param {Array} fields - Array of field names that are required
 * @returns {Function} Middleware function
 */
const requireFields = (fields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    fields.forEach(field => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      const error = new Error(`Missing required fields: ${missingFields.join(', ')}`);
      error.statusCode = 400;
      return next(error);
    }
    
    next();
  };
};

/**
 * Validation middleware for checking if request body is not empty
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const requireBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    const error = new Error('Request body is required');
    error.statusCode = 400;
    return next(error);
  }
  
  next();
};

module.exports = {
  validateRequest,
  requireFields,
  requireBody
};