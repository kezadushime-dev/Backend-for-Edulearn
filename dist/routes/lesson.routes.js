"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lesson_controllers_1 = require("../controllers/lesson.controllers");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = express_1.default.Router();
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
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
 *           example: Spiritual
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         videos:
 *           type: array
 *           items:
 *             type: string
 *         documents:
 *           type: array
 *           items:
 *             type: string
 *         audios:
 *           type: array
 *           items:
 *             type: string
 *         durationMinutes:
 *           type: number
 *           example: 30
 *         modules:
 *           type: array
 *           items:
 *             type: object
 *         quiz:
 *           type: object
 *         interactiveElements:
 *           type: object
 *         instructor:
 *           type: string
 *         course:
 *           type: string
 *           description: Course title
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
router.get("/", lesson_controllers_1.getAllLessons);
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
router.get("/:id", lesson_controllers_1.getLesson);
/**
 * @swagger
 * /lessons/{id}/modules:
 *   get:
 *     tags: [Lessons]
 *     summary: Get module-focused lesson view
 *     description: Returns modules, lesson quiz and interactive elements for module-based frontend pages.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson modules retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 lessonId: 67ba00011122233344455577
 *                 title: Lesson 1 - Origins of Adventism in Rwanda
 *                 modules:
 *                   - moduleTitle: Module 1 - Missionary Arrival
 *                     order: 1
 *                     content:
 *                       text: The Adventist message first arrived in Rwanda through missionaries.
 *                       image: https://cdn.example.com/adventist_timeline.png
 *                       video: https://cdn.example.com/church_history.mp4
 *                       audio: https://cdn.example.com/sermon_clip.mp3
 *                     questions:
 *                       - type: multiple-choice
 *                         question: In which decade did Adventism first arrive in Rwanda?
 *                         options: ["1920s", "1930s", "1940s"]
 *                         answer: "1920s"
 *                 quiz:
 *                   questions:
 *                     - type: true-false
 *                       question: Adventism reached Rwanda in the 1940s.
 *                       answer: false
 *       404:
 *         description: Lesson not found
 */
router.get("/:id/modules", lesson_controllers_1.getLessonModules);
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
 *               - course
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               course:
 *                 type: string
 *                 description: Course title (backend will resolve to ID)
 *               order:
 *                 type: number
 *               durationMinutes:
 *                 type: number
 *               modules:
 *                 type: string
 *                 description: JSON string array of modules
 *                 example: '[{"moduleTitle":"Module 1: What is HTML?","order":1,"content":{"text":"HTML is the standard markup language.","image":"https://cdn.example.com/html_structure.png","video":"https://cdn.example.com/intro_html.mp4","audio":"https://cdn.example.com/html_explanation.mp3"},"questions":[{"type":"multiple-choice","question":"What does HTML stand for?","options":["Hyper Text Markup Language","High Tech Modern Language","Home Tool Markup Language"],"answer":"Hyper Text Markup Language"}]}]'
 *               quiz:
 *                 type: string
 *                 description: JSON string object for lesson-end quiz
 *                 example: '{"questions":[{"type":"true-false","question":"HTML is used to style web pages.","answer":"False"}],"passingScore":70}'
 *               interactiveElements:
 *                 type: string
 *                 description: JSON object string with discussion/practical/spiritual prompts
 *                 example: '{"discussionPrompts":["Share one key learning point"],"practicalAssignments":["Build a simple HTML page"],"spiritualReflections":["Write one personal reflection"]}'
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               video:
 *                 type: string
 *                 format: binary
 *               videoUrl:
 *                 type: string
 *                 description: Optional external video URL (YouTube, Vimeo, etc.)
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               audio:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("leader", "admin", "instructor"), upload_middleware_1.upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
    { name: "audio", maxCount: 5 },
    { name: "documents", maxCount: 5 },
]), lesson_controllers_1.createLesson);
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
 *               course:
 *                 type: string
 *                 description: Course title
 *               order:
 *                 type: number
 *               durationMinutes:
 *                 type: number
 *               modules:
 *                 type: string
 *                 description: JSON array string
 *                 example: '[{"moduleTitle":"Module 1: Balanced Diet","order":1,"content":{"text":"A balanced diet includes proteins, carbohydrates, fats, vitamins, and minerals."}}]'
 *               quiz:
 *                 type: string
 *                 example: '{"questions":[{"type":"multiple-choice","question":"Which nutrient is the main source of energy?","options":["Proteins","Carbohydrates","Fats"],"answer":"Carbohydrates"}]}'
 *               interactiveElements:
 *                 type: string
 *                 example: '{"discussionPrompts":["How can youth improve nutrition habits?"],"practicalAssignments":["Track your meals for 7 days"],"spiritualReflections":["Pray for discipline in healthy living"]}'
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               video:
 *                 type: string
 *                 format: binary
 *               videoUrl:
 *                 type: string
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               audio:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 */
router.patch("/:id", auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("leader", "admin", "instructor"), upload_middleware_1.upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
    { name: "audio", maxCount: 5 },
    { name: "documents", maxCount: 5 },
]), lesson_controllers_1.updateLesson);
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
router.delete("/:id", auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("leader", "admin", "instructor"), lesson_controllers_1.deleteLesson);
exports.default = router;
