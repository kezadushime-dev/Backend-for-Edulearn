import express from "express";
import {
  createLesson,
  getAllLessons,
  getLesson,
  updateLesson,
  deleteLesson,
} from "../controllers/lesson.controllers";
import { protect } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Lesson:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         content:
 *           type: string
 *         category:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         instructor:
 *           type: string
 *         order:
 *           type: number
 */

/**
 * @swagger
 * /lessons:
 *   get:
 *     tags: [Lessons]
 *     summary: Get all lessons
 *     responses:
 *       200:
 *         description: List of lessons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lesson'
 */
router.get("/", getAllLessons);

/**
 * @swagger
 * /lessons/{id}:
 *   get:
 *     tags: [Lessons]
 *     summary: Get single lesson by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       404:
 *         description: Lesson not found
 */
router.get("/:id", getLesson);

/**
 * @swagger
 * /lessons:
 *   post:
 *     tags: [Lessons]
 *     summary: Create a new lesson
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - content
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               order:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               video:
 *                 type: string
 *                 format: binary
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

router.post("/", protect, upload.fields([ { name: "images", maxCount: 5 }, { name: "video", maxCount: 1 }, { name: "documents", maxCount: 5 }, ]), createLesson);

/**
 * @swagger
 * /lessons/{id}:
 *   patch:
 *     tags: [Lessons]
 *     summary: Update lesson
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               order:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               video:
 *                 type: string
 *                 format: binary
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 */

router.patch("/:id", protect, upload.fields([ { name: "images", maxCount: 5 }, { name: "video", maxCount: 1 }, { name: "documents", maxCount: 5 }, ]), updateLesson);

/**
 * @swagger
 * /lessons/{id}:
 *   delete:
 *     tags: [Lessons]
 *     summary: Delete lesson
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Lesson deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 */
router.delete("/:id", protect, deleteLesson);

export default router;
