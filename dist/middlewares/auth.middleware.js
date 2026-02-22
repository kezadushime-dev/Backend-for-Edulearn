"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const AppError_1 = require("../utils/AppError");
const catchAsync_1 = require("../utils/catchAsync");
const normalizeRole = (role) => {
    if (role === "learner")
        return "user";
    if (role === "instructor")
        return "leader";
    return role;
};
exports.protect = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError_1.AppError('You are not logged in. Please login to get access.', 401));
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
    const currentUser = await user_model_1.User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError_1.AppError('The user belonging to this token no longer exists.', 401));
    }
    await user_model_1.User.findByIdAndUpdate(currentUser._id, { lastActiveAt: new Date() }).catch(() => null);
    req.user = currentUser;
    next();
});
const restrictTo = (...roles) => {
    return (req, res, next) => {
        const normalizedRequestedRoles = roles.map(normalizeRole);
        const normalizedCurrentRole = normalizeRole(req.user.role);
        if (!normalizedRequestedRoles.includes(normalizedCurrentRole)) {
            return next(new AppError_1.AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
