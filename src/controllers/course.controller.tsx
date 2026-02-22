import { Course } from "../models/course.model";
import { Lesson } from "../models/lesson.model";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/AppError";
import cloudinary from "../config/claudinary";

const FRAMEWORK_CATEGORIES: Record<string, { name: string; aliases: string[] }> = {
  INTELLECTUAL: {
    name: "Iby'ubwenge (Intellectual)",
    aliases: ["intellectual", "iby'ubwenge", "ibyubwenge", "iby ubwenge"],
  },
  SPIRITUAL: {
    name: "Iby'umwuka (Spiritual)",
    aliases: ["spiritual", "iby'umwuka", "ibyumwuka", "iby umwuka"],
  },
  PHYSICAL: {
    name: "Iby'umubiri (Physical)",
    aliases: ["physical", "iby'umubiri", "ibyumubiri", "iby umubiri"],
  },
};

const normalizeText = (value: string) => value.toLowerCase().trim();

const normalizeFrameworkCategory = (value?: string): string | undefined => {
  if (!value) return undefined;

  const input = normalizeText(value);

  for (const [code, data] of Object.entries(FRAMEWORK_CATEGORIES)) {
    if (normalizeText(code) === input || data.aliases.some((alias) => normalizeText(alias) === input)) {
      return code;
    }
  }

  return undefined;
};

const getFrameworkCategoryName = (code?: string) => {
  if (!code) return undefined;
  return FRAMEWORK_CATEGORIES[code]?.name;
};

const parseMaybeJson = (value: any, fieldName: string) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const maybeJson =
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"));

  if (!maybeJson) return value;

  try {
    return JSON.parse(trimmed);
  } catch {
    throw new AppError(`Invalid JSON format in '${fieldName}'`, 400);
  }
};

const uploadToCloudinary = (fileBuffer: Buffer) => {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "courses",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || "");
      },
    );

    stream.end(fileBuffer);
  });
};

const buildCoursePayload = (body: any, imageUrl?: string) => {
  const payload: any = { ...body };

  if (payload.duration !== undefined) {
    payload.duration = Number(payload.duration) || 0;
  }

  const parsedExam = parseMaybeJson(body.exam, "exam");
  if (parsedExam !== undefined) payload.exam = parsedExam;

  const parsedInteractive = parseMaybeJson(body.interactiveElements, "interactiveElements");
  if (parsedInteractive !== undefined) payload.interactiveElements = parsedInteractive;

  const normalizedFrameworkCategory = normalizeFrameworkCategory(
    body.frameworkCategory || body.category,
  );

  if (normalizedFrameworkCategory) {
    payload.frameworkCategory = normalizedFrameworkCategory;
    if (!body.category || normalizeFrameworkCategory(body.category)) {
      payload.category = getFrameworkCategoryName(normalizedFrameworkCategory);
    }
  }

  if (imageUrl) {
    payload.image = imageUrl;
    payload.coverImage = imageUrl;
  }

  return payload;
};

export const createCourse = catchAsync(async (req: AuthRequest, res: any) => {
  req.body.instructor = req.user.id;

  const file = (req.files as { image?: Express.Multer.File[] })?.image?.[0];
  const imageUrl = file ? await uploadToCloudinary(file.buffer) : undefined;

  const course = await Course.create(buildCoursePayload(req.body, imageUrl));

  res.status(201).json({
    status: "success",
    data: { course },
  });
});

export const getAllCourses = catchAsync(async (req: AuthRequest, res: any) => {
  const filter: any = {};
  const andConditions: any[] = [];

  if (req.query.frameworkCategory) {
    const normalized = normalizeFrameworkCategory(req.query.frameworkCategory.toString());
    if (normalized) andConditions.push({ frameworkCategory: normalized });
  }

  if (req.query.category) {
    const categoryQuery = req.query.category.toString();
    const normalized = normalizeFrameworkCategory(categoryQuery);

    if (normalized) {
      andConditions.push({
        $or: [
        { frameworkCategory: normalized },
        { category: categoryQuery },
        { category: getFrameworkCategoryName(normalized) },
        ],
      });
    } else {
      andConditions.push({ category: categoryQuery });
    }
  }

  if (req.query.level) filter.level = req.query.level;

  if (req.query.search) {
    andConditions.push({
      $or: [
      { title: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
      { learningGoal: { $regex: req.query.search, $options: "i" } },
      ],
    });
  }

  if (andConditions.length > 0) {
    filter.$and = andConditions;
  }

  const courses = await Course.find(filter)
    .populate("instructor", "name image avatarUrl")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: courses.length,
    data: { courses },
  });
});

export const getCourseFrameworkTree = catchAsync(async (_req: AuthRequest, res: any) => {
  const courses = await Course.find()
    .populate("instructor", "name image avatarUrl")
    .populate({
      path: "lessons",
      options: { sort: { order: 1 } },
    })
    .sort({ createdAt: -1 });

  const grouped: Record<string, any> = {
    INTELLECTUAL: {
      code: "INTELLECTUAL",
      name: FRAMEWORK_CATEGORIES.INTELLECTUAL.name,
      courses: [],
    },
    SPIRITUAL: {
      code: "SPIRITUAL",
      name: FRAMEWORK_CATEGORIES.SPIRITUAL.name,
      courses: [],
    },
    PHYSICAL: {
      code: "PHYSICAL",
      name: FRAMEWORK_CATEGORIES.PHYSICAL.name,
      courses: [],
    },
  };

  courses.forEach((course: any) => {
    const normalized = course.frameworkCategory || normalizeFrameworkCategory(course.category) || "INTELLECTUAL";

    if (!grouped[normalized]) {
      grouped[normalized] = {
        code: normalized,
        name: course.category || normalized,
        courses: [],
      };
    }

    grouped[normalized].courses.push({
      courseId: course._id,
      courseName: course.title,
      title: course.title,
      description: course.description,
      learningGoal: course.learningGoal,
      level: course.level,
      duration: course.duration,
      instructor: course.instructor,
      exam: course.exam,
      interactiveElements: course.interactiveElements,
      lessons: (course.lessons || []).map((lesson: any) => ({
        lessonId: lesson._id,
        lessonTitle: lesson.title,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        order: lesson.order,
        modules: lesson.modules || [],
        quiz: lesson.quiz || { questions: [] },
        interactiveElements: lesson.interactiveElements,
      })),
    });
  });

  res.status(200).json({
    status: "success",
    data: {
      categories: Object.values(grouped),
    },
  });
});

export const getCourse = catchAsync(async (req: AuthRequest, res: any) => {
  const course = await Course.findById(req.params.id)
    .populate("instructor", "name image avatarUrl")
    .populate({
      path: "lessons",
      options: { sort: { order: 1 } },
    });

  if (!course) {
    return res.status(404).json({
      status: "fail",
      message: "Course not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: { course },
  });
});

export const getCourseLessons = catchAsync(async (req: AuthRequest, res: any) => {
  const course = await Course.findById(req.params.id).select("_id title");
  if (!course) {
    return res.status(404).json({
      status: "fail",
      message: "Course not found",
    });
  }

  const lessons = await Lesson.find({ course: course._id })
    .sort({ order: 1 })
    .populate("instructor", "name image avatarUrl");

  res.status(200).json({
    status: "success",
    results: lessons.length,
    data: { lessons },
  });
});

export const updateCourse = catchAsync(async (req: AuthRequest, res: any) => {
  const file = (req.files as { image?: Express.Multer.File[] })?.image?.[0];
  const imageUrl = file ? await uploadToCloudinary(file.buffer) : undefined;

  const course = await Course.findByIdAndUpdate(
    req.params.id,
    buildCoursePayload(req.body, imageUrl),
    {
      new: true,
      runValidators: true,
    },
  );

  if (!course) {
    return res.status(404).json({
      status: "fail",
      message: "Course not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: { course },
  });
});

export const deleteCourse = catchAsync(async (req: AuthRequest, res: any) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      status: "fail",
      message: "Course not found",
    });
  }

  await Lesson.deleteMany({ course: course._id });
  await course.deleteOne();

  res.status(204).json({
    status: "success",
    data: null,
  });
});
