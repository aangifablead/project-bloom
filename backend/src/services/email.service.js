require('dotenv').config(); 
const nodemailer = require('nodemailer');
const { logger } = require('../config/logger');

// Create a transporter
// For Gmail: use service: 'gmail' and an "App Password"
// services/email.service.js
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL for port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // fergmhjubrkgojzn
    },
    tls: {
        // Essential for localhost to bypass certificate handshake errors
        rejectUnauthorized: false
    }
});

// ADD THIS: Test the connection on server startup
transporter.verify((error, success) => {
    if (error) {
        console.log("SMTP Connection Error Details:", error);
    } else {
        console.log("Mailing server is ready!");
    }
});
/**
 * Send Password Reset Email
 */
const sendResetPasswordEmail = async (to, token) => {
  const resetUrl = `http://localhost:8080/reset-password?token=${token}`;
  
  const mailOptions = {
    from: '"Project Bloom" <noreply@yourapp.com>',
    to: to,
    subject: 'Password Reset Request - Project Bloom',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Project Bloom</h1>
        </div>
        
        <div style="padding: 30px; line-height: 1.6; color: #333;">
          <h2 style="color: #1f2937;">Reset Your Password</h2>
          <p>Hello,</p>
          <p>We received a request to reset the password for your Project Bloom account. Click the button below to choose a new password. <strong>This link will expire in 1 hour.</strong></p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="font-size: 0.9em; color: #6b7280;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          
          <p style="font-size: 0.8em; color: #9ca3af; text-align: center;">
            &copy; 2026 Project Bloom. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to: ${to}`);
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = { sendResetPasswordEmail };