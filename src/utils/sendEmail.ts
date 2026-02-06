import { sendEmail as sendMailTransport } from '../config/nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message?: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  await sendMailTransport(
    options.email,
    options.subject,
    options.html || options.message || ''
  );
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  const { welcomeEmailTemplate } = await import('../templates/emails/welcomeEmail');
  await sendEmail({
    email,
    subject: 'Welcome to Digital Learning Platform',
    html: welcomeEmailTemplate(name),
  });
};

export const sendPasswordResetEmail = async (email: string, name: string, resetURL: string): Promise<void> => {
  const { passwordResetEmailTemplate } = await import('../templates/emails/passwordResetEmail');
  await sendEmail({
    email,
    subject: 'Password Reset Request',
    html: passwordResetEmailTemplate(name, resetURL),
  });
};

export const sendPasswordChangedEmail = async (email: string, name: string): Promise<void> => {
  const { passwordChangedEmailTemplate } = await import('../templates/emails/passwordChangedEmail');
  await sendEmail({
    email,
    subject: 'Password Changed Successfully',
    html: passwordChangedEmailTemplate(name),
  });
};

export const sendAccountDeletedEmail = async (email: string, name: string): Promise<void> => {
  const { accountDeletedEmailTemplate } = await import('../templates/emails/accountDeletedEmail');
  await sendEmail({
    email,
    subject: 'Account Deleted',
    html: accountDeletedEmailTemplate(name),
  });
};

export const sendRoleUpdatedEmail = async (email: string, name: string, newRole: string): Promise<void> => {
  const { roleUpdatedEmailTemplate } = await import('../templates/emails/roleUpdatedEmail');
  await sendEmail({
    email,
    subject: 'Your Role Has Been Updated',
    html: roleUpdatedEmailTemplate(name, newRole),
  });
};

export const sendAccountDeletedByAdminEmail = async (email: string, name: string): Promise<void> => {
  const { accountDeletedByAdminEmailTemplate } = await import('../templates/emails/accountDeletedByAdminEmail');
  await sendEmail({
    email,
    subject: 'Account Deleted by Administrator',
    html: accountDeletedByAdminEmailTemplate(name),
  });
};

export const sendProfileUpdatedEmail = async (email: string, name: string, updatedFields: string[]): Promise<void> => {
  const { profileUpdatedEmailTemplate } = await import('../templates/emails/profileUpdatedEmail');
  await sendEmail({
    email,
    subject: 'Profile Updated Successfully',
    html: profileUpdatedEmailTemplate(name, updatedFields),
  });
};
