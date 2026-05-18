const crypto = require('crypto');
const { generateSecret, generateURI, verify } = require('otplib');
const User = require('../models/user.model');
const { 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} = require('../services/token.service');
const { sendSuccessResponse } = require('../utils/response.util');
const { logger } = require('../config/logger');
const { sendResetPasswordEmail } = require('../services/email.service');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    const user = new User({ name, email, password });
    await user.save();

    logger.info(`New user registered: ${email}`);

    const payload = { id: user._id, email: user.email, role: user.role };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return sendSuccessResponse(res, {
      user: userData,
      token,
      message: 'User registered successfully'
    }, 201);
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(401).json({ status: 'error', message: 'Account is deactivated' });
    }
    if (user.isLocked) {
      return res.status(401).json({ status: 'error', message: 'Account is temporarily locked' });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      logger.warn(`Failed login attempt for email: ${email}`);
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }
    await user.resetLoginAttempts();
    
    if (user.isTwoFactorEnabled) {
      logger.info(`2FA verification required for user: ${email}`);
      return res.status(200).json({
        status: '2fa_required',
        message: 'Two-factor authentication code required to complete login.',
        userId: user._id
      });
    }

    const payload = { id: user._id, email: user.email, role: user.role };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    const userData = { _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive };
    logger.info(`User logged in: ${email}`);
    return sendSuccessResponse(res, { user: userData, token, message: 'Login successful' });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const tokenFromCookie = req.cookies?.refreshToken;

    if (!tokenFromCookie) {
      return res.status(401).json({ status: 'error', message: 'Refresh token missing from context' });
    }

    const decoded = verifyRefreshToken(tokenFromCookie);
    if (!decoded) {
      return res.status(401).json({ status: 'error', message: 'Invalid or expired refresh token structure' });
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== tokenFromCookie) {
      return res.status(401).json({ status: 'error', message: 'Session expired or token reused' });
    }

    const newAccessToken = generateToken({ id: user._id, email: user.email, role: user.role });

    return res.status(200).json({
      status: 'success',
      token: newAccessToken
    });
  } catch (error) {
    logger.error('Refresh Token system error:', error);
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const tokenFromCookie = req.cookies?.refreshToken;

    if (tokenFromCookie) {
      await User.findOneAndUpdate({ refreshToken: tokenFromCookie }, { refreshToken: undefined });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
  } catch (error) {
    logger.error('Logout handler error:', error);
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'No user found.' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 3600000;
    await user.save();
    await sendResetPasswordEmail(user.email, resetToken);
    res.status(200).json({ status: 'success', message: 'Email sent!' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is invalid or has expired.'
      });
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return sendSuccessResponse(res, {
      message: 'Password has been reset successfully!'
    }, 200);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ status: 'error', message: 'Incorrect current password' });
    }
    user.password = newPassword;
    await user.save();
    logger.info(`Password successfully updated for user: ${user.email}`);
    return res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
};

const enable2FA = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id || req.body.userId;
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User authentication context missing.'
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    const secret = generateSecret();
    const otpauthUrl = generateURI({
      secret,
      accountName: user.email,
      issuer: 'ProjectFlow'
    });
    user.twoFactorSecret = secret;
    await user.save();
    
    return res.status(200).json({
      status: 'success',
      qrCodeUrl: otpauthUrl,
      secret: secret
    });
  } catch (error) {
    logger.error('Enable 2FA error:', error);
    next(error);
  }
};

const verify2FA = async (req, res, next) => {
  try {
    const { userId, code } = req.body;
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    const isValid = verify({
      token: code,
      secret: user.twoFactorSecret
    });
    if (!isValid) {
      return res.status(400).json({ status: 'error', message: 'Invalid authentication code. Please check your app.' });
    }
    if (!user.isTwoFactorEnabled) {
      user.isTwoFactorEnabled = true;
      await user.save();
    }
    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    const userData = { _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive };
    return sendSuccessResponse(res, { user: userData, token, message: 'Two-factor verification successful' });
  } catch (error) {
    logger.error('2FA Verification error:', error);
    next(error);
  }
};

const disable2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();
    return res.status(200).json({ status: 'success', message: '2FA protection turned off successfully.' });
  } catch (error) {
    logger.error('Disable 2FA error:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  enable2FA,
  verify2FA,
  disable2FA
};