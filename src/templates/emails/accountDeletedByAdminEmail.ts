export const accountDeletedByAdminEmailTemplate = (name: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .warning { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 10px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Account Deleted</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>Your Digital Learning Platform account has been deleted by an administrator.</p>
      <div class="warning">
        <strong>⚠️ Important:</strong>
        <p>All your data has been removed from our system. This action cannot be undone.</p>
      </div>
      <p>If you believe this was done in error, please contact our support team immediately.</p>
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
