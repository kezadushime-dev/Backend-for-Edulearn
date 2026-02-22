import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourseFrameworkTree,
  getCourse,
  getCourseLessons,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller";
import { protect, restrictTo } from "../middlewares/auth.middleware";
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
 *         learningGoal:
 *           type: string
 *           example: Build practical and spiritual growth through structured lessons.
 *         frameworkCategory:
 *           type: string
 *           enum: [INTELLECTUAL, SPIRITUAL, PHYSICAL]
 *           example: SPIRITUAL
 *         category:
 *           type: string
 *           example: Iby'umwuka (Spiritual)
 *         level:
 *           type: string
 *           example: Beginner
 *         duration:
 *           type: number
 *           example: 240
 *         exam:
 *           type: object
 *         interactiveElements:
 *           type: object
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
 *     parameters:
 *       - in: query
 *         name: frameworkCategory
 *         schema:
 *           type: string
 *           enum: [INTELLECTUAL, SPIRITUAL, PHYSICAL]
 *         example: SPIRITUAL
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         example: Iby'umwuka (Spiritual)
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [Beginner, Intermediate, Advanced]
 *         example: Beginner
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         example: Adventist
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
 * /courses/framework:
 *   get:
 *     tags: [Courses]
 *     summary: Get full framework tree grouped by categories
 *     description: Returns categories -> courses -> lessons -> modules + quiz + exam, ready for frontend framework pages.
 *     responses:
 *       200:
 *         description: Framework tree data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *             example:
 *               status: success
 *               data:
 *                 categories:
 *                   - code: SPIRITUAL
 *                     name: Iby'umwuka (Spiritual)
 *                     courses:
 *                       - courseId: 67ba00011122233344455566
 *                         courseName: Adventist Church Growth in Rwanda
 *                         learningGoal: Understand Adventist history and mission in Rwanda.
 *                         level: Beginner
 *                         exam:
 *                           questions:
 *                             - type: short-answer
 *                               question: Sobanura inkomoko y'Itorero ry'Abadiventisti mu Rwanda.
 *                         lessons:
 *                           - lessonId: 67ba00011122233344455577
 *                             lessonTitle: Lesson 1 - Origins of Adventism in Rwanda
 *                             modules:
 *                               - moduleTitle: Module 1 - Missionary Arrival
 *                                 content:
 *                                   text: The Adventist message first arrived in Rwanda through missionaries.
 *                                   image: https://cdn.example.com/adventist_timeline.png
 *                                   video: https://cdn.example.com/church_history.mp4
 *                                   audio: https://cdn.example.com/sermon_clip.mp3
 *                                 questions:
 *                                   - type: multiple-choice
 *                                     question: In which decade did Adventism first arrive in Rwanda?
 *                                     options: ["1920s", "1930s", "1940s"]
 *                                     answer: "1920s"
 *                             quiz:
 *                               questions:
 *                                 - type: true-false
 *                                   question: Adventism reached Rwanda in the 1940s.
 *                                   answer: false
 */
router.get("/framework", getCourseFrameworkTree);

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
router.get("/:id/lessons", getCourseLessons);

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
 *               learningGoal:
 *                 type: string
 *               frameworkCategory:
 *                 type: string
 *                 enum: [INTELLECTUAL, SPIRITUAL, PHYSICAL]
 *               category:
 *                 type: string
 *                 description: display name like Iby'ubwenge (Intellectual)
 *               exam:
 *                 type: string
 *                 description: JSON string for end-of-course exam object
 *                 example: '{"questions":[{"type":"short-answer","question":"Explain the difference between HTML and CSS."}],"passingScore":70}'
 *               interactiveElements:
 *                 type: string
 *                 description: JSON string for course-level interactive elements
 *                 example: '{"discussionPrompts":["How can this lesson impact your local church?"],"practicalAssignments":["Create a summary of key lessons"],"spiritualReflections":["Write a prayer based on this topic"]}'
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
  restrictTo("leader", "admin", "instructor"),
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
 *               learningGoal:
 *                 type: string
 *               frameworkCategory:
 *                 type: string
 *                 enum: [INTELLECTUAL, SPIRITUAL, PHYSICAL]
 *               exam:
 *                 type: string
 *                 example: '{"questions":[{"type":"short-answer","question":"Summarize all lessons in this course."}],"passingScore":70}'
 *               interactiveElements:
 *                 type: string
 *                 example: '{"discussionPrompts":["What stood out most?"],"practicalAssignments":["Apply one concept this week"],"spiritualReflections":["Reflect on your spiritual growth"]}'
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
  restrictTo("leader", "admin", "instructor"),
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
router.delete("/:id", protect, restrictTo("leader", "admin", "instructor"), deleteCourse);

export default router;
