const { verifyToken } = require('../services/token.service.js'); 
const User = require('../models/user.model.js');
const { logger } = require('../config/logger.js');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access token is required'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }

    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'User account is deactivated'
      });
    }

    // Attach user information to request object
    req.user = user;
    req.userId = user._id.toString();
    req.userRole = user.role;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

const handleRefreshToken = async (req, res, next) => {
  logger.info('Refresh token middleware - placeholder for future implementation');
  next();
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (from previous 'authenticate' middleware)
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Authentication required' });
    }

    // Check if the user's role is in the allowed roles array
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'You do not have permission to perform this action' 
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  restrictTo,
  protect: authenticate,     
  requireAdmin: authorize,   
  handleRefreshToken
};