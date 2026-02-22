export const accountDeletedEmailTemplate = (name: string): string => {
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
      <h1>Konti yawe yasibwe</h1>
    </div>
    <div class="content">
      <h2>Murabeho ${name},</h2>
      <p>Konti yawe yasibwe neza muri sisitemu yacu.</p>
      <p>Amakuru yawe yose yavanywe muri sisitemu.</p>
      <p>Nimwifuza kugaruka, mushobora kongera kwiyandikisha igihe icyo ari cyo cyose.</p>
      <p>Murakoze kuba mwarabanye natwe.</p>
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
