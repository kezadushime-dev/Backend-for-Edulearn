export const profileUpdatedEmailTemplate = (name: string, updatedFields: string[]): string => {
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
      <h1>Umwirondoro wavuguruwe</h1>
    </div>
    <div class="content">
      <h2>Muraho ${name},</h2>
      <p>Umwirondoro wawe wavuguruwe neza.</p>
      <div class="info">
        <strong>Ibyahinduwe:</strong>
        <ul>
          ${updatedFields.map(field => `<li>${field}</li>`).join('')}
        </ul>
      </div>
      <p>Niba atari wowe wabikoze, twandikire ako kanya.</p>
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
