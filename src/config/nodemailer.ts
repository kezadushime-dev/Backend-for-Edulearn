import nodemailer from "nodemailer";
import { env } from "./env";

function createTransporter() {
  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
    

    socketTimeout: 10000,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });
}

export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn("⚠️ Email skipped - no credentials configured");
    return false;
  }

  try {
    await transporter.sendMail({
      from: env.EMAIL_USER,
      to,
      subject,
      html,
    });

    console.log("📧 Email sent to:", to);
    return true;
  } catch (error: any) {
    console.warn("⚠️ Email failed but app continues:", error.message);
    return false;
  }
}

export async function verifyEmailService(): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn(
      "⚠️  Email Service: Not configured (EMAIL_USER or EMAIL_PASS missing)",
    );
    return;
  }

  try {
    await transporter.verify();
    console.log("✅ Email Service: Connected");
    console.log(`📧 SMTP: gmail (${env.EMAIL_USER})`);
  } catch (error: any) {
    console.error("❌ Email Service: Failed -", error);
  }
}
