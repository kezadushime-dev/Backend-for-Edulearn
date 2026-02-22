import express from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import {
  createHomepageProgram,
  deleteHomepageProgram,
  getHomepageProgramById,
  getHomepageProgramsAdmin,
  getPublicHomepagePopup,
  getPublicHomepagePrograms,
  updateHomepageProgram,
} from "../controllers/homepageProgram.controller";

const router = express.Router();

// Public endpoints (for homepage)
router.get("/public", getPublicHomepagePrograms);
router.get("/public/popup", getPublicHomepagePopup);

// Admin endpoints
router.use(protect, restrictTo("admin"));

router.get("/", getHomepageProgramsAdmin);
router.get("/:id", getHomepageProgramById);
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  createHomepageProgram,
);
router.patch(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  updateHomepageProgram,
);
router.delete("/:id", deleteHomepageProgram);

export default router;

