"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    name: joi_1.default.string()
        .min(2)
        .max(50)
        .required()
        .messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters",
    }),
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        "string.email": "Please provide valid email",
    }),
    password: joi_1.default.string()
        .min(8)
        .pattern(new RegExp("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]"))
        .required()
        .messages({
        "string.min": "Password must be at least 8 characters",
        "string.pattern.base": "Password must contain letters and numbers",
    }),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
exports.updatePasswordSchema = joi_1.default.object({
    currentPassword: joi_1.default.string().required(),
    newPassword: joi_1.default.string().min(8).required(),
});
