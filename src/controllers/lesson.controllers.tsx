import { Lesson } from "../models/lesson.model";
import { Course } from "../models/course.model";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../middlewares/auth.middleware";
import cloudinary from "../config/claudinary";

// Upload helper
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
        resolve(result?.secure_url!);
      },
    );

    stream.end(fileBuffer);
  });
};



// ✅ CREATE LESSON
export const createLesson = catchAsync(async (req: AuthRequest, res: any) => {
  req.body.instructor = req.user.id;

  const courseTitle = req.body.course; // now frontend sends title

  if (!courseTitle) {
    return res.status(400).json({
      status: "fail",
      message: "Lesson must belong to a course",
    });
  }

  // 🔥 Find course by title instead of id
  const course = await Course.findOne({ title: courseTitle });

  if (!course) {
    return res.status(404).json({
      status: "fail",
      message: "Course not found",
    });
  }

  const files = req.files as {
    images?: Express.Multer.File[];
    video?: Express.Multer.File[];
    documents?: Express.Multer.File[];
  };

  let imageUrls: string[] = [];
  let videoUrls: string[] = [];
  let documentUrls: string[] = [];

  if (files?.images) {
    imageUrls = await Promise.all(
      files.images.map((file) =>
        uploadToCloudinary(file.buffer, "image")
      )
    );
  }

  if (files?.video) {
    videoUrls = await Promise.all(
      files.video.map((file) =>
        uploadToCloudinary(file.buffer, "video")
      )
    );
  }

  if (files?.documents) {
    documentUrls = await Promise.all(
      files.documents.map((file) =>
        uploadToCloudinary(file.buffer, "raw")
      )
    );
  }

  const newLesson = await Lesson.create({
    ...req.body,
    course: course._id, // 🔥 store ID internally
    images: imageUrls,
    videos: videoUrls,
    documents: documentUrls,
  });

  // Add lesson to course
  await Course.findByIdAndUpdate(course._id, {
    $push: { lessons: newLesson._id },
  });

  res.status(201).json({
    status: "success",
    data: { lesson: newLesson },
  });
});



// ✅ GET ALL LESSONS
export const getAllLessons = catchAsync(async (req: AuthRequest, res: any) => {
  const lessons = await Lesson.find()
    .sort({ order: 1 })
    .populate("instructor", "name image")
    .populate("course", "title");

  res.status(200).json({
    status: "success",
    results: lessons.length,
    data: { lessons },
  });
});



// ✅ GET SINGLE LESSON
export const getLesson = catchAsync(async (req: AuthRequest, res: any) => {
  const lesson = await Lesson.findById(req.params.id)
    .populate("instructor", "name image")
    .populate("course", "title description");

  res.status(200).json({
    status: "success",
    data: { lesson },
  });
});



// ✅ UPDATE LESSON
export const updateLesson = catchAsync(async (req: AuthRequest, res: any) => {
  const files = req.files as {
    images?: Express.Multer.File[];
    video?: Express.Multer.File[];
    documents?: Express.Multer.File[];
  };

  if (files?.images) {
    req.body.images = await Promise.all(
      files.images.map((file) =>
        uploadToCloudinary(file.buffer, "image")
      )
    );
  }

  if (files?.video) {
    req.body.videos = await Promise.all(
      files.video.map((file) =>
        uploadToCloudinary(file.buffer, "video")
      )
    );
  }

  if (files?.documents) {
    req.body.documents = await Promise.all(
      files.documents.map((file) =>
        uploadToCloudinary(file.buffer, "raw")
      )
    );
  }

  const lesson = await Lesson.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: { lesson },
  });
});



// ✅ DELETE LESSON
export const deleteLesson = catchAsync(async (req: AuthRequest, res: any) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return res.status(404).json({
      status: "fail",
      message: "Lesson not found",
    });
  }

  // 🔥 Remove from course
  await Course.findByIdAndUpdate(lesson.course, {
    $pull: { lessons: lesson._id },
  });

  await Lesson.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
