import mongoose, { Document, Types } from "mongoose";

export interface IChatMember extends Document {
  room: Types.ObjectId;
  user: Types.ObjectId;
  joinedAt: Date;
}

const chatMemberSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

chatMemberSchema.index({ room: 1, user: 1 }, { unique: true });

export const ChatMember = mongoose.model<IChatMember>("ChatMember", chatMemberSchema);
