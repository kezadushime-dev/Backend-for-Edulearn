import { User } from "../models/user.model";
import { Post } from "../models/post.model";
import { Like } from "../models/like.model";
import { Course } from "../models/course.model";
import { UserCourseProgress } from "../models/userCourseProgress.model";
import { ChatRoom } from "../models/chatRoom.model";
import { Message } from "../models/message.model";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getMyStats = catchAsync(async (req: AuthRequest, res: any) => {
  const userId = req.user._id;

  const [progressDocs, posts] = await Promise.all([
    UserCourseProgress.find({ user: userId }),
    Post.find({ author: userId }),
  ]);

  const totalCoursesCompleted = progressDocs.filter((doc: any) => doc.progress >= 100).length;
  const totalStudyMinutes = progressDocs.reduce(
    (sum: number, doc: any) => sum + (doc.totalMinutes || 0),
    0,
  );

  const postIds = posts.map((post: any) => post._id);
  const likesReceived = await Like.countDocuments({ post: { $in: postIds } });

  res.status(200).json({
    status: "success",
    data: {
      stats: {
        totalCoursesCompleted,
        totalStudyMinutes,
        postsCount: posts.filter((post: any) => !post.isHidden).length,
        likesReceived,
      },
    },
  });
});

export const getPlatformStats = catchAsync(async (_req: AuthRequest, res: any) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalPosts,
    hiddenPosts,
    totalCourses,
    totalChatRooms,
    totalMessages,
    activeUsersLast7Days,
  ] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments({ isHidden: false }),
    Post.countDocuments({ isHidden: true }),
    Course.countDocuments(),
    ChatRoom.countDocuments(),
    Message.countDocuments(),
    User.countDocuments({ lastActiveAt: { $gte: sevenDaysAgo } }),
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats: {
        totalUsers,
        totalPosts,
        hiddenPosts,
        totalCourses,
        totalChatRooms,
        totalMessages,
        activeUsersLast7Days,
      },
    },
  });
});
