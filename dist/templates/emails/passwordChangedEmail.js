"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordChangedEmailTemplate = void 0;
const passwordChangedEmailTemplate = (name) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10B981; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .info { background: #ECFDF5; border-left: 4px solid #10B981; padding: 10px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Password Changed Successfully</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>Your password has been successfully changed.</p>
      <div class="info">
        <strong>ℹ️ What happened?</strong>
        <p>Your account password was updated on ${new Date().toLocaleString()}.</p>
      </div>
      <p>If you made this change, no further action is needed.</p>
      <p><strong>If you didn't make this change:</strong></p>
      <ul>
        <li>Your account may be compromised</li>
        <li>Please contact our support team immediately</li>
        <li>Consider enabling additional security measures</li>
      </ul>
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
exports.passwordChangedEmailTemplate = passwordChangedEmailTemplate;
