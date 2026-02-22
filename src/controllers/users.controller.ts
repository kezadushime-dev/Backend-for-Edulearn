import { User } from "../models/user.model";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middlewares/auth.middleware";

const normalizeRole = (role: string) => {
  if (role === "learner") return "user";
  if (role === "instructor") return "leader";
  return role;
};

const canManageUser = (currentUser: any, targetUserId: string) => {
  const role = normalizeRole(currentUser.role);
  return role === "admin" || currentUser._id.toString() === targetUserId.toString();
};

export const getUsers = catchAsync(async (req: AuthRequest, res: any) => {
  const filter: any = {};

  if (req.query.role) {
    const role = req.query.role.toString();
    if (role === "user") filter.role = { $in: ["user", "learner"] };
    else if (role === "leader") filter.role = { $in: ["leader", "instructor"] };
    else filter.role = role;
  }

  if (req.query.conference) filter.conference = req.query.conference;
  if (req.query.country) filter.country = req.query.country;
  if (req.query.field) filter.field = req.query.field;
  if (req.query.province) filter.province = req.query.province;
  if (req.query.region) filter.region = req.query.region;
  if (req.query.church) filter.church = req.query.church;
  if (req.query.club) filter.club = req.query.club;
  if (req.query.ageGroup) filter.ageGroup = req.query.ageGroup;

  const users = await User.find(filter).select("-password").sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

export const getUser = catchAsync(async (req: AuthRequest, res: any, next: any) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const updateUser = catchAsync(async (req: AuthRequest, res: any, next: any) => {
  const { id } = req.params;
  if (!canManageUser(req.user, id)) {
    return next(new AppError("You can only update your profile", 403));
  }

  const allowedFields = [
    "name",
    "email",
    "avatarUrl",
    "country",
    "field",
    "province",
    "image",
    "church",
    "club",
    "region",
    "district",
    "conference",
    "ageGroup",
  ];

  const updateBody: any = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updateBody[field] = req.body[field];
  });

  if (req.body.role !== undefined) {
    if (normalizeRole(req.user.role) !== "admin") {
      return next(new AppError("Only admin can update role", 403));
    }
    updateBody.role = req.body.role;
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateBody, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!updatedUser) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",
    data: { user: updatedUser },
  });
});
