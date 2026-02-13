import mongoose from "mongoose";
import { Quiz } from "../models/quiz.model";
import { Result } from "../models/result.model";
import { Report } from "../models/report.model";
import { Lesson } from "../models/lesson.model";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../middlewares/auth.middleware";

// Create a new quiz
export const createQuiz = catchAsync(async (req: AuthRequest, res: any) => {
  if (!Array.isArray(req.body.questions) || req.body.questions.length === 0) {
    return res.status(400).json({
      status: "fail",
      message: "Questions must be a non-empty array of objects",
    });
  }

  // --- Look up lesson if frontend sends an ID ---
  let lessonTitle = req.body.lesson; // default: whatever frontend sent

  if (mongoose.Types.ObjectId.isValid(req.body.lesson)) {
    const lessonDoc = await Lesson.findById(req.body.lesson);
    if (lessonDoc) {
      lessonTitle = lessonDoc.title; // replace with the actual lesson title
    }
  }

  const quiz = await Quiz.create({
    ...req.body,
    createdBy: req.user.name,
    lesson: lessonTitle, // always store the lesson title
  });

  res.status(201).json({ status: "success", data: { quiz } });
});

// Get all quizzes
export const getAllQuizzes = catchAsync(async (req: AuthRequest, res: any) => {
  // Fetch all quizzes, sorted by newest updated/created first
  const quizzes = await Quiz.find()
    .sort({ updatedAt: -1 }) // newest on top
    .populate("lesson", "title") // populate only the title
    .populate("createdBy", "name email");

  // Map quizzes to include quiz id + lesson title
  const formattedQuizzes = quizzes.map((q: any) => ({
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
export const getQuizById = catchAsync(async (req: AuthRequest, res: any) => {
  const quiz = await Quiz.findById(req.params.id).populate("lesson", "title");
  if (!quiz)
    return res.status(404).json({ status: "fail", message: "Quiz not found" });

  const formattedQuiz = {
    _id: quiz._id,
    title: quiz.title,
    lesson: (quiz.lesson as any)?.title || null,
    createdBy: quiz.createdBy,
    questions: quiz.questions,
    passingScore: quiz.passingScore,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
  };

  res.status(200).json({ status: "success", data: { quiz: formattedQuiz } });
});

// Get quiz by lesson
export const getQuizByLesson = catchAsync(
  async (req: AuthRequest, res: any) => {
    const quiz = await Quiz.findOne({ lesson: req.params.lessonId }).populate(
      "lesson",
      "title",
    );
    if (!quiz)
      return res
        .status(404)
        .json({ status: "fail", message: "Quiz not found" });
    res.status(200).json({ status: "success", data: { quiz } });
  },
);

// Update a quiz
export const updateQuiz = catchAsync(async (req: AuthRequest, res: any) => {
  const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!quiz)
    return res.status(404).json({ status: "fail", message: "Quiz not found" });
  res.status(200).json({ status: "success", data: { quiz } });
});

// Delete a quiz
export const deleteQuiz = catchAsync(async (req: AuthRequest, res: any) => {
  const quiz = await Quiz.findByIdAndDelete(req.params.id);
  if (!quiz)
    return res.status(404).json({ status: "fail", message: "Quiz not found" });
  res.status(204).json({ status: "success", data: null });
});

// Submit quiz answers and automatically grade
export const submitQuiz = catchAsync(async (req: AuthRequest, res: any) => {
  const quiz = await Quiz.findById(req.params.id).populate({
    path: "lesson",
    select: "title",
  });
  if (!quiz)
    return res.status(404).json({ status: "fail", message: "Quiz not found" });

  let score = 0;

  const responses = req.body.answers.map((answer: any, index: number) => {
    const question = quiz.questions[index];
    const isCorrect =
      answer.selectedOptionIndex === question.correctOptionIndex;
    if (isCorrect) score += question.points;

    return {
      questionId: question._id,
      selectedOptionIndex: answer.selectedOptionIndex,
      isCorrect,
    };
  });

  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
  const percentage = (score / totalPoints) * 100;
  const passed = percentage >= quiz.passingScore;

  const result = await Result.create({
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

  const populatedQuiz = result.quiz as any;

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
  let report = await Report.findOne({ user: req.user.id });
  const userResults = await Result.find({ user: req.user.id }).populate({
    path: "quiz",
    select: "title lesson",
    populate: { path: "lesson", select: "title" },
  });

  if (!report) {
    report = await Report.create({
      user: req.user.id,
      quizzes: [],
      overallAverage: 0,
      status: "pending",
    });
  }

  // Rebuild quizzes array with lessons
  report.quizzes = userResults.map((resItem: any) => ({
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
  const total = report.quizzes.reduce(
    (sum: number, q: any) => sum + (q.percentage ?? 0),
    0,
  );
  report.overallAverage =
    report.quizzes.length > 0 ? total / report.quizzes.length : 0;

  await report.save();

  res.status(200).json({
    status: "success",
    data: { result: formattedResult, report },
  });
});

// Get analytics for all quizzes (average, pass rates, etc.)
export const getAnalytics = catchAsync(async (_req: AuthRequest, res: any) => {
  const results = await Result.find().populate("quiz", "title");

  const analytics = results.reduce((acc: any, r: any) => {
    const quizId = r.quiz._id.toString();
    if (!acc[quizId])
      acc[quizId] = {
        title: r.quiz.title,
        attempts: 0,
        passed: 0,
        totalScore: 0,
      };

    acc[quizId].attempts += 1;
    if (r.passed) acc[quizId].passed += 1;
    acc[quizId].totalScore += r.score;

    return acc;
  }, {});

  // Convert to array with averages
  const analyticsArray = Object.values(analytics).map((q: any) => ({
    title: q.title,
    attempts: q.attempts,
    passed: q.passed,
    averageScore: q.totalScore / q.attempts,
  }));

  res
    .status(200)
    .json({ status: "success", data: { analytics: analyticsArray } });
});
