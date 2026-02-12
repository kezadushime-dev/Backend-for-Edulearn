import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },

  description: { type: String, required: true },

  content: { type: String, required: true },

  images: [
    {
      type: String,
    },
  ],

  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  order: { type: Number, default: 0 },

  category: { type: String, required: true },

  createdAt: { type: Date, default: Date.now },
});

export const Lesson = mongoose.model("Lesson", lessonSchema);
