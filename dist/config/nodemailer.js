"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.verifyEmailService = verifyEmailService;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("./env");
function createTransporter() {
    if (!env_1.env.EMAIL_USER || !env_1.env.EMAIL_PASS) {
        return null;
    }
    return nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: env_1.env.EMAIL_USER,
            pass: env_1.env.EMAIL_PASS,
        },
        pool: true,
        maxConnections: 3,
        tls: {
            rejectUnauthorized: false,
        },
        socketTimeout: 10000,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
    });
}
async function sendEmail(to, subject, html) {
    const transporter = createTransporter();
    if (!transporter) {
        console.warn("⚠️ Email skipped - no credentials configured");
        return false;
    }
    try {
        await transporter.sendMail({
            from: env_1.env.EMAIL_USER,
            to,
            subject,
            html,
        });
        console.log("📧 Email sent to:", to);
        return true;
    }
    catch (error) {
        console.warn("⚠️ Email failed but app continues:", error.message);
        return false;
    }
}
async function verifyEmailService() {
    const transporter = createTransporter();
    if (!transporter) {
        console.warn("⚠️  Email Service: Not configured (EMAIL_USER or EMAIL_PASS missing)");
        return;
    }
    try {
        await transporter.verify();
        console.log("✅ Email Service: Connected");
        console.log(`📧 SMTP: gmail (${env_1.env.EMAIL_USER})`);
    }
    catch (error) {
        console.error("❌ Email Service: Failed -", error.message);
    }
}
