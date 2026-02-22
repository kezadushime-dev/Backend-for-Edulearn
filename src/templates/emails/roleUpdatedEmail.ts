const roleToKinyarwanda = (role: string) => {
  const normalized = role.toLowerCase();
  if (normalized === "admin") return "Admin";
  if (normalized === "leader" || normalized === "instructor") return "Umuyobozi";
  if (normalized === "user" || normalized === "learner") return "Umukoresha";
  return role;
};

export const roleUpdatedEmailTemplate = (name: string, newRole: string): string => {
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
      <h1>Uruhare rwawe rwahinduwe</h1>
    </div>
    <div class="content">
      <h2>Muraho ${name},</h2>
      <p>Uruhare rwa konti yawe rwahinduwe n'ubuyobozi.</p>
      <p>Uruhare rushya ni: <span class="role-badge">${roleToKinyarwanda(newRole)}</span></p>
      <p>Ibi bishobora guhindura uburenganzira n'ibyo wemerewe gukoresha kuri platform.</p>
      <p>Niba hari ibyo ushaka kubaza, twandikire.</p>
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
