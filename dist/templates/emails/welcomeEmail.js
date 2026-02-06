"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeEmailTemplate = void 0;
const welcomeEmailTemplate = (name) => {
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Digital Learning Platform!</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>We're thrilled to have you join our learning community!</p>
      <p>You now have access to:</p>
      <ul>
        <li>Interactive courses and lessons</li>
        <li>Quizzes and assessments</li>
        <li>Progress tracking and analytics</li>
        <li>Personalized learning experience</li>
      </ul>
      <p>Start your learning journey today and unlock your potential!</p>
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
exports.welcomeEmailTemplate = welcomeEmailTemplate;
