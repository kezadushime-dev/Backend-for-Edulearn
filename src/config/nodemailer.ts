import nodemailer from 'nodemailer';
import { env } from './env';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

export const verifyEmailService = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('✅ Email Service Connected');
    console.log(`📧 SMTP: gmail`);
    return true;
  } catch (error) {
    console.error('❌ Email Service Failed:', error);
    return false;
  }
};