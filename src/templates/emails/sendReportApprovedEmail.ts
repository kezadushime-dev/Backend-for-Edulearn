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
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .info { background: #E8F4FD; border-left: 4px solid #2E86DE; padding: 10px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Ubusabe bwa raporo bwemejwe</h1>
    </div>
    <div class="content">
      <h2>Muraho ${name},</h2>
      <p>Inkuru nziza. Ubusabe bwawe bwo gukuramo raporo bwemejwe n'umuyobozi wawe.</p>

      <div class="info">
        <p>Ubu ushobora kwinjira kuri konti yawe ugakuramo raporo yawe.</p>
      </div>

      <p>Niba hari ikibazo, twandikire.</p>
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
