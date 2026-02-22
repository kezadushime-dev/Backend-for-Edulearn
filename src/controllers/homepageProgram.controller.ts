import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/claudinary";
import { HomepageProgram } from "../models/homepageProgram.model";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middlewares/auth.middleware";

const uploadToCloudinary = (
  fileBuffer: Buffer,
  resourceType: "image" | "video",
) => {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "homepage-programs",
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

const parseBoolean = (value: any, defaultValue: boolean) => {
  if (value === undefined || value === null || value === "") return defaultValue;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  const normalized = String(value).toLowerCase().trim();
  if (["true", "1", "yes"].includes(normalized)) return true;
  if (["false", "0", "no"].includes(normalized)) return false;
  return defaultValue;
};

const parseOptionalDate = (value: any): Date | undefined => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
};

const validateDateRange = (startDate?: Date, endDate?: Date) => {
  if (startDate && endDate && startDate > endDate) {
    throw new AppError("startDate must be before endDate", 400);
  }
};

const parseLimit = (value: any, defaultValue = 20) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return defaultValue;
  return Math.min(n, 100);
};

const buildPublicActiveFilter = () => {
  const now = new Date();
  return {
    showOnHomepage: true,
    isActive: true,
    $and: [
      {
        $or: [
          { startDate: { $exists: false } },
          { startDate: null },
          { startDate: { $lte: now } },
        ],
      },
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ],
  };
};

export const getPublicHomepagePrograms = catchAsync(
  async (req: Request, res: Response) => {
    const limit = parseLimit(req.query.limit, 20);

    const programs = await HomepageProgram.find(buildPublicActiveFilter())
      .sort({ startDate: -1, createdAt: -1 })
      .limit(limit)
      .select("-__v")
      .lean();

    const popupProgram = programs.find((item: any) => item.isPopup);

    res.status(200).json({
      status: "success",
      results: programs.length,
      data: {
        programs,
        popup: popupProgram
          ? {
              id: popupProgram._id,
              title: popupProgram.popupTitle || popupProgram.title,
              message: popupProgram.popupMessage || popupProgram.description,
              imageUrl: popupProgram.imageUrl,
              videoUrl: popupProgram.videoUrl,
            }
          : null,
      },
    });
  },
);

export const getPublicHomepagePopup = catchAsync(
  async (_req: Request, res: Response) => {
    const popupProgram = await HomepageProgram.findOne({
      ...buildPublicActiveFilter(),
      isPopup: true,
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .select("-__v")
      .lean();

    res.status(200).json({
      status: "success",
      data: {
        popup: popupProgram
          ? {
              id: popupProgram._id,
              title: popupProgram.popupTitle || popupProgram.title,
              message: popupProgram.popupMessage || popupProgram.description,
              imageUrl: popupProgram.imageUrl,
              videoUrl: popupProgram.videoUrl,
            }
          : null,
      },
    });
  },
);

export const getHomepageProgramsAdmin = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const includeInactive = parseBoolean(req.query.includeInactive, false);
    const filter: any = includeInactive ? {} : { isActive: true };

    if (req.query.type) {
      filter.type = String(req.query.type).toUpperCase();
    }

    const programs = await HomepageProgram.find(filter)
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: programs.length,
      data: { programs },
    });
  },
);

export const getHomepageProgramById = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const program = await HomepageProgram.findById(req.params.id).populate(
      "createdBy",
      "name email role",
    );
    if (!program) return next(new AppError("Homepage program not found", 404));

    res.status(200).json({
      status: "success",
      data: { program },
    });
  },
);

export const createHomepageProgram = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const files = req.files as {
      image?: Express.Multer.File[];
      video?: Express.Multer.File[];
    };

    const uploadedImage = files?.image?.[0]
      ? await uploadToCloudinary(files.image[0].buffer, "image")
      : undefined;
    const uploadedVideo = files?.video?.[0]
      ? await uploadToCloudinary(files.video[0].buffer, "video")
      : undefined;

    const imageUrl = uploadedImage || req.body.imageUrl;
    const videoUrl = uploadedVideo || req.body.videoUrl;

    if (!req.body.title || !req.body.description) {
      return next(new AppError("title and description are required", 400));
    }

    if (!imageUrl && !videoUrl) {
      return next(new AppError("Provide at least one media item (image or video)", 400));
    }

    const startDate = parseOptionalDate(req.body.startDate);
    const endDate = parseOptionalDate(req.body.endDate);
    validateDateRange(startDate, endDate);

    const program = await HomepageProgram.create({
      type: req.body.type ? String(req.body.type).toUpperCase() : "PROGRAM",
      title: req.body.title,
      description: req.body.description,
      imageUrl,
      videoUrl,
      showOnHomepage: parseBoolean(req.body.showOnHomepage, true),
      isPopup: parseBoolean(req.body.isPopup, false),
      popupTitle: req.body.popupTitle,
      popupMessage: req.body.popupMessage,
      isActive: parseBoolean(req.body.isActive, true),
      startDate,
      endDate,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      status: "success",
      message: "Homepage program created successfully",
      data: { program },
    });
  },
);

export const updateHomepageProgram = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const existing = await HomepageProgram.findById(req.params.id);
    if (!existing) return next(new AppError("Homepage program not found", 404));

    const files = req.files as {
      image?: Express.Multer.File[];
      video?: Express.Multer.File[];
    };

    const updateBody: any = {};
    const allowedFields = [
      "title",
      "description",
      "popupTitle",
      "popupMessage",
      "imageUrl",
      "videoUrl",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updateBody[field] = req.body[field];
    }

    if (req.body.type !== undefined) updateBody.type = String(req.body.type).toUpperCase();
    if (req.body.showOnHomepage !== undefined) {
      updateBody.showOnHomepage = parseBoolean(req.body.showOnHomepage, true);
    }
    if (req.body.isPopup !== undefined) {
      updateBody.isPopup = parseBoolean(req.body.isPopup, false);
    }
    if (req.body.isActive !== undefined) {
      updateBody.isActive = parseBoolean(req.body.isActive, true);
    }

    if (req.body.startDate !== undefined) {
      updateBody.startDate = parseOptionalDate(req.body.startDate);
    }
    if (req.body.endDate !== undefined) {
      updateBody.endDate = parseOptionalDate(req.body.endDate);
    }
    validateDateRange(
      updateBody.startDate ?? existing.startDate,
      updateBody.endDate ?? existing.endDate,
    );

    if (files?.image?.[0]) {
      updateBody.imageUrl = await uploadToCloudinary(files.image[0].buffer, "image");
    }
    if (files?.video?.[0]) {
      updateBody.videoUrl = await uploadToCloudinary(files.video[0].buffer, "video");
    }

    const finalImage = updateBody.imageUrl ?? existing.imageUrl;
    const finalVideo = updateBody.videoUrl ?? existing.videoUrl;
    if (!finalImage && !finalVideo) {
      return next(new AppError("Program must contain at least one media item", 400));
    }

    const program = await HomepageProgram.findByIdAndUpdate(req.params.id, updateBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      message: "Homepage program updated successfully",
      data: { program },
    });
  },
);

export const deleteHomepageProgram = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const program = await HomepageProgram.findById(req.params.id);
    if (!program) return next(new AppError("Homepage program not found", 404));

    await program.deleteOne();

    res.status(200).json({
      status: "success",
      message: "Homepage program deleted successfully",
    });
  },
);

