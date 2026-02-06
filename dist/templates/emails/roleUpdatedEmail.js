"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleUpdatedEmailTemplate = void 0;
const roleUpdatedEmailTemplate = (name, newRole) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .role-badge { display: inline-block; padding: 8px 16px; background: #10B981; color: white; border-radius: 5px; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Role Updated</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>Your account role has been updated by an administrator.</p>
      <p>Your new role is: <span class="role-badge">${newRole.toUpperCase()}</span></p>
      <p>This change may affect your access permissions and available features on the platform.</p>
      <p>If you have any questions about your new role, please contact support.</p>
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
exports.roleUpdatedEmailTemplate = roleUpdatedEmailTemplate;
