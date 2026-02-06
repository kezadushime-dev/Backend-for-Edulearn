import nodemailer from 'nodemailer';
import { env } from '../config/env';   // adjust path

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT),
  secure: true,        // 👈 REQUIRED for Gmail 465
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const verifyEmailService = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('✅ Email Service Connected');
    console.log(`📧 SMTP: ${env.SMTP_HOST}:${env.SMTP_PORT}`);
    return true;
  } catch (error) {
    console.error('❌ Email Service Failed:', error);
    return false;
  }
};
