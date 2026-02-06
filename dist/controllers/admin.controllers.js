"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatistics = exports.getUsersByRole = exports.deleteUser = exports.updateUserRole = exports.getUserById = exports.getAllUsers = void 0;
const user_model_1 = require("../models/user.model");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../utils/AppError");
const sendEmail_1 = require("../utils/sendEmail");
const claudinary_1 = __importDefault(require("../config/claudinary"));
// Get all users
exports.getAllUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const users = await user_model_1.User.find().select('-password');
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users },
    });
});
// Get user by ID
exports.getUserById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const user = await user_model_1.User.findById(req.params.id).select('-password');
    if (!user)
        return next(new AppError_1.AppError('User not found', 404));
    res.status(200).json({
        status: 'success',
        data: { user },
    });
});
// Update user role
exports.updateUserRole = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { role } = req.body;
    const user = await user_model_1.User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select('-password');
    if (!user)
        return next(new AppError_1.AppError('User not found', 404));
    // Send role update notification email
    try {
        await (0, sendEmail_1.sendRoleUpdatedEmail)(user.email, user.name, role);
    }
    catch (err) {
        console.error('Failed to send role update email:', err);
    }
    res.status(200).json({
        status: 'success',
        data: { user },
    });
});
// Delete user
exports.deleteUser = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const user = await user_model_1.User.findById(req.params.id);
    if (!user)
        return next(new AppError_1.AppError('User not found', 404));
    // Send account deletion notification email before deleting
    try {
        await (0, sendEmail_1.sendAccountDeletedByAdminEmail)(user.email, user.name);
    }
    catch (err) {
        console.error('Failed to send account deletion email:', err);
    }
    // Delete profile image from Cloudinary if exists
    if (user.image) {
        const publicId = user.image.split('/').pop()?.split('.')[0];
        if (publicId) {
            try {
                await claudinary_1.default.uploader.destroy(`users/${publicId}`);
            }
            catch (err) {
                console.error('Failed to delete image from Cloudinary:', err);
            }
        }
    }
    await user_model_1.User.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});
// Get users by role
exports.getUsersByRole = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { role } = req.params;
    const users = await user_model_1.User.find({ role }).select('-password');
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users },
    });
});
// Get platform statistics
exports.getStatistics = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const totalUsers = await user_model_1.User.countDocuments();
    const learners = await user_model_1.User.countDocuments({ role: 'learner' });
    const instructors = await user_model_1.User.countDocuments({ role: 'instructor' });
    const admins = await user_model_1.User.countDocuments({ role: 'admin' });
    res.status(200).json({
        status: 'success',
        data: {
            statistics: {
                totalUsers,
                learners,
                instructors,
                admins,
            },
        },
    });
});
