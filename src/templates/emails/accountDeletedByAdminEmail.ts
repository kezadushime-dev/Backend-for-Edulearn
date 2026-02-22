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
      <h1>Konti yasibwe n'ubuyobozi</h1>
    </div>
    <div class="content">
      <h2>Muraho ${name},</h2>
      <p>Konti yawe yasibwe n'umuyobozi wa sisitemu.</p>
      <div class="warning">
        <strong>Icyitonderwa:</strong>
        <p>Amakuru yawe yose yavanywe muri sisitemu kandi ntashobora kugarurwa.</p>
      </div>
      <p>Niba mubona habayeho ikosa, twandikire vuba bishoboka.</p>
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
