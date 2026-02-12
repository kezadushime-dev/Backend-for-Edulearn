export const reportApprovedEmailTemplate = (name: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2E86DE; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 24px; background: #2E86DE; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .info { background: #E8F4FD; border-left: 4px solid #2E86DE; padding: 10px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Report Approved ✅</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>Good news! Your request to download your academic report has been <strong>approved</strong> by your instructor/admin.</p>

      <div class="info">
        <p>You can now log in to your account and download your report securely.</p>
      </div>

      <p>We recommend downloading your report soon. If you have any questions, contact support.</p>

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
