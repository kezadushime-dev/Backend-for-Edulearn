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
    .logo { width: 90px; height: 90px; object-fit: cover; border-radius: 50%; margin-bottom: 12px; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img
        class="logo"
        src="https://i.pinimg.com/1200x/11/20/c6/1120c6220b54bf64cfb18131de32417f.jpg"
        alt="Adventits youth Ministry Rwanda logo"
      />
      <h1>Murakaza neza muri Adventits youth Ministry Rwanda</h1>
    </div>
    <div class="content">
      <h2>Muraho ${name},</h2>
      <p>Twishimiye cyane ko mwiyunze ku muryango wacu wo kwiga.</p>
      <p>Ubu mwemerewe kubona:</p>
      <ul>
        <li>Amasomo n'inyigisho zifite ireme</li>
        <li>Ibizami n'isuzumabumenyi</li>
        <li>Gukurikirana aho ugeze n'iterambere ryawe</li>
        <li>Uburyo bwo kwiga bujyanye n'ibyo ukeneye</li>
      </ul>
      <p>Tangirira urugendo rwawe rwo kwiga uyu munsi.</p>
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
exports.welcomeEmailTemplate = welcomeEmailTemplate;
