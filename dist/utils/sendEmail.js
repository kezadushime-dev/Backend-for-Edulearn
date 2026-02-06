"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAccountDeletedByAdminEmail = exports.sendRoleUpdatedEmail = exports.sendAccountDeletedEmail = exports.sendPasswordChangedEmail = exports.sendPasswordResetEmail = exports.sendWelcomeEmail = exports.sendEmail = void 0;
const nodemailer_1 = require("../config/nodemailer");
const sendEmail = async (options) => {
    await nodemailer_1.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@learningplatform.com',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    });
};
exports.sendEmail = sendEmail;
const sendWelcomeEmail = async (email, name) => {
    const { welcomeEmailTemplate } = await Promise.resolve().then(() => __importStar(require('../templates/emails/welcomeEmail')));
    await (0, exports.sendEmail)({
        email,
        subject: 'Welcome to Digital Learning Platform',
        html: welcomeEmailTemplate(name),
    });
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPasswordResetEmail = async (email, name, resetURL) => {
    const { passwordResetEmailTemplate } = await Promise.resolve().then(() => __importStar(require('../templates/emails/passwordResetEmail')));
    await (0, exports.sendEmail)({
        email,
        subject: 'Password Reset Request',
        html: passwordResetEmailTemplate(name, resetURL),
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendPasswordChangedEmail = async (email, name) => {
    const { passwordChangedEmailTemplate } = await Promise.resolve().then(() => __importStar(require('../templates/emails/passwordChangedEmail')));
    await (0, exports.sendEmail)({
        email,
        subject: 'Password Changed Successfully',
        html: passwordChangedEmailTemplate(name),
    });
};
exports.sendPasswordChangedEmail = sendPasswordChangedEmail;
const sendAccountDeletedEmail = async (email, name) => {
    const { accountDeletedEmailTemplate } = await Promise.resolve().then(() => __importStar(require('../templates/emails/accountDeletedEmail')));
    await (0, exports.sendEmail)({
        email,
        subject: 'Account Deleted',
        html: accountDeletedEmailTemplate(name),
    });
};
exports.sendAccountDeletedEmail = sendAccountDeletedEmail;
const sendRoleUpdatedEmail = async (email, name, newRole) => {
    const { roleUpdatedEmailTemplate } = await Promise.resolve().then(() => __importStar(require('../templates/emails/roleUpdatedEmail')));
    await (0, exports.sendEmail)({
        email,
        subject: 'Your Role Has Been Updated',
        html: roleUpdatedEmailTemplate(name, newRole),
    });
};
exports.sendRoleUpdatedEmail = sendRoleUpdatedEmail;
const sendAccountDeletedByAdminEmail = async (email, name) => {
    const { accountDeletedByAdminEmailTemplate } = await Promise.resolve().then(() => __importStar(require('../templates/emails/accountDeletedByAdminEmail')));
    await (0, exports.sendEmail)({
        email,
        subject: 'Account Deleted by Administrator',
        html: accountDeletedByAdminEmailTemplate(name),
    });
};
exports.sendAccountDeletedByAdminEmail = sendAccountDeletedByAdminEmail;
