import nodemailer from "nodemailer";
import { env } from "./env";

let transporter: any = null;

if (env.EMAIL_USER && env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });
}

export { transporter };

export const verifyEmailService = async (): Promise<boolean> => {
  if (!transporter) {
    console.warn("⚠️  Email service not configured - EMAIL_USER or EMAIL_PASS missing");
    return false;
  }
  
  try {
    await transporter.verify();
    console.log("✅ Email Service Connected");
    console.log(`📧 SMTP: gmail`);
    return true;
  } catch (error) {
    console.error("❌ Email Service Failed:", error);
    return false;
  }
};
