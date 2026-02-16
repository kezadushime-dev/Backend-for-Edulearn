import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    description: { type: String, required: true },

    content: { type: String, required: true },

    images: [
      {
        type: String,
      },
    ],

    videos: [
      {
        type: String, // can store either Cloudinary URL or external URL
      },
    ],
    
    documents: [{ type: String }],

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order: { type: Number, default: 0 },

    category: { type: String, required: true },
  },
  { timestamps: true },
);

export const Lesson = mongoose.model("Lesson", lessonSchema);
