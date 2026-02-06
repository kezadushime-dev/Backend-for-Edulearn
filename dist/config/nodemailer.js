"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailService = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env"); // adjust path
exports.transporter = nodemailer_1.default.createTransport({
    host: env_1.env.SMTP_HOST,
    port: parseInt(env_1.env.SMTP_PORT),
    secure: true, // 👈 REQUIRED for Gmail 465
    auth: {
        user: env_1.env.SMTP_USER,
        pass: env_1.env.SMTP_PASS,
    },
});
const verifyEmailService = async () => {
    try {
        await exports.transporter.verify();
        console.log('✅ Email Service Connected');
        console.log(`📧 SMTP: ${env_1.env.SMTP_HOST}:${env_1.env.SMTP_PORT}`);
        return true;
    }
    catch (error) {
        console.error('❌ Email Service Failed:', error);
        return false;
    }
};
exports.verifyEmailService = verifyEmailService;
