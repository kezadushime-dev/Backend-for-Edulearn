"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveReport = exports.getStatistics = exports.getUsersByRole = exports.deleteUser = exports.updateUserRole = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const user_model_1 = require("../models/user.model");
const report_model_1 = require("../models/report.model");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../utils/AppError");
const sendEmail_1 = require("../utils/sendEmail");
const claudinary_1 = __importDefault(require("../config/claudinary"));
// Get all users
exports.getAllUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const users = await user_model_1.User.find()
        .sort({ createdAt: -1 })
        .select("-password");
    res.status(200).json({
        status: "success",
        results: users.length,
        data: { users },
    });
});
// Get user by ID
exports.getUserById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const user = await user_model_1.User.findById(req.params.id).select("-password");
    if (!user)
        return next(new AppError_1.AppError("User not found", 404));
    res.status(200).json({
        status: "success",
        data: { user },
    });
});
//create user
exports.createUser = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { name, email, password, role } = req.body;
    // 1. Validate roles
    const allowedRoles = ["user", "leader", "admin", "learner", "instructor"];
    if (!allowedRoles.includes(role)) {
        return next(new AppError_1.AppError("Invalid role", 400));
    }
    // 2. Check existing email
    const existingUser = await user_model_1.User.findOne({ email });
    if (existingUser) {
        return next(new AppError_1.AppError("Email already in use", 400));
    }
    const user = await user_model_1.User.create({ name, email, password, role });
    res.status(201).json({
        status: "success",
        data: { user },
    });
});
// Update user role
exports.updateUserRole = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { role } = req.body;
    const user = await user_model_1.User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select("-password");
    if (!user)
        return next(new AppError_1.AppError("User not found", 404));
    // Send role update notification email
    try {
        await (0, sendEmail_1.sendRoleUpdatedEmail)(user.email, user.name, role);
    }
    catch (err) {
        console.error("Failed to send role update email:", err);
    }
    res.status(200).json({
        status: "success",
        data: { user },
    });
});
// Delete user
exports.deleteUser = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const user = await user_model_1.User.findById(req.params.id);
    if (!user)
        return next(new AppError_1.AppError("User not found", 404));
    // Send account deletion notification email before deleting
    try {
        await (0, sendEmail_1.sendAccountDeletedByAdminEmail)(user.email, user.name);
    }
    catch (err) {
        console.error("Failed to send account deletion email:", err);
    }
    // Delete profile image from Cloudinary if exists
    if (user.image) {
        const publicId = user.image.split("/").pop()?.split(".")[0];
        if (publicId) {
            try {
                await claudinary_1.default.uploader.destroy(`users/${publicId}`);
            }
            catch (err) {
                console.error("Failed to delete image from Cloudinary:", err);
            }
        }
    }
    await user_model_1.User.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: "success",
        data: null,
    });
});
// Get users by role
exports.getUsersByRole = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { role } = req.params;
    let filter = { role };
    if (role === "user")
        filter = { role: { $in: ["user", "learner"] } };
    if (role === "leader")
        filter = { role: { $in: ["leader", "instructor"] } };
    const users = await user_model_1.User.find(filter).select("-password");
    res.status(200).json({
        status: "success",
        results: users.length,
        data: { users },
    });
});
// Get platform statistics
exports.getStatistics = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const totalUsers = await user_model_1.User.countDocuments();
    const users = await user_model_1.User.countDocuments({ role: { $in: ["user", "learner"] } });
    const leaders = await user_model_1.User.countDocuments({ role: { $in: ["leader", "instructor"] } });
    const admins = await user_model_1.User.countDocuments({ role: "admin" });
    res.status(200).json({
        status: "success",
        data: {
            statistics: {
                totalUsers,
                users,
                leaders,
                admins,
            },
        },
    });
});
// Approve report download request
exports.approveReport = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const report = await report_model_1.Report.findById(req.params.id).populate("user");
    if (!report) {
        return res
            .status(404)
            .json({ status: "fail", message: "Report not found" });
    }
    report.status = "approved";
    report.approvedBy = req.user.id;
    report.approvedAt = new Date();
    await report.save();
    const learner = report.user;
    // Send approval email using template
    try {
        await (0, sendEmail_1.sendReportApprovedEmail)(learner.email, learner.name);
    }
    catch (err) {
        console.error("Failed to send report approved email:", err);
        // Optional: You can log to a monitoring system here
    }
    res
        .status(200)
        .json({
        status: "success",
        message: "Report approved and learner notified",
        data: { report },
    });
});
