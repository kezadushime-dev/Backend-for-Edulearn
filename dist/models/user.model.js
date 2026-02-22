"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, required: [true, "Name is required"] },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 8,
        select: false,
    },
    role: {
        type: String,
        enum: ["user", "leader", "admin", "learner", "instructor"],
        default: "user",
    },
    isSeedAdmin: { type: Boolean, default: false },
    image: { type: String },
    avatarUrl: { type: String },
    country: { type: String },
    field: { type: String },
    province: { type: String },
    church: { type: String },
    club: { type: String },
    region: { type: String },
    district: { type: String },
    conference: { type: String },
    ageGroup: { type: String },
    lastActiveAt: { type: Date, default: Date.now },
    passwordResetToken: String,
    passwordResetExpires: Date,
}, { timestamps: true });
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    this.password = await bcryptjs_1.default.hash(this.password, 12);
    next();
});
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcryptjs_1.default.compare(candidatePassword, userPassword);
};
userSchema.methods.createPasswordResetToken = function () {
    const crypto = require("crypto");
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    return resetToken;
};
exports.User = mongoose_1.default.model("User", userSchema);
