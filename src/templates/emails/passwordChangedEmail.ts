export const passwordChangedEmailTemplate = (name: string): string => {
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
      <h1>Ijambo banga ryahinduwe neza</h1>
    </div>
    <div class="content">
      <h2>Muraho ${name},</h2>
      <p>Ijambo banga rya konti yawe ryahinduwe neza.</p>
      <div class="info">
        <strong>Ibyabaye:</strong>
        <p>Konti yawe yahinduye ijambo banga ku wa ${new Date().toLocaleString()}.</p>
      </div>
      <p>Niba ari wowe wabikoze, nta kindi gisabwa.</p>
      <p><strong>Niba atari wowe:</strong></p>
      <ul>
        <li>Konti yawe ishobora kuba iri mu kaga</li>
        <li>Twandikire vuba bishoboka</li>
      </ul>
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
