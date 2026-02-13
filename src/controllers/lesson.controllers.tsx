import { Lesson } from "../models/lesson.model";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../middlewares/auth.middleware";
import cloudinary from "../config/claudinary";

// Helper to upload a single buffer to Cloudinary
const uploadToCloudinary = (fileBuffer: Buffer) => {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "lessons" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url!);
      }
    );
    stream.end(fileBuffer);
  });
};

// Create Lesson
export const createLesson = catchAsync(async (req: AuthRequest, res: any) => {
  req.body.instructor = req.user.id;

  // 1️⃣ Check if images are provided
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return res.status(400).json({ status: "fail", message: "At least one image is required" });
  }

  // 2️⃣ Upload all images to Cloudinary
  const files = req.files as Express.Multer.File[];
  const uploadedUrls = await Promise.all(files.map(file => uploadToCloudinary(file.buffer)));

  // 3️⃣ Create lesson with uploaded image URLs
  const newLesson = await Lesson.create({
    ...req.body,
    images: uploadedUrls,
  });

  res.status(201).json({ status: "success", data: { lesson: newLesson } });
});

// Get all lessons
export const getAllLessons = catchAsync(async (req: AuthRequest, res: any) => {
  const lessons = await Lesson.find().populate("instructor", "name image");
  res.status(200).json({ status: "success", results: lessons.length, data: { lessons } });
});

// Get single lesson
export const getLesson = catchAsync(async (req: AuthRequest, res: any) => {
  const lesson = await Lesson.findById(req.params.id).populate("instructor", "name image");
  res.status(200).json({ status: "success", data: { lesson } });
});

// Update lesson (optional new images)
export const updateLesson = catchAsync(async (req: AuthRequest, res: any) => {
  if (req.files && (req.files as Express.Multer.File[]).length > 0) {
    const files = req.files as Express.Multer.File[];
    const uploadedUrls = await Promise.all(files.map(file => uploadToCloudinary(file.buffer)));
    req.body.images = uploadedUrls; // replace old images
  }

  const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", data: { lesson } });
});

// Delete lesson
export const deleteLesson = catchAsync(async (req: AuthRequest, res: any) => {
  await Lesson.findByIdAndDelete(req.params.id);
  res.status(204).json({ status: "success", data: null });
});
