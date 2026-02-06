"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountDeletedEmailTemplate = void 0;
const accountDeletedEmailTemplate = (name) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #6B7280; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Account Deleted</h1>
    </div>
    <div class="content">
      <h2>Goodbye ${name},</h2>
      <p>Your Digital Learning Platform account has been successfully deleted.</p>
      <p>We're sorry to see you go. All your data has been removed from our system.</p>
      <p>If you change your mind, you're always welcome to create a new account and rejoin our learning community.</p>
      <p>Thank you for being part of our platform.</p>
      <p>Best wishes,<br>The Digital Learning Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Digital Learning Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};
exports.accountDeletedEmailTemplate = accountDeletedEmailTemplate;
