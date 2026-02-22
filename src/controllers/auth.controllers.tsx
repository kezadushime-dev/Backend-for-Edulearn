import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/user.model";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendAccountDeletedEmail,
  sendProfileUpdatedEmail,
} from "../utils/sendEmail";
import { registerSchema, loginSchema } from "../validations/authValidation";
import cloudinary from "../config/claudinary";

const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || "secret";
  const expiresIn = process.env.JWT_EXPIRES_IN || "90d";
  return jwt.sign({ id }, secret, { expiresIn } as jwt.SignOptions);
};

const createSendToken = (user: any, statusCode: number, res: any) => {
  const token = signToken(user._id);
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

const normalizeUserRole = (role?: string) => {
  if (!role) return "user";
  if (role === "learner") return "user";
  if (role === "instructor") return "leader";
  return role;
};

const uploadToCloudinary = (fileBuffer: Buffer, resourceType: "image") => {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "users", resource_type: resourceType },
      (err, result) => {
        if (err) return reject(err);
        resolve(result!.secure_url);
      },
    );
    stream.end(fileBuffer);
  });
};

export const register = catchAsync(async (req: any, res: any, next: any) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const {
    name,
    email,
    password,
    role,
    avatarUrl,
    country,
    field,
    province,
    church,
    club,
    region,
    district,
    conference,
    ageGroup,
  } = req.body;

  const normalizedRole = normalizeUserRole(role);
  if (normalizedRole === "admin") {
    return next(new AppError("You cannot self-register as admin", 403));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new AppError("Email already in use", 400));

  const newUser = await User.create({
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
    await sendWelcomeEmail(newUser.email, newUser.name);
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }

  createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req: any, res: any, next: any) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  user.lastActiveAt = new Date();
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res);
});

export const logout = catchAsync(async (_req: any, res: any) => {
  res.status(200).json({
    status: "success",
    data: null,
  });
});

export const getMe = catchAsync(async (req: any, res: any, next: any) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

const filterObj = (obj: any, ...allowedFields: string[]) => {
  const newObj: any = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

export const updateMe = catchAsync(async (req: any, res: any, next: any) => {
  if (req.body.role) {
    return next(new AppError("You cannot update your role", 403));
  }

  const filteredBody = filterObj(
    req.body,
    "name",
    "email",
    "password",
    "avatarUrl",
    "country",
    "field",
    "province",
    "church",
    "club",
    "region",
    "district",
    "conference",
    "ageGroup",
  );

  if (req.file) {
    const imageUrl = await uploadToCloudinary(req.file.buffer, "image");
    filteredBody.image = imageUrl;
    filteredBody.avatarUrl = imageUrl;
  }

  const updatedFields: string[] = [];
  if (filteredBody.name) updatedFields.push("Amazina");
  if (filteredBody.email) updatedFields.push("Imeli");
  if (filteredBody.password) updatedFields.push("Ijambo banga");
  if (filteredBody.avatarUrl || filteredBody.image) updatedFields.push("Ifoto ya profili");
  if (filteredBody.country) updatedFields.push("Igihugu");
  if (filteredBody.field) updatedFields.push("Field");
  if (filteredBody.province) updatedFields.push("Intara");
  if (filteredBody.church) updatedFields.push("Itorero");
  if (filteredBody.club) updatedFields.push("Club");
  if (filteredBody.region) updatedFields.push("Akarere");
  if (filteredBody.ageGroup) updatedFields.push("Itsinda ry'imyaka");

  let user;
  if (filteredBody.password) {
    user = await User.findById(req.user._id);
    if (!user) return next(new AppError("User not found", 404));

    user.password = filteredBody.password;
    if (filteredBody.name) user.name = filteredBody.name;
    if (filteredBody.email) user.email = filteredBody.email;
    if (filteredBody.image) user.image = filteredBody.image;
    if (filteredBody.avatarUrl) user.avatarUrl = filteredBody.avatarUrl;
    if (filteredBody.country) user.country = filteredBody.country;
    if (filteredBody.field) user.field = filteredBody.field;
    if (filteredBody.province) user.province = filteredBody.province;
    if (filteredBody.church) user.church = filteredBody.church;
    if (filteredBody.club) user.club = filteredBody.club;
    if (filteredBody.region) user.region = filteredBody.region;
    if (filteredBody.district) user.district = filteredBody.district;
    if (filteredBody.conference) user.conference = filteredBody.conference;
    if (filteredBody.ageGroup) user.ageGroup = filteredBody.ageGroup;

    await user.save();
  } else {
    user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
      new: true,
      runValidators: true,
    });
  }

  if (updatedFields.length > 0 && user) {
    try {
      await sendProfileUpdatedEmail(user.email, user.name, updatedFields);
    } catch (err) {
      console.error("Failed to send profile updated email:", err);
    }
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const updatePassword = catchAsync(async (req: any, res: any, next: any) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return next(new AppError("Please provide current and new password", 400));
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user || !(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError("Current password is incorrect", 401));
  }

  user.password = newPassword;
  await user.save();

  try {
    await sendPasswordChangedEmail(user.email, user.name);
  } catch (err) {
    console.error("Failed to send password changed email:", err);
  }

  res.status(200).json({ status: "success", message: "Password updated successfully" });
});

export const forgotPassword = catchAsync(async (req: any, res: any, next: any) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Please provide your email", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("No user found with that email", 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(user.email, user.name, resetURL);
    res.status(200).json({
      status: "success",
      message: "Password reset link sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("There was an error sending the email", 500));
  }
});

export const resetPassword = catchAsync(async (req: any, res: any, next: any) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) return next(new AppError("Token is invalid or has expired", 400));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  try {
    await sendPasswordChangedEmail(user.email, user.name);
  } catch (err) {
    console.error("Failed to send password changed email:", err);
  }

  res.status(200).json({ status: "success", message: "Password reset successfully" });
});

export const deleteMyAccount = catchAsync(async (req: any, res: any, next: any) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new AppError("User not found", 404));

  try {
    await sendAccountDeletedEmail(user.email, user.name);
  } catch (err) {
    console.error("Failed to send account deleted email:", err);
  }

  if (user.image) {
    const publicId = user.image.split("/").pop()?.split(".")[0];
    if (publicId) await cloudinary.uploader.destroy(`users/${publicId}`);
  }

  await User.findByIdAndDelete(req.user._id);

  res.status(204).json({
    status: "success",
    message: "Account deleted successfully",
  });
});
