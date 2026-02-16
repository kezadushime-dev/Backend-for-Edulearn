import multer from "multer";
import { AppError } from "../utils/AppError";

const multerStorage = multer.memoryStorage();

const multerFilter = (req: any, file: any, cb: any) => {
  // Allow images
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  }

  // Allow videos
  else if (file.mimetype.startsWith("video")) {
    cb(null, true);
  }

  // Allow PDF
  else if (file.mimetype === "application/pdf") {
    cb(null, true);
  }

  // Allow Word documents (doc & docx)
  else if (
    file.mimetype === "application/msword" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    cb(null, true);
  }

  // Reject everything else
  else {
    cb(
      new AppError(
        "Unsupported file type! Only images, videos, PDF, and DOC files are allowed.",
        400
      ),
      false
    );
  }
};

export const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit (good for videos)
  },
});