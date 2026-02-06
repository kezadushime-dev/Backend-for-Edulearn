"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLesson = exports.updateLesson = exports.getLesson = exports.getAllLessons = exports.createLesson = void 0;
const lesson_model_1 = require("../models/lesson.model");
const catchAsync_1 = require("../utils/catchAsync");
const claudinary_1 = __importDefault(require("../config/claudinary"));
// Helper to upload a single buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = claudinary_1.default.uploader.upload_stream({ folder: "lessons" }, (error, result) => {
            if (error)
                return reject(error);
            resolve(result?.secure_url);
        });
        stream.end(fileBuffer);
    });
};
// Create Lesson
exports.createLesson = (0, catchAsync_1.catchAsync)(async (req, res) => {
    req.body.instructor = req.user.id;
    // 1️⃣ Check if images are provided
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ status: "fail", message: "At least one image is required" });
    }
    // 2️⃣ Upload all images to Cloudinary
    const files = req.files;
    const uploadedUrls = await Promise.all(files.map(file => uploadToCloudinary(file.buffer)));
    // 3️⃣ Create lesson with uploaded image URLs
    const newLesson = await lesson_model_1.Lesson.create({
        ...req.body,
        images: uploadedUrls,
    });
    res.status(201).json({ status: "success", data: { lesson: newLesson } });
});
// Get all lessons
exports.getAllLessons = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const lessons = await lesson_model_1.Lesson.find().populate("instructor", "name image");
    res.status(200).json({ status: "success", results: lessons.length, data: { lessons } });
});
// Get single lesson
exports.getLesson = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const lesson = await lesson_model_1.Lesson.findById(req.params.id).populate("instructor", "name image");
    res.status(200).json({ status: "success", data: { lesson } });
});
// Update lesson (optional new images)
exports.updateLesson = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (req.files && req.files.length > 0) {
        const files = req.files;
        const uploadedUrls = await Promise.all(files.map(file => uploadToCloudinary(file.buffer)));
        req.body.images = uploadedUrls; // replace old images
    }
    const lesson = await lesson_model_1.Lesson.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({ status: "success", data: { lesson } });
});
// Delete lesson
exports.deleteLesson = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await lesson_model_1.Lesson.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: "success", data: null });
});
