import express from "express";
import { protect } from "../middlewares/auth.middleware";
import { getUsers, getUser, updateUser } from "../controllers/users.controller";

const router = express.Router();

router.use(protect);

router.get("/", getUsers);
router.get("/:id", getUser);
router.patch("/:id", updateUser);

export default router;
