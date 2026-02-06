"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCreateUserSchema = exports.updateRoleSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.updateRoleSchema = joi_1.default.object({
    role: joi_1.default.string()
        .valid("learner", "instructor", "admin")
        .required()
        .messages({
        "any.only": "Role must be learner, instructor or admin",
    }),
});
exports.adminCreateUserSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required(),
    role: joi_1.default.string()
        .valid("learner", "instructor", "admin")
        .required(),
});
