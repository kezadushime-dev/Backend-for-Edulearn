import { Course } from "../models/course.model";
import { Lesson } from "../models/lesson.model";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../middlewares/auth.middleware";
import cloudinary from "../config/claudinary";

// Upload helper
const uploadToCloudinary = (fileBuffer: Buffer) => {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "courses",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url!);
      }
    );

    stream.end(fileBuffer);
  });
};



// ✅ CREATE COURSE (WITH IMAGE)
export const createCourse = catchAsync(async (req: AuthRequest, res: any) => {
  req.body.instructor = req.user.id;

  const file = (req.files as { image?: Express.Multer.File[] })?.image?.[0];

  let imageUrl: string | undefined;

  if (file) {
    imageUrl = await uploadToCloudinary(file.buffer);
  }

  const course = await Course.create({
    ...req.body,
    image: imageUrl,
  });

  res.status(201).json({
    status: "success",
    data: { course },
  });
});



// ✅ GET ALL COURSES
export const getAllCourses = catchAsync(async (req: AuthRequest, res: any) => {
  const courses = await Course.find()
    .populate("instructor", "name image")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: courses.length,
    data: { courses },
  });
});



// ✅ GET SINGLE COURSE (WITH LESSONS)
export const getCourse = catchAsync(async (req: AuthRequest, res: any) => {
  const course = await Course.findById(req.params.id)
    .populate("instructor", "name image")
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



// ✅ UPDATE COURSE (OPTIONAL IMAGE UPDATE)
export const updateCourse = catchAsync(async (req: AuthRequest, res: any) => {
  const file = (req.files as { image?: Express.Multer.File[] })?.image?.[0];

  if (file) {
    req.body.image = await uploadToCloudinary(file.buffer);
  }

  const course = await Course.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: { course },
  });
});



// ✅ DELETE COURSE (AND ITS LESSONS)
export const deleteCourse = catchAsync(async (req: AuthRequest, res: any) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      status: "fail",
      message: "Course not found",
    });
  }

  // delete lessons inside course
  await Lesson.deleteMany({ course: course._id });

  await course.deleteOne();

  res.status(204).json({
    status: "success",
    data: null,
  });
});
