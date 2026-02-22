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
      <h1>Gusubiramo ijambo banga</h1>
    </div>
    <div class="content">
      <h2>Muraho ${name},</h2>
      <p>Twakiriye ubusabe bwo guhindura ijambo banga rya konti yawe.</p>
      <p>Kanda kuri buto ikurikira kugirango ushyireho ijambo banga rishya:</p>
      <a href="${resetURL}" class="button">Hindura ijambo banga</a>
      <p>Cyangwa kopi iyi link uyishyire muri browser yawe:</p>
      <p style="word-break: break-all; color: #4F46E5;">${resetURL}</p>
      <div class="warning">
        <strong>Itangazo ry'umutekano:</strong>
        <p>Iyi link izarangira mu minota 10. Niba atari wowe wayisabye, wirengagize ubu butumwa.</p>
      </div>
      <p>Murakoze,<br>Itsinda rya Adventits youth Ministry Rwanda</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Adventits youth Ministry Rwanda. Uburenganzira bwose burabitswe.</p>
    </div>
  </div>
</body>
</html>
  `;
};
exports.passwordResetEmailTemplate = passwordResetEmailTemplate;
