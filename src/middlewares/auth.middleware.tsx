import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

export interface AuthRequest extends Request {
  user?: any;
}

const normalizeRole = (role: string) => {
  if (role === "learner") return "user";
  if (role === "instructor") return "leader";
  return role;
};

export const protect = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please login to get access.', 401));
  }

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  await User.findByIdAndUpdate(currentUser._id, { lastActiveAt: new Date() }).catch(() => null);

  req.user = currentUser;
  next();
});

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const normalizedRequestedRoles = roles.map(normalizeRole);
    const normalizedCurrentRole = normalizeRole(req.user.role);

    if (!normalizedRequestedRoles.includes(normalizedCurrentRole)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
