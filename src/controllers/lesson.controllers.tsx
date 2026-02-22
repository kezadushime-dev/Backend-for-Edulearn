import { Lesson } from "../models/lesson.model";
import { Course } from "../models/course.model";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/AppError";
import cloudinary from "../config/claudinary";

const uploadToCloudinary = (
  fileBuffer: Buffer,
  resourceType: "image" | "video" | "raw",
) => {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "lessons",
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || "");
      },
    );

    stream.end(fileBuffer);
  });
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

const parseStructuredField = (
  value: any,
  fieldName: string,
  expected: "array" | "object",
) => {
  const parsed = parseMaybeJson(value, fieldName);
  if (parsed === undefined) return undefined;

  if (expected === "array" && !Array.isArray(parsed)) {
    throw new AppError(`'${fieldName}' must be an array`, 400);
  }

  if (
    expected === "object" &&
    (Array.isArray(parsed) || typeof parsed !== "object")
  ) {
    throw new AppError(`'${fieldName}' must be an object`, 400);
  }

  return parsed;
};

export const createLesson = catchAsync(async (req: AuthRequest, res: any) => {
  req.body.instructor = req.user.id;

  const courseInput = req.body.course;

  if (!courseInput) {
    return res.status(400).json({
      status: "fail",
      message: "Lesson must belong to a course",
    });
  }

  const course =
    (await Course.findById(courseInput)) || (await Course.findOne({ title: courseInput }));

  if (!course) {
    return res.status(404).json({
      status: "fail",
      message: "Course not found",
    });
  }

  const files = req.files as {
    images?: Express.Multer.File[];
    video?: Express.Multer.File[];
    videos?: Express.Multer.File[];
    audio?: Express.Multer.File[];
    audios?: Express.Multer.File[];
    documents?: Express.Multer.File[];
  };

  const imageFiles = files?.images || [];
  const videoFiles = [...(files?.video || []), ...(files?.videos || [])];
  const audioFiles = [...(files?.audio || []), ...(files?.audios || [])];
  const documentFiles = files?.documents || [];

  const imageUrls = await Promise.all(
    imageFiles.map((file) => uploadToCloudinary(file.buffer, "image")),
  );

  const videoUrls = await Promise.all(
    videoFiles.map((file) => uploadToCloudinary(file.buffer, "video")),
  );

  const audioUrls = await Promise.all(
    audioFiles.map((file) => uploadToCloudinary(file.buffer, "video")),
  );

  const documentUrls = await Promise.all(
    documentFiles.map((file) => uploadToCloudinary(file.buffer, "raw")),
  );

  const modules = parseStructuredField(req.body.modules, "modules", "array");
  const quiz = parseStructuredField(req.body.quiz, "quiz", "object");
  const interactiveElements = parseStructuredField(
    req.body.interactiveElements,
    "interactiveElements",
    "object",
  );

  const lessonPayload: any = {
    ...req.body,
    course: course._id,
    images: imageUrls,
    videos: videoUrls,
    audios: audioUrls,
    documents: documentUrls,
  };

  if (req.body.durationMinutes !== undefined) {
    lessonPayload.durationMinutes = Number(req.body.durationMinutes) || 0;
  }

  if (modules !== undefined) lessonPayload.modules = modules;
  if (quiz !== undefined) lessonPayload.quiz = quiz;
  if (interactiveElements !== undefined) lessonPayload.interactiveElements = interactiveElements;

  const newLesson = await Lesson.create(lessonPayload);

  await Course.findByIdAndUpdate(course._id, {
    $addToSet: { lessons: newLesson._id },
  });

  res.status(201).json({
    status: "success",
    data: { lesson: newLesson },
  });
});

export const getAllLessons = catchAsync(async (_req: AuthRequest, res: any) => {
  const lessons = await Lesson.find()
    .sort({ order: 1 })
    .populate("instructor", "name image")
    .populate("course", "title frameworkCategory category");

  res.status(200).json({
    status: "success",
    results: lessons.length,
    data: { lessons },
  });
});

export const getLesson = catchAsync(async (req: AuthRequest, res: any) => {
  const lesson = await Lesson.findById(req.params.id)
    .populate("instructor", "name image")
    .populate("course", "title description frameworkCategory category");

  if (!lesson) {
    return res.status(404).json({
      status: "fail",
      message: "Lesson not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: { lesson },
  });
});

export const getLessonModules = catchAsync(async (req: AuthRequest, res: any) => {
  const lesson = await Lesson.findById(req.params.id).select(
    "_id title modules quiz interactiveElements",
  );

  if (!lesson) {
    return res.status(404).json({
      status: "fail",
      message: "Lesson not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      lessonId: lesson._id,
      title: lesson.title,
      modules: (lesson as any).modules || [],
      quiz: (lesson as any).quiz || { questions: [] },
      interactiveElements: (lesson as any).interactiveElements || {
        discussionPrompts: [],
        practicalAssignments: [],
        spiritualReflections: [],
      },
    },
  });
});

export const updateLesson = catchAsync(async (req: AuthRequest, res: any) => {
  const files = req.files as {
    images?: Express.Multer.File[];
    video?: Express.Multer.File[];
    videos?: Express.Multer.File[];
    audio?: Express.Multer.File[];
    audios?: Express.Multer.File[];
    documents?: Express.Multer.File[];
  };

  if (files?.images) {
    req.body.images = await Promise.all(
      files.images.map((file) => uploadToCloudinary(file.buffer, "image")),
    );
  }

  if (files?.video || files?.videos) {
    const videoFiles = [...(files?.video || []), ...(files?.videos || [])];
    req.body.videos = await Promise.all(
      videoFiles.map((file) => uploadToCloudinary(file.buffer, "video")),
    );
  }

  if (files?.audio || files?.audios) {
    const audioFiles = [...(files?.audio || []), ...(files?.audios || [])];
    req.body.audios = await Promise.all(
      audioFiles.map((file) => uploadToCloudinary(file.buffer, "video")),
    );
  }

  if (files?.documents) {
    req.body.documents = await Promise.all(
      files.documents.map((file) => uploadToCloudinary(file.buffer, "raw")),
    );
  }

  const modules = parseStructuredField(req.body.modules, "modules", "array");
  const quiz = parseStructuredField(req.body.quiz, "quiz", "object");
  const interactiveElements = parseStructuredField(
    req.body.interactiveElements,
    "interactiveElements",
    "object",
  );

  if (modules !== undefined) req.body.modules = modules;
  if (quiz !== undefined) req.body.quiz = quiz;
  if (interactiveElements !== undefined) req.body.interactiveElements = interactiveElements;

  if (req.body.durationMinutes !== undefined) {
    req.body.durationMinutes = Number(req.body.durationMinutes) || 0;
  }

  const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!lesson) {
    return res.status(404).json({
      status: "fail",
      message: "Lesson not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: { lesson },
  });
});

export const deleteLesson = catchAsync(async (req: AuthRequest, res: any) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return res.status(404).json({
      status: "fail",
      message: "Lesson not found",
    });
  }

  await Course.findByIdAndUpdate(lesson.course, {
    $pull: { lessons: lesson._id },
  });

  await Lesson.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
