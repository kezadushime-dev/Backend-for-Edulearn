import mongoose from "mongoose";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Lesson } from "../models/lesson.model";
import { UserCourseProgress } from "../models/userCourseProgress.model";

export const completeLesson = catchAsync(async (req: AuthRequest, res: any) => {
  const userId = new mongoose.Types.ObjectId(req.user.id); // cast to ObjectId
  const lessonId = new mongoose.Types.ObjectId(req.params.lessonId); // cast to ObjectId

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    return res.status(404).json({ status: "fail", message: "Lesson not found" });
  }

  const courseId = new mongoose.Types.ObjectId(lesson.course); // cast course to ObjectId

  // Find or create progress record
  let progressDoc = await UserCourseProgress.findOne({ user: userId, course: courseId });
  if (!progressDoc) {
    progressDoc = await UserCourseProgress.create({ user: userId, course: courseId });
  }

  // If lesson not completed yet
  const alreadyCompleted = progressDoc.completedLessons.some(
    (id: any) => id.toString() === lessonId.toString(),
  );

  if (!alreadyCompleted) {
    progressDoc.completedLessons.push(lessonId);

    // Calculate progress percentage
    const totalLessons = await Lesson.countDocuments({ course: courseId });
    progressDoc.progress =
      totalLessons > 0
        ? Math.round((progressDoc.completedLessons.length / totalLessons) * 100)
        : 0;
  }

  const lessonMinutesToAdd = !alreadyCompleted ? (lesson as any).durationMinutes || 0 : 0;
  progressDoc.totalMinutes = (progressDoc.totalMinutes || 0) + lessonMinutesToAdd;
  progressDoc.lastAccessedAt = new Date();
  await progressDoc.save();

  res.status(200).json({
    status: "success",
    data: {
      lessonCompleted: lesson.title,
      progress: progressDoc.progress,
      totalMinutes: progressDoc.totalMinutes,
    },
  });
});
