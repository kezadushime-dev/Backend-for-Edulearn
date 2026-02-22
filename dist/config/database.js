"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sanitizeMongoUri = (uri) => {
    try {
        const parsed = new URL(uri);
        if (parsed.password)
            parsed.password = '***';
        return parsed.toString();
    }
    catch {
        return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:\/?#]+:)([^@]+)(@)/i, '$1***$3');
    }
};
const connectDB = async () => {
    const primaryUri = process.env.MONGODB_URI;
    const fallbackUri = process.env.MONGODB_URI_FALLBACK;
    if (!primaryUri) {
        console.error('Missing MONGODB_URI in environment.');
        process.exit(1);
    }
    try {
        const conn = await mongoose_1.default.connect(primaryUri, {
            serverSelectionTimeoutMS: 15000,
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    catch (error) {
        const isSrvResolutionError = error?.code === 'ECONNREFUSED' &&
            error?.syscall === 'querySrv' &&
            typeof error?.hostname === 'string' &&
            error.hostname.startsWith('_mongodb._tcp.');
        if (isSrvResolutionError && fallbackUri) {
            console.warn(`Primary Mongo URI failed on SRV lookup. Retrying with fallback URI: ${sanitizeMongoUri(fallbackUri)}`);
            try {
                const conn = await mongoose_1.default.connect(fallbackUri, {
                    serverSelectionTimeoutMS: 15000,
                });
                console.log(`MongoDB connected via fallback: ${conn.connection.host}`);
                return;
            }
            catch (fallbackError) {
                console.error('Error connecting to MongoDB via fallback URI:', fallbackError);
                process.exit(1);
            }
        }
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
