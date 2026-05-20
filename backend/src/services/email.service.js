require('dotenv').config();

const nodemailer = require('nodemailer');
const { logger } = require('../config/logger');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error) => {
  if (error) {
    console.log(
      'SMTP Connection Error:',
      error
    );
  } else {
    console.log(
      '✅ Mailing server is ready!'
    );
  }
});
const sendResetPasswordEmail = async (
  to,
  token
) => {
  const resetUrl = `http://localhost:8080/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Project Bloom" <${process.env.EMAIL_USER}>`,

    to,

    subject:
      'Password Reset Request - Project Bloom',

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        
        <div style="background: #4f46e5; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">
            Project Bloom
          </h1>
        </div>

        <div style="padding: 30px;">
          <h2>Reset Your Password</h2>

          <p>
            We received a request to reset your password.
          </p>

          <p>
            Click the button below to continue.
          </p>

          <div style="text-align:center; margin: 30px 0;">
            <a
              href="${resetUrl}"
              style="
                background:#4f46e5;
                color:white;
                padding:12px 24px;
                text-decoration:none;
                border-radius:6px;
                display:inline-block;
                font-weight:bold;
              "
            >
              Reset Password
            </a>
          </div>

          <p style="color:#666; font-size:14px;">
            This link will expire in 1 hour.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

    logger.info(
      `Password reset email sent to ${to}`
    );
  } catch (error) {
    logger.error(
      'Reset password email failed:',
      error
    );

    throw new Error(
      'Email could not be sent'
    );
  }
};

// ======================================================
// TEAM INVITE EMAIL
// ======================================================

const sendInviteEmail = async ({
  name,
  email,
  role,
  inviteToken,
}) => {
  const inviteUrl = `http://localhost:8080/accept-invite/${inviteToken}`;

  const mailOptions = {
    from: `"Project Bloom" <${process.env.EMAIL_USER}>`,

    to: email,

    subject:
      'You have been invited to Project Bloom',

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        overflow: hidden;
      ">

        <!-- HEADER -->
        <div style="
          background: #4f46e5;
          padding: 24px;
          text-align: center;
        ">
          <h1 style="
            color: white;
            margin: 0;
            font-size: 28px;
          ">
            Project Bloom
          </h1>
        </div>

        <!-- BODY -->
        <div style="padding: 32px;">

          <h2 style="
            margin-top: 0;
            color: #111827;
          ">
            Team Invitation
          </h2>

          <p style="
            color: #374151;
            line-height: 1.6;
          ">
            Hello <strong>${name}</strong>,
          </p>

          <p style="
            color: #374151;
            line-height: 1.6;
          ">
            You have been invited to join
            <strong>Project Bloom</strong>
            as a
            <strong>${role}</strong>.
          </p>

          <p style="
            color: #374151;
            line-height: 1.6;
          ">
            Click the button below to accept your invitation.
          </p>

          <!-- BUTTON -->
          <div style="
            text-align: center;
            margin: 40px 0;
          ">
            <a
              href="${inviteUrl}"
              style="
                background: #4f46e5;
                color: white;
                padding: 14px 28px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                display: inline-block;
              "
            >
              Accept Invitation
            </a>
          </div>

          <p style="
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
          ">
            If the button does not work,
            copy and paste this URL into your browser:
          </p>

          <p style="
            word-break: break-all;
            font-size: 14px;
            color: #4f46e5;
          ">
            ${inviteUrl}
          </p>

          <hr style="
            margin: 30px 0;
            border: none;
            border-top: 1px solid #e5e7eb;
          " />

          <p style="
            font-size: 12px;
            color: #9ca3af;
            text-align: center;
          ">
            © 2026 Project Bloom.
            All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

    logger.info(
      `Invite email sent to ${email}`
    );
  } catch (error) {
    logger.error(
      'Invite email failed:',
      error
    );

    throw new Error(
      'Invite email could not be sent'
    );
  }
};

module.exports = {
  sendResetPasswordEmail,
  sendInviteEmail,
};