import { ChatRoom } from "../models/chatRoom.model";
import { ChatMember } from "../models/chatMember.model";
import { Message } from "../models/message.model";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middlewares/auth.middleware";

const normalizeRole = (role: string) => {
  if (role === "learner") return "user";
  if (role === "instructor") return "leader";
  return role;
};

const ensureRoomMembership = async (roomId: string, userId: string) => {
  const membership = await ChatMember.findOne({ room: roomId, user: userId });
  return Boolean(membership);
};

export const getRooms = catchAsync(async (req: AuthRequest, res: any) => {
  const memberships = await ChatMember.find({ user: req.user._id }).select("room");
  const roomIds = memberships.map((item: any) => item.room);

  const rooms = await ChatRoom.find({ _id: { $in: roomIds } })
    .populate("course", "title")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: rooms.length,
    data: { rooms },
  });
});

export const createRoom = catchAsync(async (req: AuthRequest, res: any, next: any) => {
  const { name, type = "GROUP", courseId, memberIds = [] } = req.body;
  if (!name) return next(new AppError("name is required", 400));

  const normalizedType = String(type).toUpperCase();
  if (!["GROUP", "COURSE", "PRIVATE"].includes(normalizedType)) {
    return next(new AppError("type must be GROUP, COURSE, or PRIVATE", 400));
  }

  const normalizedRole = normalizeRole(req.user.role);
  if (normalizedType !== "PRIVATE" && !["leader", "admin"].includes(normalizedRole)) {
    return next(new AppError("Only leader/admin can create group or course rooms", 403));
  }

  const room = await ChatRoom.create({
    name,
    type: normalizedType,
    course: courseId,
    createdBy: req.user._id,
  });

  const requestedMemberIds = Array.isArray(memberIds)
    ? memberIds
    : memberIds
      ? [memberIds]
      : [];

  const uniqueMemberIds = Array.from(
    new Set([
      req.user._id.toString(),
      ...requestedMemberIds.map((id: any) => id.toString()),
    ]),
  );

  await ChatMember.insertMany(
    uniqueMemberIds.map((id) => ({ room: room._id, user: id, joinedAt: new Date() })),
    { ordered: false },
  ).catch(() => null);

  res.status(201).json({
    status: "success",
    data: { room },
  });
});

export const joinRoom = catchAsync(async (req: AuthRequest, res: any, next: any) => {
  const room = await ChatRoom.findById(req.params.roomId);
  if (!room) return next(new AppError("Room not found", 404));

  await ChatMember.findOneAndUpdate(
    { room: room._id, user: req.user._id },
    { room: room._id, user: req.user._id, joinedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  res.status(200).json({
    status: "success",
    message: "Joined room successfully",
  });
});

export const leaveRoom = catchAsync(async (req: AuthRequest, res: any, next: any) => {
  const room = await ChatRoom.findById(req.params.roomId);
  if (!room) return next(new AppError("Room not found", 404));

  await ChatMember.findOneAndDelete({ room: room._id, user: req.user._id });

  res.status(200).json({
    status: "success",
    message: "Left room successfully",
  });
});

export const getRoomMessages = catchAsync(async (req: AuthRequest, res: any, next: any) => {
  const { roomId } = req.params;
  const isMember = await ensureRoomMembership(roomId, req.user._id.toString());
  if (!isMember) return next(new AppError("You are not a member of this room", 403));

  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const before = req.query.before ? new Date(req.query.before.toString()) : null;

  const filter: any = { room: roomId };
  if (before && !Number.isNaN(before.getTime())) {
    filter.createdAt = { $lt: before };
  }

  const messages = await Message.find(filter)
    .populate("sender", "name image avatarUrl role")
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json({
    status: "success",
    results: messages.length,
    data: { messages: messages.reverse() },
  });
});

export const createRoomMessage = catchAsync(async (req: AuthRequest, res: any, next: any) => {
  const { roomId } = req.params;
  const { content } = req.body;

  if (!content) return next(new AppError("content is required", 400));

  const isMember = await ensureRoomMembership(roomId, req.user._id.toString());
  if (!isMember) return next(new AppError("You are not a member of this room", 403));

  const message = await Message.create({
    room: roomId,
    sender: req.user._id,
    content,
  });

  const populatedMessage = await Message.findById(message._id).populate(
    "sender",
    "name image avatarUrl role",
  );

  res.status(201).json({
    status: "success",
    data: { message: populatedMessage },
  });
});
