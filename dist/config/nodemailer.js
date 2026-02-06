"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailService = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("./env");
let transporter = null;
exports.transporter = transporter;
if (env_1.env.EMAIL_USER && env_1.env.EMAIL_PASS) {
    exports.transporter = transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: env_1.env.EMAIL_USER,
            pass: env_1.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
    });
}
const verifyEmailService = async () => {
    if (!transporter) {
        console.warn("⚠️  Email service not configured - EMAIL_USER or EMAIL_PASS missing");
        return false;
    }
    try {
        await transporter.verify();
        console.log("✅ Email Service Connected");
        console.log(`📧 SMTP: gmail`);
        return true;
    }
    catch (error) {
        console.error("❌ Email Service Failed:", error);
        return false;
    }
};
exports.verifyEmailService = verifyEmailService;
