import express from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  getMyCourses,
  getMyCourseProgress,
  completeMyCourseLesson,
} from "../controllers/me.controller";

const router = express.Router();

router.use(protect);

router.get("/courses", getMyCourses);
router.get("/courses/:courseId/progress", getMyCourseProgress);
router.post("/courses/:courseId/progress/complete-lesson", completeMyCourseLesson);

export default router;
