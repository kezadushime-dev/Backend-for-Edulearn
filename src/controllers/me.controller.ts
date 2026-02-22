import { Course } from "../models/course.model";
import { Lesson } from "../models/lesson.model";
import { UserCourseProgress } from "../models/userCourseProgress.model";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middlewares/auth.middleware";

const toNumber = (value: any, fallback: number) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const getMyCourses = catchAsync(async (req: AuthRequest, res: any) => {
  const sort = req.query.sort?.toString();
  const limit = toNumber(req.query.limit, 0);

  const courses = await Course.find().populate("instructor", "name image avatarUrl");
  const progressDocs = await UserCourseProgress.find({ user: req.user.id });
  const progressMap = new Map(
    progressDocs.map((doc: any) => [doc.course.toString(), doc]),
  );

  let coursesWithProgress = courses.map((course: any) => {
    const progressDoc = progressMap.get(course._id.toString());
    return {
      _id: course._id,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      image: course.image || course.coverImage,
      duration: course.duration,
      instructor: course.instructor,
      progressPercent: progressDoc?.progress || 0,
      completedLessons: progressDoc?.completedLessons || [],
      totalMinutes: progressDoc?.totalMinutes || 0,
      lastAccessedAt: progressDoc?.lastAccessedAt || progressDoc?.updatedAt || null,
    };
  });

  if (sort === "lastAccessed") {
    coursesWithProgress = coursesWithProgress.sort((a, b) => {
      const aTime = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
      const bTime = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
      return bTime - aTime;
    });
  }

  if (limit > 0) {
    coursesWithProgress = coursesWithProgress.slice(0, limit);
  }

  res.status(200).json({
    status: "success",
    results: coursesWithProgress.length,
    data: { courses: coursesWithProgress },
  });
});

export const getMyCourseProgress = catchAsync(async (req: AuthRequest, res: any, next: any) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) return next(new AppError("Course not found", 404));

  const progressDoc = await UserCourseProgress.findOne({
    user: req.user.id,
    course: courseId,
  });

  const totalLessons = await Lesson.countDocuments({ course: courseId });

  res.status(200).json({
    status: "success",
    data: {
      progress: {
        courseId,
        percent: progressDoc?.progress || 0,
        completedLessons: progressDoc?.completedLessons || [],
        totalLessons,
        totalMinutes: progressDoc?.totalMinutes || 0,
        lastAccessedAt: progressDoc?.lastAccessedAt || progressDoc?.updatedAt || null,
      },
    },
  });
});

export const completeMyCourseLesson = catchAsync(
  async (req: AuthRequest, res: any, next: any) => {
    const { courseId } = req.params;
    const { lessonId, minutesSpent } = req.body;

    if (!lessonId) {
      return next(new AppError("lessonId is required", 400));
    }

    const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
    if (!lesson) return next(new AppError("Lesson not found in this course", 404));

    let progressDoc = await UserCourseProgress.findOne({
      user: req.user.id,
      course: courseId,
    });

    if (!progressDoc) {
      progressDoc = await UserCourseProgress.create({
        user: req.user.id,
        course: courseId,
        completedLessons: [],
        progress: 0,
        totalMinutes: 0,
      });
    }

    const lessonAlreadyCompleted = progressDoc.completedLessons.some(
      (id: any) => id.toString() === lessonId.toString(),
    );

    if (!lessonAlreadyCompleted) {
      progressDoc.completedLessons.push(lesson._id as any);
    }

    const totalLessons = await Lesson.countDocuments({ course: courseId });
    progressDoc.progress =
      totalLessons > 0
        ? Math.round((progressDoc.completedLessons.length / totalLessons) * 100)
        : 0;

    const hasExplicitMinutes = minutesSpent !== undefined;
    const lessonMinutes = hasExplicitMinutes
      ? toNumber(minutesSpent, 0)
      : !lessonAlreadyCompleted
        ? toNumber((lesson as any).durationMinutes, 0)
        : 0;

    progressDoc.totalMinutes = (progressDoc.totalMinutes || 0) + Math.max(lessonMinutes, 0);
    progressDoc.lastAccessedAt = new Date();
    await progressDoc.save();

    res.status(200).json({
      status: "success",
      data: {
        progress: {
          courseId,
          lessonId,
          percent: progressDoc.progress,
          completedLessons: progressDoc.completedLessons,
          totalLessons,
          totalMinutes: progressDoc.totalMinutes,
          lastAccessedAt: progressDoc.lastAccessedAt,
        },
      },
    });
  },
);
