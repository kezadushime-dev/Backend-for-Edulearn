"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = exports.submitQuiz = exports.deleteQuiz = exports.updateQuiz = exports.getQuizByLesson = exports.getQuizById = exports.getAllQuizzes = exports.createQuiz = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const quiz_model_1 = require("../models/quiz.model");
const result_model_1 = require("../models/result.model");
const report_model_1 = require("../models/report.model");
const lesson_model_1 = require("../models/lesson.model");
const catchAsync_1 = require("../utils/catchAsync");
// Create a new quiz
exports.createQuiz = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!Array.isArray(req.body.questions) || req.body.questions.length === 0) {
        return res.status(400).json({
            status: "fail",
            message: "Questions must be a non-empty array of objects",
        });
    }
    // --- Look up lesson if frontend sends an ID ---
    let lessonTitle = req.body.lesson; // default: whatever frontend sent
    if (mongoose_1.default.Types.ObjectId.isValid(req.body.lesson)) {
        const lessonDoc = await lesson_model_1.Lesson.findById(req.body.lesson);
        if (lessonDoc) {
            lessonTitle = lessonDoc.title; // replace with the actual lesson title
        }
    }
    const quiz = await quiz_model_1.Quiz.create({
        ...req.body,
        createdBy: req.user.name,
        lesson: lessonTitle, // always store the lesson title
    });
    res.status(201).json({ status: "success", data: { quiz } });
});
// Get all quizzes
exports.getAllQuizzes = (0, catchAsync_1.catchAsync)(async (req, res) => {
    // Fetch all quizzes, sorted by newest updated/created first
    const quizzes = await quiz_model_1.Quiz.find()
        .sort({ updatedAt: -1 }) // newest on top
        .populate("lesson", "title") // populate only the title
        .populate("createdBy", "name email");
    // Map quizzes to include quiz id + lesson title
    const formattedQuizzes = quizzes.map((q) => ({
        _id: q._id,
        title: q.title,
        lesson: q.lesson?.title || null,
        createdBy: q.createdBy,
        questions: q.questions,
        passingScore: q.passingScore,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
    }));
    res.status(200).json({
        status: "success",
        results: formattedQuizzes.length,
        data: { quizzes: formattedQuizzes },
    });
});
// Get quiz by ID
exports.getQuizById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const quiz = await quiz_model_1.Quiz.findById(req.params.id).populate("lesson", "title");
    if (!quiz)
        return res.status(404).json({ status: "fail", message: "Quiz not found" });
    const formattedQuiz = {
        _id: quiz._id,
        title: quiz.title,
        lesson: quiz.lesson?.title || null,
        createdBy: quiz.createdBy,
        questions: quiz.questions,
        passingScore: quiz.passingScore,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
    };
    res.status(200).json({ status: "success", data: { quiz: formattedQuiz } });
});
// Get quiz by lesson
exports.getQuizByLesson = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const quiz = await quiz_model_1.Quiz.findOne({ lesson: req.params.lessonId }).populate("lesson", "title");
    if (!quiz)
        return res
            .status(404)
            .json({ status: "fail", message: "Quiz not found" });
    res.status(200).json({ status: "success", data: { quiz } });
});
// Update a quiz
exports.updateQuiz = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const quiz = await quiz_model_1.Quiz.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!quiz)
        return res.status(404).json({ status: "fail", message: "Quiz not found" });
    res.status(200).json({ status: "success", data: { quiz } });
});
// Delete a quiz
exports.deleteQuiz = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const quiz = await quiz_model_1.Quiz.findByIdAndDelete(req.params.id);
    if (!quiz)
        return res.status(404).json({ status: "fail", message: "Quiz not found" });
    res.status(204).json({ status: "success", data: null });
});
// Submit quiz answers and automatically grade
exports.submitQuiz = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const quiz = await quiz_model_1.Quiz.findById(req.params.id).populate({
        path: "lesson",
        select: "title",
    });
    if (!quiz)
        return res.status(404).json({ status: "fail", message: "Quiz not found" });
    let score = 0;
    const responses = req.body.answers.map((answer, index) => {
        const question = quiz.questions[index];
        const isCorrect = answer.selectedOptionIndex === question.correctOptionIndex;
        if (isCorrect)
            score += question.points;
        return {
            questionId: question._id,
            selectedOptionIndex: answer.selectedOptionIndex,
            isCorrect,
        };
    });
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = (score / totalPoints) * 100;
    const passed = percentage >= quiz.passingScore;
    const result = await result_model_1.Result.create({
        user: req.user.id,
        quiz: quiz._id,
        lesson: quiz.lesson,
        score,
        percentage,
        passed,
        responses,
    });
    // Populate for formatted result
    await result.populate({
        path: "quiz",
        select: "title lesson",
        populate: { path: "lesson", select: "title" },
    });
    const populatedQuiz = result.quiz;
    const formattedResult = {
        ...result.toObject(),
        quiz: {
            _id: populatedQuiz._id,
            title: populatedQuiz.title,
            lesson: populatedQuiz.lesson
                ? { _id: populatedQuiz.lesson._id, title: populatedQuiz.lesson.title }
                : { _id: null, title: "No Lesson" },
        },
    };
    // Update or create report
    let report = await report_model_1.Report.findOne({ user: req.user.id });
    const userResults = await result_model_1.Result.find({ user: req.user.id }).populate({
        path: "quiz",
        select: "title lesson",
        populate: { path: "lesson", select: "title" },
    });
    if (!report) {
        report = await report_model_1.Report.create({
            user: req.user.id,
            quizzes: [],
            overallAverage: 0,
            status: "pending",
        });
    }
    // Rebuild quizzes array with lessons
    report.quizzes = userResults.map((resItem) => ({
        quiz: {
            _id: resItem.quiz._id,
            title: resItem.quiz.title,
            lesson: resItem.quiz.lesson
                ? { _id: resItem.quiz.lesson._id, title: resItem.quiz.lesson.title }
                : { _id: null, title: "No Lesson" },
        },
        score: resItem.score,
        percentage: resItem.percentage,
        passed: resItem.passed,
        takenAt: resItem.completedAt || new Date(),
    }));
    // Recalculate overall average
    const total = report.quizzes.reduce((sum, q) => sum + (q.percentage ?? 0), 0);
    report.overallAverage =
        report.quizzes.length > 0 ? total / report.quizzes.length : 0;
    await report.save();
    res.status(200).json({
        status: "success",
        data: { result: formattedResult, report },
    });
});
// Get analytics for all quizzes (average, pass rates, etc.)
exports.getAnalytics = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const results = await result_model_1.Result.find().populate("quiz", "title");
    const analytics = results.reduce((acc, r) => {
        const quizId = r.quiz._id.toString();
        if (!acc[quizId])
            acc[quizId] = {
                title: r.quiz.title,
                attempts: 0,
                passed: 0,
                totalScore: 0,
            };
        acc[quizId].attempts += 1;
        if (r.passed)
            acc[quizId].passed += 1;
        acc[quizId].totalScore += r.score;
        return acc;
    }, {});
    // Convert to array with averages
    const analyticsArray = Object.values(analytics).map((q) => ({
        title: q.title,
        attempts: q.attempts,
        passed: q.passed,
        averageScore: q.totalScore / q.attempts,
    }));
    res
        .status(200)
        .json({ status: "success", data: { analytics: analyticsArray } });
});
