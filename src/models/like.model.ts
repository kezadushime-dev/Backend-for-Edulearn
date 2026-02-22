import mongoose, { Document, Types } from "mongoose";

export interface ILike extends Document {
  post: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
}

const likeSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

likeSchema.index({ post: 1, user: 1 }, { unique: true });

export const Like = mongoose.model<ILike>("Like", likeSchema);
