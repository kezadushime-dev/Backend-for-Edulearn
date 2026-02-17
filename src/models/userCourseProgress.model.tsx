import mongoose from "mongoose";

const userCourseProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    progress: { type: Number, default: 0 }, // 0 - 100%
  },
  { timestamps: true }
);

userCourseProgressSchema.index({ user: 1, course: 1 }, { unique: true }); // One record per user-course

export const UserCourseProgress = mongoose.model("UserCourseProgress", userCourseProgressSchema);
