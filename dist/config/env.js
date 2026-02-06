"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('5000'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    MONGODB_URI: zod_1.z.string().min(1),
    JWT_SECRET: zod_1.z.string().min(8),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().optional(),
    CLOUDINARY_API_KEY: zod_1.z.string().optional(),
    CLOUDINARY_API_SECRET: zod_1.z.string().optional(),
    EMAIL_USER: zod_1.z.string().optional(),
    EMAIL_PASS: zod_1.z.string().optional(),
    ADMIN_EMAIL: zod_1.z.string().email().optional(),
    ADMIN_PASSWORD: zod_1.z.string().min(8).optional(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.warn('⚠️  Some environment variables are invalid:', parsed.error.format());
}
exports.env = parsed.success ? parsed.data : process.env;
