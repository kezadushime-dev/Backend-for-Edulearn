import { Quiz } from '../models/quiz.model';
import { Result } from '../models/result.model';
import { Report } from "../models/report.model";
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middlewares/auth.middleware';


// Create a new quiz
export const createQuiz = catchAsync(async (req: AuthRequest, res: any) => {
  if (!Array.isArray(req.body.questions) || req.body.questions.length === 0) {
    return res.status(400).json({
      status: "fail",
      message: "Questions must be a non-empty array of objects",
    });
  }

  const quiz = await Quiz.create({
    ...req.body,
    createdBy: req.user.name, // instructor name from JWT
    lesson: req.body.lesson,  // lesson title from request
  });

  res.status(201).json({ status: "success", data: { quiz } });
});

// Get all quizzes
export const getAllQuizzes = catchAsync(async (req: AuthRequest, res: any) => {
  const quizzes = await Quiz.find()
    .populate("lesson", "title")
    .populate("createdBy", "name email"); 

  res.status(200).json({
    status: "success",
    results: quizzes.length,
    data: { quizzes },
  });
});

// Get quiz by ID
export const getQuizById = catchAsync(async (req: AuthRequest, res: any) => {
  const quiz = await Quiz.findById(req.params.id).populate("lesson", "title");
  if (!quiz) return res.status(404).json({ status: "fail", message: "Quiz not found" });
  res.status(200).json({ status: "success", data: { quiz } });
});

// Get quiz by lesson
export const getQuizByLesson = catchAsync(async (req: AuthRequest, res: any) => {
  const quiz = await Quiz.findOne({ lesson: req.params.lessonId }).populate("lesson", "title");
  if (!quiz) return res.status(404).json({ status: "fail", message: "Quiz not found" });
  res.status(200).json({ status: "success", data: { quiz } });
});

// Update a quiz
export const updateQuiz = catchAsync(async (req: AuthRequest, res: any) => {
  const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!quiz) return res.status(404).json({ status: "fail", message: "Quiz not found" });
  res.status(200).json({ status: "success", data: { quiz } });
});

// Delete a quiz
export const deleteQuiz = catchAsync(async (req: AuthRequest, res: any) => {
  const quiz = await Quiz.findByIdAndDelete(req.params.id);
  if (!quiz) return res.status(404).json({ status: "fail", message: "Quiz not found" });
  res.status(204).json({ status: "success", data: null });
});

// Submit quiz answers and automatically grade
export const submitQuiz = catchAsync(async (req: AuthRequest, res: any) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    return res.status(404).json({ status: "fail", message: "Quiz not found" });
  }

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

  const totalPoints = quiz.questions.reduce(
    (sum, q) => sum + q.points,
    0
  );

  const percentage = (score / totalPoints) * 100;
  const passed = percentage >= quiz.passingScore;

  // Save result
  const result = await Result.create({
    user: req.user.id,
    quiz: quiz._id,
    score,
    percentage,
    passed,
    responses,
  });

  // ===== UPDATE REPORT =====

  // Get ALL results of this user
  const userResults = await Result.find({
    user: req.user.id,
  }).populate("quiz");

  let report = await Report.findOne({ user: req.user.id });

  if (!report) {
    report = await Report.create({
      user: req.user.id,
      quizzes: [],
    });
  }

  // Clear existing quizzes safely (DocumentArray safe)
  report.quizzes.splice(0, report.quizzes.length);

  // Rebuild quizzes properly
  userResults.forEach((resItem: any) => {
    report.quizzes.push({
      quiz: resItem.quiz._id,
      score: resItem.score,
      percentage: resItem.percentage,
      passed: resItem.passed,
      lesson: resItem.quiz.lesson,
    });
  });

  // Recalculate overall average
  const total = report.quizzes.reduce(
    (sum: number, q: any) => sum + (q.percentage ?? 0),
    0,
  );

  report.overallAverage =
    report.quizzes.length > 0 ? total / report.quizzes.length : 0;

  await report.save();

  // ========================

  res.status(200).json({
    status: "success",
    data: {
      result,
      report,
    },
  });
});

export const requestReportDownload = catchAsync(
  async (req: AuthRequest, res: any) => {
    const report = await Report.findOne({ user: req.user.id });

    if (!report) {
      return res.status(404).json({
        status: "fail",
        message: "Report not found",
      });
    }

    report.status = "pending"; // ✅ now becomes pending
    await report.save();

    res.status(200).json({
      status: "success",
      message: "Download request sent. Waiting for approval.",
    });
  }
);


// Get analytics for all quizzes (average, pass rates, etc.)
export const getAnalytics = catchAsync(async (_req: AuthRequest, res: any) => {
  const results = await Result.find().populate("quiz", "title");

  const analytics = results.reduce((acc: any, r: any) => {
    const quizId = r.quiz._id.toString();
    if (!acc[quizId]) acc[quizId] = { title: r.quiz.title, attempts: 0, passed: 0, totalScore: 0 };

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

  res.status(200).json({ status: "success", data: { analytics: analyticsArray } });
});