"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const AppError_1 = require("../utils/AppError");
const multerStorage = multer_1.default.memoryStorage();
const multerFilter = (req, file, cb) => {
    // Allow images
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    }
    // Allow videos
    else if (file.mimetype.startsWith("video")) {
        cb(null, true);
    }
    // Allow audio
    else if (file.mimetype.startsWith("audio")) {
        cb(null, true);
    }
    // Allow PDF
    else if (file.mimetype === "application/pdf") {
        cb(null, true);
    }
    // Allow Word documents (doc & docx)
    else if (file.mimetype === "application/msword" ||
        file.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        cb(null, true);
    }
    // Reject everything else
    else {
        cb(new AppError_1.AppError("Unsupported file type! Only images, videos, audio, PDF, and DOC files are allowed.", 400), false);
    }
};
exports.upload = (0, multer_1.default)({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit (good for videos)
    },
});
