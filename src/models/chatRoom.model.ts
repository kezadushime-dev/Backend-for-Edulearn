import mongoose, { Document, Types } from "mongoose";

export type ChatRoomType = "GROUP" | "COURSE" | "PRIVATE";

export interface IChatRoom extends Document {
  name: string;
  type: ChatRoomType;
  course?: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const chatRoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["GROUP", "COURSE", "PRIVATE"],
      required: true,
    },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const ChatRoom = mongoose.model<IChatRoom>("ChatRoom", chatRoomSchema);
