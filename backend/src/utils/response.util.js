/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {any} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} JSON response
 */
const sendSuccessResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @returns {Object} JSON response
 */
const sendErrorResponse = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send a not found response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Resource not found')
 * @returns {Object} JSON response
 */
const sendNotFoundResponse = (res, message = 'Resource not found') => {
  return res.status(404).json({
    status: 'error',
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send a bad request response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} JSON response
 */
const sendBadRequestResponse = (res, message) => {
  return res.status(400).json({
    status: 'error',
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send an unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Unauthorized')
 * @returns {Object} JSON response
 */
const sendUnauthorizedResponse = (res, message = 'Unauthorized') => {
  return res.status(401).json({
    status: 'error',
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send a forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Forbidden')
 * @returns {Object} JSON response
 */
const sendForbiddenResponse = (res, message = 'Forbidden') => {
  return res.status(403).json({
    status: 'error',
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Format pagination response
 * @param {Array} data - Array of items
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @param {number} total - Total number of items
 * @returns {Object} Formatted pagination object
 */
const formatPaginationResponse = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
  sendNotFoundResponse,
  sendBadRequestResponse,
  sendUnauthorizedResponse,
  sendForbiddenResponse,
  formatPaginationResponse
};