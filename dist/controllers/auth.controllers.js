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
const signToken = (id) => {
    const secret = process.env.JWT_SECRET || "secret";
    const expiresIn = process.env.JWT_EXPIRES_IN || "90d";
    return jsonwebtoken_1.default.sign({ id }, secret, { expiresIn });
};
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    user.password = undefined;
    res.status(statusCode).json({
        status: "success",
        token,
        data: { user },
    });
};
const normalizeUserRole = (role) => {
    if (!role)
        return "user";
    if (role === "learner")
        return "user";
    if (role === "instructor")
        return "leader";
    return role;
};
const uploadToCloudinary = (fileBuffer, resourceType) => {
    return new Promise((resolve, reject) => {
        const stream = claudinary_1.default.uploader.upload_stream({ folder: "users", resource_type: resourceType }, (err, result) => {
            if (err)
                return reject(err);
            resolve(result.secure_url);
        });
        stream.end(fileBuffer);
    });
};
exports.register = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { error } = authValidation_1.registerSchema.validate(req.body);
    if (error)
        return next(new AppError_1.AppError(error.details[0].message, 400));
    const { name, email, password, role, avatarUrl, country, field, province, church, club, region, district, conference, ageGroup, } = req.body;
    const normalizedRole = normalizeUserRole(role);
    if (normalizedRole === "admin") {
        return next(new AppError_1.AppError("You cannot self-register as admin", 403));
    }
    const existingUser = await user_model_1.User.findOne({ email });
    if (existingUser)
        return next(new AppError_1.AppError("Email already in use", 400));
    const newUser = await user_model_1.User.create({
        name,
        email,
        password,
        role: normalizedRole,
        avatarUrl,
        image: avatarUrl,
        country,
        field,
        province,
        church,
        club,
        region,
        district,
        conference,
        ageGroup,
        lastActiveAt: new Date(),
    });
    try {
        await (0, sendEmail_1.sendWelcomeEmail)(newUser.email, newUser.name);
    }
    catch (err) {
        console.error("Failed to send welcome email:", err);
    }
    createSendToken(newUser, 201, res);
});
exports.login = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { error } = authValidation_1.loginSchema.validate(req.body);
    if (error)
        return next(new AppError_1.AppError(error.details[0].message, 400));
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError_1.AppError("Please provide email and password", 400));
    }
    const user = await user_model_1.User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError_1.AppError("Incorrect email or password", 401));
    }
    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });
    createSendToken(user, 200, res);
});
exports.logout = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    res.status(200).json({
        status: "success",
        data: null,
    });
});
exports.getMe = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const user = await user_model_1.User.findById(req.user.id);
    if (!user)
        return next(new AppError_1.AppError("User not found", 404));
    res.status(200).json({
        status: "success",
        data: { user },
    });
});
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
        if (allowedFields.includes(key))
            newObj[key] = obj[key];
    });
    return newObj;
};
exports.updateMe = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    if (req.body.role) {
        return next(new AppError_1.AppError("You cannot update your role", 403));
    }
    const filteredBody = filterObj(req.body, "name", "email", "password", "avatarUrl", "country", "field", "province", "church", "club", "region", "district", "conference", "ageGroup");
    if (req.file) {
        const imageUrl = await uploadToCloudinary(req.file.buffer, "image");
        filteredBody.image = imageUrl;
        filteredBody.avatarUrl = imageUrl;
    }
    const updatedFields = [];
    if (filteredBody.name)
        updatedFields.push("Amazina");
    if (filteredBody.email)
        updatedFields.push("Imeli");
    if (filteredBody.password)
        updatedFields.push("Ijambo banga");
    if (filteredBody.avatarUrl || filteredBody.image)
        updatedFields.push("Ifoto ya profili");
    if (filteredBody.country)
        updatedFields.push("Igihugu");
    if (filteredBody.field)
        updatedFields.push("Field");
    if (filteredBody.province)
        updatedFields.push("Intara");
    if (filteredBody.church)
        updatedFields.push("Itorero");
    if (filteredBody.club)
        updatedFields.push("Club");
    if (filteredBody.region)
        updatedFields.push("Akarere");
    if (filteredBody.ageGroup)
        updatedFields.push("Itsinda ry'imyaka");
    let user;
    if (filteredBody.password) {
        user = await user_model_1.User.findById(req.user._id);
        if (!user)
            return next(new AppError_1.AppError("User not found", 404));
        user.password = filteredBody.password;
        if (filteredBody.name)
            user.name = filteredBody.name;
        if (filteredBody.email)
            user.email = filteredBody.email;
        if (filteredBody.image)
            user.image = filteredBody.image;
        if (filteredBody.avatarUrl)
            user.avatarUrl = filteredBody.avatarUrl;
        if (filteredBody.country)
            user.country = filteredBody.country;
        if (filteredBody.field)
            user.field = filteredBody.field;
        if (filteredBody.province)
            user.province = filteredBody.province;
        if (filteredBody.church)
            user.church = filteredBody.church;
        if (filteredBody.club)
            user.club = filteredBody.club;
        if (filteredBody.region)
            user.region = filteredBody.region;
        if (filteredBody.district)
            user.district = filteredBody.district;
        if (filteredBody.conference)
            user.conference = filteredBody.conference;
        if (filteredBody.ageGroup)
            user.ageGroup = filteredBody.ageGroup;
        await user.save();
    }
    else {
        user = await user_model_1.User.findByIdAndUpdate(req.user._id, filteredBody, {
            new: true,
            runValidators: true,
        });
    }
    if (updatedFields.length > 0 && user) {
        try {
            await (0, sendEmail_1.sendProfileUpdatedEmail)(user.email, user.name, updatedFields);
        }
        catch (err) {
            console.error("Failed to send profile updated email:", err);
        }
    }
    res.status(200).json({
        status: "success",
        data: { user },
    });
});
exports.updatePassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return next(new AppError_1.AppError("Please provide current and new password", 400));
    }
    const user = await user_model_1.User.findById(req.user._id).select("+password");
    if (!user || !(await user.correctPassword(currentPassword, user.password))) {
        return next(new AppError_1.AppError("Current password is incorrect", 401));
    }
    user.password = newPassword;
    await user.save();
    try {
        await (0, sendEmail_1.sendPasswordChangedEmail)(user.email, user.name);
    }
    catch (err) {
        console.error("Failed to send password changed email:", err);
    }
    res.status(200).json({ status: "success", message: "Password updated successfully" });
});
exports.forgotPassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { email } = req.body;
    if (!email)
        return next(new AppError_1.AppError("Please provide your email", 400));
    const user = await user_model_1.User.findOne({ email });
    if (!user)
        return next(new AppError_1.AppError("No user found with that email", 404));
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    try {
        await (0, sendEmail_1.sendPasswordResetEmail)(user.email, user.name, resetURL);
        res.status(200).json({
            status: "success",
            message: "Password reset link sent to email!",
        });
    }
    catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError_1.AppError("There was an error sending the email", 500));
    }
});
exports.resetPassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const hashedToken = crypto_1.default.createHash("sha256").update(req.params.token).digest("hex");
    const user = await user_model_1.User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
    });
    if (!user)
        return next(new AppError_1.AppError("Token is invalid or has expired", 400));
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    try {
        await (0, sendEmail_1.sendPasswordChangedEmail)(user.email, user.name);
    }
    catch (err) {
        console.error("Failed to send password changed email:", err);
    }
    res.status(200).json({ status: "success", message: "Password reset successfully" });
});
exports.deleteMyAccount = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const user = await user_model_1.User.findById(req.user._id);
    if (!user)
        return next(new AppError_1.AppError("User not found", 404));
    try {
        await (0, sendEmail_1.sendAccountDeletedEmail)(user.email, user.name);
    }
    catch (err) {
        console.error("Failed to send account deleted email:", err);
    }
    if (user.image) {
        const publicId = user.image.split("/").pop()?.split(".")[0];
        if (publicId)
            await claudinary_1.default.uploader.destroy(`users/${publicId}`);
    }
    await user_model_1.User.findByIdAndDelete(req.user._id);
    res.status(204).json({
        status: "success",
        message: "Account deleted successfully",
    });
});
