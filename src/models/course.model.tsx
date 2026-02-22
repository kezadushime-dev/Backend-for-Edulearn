import mongoose from "mongoose";

const assessmentQuestionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["multiple-choice", "true-false", "short-answer", "essay"],
      default: "multiple-choice",
    },
    question: { type: String, required: true },
    options: [{ type: String }],
    answer: { type: mongoose.Schema.Types.Mixed },
    points: { type: Number, default: 1 },
  },
  { _id: false },
);

const courseExamSchema = new mongoose.Schema(
  {
    questions: { type: [assessmentQuestionSchema], default: [] },
    passingScore: { type: Number, default: 70 },
    durationMinutes: { type: Number, default: 0 },
  },
  { _id: false },
);

const interactiveElementsSchema = new mongoose.Schema(
  {
    discussionPrompts: { type: [String], default: [] },
    practicalAssignments: { type: [String], default: [] },
    spiritualReflections: { type: [String], default: [] },
  },
  { _id: false },
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    learningGoal: { type: String },

    image: { type: String },
    coverImage: { type: String },

    // Backward compatible display category while supporting framework category.
    category: { type: String, default: "General" },
    frameworkCategory: {
      type: String,
      enum: ["INTELLECTUAL", "SPIRITUAL", "PHYSICAL"],
    },

    level: {
      type: String,
      enum: [
        "Beginner",
        "Intermediate",
        "Advanced",
        "Friend",
        "Companion",
        "Explorer",
        "Ranger",
        "Voyager",
        "Guide",
        "Ambassador-Year1",
        "Ambassador-Year2",
        "Youth-Leader-Rwanda",
        "All Levels",
        "Beginner-Intermediate",
      ],
      default: "Beginner",
    },
    targetGroup: {
      type: String,
      enum: ["Pathfinder", "Ambassador", "Youth-Leader", "Youth"],
      default: "Youth",
    },
    durationWeeks: { type: Number, default: 0 },
    duration: { type: Number, default: 0 }, // minutes

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],

    exam: { type: courseExamSchema, default: () => ({}) },
    interactiveElements: { type: interactiveElementsSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export const Course = mongoose.model("Course", courseSchema);
