import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller";
import { protect } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f123abc456def789000111
 *         title:
 *           type: string
 *           example: Node.js Mastery
 *         description:
 *           type: string
 *           example: Complete backend course
 *         image:
 *           type: string
 *           example: https://res.cloudinary.com/demo/image/upload/v123/course.jpg
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     tags: [Courses]
 *     summary: Get all courses
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 */
router.get("/", getAllCourses);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Get single course
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 */
router.get("/:id", getCourse);

/**
 * @swagger
 * /courses:
 *   post:
 *     tags: [Courses]
 *     summary: Create course
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  protect,
  upload.fields([{ name: "image", maxCount: 1 }]),
  createCourse
);

/**
 * @swagger
 * /courses/{id}:
 *   patch:
 *     tags: [Courses]
 *     summary: Update course
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
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/:id",
  protect,
  upload.fields([{ name: "image", maxCount: 1 }]),
  updateCourse
);

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     tags: [Courses]
 *     summary: Delete course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       404:
 *         description: Course not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", protect, deleteCourse);

export default router;
