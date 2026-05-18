const express = require('express');
const { body } = require('express-validator');
const { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  changePassword, 
  disable2FA, 
  enable2FA,
  verify2FA,
  refresh
} = require('../controllers/auth.controller');
const { validateRequest } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware'); 

const router = express.Router();

const registerValidationRules = [
  body('name').isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters').trim().escape(),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const loginValidationRules = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const changePasswordValidationRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];

const verificationValidationRules = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Verification token must be exactly 6 characters long')
];

router.post('/register', registerValidationRules, validateRequest, register);
router.post('/login', loginValidationRules, validateRequest, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', authenticate, changePasswordValidationRules, validateRequest, changePassword);
router.post('/2fa/enable', authenticate, enable2FA);
router.post('/2fa/disable', authenticate, disable2FA);
router.post('/2fa/verify', verificationValidationRules, validateRequest, verify2FA);
router.post('/refresh', refresh);
router.get('/me', authenticate, (req, res) => {
  // Your 'authenticate' middleware attaches the verified database user to req.user
  if (!req.user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  // Strip the password out just to be safe
  const userData = req.user.toObject ? req.user.toObject() : { ...req.user };
  delete userData.password;

  res.status(200).json({
    success: true,
    data: userData
  });
});
module.exports = router;