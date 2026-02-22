import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "user" | "leader" | "admin" | "learner" | "instructor";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isSeedAdmin?: boolean;
  image?: string;
  avatarUrl?: string;
  country?: string;
  field?: string;
  province?: string;
  church?: string;
  club?: string;
  region?: string;
  district?: string;
  conference?: string;
  ageGroup?: string;
  lastActiveAt?: Date;
  createdAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  correctPassword(
    candidatePassword: string,
    userPassword: string,
  ): Promise<boolean>;
  createPasswordResetToken(): string;
}

const userSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
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

export const User = mongoose.model<IUser>("User", userSchema);
