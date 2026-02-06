"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetEmailTemplate = void 0;
const passwordResetEmailTemplate = (name, resetURL) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 24px; background: #DC2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .warning { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 10px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>We received a request to reset your password for your Digital Learning Platform account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetURL}" class="button">Reset Password</a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #4F46E5;">${resetURL}</p>
      <div class="warning">
        <strong>⚠️ Security Notice:</strong>
        <p>This link will expire in 10 minutes. If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      </div>
      <p>Best regards,<br>The Digital Learning Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Digital Learning Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};
exports.passwordResetEmailTemplate = passwordResetEmailTemplate;
