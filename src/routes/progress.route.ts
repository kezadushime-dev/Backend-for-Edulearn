import express from "express";
import { protect } from "../middlewares/auth.middleware";
import { completeLesson } from "../controllers/progress.controller";

const router = express.Router();

/**
 * @swagger
 * /progress/lesson/{lessonId}/complete:
 *   post:
 *     tags: [Progress]
 *     summary: Mark a lesson as completed and update course progress
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson completed successfully, progress updated
 *       404:
 *         description: Lesson not found
 *       401:
 *         description: Unauthorized
 */
router.post("/lesson/:lessonId/complete", protect, completeLesson);

export default router;