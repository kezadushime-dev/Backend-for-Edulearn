import express from "express";
import * as quizController from "../controllers/quiz.controllers";
import { protect, restrictTo } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /quizzes:
 *   post:
 *     summary: Create a new quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lesson
 *               - title
 *               - questions
 *             properties:
 *               lesson:
 *                 type: string
 *                 example: "63f7e3c9b7f5a9c1d2a1b100"
 *               title:
 *                 type: string
 *                 example: "Node.js Basics Quiz"
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionText:
 *                       type: string
 *                       example: "What is Node.js?"
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["JavaScript runtime", "Database", "Framework", "Library"]
 *                     correctOptionIndex:
 *                       type: number
 *                       example: 0
 *                     points:
 *                       type: number
 *                       example: 1
 *                     image:
 *                       type: string
 *                       example: "https://example.com/question1.png"
 *                     optionImages:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["https://example.com/option1.png"]
 *               passingScore:
 *                 type: number
 *                 default: 70
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 quiz:
 *                   _id: 63f7e3c9b7f5a9c1d2a1b234
 *                   lesson: "63f7e3c9b7f5a9c1d2a1b100"
 *                   title: "Node.js Basics Quiz"
 *                   questions:
 *                     - questionText: "What is Node.js?"
 *                       options: ["JavaScript runtime", "Database", "Framework", "Library"]
 *                       correctOptionIndex: 0
 *                       points: 1
 *                       image: "https://example.com/question1.png"
 *                       optionImages: ["https://example.com/option1.png"]
 *                   passingScore: 70
 *                   isActive: true
 *                   createdBy:
 *                     _id: 63f7e3c9b7f5a9c1d2a1b999
 *                     name: "John Doe"
 *                     email: "john@example.com"
 *                   createdAt: "2026-02-05T09:00:00.000Z"
 *                   updatedAt: "2026-02-05T09:30:00.000Z"
 *       400:
 *         description: Validation error (missing fields or invalid data)
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       403:
 *         description: Forbidden – only instructors or admins can create quizzes
 *       500:
 *         description: Server error
 */
router.post("/", restrictTo("instructor", "admin"), quizController.createQuiz);

/**
 * @swagger
 * /quizzes:
 *   get:
 *     summary: Get all quizzes
 *     tags: [Quizzes]
 *     description: Retrieve a list of all quizzes with optional lesson and creator info.
 *     security:
 *       - bearerAuth:
 *     responses:
 *       200:
 *         description: List of all quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: number
 *                   example: 5
 *                 data:
 *                   type: object
 *                   properties:
 *                     quizzes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 63f7e3c9b7f5a9c1d2a1b234
 *                           lesson:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 63f7e3c9b7f5a9c1d2a1b100
 *                               title:
 *                                 type: string
 *                                 example: "Node.js Basics"
 *                           title:
 *                             type: string
 *                             example: "Node.js Quiz 1"
 *                           questions:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 questionText:
 *                                   type: string
 *                                   example: "What is Node.js?"
 *                                 options:
 *                                   type: array
 *                                   items:
 *                                     type: string
 *                                     example: "JavaScript runtime"
 *                                 correctOptionIndex:
 *                                   type: number
 *                                   example: 0
 *                                 points:
 *                                   type: number
 *                                   example: 1
 *                                 image:
 *                                   type: string
 *                                   example: "https://example.com/question1.png"
 *                                 optionImages:
 *                                   type: array
 *                                   items:
 *                                     type: string
 *                                     example: "https://example.com/option1.png"
 *                           passingScore:
 *                             type: number
 *                             example: 70
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *                           createdBy:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 63f7e3c9b7f5a9c1d2a1b999
 *                               name:
 *                                 type: string
 *                                 example: "John Doe"
 *                               email:
 *                                 type: string
 *                                 example: "john@example.com"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2026-02-05T09:00:00.000Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2026-02-05T09:30:00.000Z"
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       500:
 *         description: Server error
 */
router.get("/", quizController.getAllQuizzes);
/**
 * @swagger
 * /quizzes/{id}:
 *   get:
 *     summary: Get a quiz by ID
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz found
 *       404:
 *         description: Quiz not found
 */
router.get("/:id", quizController.getQuizById);

/**
 * @swagger
 * /quizzes/{id}:
 *   patch:
 *     summary: Update a quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Quiz updated
 *       404:
 *         description: Quiz not found
 */
router.patch(
  "/:id",
  restrictTo("instructor", "admin"),
  quizController.updateQuiz,
);

/**
 * @swagger
 * /quizzes/{id}:
 *   delete:
 *     summary: Delete a quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       204:
 *         description: Quiz deleted
 *       404:
 *         description: Quiz not found
 */

router.delete(
  "/:id",
  restrictTo("instructor", "admin"),
  quizController.deleteQuiz,
);

/**
 * @swagger
 * /quizzes/analytics:
 *   get:
 *     summary: Get quiz analytics (average score, pass rate, attempts)
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth:
 *     responses:
 *       200:
 *         description: Analytics for all quizzes
 */
router.get(
  "/analytics",
  restrictTo("instructor", "admin"),
  quizController.getAnalytics,
);

/**
 * @swagger
 * /quizzes/lesson/{lessonId}:
 *   get:
 *     summary: Get quiz by lesson ID
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth:
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *     responses:
 *       200:
 *         description: Quiz for lesson found
 */
router.get("/lesson/:lessonId", quizController.getQuizByLesson);

/**
 * @swagger
 * /quizzes/{id}/submit:
 *   post:
 *     summary: Submit answers for a quiz and automatically grade
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     selectedOptionIndex:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Quiz graded successfully
 */
router.post("/:id/submit", quizController.submitQuiz);

export default router;
