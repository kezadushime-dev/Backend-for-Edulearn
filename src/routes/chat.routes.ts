import express from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  getRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomMessages,
  createRoomMessage,
} from "../controllers/chat.controller";

const router = express.Router();

router.use(protect);

router.get("/rooms", getRooms);
router.post("/rooms", createRoom);
router.post("/rooms/:roomId/join", joinRoom);
router.post("/rooms/:roomId/leave", leaveRoom);
router.get("/rooms/:roomId/messages", getRoomMessages);
router.post("/rooms/:roomId/messages", createRoomMessage);

export default router;
