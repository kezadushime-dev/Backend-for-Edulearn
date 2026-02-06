import { Quiz } from '../models/quiz.model';
import { Result } from '../models/result.model';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middlewares/auth.middleware';


// Create a new quiz
export const createQuiz = catchAsync(async (req: AuthRequest, res: any) => {
  const quiz = await Quiz.create({ ...req.body, createdBy: req.user.id });
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
  if (!quiz) return res.status(404).json({ status: "fail", message: "Quiz not found" });

  let score = 0;
  const responses = req.body.answers.map((answer: any, index: number) => {
    const question = quiz.questions[index];
    const isCorrect = answer.selectedOptionIndex === question.correctOptionIndex;
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
    score,
    percentage,
    passed,
    responses,
  });

  res.status(200).json({ status: "success", data: { result } });
});

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