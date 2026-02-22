import mongoose, { Document, Types } from "mongoose";

export interface IPost extends Document {
  author: Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  imageUrl?: string;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    imageUrl: { type: String },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Post = mongoose.model<IPost>("Post", postSchema);
