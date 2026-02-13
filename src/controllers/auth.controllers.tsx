import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/user.model';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendWelcomeEmail, sendPasswordResetEmail, sendPasswordChangedEmail, sendAccountDeletedEmail, sendProfileUpdatedEmail } from '../utils/sendEmail';
import { registerSchema, loginSchema } from '../validations/authValidation';
import cloudinary from '../config/claudinary';

// Helper to sign JWT
const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '90d';
  return jwt.sign({ id }, secret, { expiresIn } as jwt.SignOptions);
};

// Send token helper
const createSendToken = (user: any, statusCode: number, res: any) => {
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
export const register = catchAsync(async (req: any, res: any, next: any) => {
  // Validate request body
  const { error } = registerSchema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new AppError('Email already in use', 400));

  const newUser = await User.create({
    name,
    email,
    password,
  });

  // Send welcome email
  try {
    await sendWelcomeEmail(newUser.email, newUser.name);
  } catch (err) {
    console.error('Failed to send welcome email:', err);
  }

  createSendToken(newUser, 201, res);
});


// Login
export const login = catchAsync(async (req: any, res: any, next: any) => {
  // Validate request body
  const { error } = loginSchema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const { email, password } = req.body;

  if (!email || !password) return next(new AppError('Please provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});


//logout
export const logout = catchAsync(async (req: any, res: any, next: any) => {
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

// Get current user profile
export const getMe = catchAsync(async (req: any, res: any, next: any) => {
  const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
});

//update current user profile
const filterObj = (obj: any, ...allowedFields: string[]) => {
  const newObj: any = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

//update user 
export const updateMe = catchAsync(async (req: any, res: any, next: any) => {
  // 1) Prevent role updates
  if (req.body.role) return next(new AppError('You cannot update your role', 403));

  // 2) Filter allowed fields
  const filteredBody = filterObj(req.body, 'name', 'email', 'password');

  // 3) Handle profile image (uploaded via Cloudinary)
  if (req.file && req.file.path) {
    filteredBody.image = req.file.path; // Cloudinary URL
  }

  // Track updated fields for email notification
  const updatedFields: string[] = [];
  if (filteredBody.name) updatedFields.push('Name');
  if (filteredBody.email) updatedFields.push('Email');
  if (filteredBody.password) updatedFields.push('Password');
  if (filteredBody.image) updatedFields.push('Profile Image');

  // 4) Update user
  let user;
  if (filteredBody.password) {
    user = await User.findById(req.user._id);
    if (!user) return next(new AppError('User not found', 404));

    user.password = filteredBody.password;
    if (filteredBody.name) user.name = filteredBody.name;
    if (filteredBody.email) user.email = filteredBody.email;
    if (filteredBody.image) user.image = filteredBody.image;

    await user.save(); // triggers pre-save hooks
  } else {
    user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
      new: true,
      runValidators: true,
    });
  }

  // Send profile updated email
  if (updatedFields.length > 0 && user) {
    try {
      await sendProfileUpdatedEmail(user.email, user.name, updatedFields);
    } catch (err) {
      console.error('Failed to send profile updated email:', err);
    }
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// ------------------ UPDATE PASSWORD ------------------
export const updatePassword = catchAsync(async (req: any, res: any, next: any) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return next(new AppError('Please provide current and new password', 400));

  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.correctPassword(currentPassword, user.password)))
    return next(new AppError('Current password is incorrect', 401));

  user.password = newPassword;
  await user.save();

  // Send password changed confirmation email
  try {
    await sendPasswordChangedEmail(user.email, user.name);
  } catch (err) {
    console.error('Failed to send password changed email:', err);
  }

  res.status(200).json({ status: 'success', message: 'Password updated successfully' });
});

// ------------------ FORGOT PASSWORD ------------------
export const forgotPassword = catchAsync(async (req: any, res: any, next: any) => {
  const { email } = req.body;
  if (!email) return next(new AppError('Please provide your email', 400));

  const user = await User.findOne({ email });
  if (!user) return next(new AppError('No user found with that email', 404));

  // Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send password reset email
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(user.email, user.name, resetURL);
    res.status(200).json({ status: 'success', message: 'Password reset link sent to email!' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the email', 500));
  }
});

// ------------------ RESET PASSWORD ------------------
export const resetPassword = catchAsync(async (req: any, res: any, next: any) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Send password changed confirmation email
  try {
    await sendPasswordChangedEmail(user.email, user.name);
  } catch (err) {
    console.error('Failed to send password changed email:', err);
  }

  res.status(200).json({ status: 'success', message: 'Password reset successfully' });
});

// ------------------ DELETE MY ACCOUNT ------------------
export const deleteMyAccount = catchAsync(async (req: any, res: any, next: any) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new AppError('User not found', 404));

  // Send account deletion confirmation email before deleting
  try {
    await sendAccountDeletedEmail(user.email, user.name);
  } catch (err) {
    console.error('Failed to send account deleted email:', err);
  }

  // Delete profile image from Cloudinary if exists
  if (user.image) {
    const publicId = user.image.split('/').pop()?.split('.')[0];
    if (publicId) await cloudinary.uploader.destroy(`users/${publicId}`);
  }

  await User.findByIdAndDelete(req.user._id);

  res.status(204).json({ status: 'success', message: 'Account deleted successfully' });
});