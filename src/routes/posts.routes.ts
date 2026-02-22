import express from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getPostComments,
  createPostComment,
  likePost,
  unlikePost,
} from "../controllers/posts.controller";

const router = express.Router();

router.use(protect);

router.get("/", getPosts);
router.get("/:id", getPost);
router.post("/", createPost);
router.patch("/:id", updatePost);
router.delete("/:id", deletePost);

router.get("/:id/comments", getPostComments);
router.post("/:id/comments", createPostComment);

router.post("/:id/likes", likePost);
router.delete("/:id/likes", unlikePost);

export default router;
