"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLesson = exports.updateLesson = exports.getLessonModules = exports.getLesson = exports.getAllLessons = exports.createLesson = void 0;
const lesson_model_1 = require("../models/lesson.model");
const course_model_1 = require("../models/course.model");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../utils/AppError");
const claudinary_1 = __importDefault(require("../config/claudinary"));
const uploadToCloudinary = (fileBuffer, resourceType) => {
    return new Promise((resolve, reject) => {
        const stream = claudinary_1.default.uploader.upload_stream({
            folder: "lessons",
            resource_type: resourceType,
        }, (error, result) => {
            if (error)
                return reject(error);
            resolve(result?.secure_url || "");
        });
        stream.end(fileBuffer);
    });
};
const parseMaybeJson = (value, fieldName) => {
    if (value === undefined || value === null)
        return undefined;
    if (typeof value !== "string")
        return value;
    const trimmed = value.trim();
    if (!trimmed)
        return undefined;
    const maybeJson = (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"));
    if (!maybeJson)
        return value;
    try {
        return JSON.parse(trimmed);
    }
    catch {
        throw new AppError_1.AppError(`Invalid JSON format in '${fieldName}'`, 400);
    }
};
const parseStructuredField = (value, fieldName, expected) => {
    const parsed = parseMaybeJson(value, fieldName);
    if (parsed === undefined)
        return undefined;
    if (expected === "array" && !Array.isArray(parsed)) {
        throw new AppError_1.AppError(`'${fieldName}' must be an array`, 400);
    }
    if (expected === "object" &&
        (Array.isArray(parsed) || typeof parsed !== "object")) {
        throw new AppError_1.AppError(`'${fieldName}' must be an object`, 400);
    }
    return parsed;
};
exports.createLesson = (0, catchAsync_1.catchAsync)(async (req, res) => {
    req.body.instructor = req.user.id;
    const courseInput = req.body.course;
    if (!courseInput) {
        return res.status(400).json({
            status: "fail",
            message: "Lesson must belong to a course",
        });
    }
    const course = (await course_model_1.Course.findById(courseInput)) || (await course_model_1.Course.findOne({ title: courseInput }));
    if (!course) {
        return res.status(404).json({
            status: "fail",
            message: "Course not found",
        });
    }
    const files = req.files;
    const imageFiles = files?.images || [];
    const videoFiles = [...(files?.video || []), ...(files?.videos || [])];
    const audioFiles = [...(files?.audio || []), ...(files?.audios || [])];
    const documentFiles = files?.documents || [];
    const imageUrls = await Promise.all(imageFiles.map((file) => uploadToCloudinary(file.buffer, "image")));
    const videoUrls = await Promise.all(videoFiles.map((file) => uploadToCloudinary(file.buffer, "video")));
    const audioUrls = await Promise.all(audioFiles.map((file) => uploadToCloudinary(file.buffer, "video")));
    const documentUrls = await Promise.all(documentFiles.map((file) => uploadToCloudinary(file.buffer, "raw")));
    const modules = parseStructuredField(req.body.modules, "modules", "array");
    const quiz = parseStructuredField(req.body.quiz, "quiz", "object");
    const interactiveElements = parseStructuredField(req.body.interactiveElements, "interactiveElements", "object");
    const lessonPayload = {
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
    if (modules !== undefined)
        lessonPayload.modules = modules;
    if (quiz !== undefined)
        lessonPayload.quiz = quiz;
    if (interactiveElements !== undefined)
        lessonPayload.interactiveElements = interactiveElements;
    const newLesson = await lesson_model_1.Lesson.create(lessonPayload);
    await course_model_1.Course.findByIdAndUpdate(course._id, {
        $addToSet: { lessons: newLesson._id },
    });
    res.status(201).json({
        status: "success",
        data: { lesson: newLesson },
    });
});
exports.getAllLessons = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const lessons = await lesson_model_1.Lesson.find()
        .sort({ order: 1 })
        .populate("instructor", "name image")
        .populate("course", "title frameworkCategory category");
    res.status(200).json({
        status: "success",
        results: lessons.length,
        data: { lessons },
    });
});
exports.getLesson = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const lesson = await lesson_model_1.Lesson.findById(req.params.id)
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
exports.getLessonModules = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const lesson = await lesson_model_1.Lesson.findById(req.params.id).select("_id title modules quiz interactiveElements");
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
            modules: lesson.modules || [],
            quiz: lesson.quiz || { questions: [] },
            interactiveElements: lesson.interactiveElements || {
                discussionPrompts: [],
                practicalAssignments: [],
                spiritualReflections: [],
            },
        },
    });
});
exports.updateLesson = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const files = req.files;
    if (files?.images) {
        req.body.images = await Promise.all(files.images.map((file) => uploadToCloudinary(file.buffer, "image")));
    }
    if (files?.video || files?.videos) {
        const videoFiles = [...(files?.video || []), ...(files?.videos || [])];
        req.body.videos = await Promise.all(videoFiles.map((file) => uploadToCloudinary(file.buffer, "video")));
    }
    if (files?.audio || files?.audios) {
        const audioFiles = [...(files?.audio || []), ...(files?.audios || [])];
        req.body.audios = await Promise.all(audioFiles.map((file) => uploadToCloudinary(file.buffer, "video")));
    }
    if (files?.documents) {
        req.body.documents = await Promise.all(files.documents.map((file) => uploadToCloudinary(file.buffer, "raw")));
    }
    const modules = parseStructuredField(req.body.modules, "modules", "array");
    const quiz = parseStructuredField(req.body.quiz, "quiz", "object");
    const interactiveElements = parseStructuredField(req.body.interactiveElements, "interactiveElements", "object");
    if (modules !== undefined)
        req.body.modules = modules;
    if (quiz !== undefined)
        req.body.quiz = quiz;
    if (interactiveElements !== undefined)
        req.body.interactiveElements = interactiveElements;
    if (req.body.durationMinutes !== undefined) {
        req.body.durationMinutes = Number(req.body.durationMinutes) || 0;
    }
    const lesson = await lesson_model_1.Lesson.findByIdAndUpdate(req.params.id, req.body, {
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
exports.deleteLesson = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const lesson = await lesson_model_1.Lesson.findById(req.params.id);
    if (!lesson) {
        return res.status(404).json({
            status: "fail",
            message: "Lesson not found",
        });
    }
    await course_model_1.Course.findByIdAndUpdate(lesson.course, {
        $pull: { lessons: lesson._id },
    });
    await lesson_model_1.Lesson.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: "success",
        data: null,
    });
});
