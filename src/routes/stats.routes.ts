import express from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import { getMyStats, getPlatformStats } from "../controllers/stats.controller";

const router = express.Router();

router.get("/me", protect, getMyStats);
router.get("/platform", protect, restrictTo("admin"), getPlatformStats);

export default router;
