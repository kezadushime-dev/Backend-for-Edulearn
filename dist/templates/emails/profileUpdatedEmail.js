"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileUpdatedEmailTemplate = void 0;
const profileUpdatedEmailTemplate = (name, updatedFields) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .info { background: #EEF2FF; border-left: 4px solid #4F46E5; padding: 10px; margin: 15px 0; }
    ul { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Profile Updated</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>Your profile has been successfully updated.</p>
      <div class="info">
        <strong>📝 Updated Information:</strong>
        <ul>
          ${updatedFields.map(field => `<li>${field}</li>`).join('')}
        </ul>
      </div>
      <p>If you didn't make these changes, please contact support immediately.</p>
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
exports.profileUpdatedEmailTemplate = profileUpdatedEmailTemplate;
