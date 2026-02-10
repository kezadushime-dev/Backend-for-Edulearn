import { User } from '../models/user.model';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendRoleUpdatedEmail, sendAccountDeletedByAdminEmail } from '../utils/sendEmail';
import cloudinary from '../config/claudinary';

// Get all users
export const getAllUsers = catchAsync(async (req: any, res: any) => {
  const users = await User.find().select('-password');
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

// Get user by ID
export const getUserById = catchAsync(async (req: any, res: any, next: any) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return next(new AppError('User not found', 404));
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

//create user
export const createUser = catchAsync(async (req: any, res: any, next: any) => {
  const { name, email, password, role } = req.body;

  // 1. Validate roles
  const allowedRoles = ["learner", "instructor", "admin"];
  if (!allowedRoles.includes(role)) {
    return next(new AppError("Invalid role", 400));
  }

  // 2. Check existing email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already in use", 400));
  }

  const user = await User.create({ name, email, password, role });

  res.status(201).json({
    status: 'success',
    data: { user },
  });
});

// Update user role
export const updateUserRole = catchAsync(async (req: any, res: any, next: any) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) return next(new AppError('User not found', 404));

  // Send role update notification email
  try {
    await sendRoleUpdatedEmail(user.email, user.name, role);
  } catch (err) {
    console.error('Failed to send role update email:', err);
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// Delete user
export const deleteUser = catchAsync(async (req: any, res: any, next: any) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  // Send account deletion notification email before deleting
  try {
    await sendAccountDeletedByAdminEmail(user.email, user.name);
  } catch (err) {
    console.error('Failed to send account deletion email:', err);
  }

  // Delete profile image from Cloudinary if exists
  if (user.image) {
    const publicId = user.image.split('/').pop()?.split('.')[0];
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(`users/${publicId}`);
      } catch (err) {
        console.error('Failed to delete image from Cloudinary:', err);
      }
    }
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Get users by role
export const getUsersByRole = catchAsync(async (req: any, res: any) => {
  const { role } = req.params;
  const users = await User.find({ role }).select('-password');
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

// Get platform statistics
export const getStatistics = catchAsync(async (req: any, res: any) => {
  const totalUsers = await User.countDocuments();
  const learners = await User.countDocuments({ role: 'learner' });
  const instructors = await User.countDocuments({ role: 'instructor' });
  const admins = await User.countDocuments({ role: 'admin' });

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
