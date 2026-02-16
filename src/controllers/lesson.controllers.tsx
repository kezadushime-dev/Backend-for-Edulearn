import { Lesson } from "../models/lesson.model";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../middlewares/auth.middleware";
import cloudinary from "../config/claudinary";

// Helper to upload a single buffer to Cloudinary
const uploadToCloudinary = (
  fileBuffer: Buffer,
  resourceType: "image" | "video" | "raw"
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
      }
    );

    stream.end(fileBuffer);
  });
};


// Create Lesson
export const createLesson = catchAsync(async (req: AuthRequest, res: any) => {
  req.body.instructor = req.user.id;

  const files = req.files as {
    images?: Express.Multer.File[];
    video?: Express.Multer.File[];
    documents?: Express.Multer.File[];
  };

  let imageUrls: string[] = [];
  let videoUrl: string | undefined;
  let documentUrls: string[] = [];

  // Upload images
  if (files?.images) {
    imageUrls = await Promise.all(
      files.images.map((file) =>
        uploadToCloudinary(file.buffer, "image")
      )
    );
  }

  // Upload video
  if (files?.video) {
    videoUrl = await uploadToCloudinary(
      files.video[0].buffer,
      "video"
    );
  }

  // Upload documents (PDF / DOC)
  if (files?.documents) {
    documentUrls = await Promise.all(
      files.documents.map((file) =>
        uploadToCloudinary(file.buffer, "raw")
      )
    );
  }

  const newLesson = await Lesson.create({
    ...req.body,
    images: imageUrls,
    video: videoUrl,
    documents: documentUrls,
  });

  res.status(201).json({
    status: "success",
    data: { lesson: newLesson },
  });
});

// Get all lessons
export const getAllLessons = catchAsync(async (req: AuthRequest, res: any) => {
  const lessons = await Lesson.find()
    .sort({ updatedAt: -1 }) 
    .populate("instructor", "name image");

  res.status(200).json({
    status: "success",
    results: lessons.length,
    data: { lessons },
  });
});

// Get single lesson
export const getLesson = catchAsync(async (req: AuthRequest, res: any) => {
  const lesson = await Lesson.findById(req.params.id).populate(
    "instructor",
    "name image",
  );
  res.status(200).json({ status: "success", data: { lesson } });
});

// Update lesson (optional new images)
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
    req.body.video = await uploadToCloudinary(
      files.video[0].buffer,
      "video"
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
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: { lesson },
  });
});

// Delete lesson
export const deleteLesson = catchAsync(async (req: AuthRequest, res: any) => {
  await Lesson.findByIdAndDelete(req.params.id);
  res.status(204).json({ status: "success", data: null });
});
