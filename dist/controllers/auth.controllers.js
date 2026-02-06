"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMyAccount = exports.resetPassword = exports.forgotPassword = exports.updatePassword = exports.updateMe = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = require("../models/user.model");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../utils/AppError");
const sendEmail_1 = require("../utils/sendEmail");
const authValidation_1 = require("../validations/authValidation");
const claudinary_1 = __importDefault(require("../config/claudinary"));
// Helper to sign JWT
const signToken = (id) => {
    const secret = process.env.JWT_SECRET || 'secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '90d';
    return jsonwebtoken_1.default.sign({ id }, secret, { expiresIn });
};
// Send token helper
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    // Remove password from output
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user },
    });
};
// =================== AUTH CONTROLLERS ===================
// Register new learner (role is default 'learner')
exports.register = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    // Validate request body
    const { error } = authValidation_1.registerSchema.validate(req.body);
    if (error)
        return next(new AppError_1.AppError(error.details[0].message, 400));
    const { name, email, password } = req.body;
    // Check if user already exists
    const existingUser = await user_model_1.User.findOne({ email });
    if (existingUser)
        return next(new AppError_1.AppError('Email already in use', 400));
    const newUser = await user_model_1.User.create({
        name,
        email,
        password,
    });
    // Send welcome email
    try {
        await (0, sendEmail_1.sendWelcomeEmail)(newUser.email, newUser.name);
    }
    catch (err) {
        console.error('Failed to send welcome email:', err);
    }
    createSendToken(newUser, 201, res);
});
// Login
exports.login = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    // Validate request body
    const { error } = authValidation_1.loginSchema.validate(req.body);
    if (error)
        return next(new AppError_1.AppError(error.details[0].message, 400));
    const { email, password } = req.body;
    if (!email || !password)
        return next(new AppError_1.AppError('Please provide email and password', 400));
    const user = await user_model_1.User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError_1.AppError('Incorrect email or password', 401));
    }
    createSendToken(user, 200, res);
});
//logout
exports.logout = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    res.status(200).json({
        status: 'success',
        data: null,
    });
});
// Get current user profile
exports.getMe = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const user = await user_model_1.User.findById(req.user.id);
    if (!user)
        return next(new AppError_1.AppError('User not found', 404));
    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});
//update current user profile
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(key => {
        if (allowedFields.includes(key))
            newObj[key] = obj[key];
    });
    return newObj;
};
//update user 
exports.updateMe = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    // 1) Prevent role updates
    if (req.body.role)
        return next(new AppError_1.AppError('You cannot update your role', 403));
    // 2) Filter allowed fields
    const filteredBody = filterObj(req.body, 'name', 'email', 'password');
    // 3) Handle profile image (uploaded via Cloudinary)
    if (req.file && req.file.path) {
        filteredBody.image = req.file.path; // Cloudinary URL
    }
    // 4) Update user
    let user;
    if (filteredBody.password) {
        user = await user_model_1.User.findById(req.user._id);
        if (!user)
            return next(new AppError_1.AppError('User not found', 404));
        user.password = filteredBody.password;
        if (filteredBody.name)
            user.name = filteredBody.name;
        if (filteredBody.email)
            user.email = filteredBody.email;
        if (filteredBody.image)
            user.image = filteredBody.image;
        await user.save(); // triggers pre-save hooks
    }
    else {
        user = await user_model_1.User.findByIdAndUpdate(req.user._id, filteredBody, {
            new: true,
            runValidators: true,
        });
    }
    res.status(200).json({
        status: 'success',
        data: { user },
    });
});
// ------------------ UPDATE PASSWORD ------------------
exports.updatePassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
        return next(new AppError_1.AppError('Please provide current and new password', 400));
    const user = await user_model_1.User.findById(req.user._id).select('+password');
    if (!user || !(await user.correctPassword(currentPassword, user.password)))
        return next(new AppError_1.AppError('Current password is incorrect', 401));
    user.password = newPassword;
    await user.save();
    // Send password changed confirmation email
    try {
        await (0, sendEmail_1.sendPasswordChangedEmail)(user.email, user.name);
    }
    catch (err) {
        console.error('Failed to send password changed email:', err);
    }
    res.status(200).json({ status: 'success', message: 'Password updated successfully' });
});
// ------------------ FORGOT PASSWORD ------------------
exports.forgotPassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { email } = req.body;
    if (!email)
        return next(new AppError_1.AppError('Please provide your email', 400));
    const user = await user_model_1.User.findOne({ email });
    if (!user)
        return next(new AppError_1.AppError('No user found with that email', 404));
    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // Send password reset email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;
    try {
        await (0, sendEmail_1.sendPasswordResetEmail)(user.email, user.name, resetURL);
        res.status(200).json({ status: 'success', message: 'Password reset link sent to email!' });
    }
    catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError_1.AppError('There was an error sending the email', 500));
    }
});
// ------------------ RESET PASSWORD ------------------
exports.resetPassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const hashedToken = crypto_1.default.createHash('sha256').update(req.params.token).digest('hex');
    const user = await user_model_1.User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
    });
    if (!user)
        return next(new AppError_1.AppError('Token is invalid or has expired', 400));
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // Send password changed confirmation email
    try {
        await (0, sendEmail_1.sendPasswordChangedEmail)(user.email, user.name);
    }
    catch (err) {
        console.error('Failed to send password changed email:', err);
    }
    res.status(200).json({ status: 'success', message: 'Password reset successfully' });
});
// ------------------ DELETE MY ACCOUNT ------------------
exports.deleteMyAccount = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const user = await user_model_1.User.findById(req.user._id);
    if (!user)
        return next(new AppError_1.AppError('User not found', 404));
    // Send account deletion confirmation email before deleting
    try {
        await (0, sendEmail_1.sendAccountDeletedEmail)(user.email, user.name);
    }
    catch (err) {
        console.error('Failed to send account deleted email:', err);
    }
    // Delete profile image from Cloudinary if exists
    if (user.image) {
        const publicId = user.image.split('/').pop()?.split('.')[0];
        if (publicId)
            await claudinary_1.default.uploader.destroy(`users/${publicId}`);
    }
    await user_model_1.User.findByIdAndDelete(req.user._id);
    res.status(204).json({ status: 'success', message: 'Account deleted successfully' });
});
