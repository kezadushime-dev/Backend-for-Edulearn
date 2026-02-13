import mongoose, { Document, Types } from "mongoose";
import { IUser } from "./user.model";

interface ILesson {
  title: string;
}

interface IQuizPopulated {
  title: string;
  lesson: ILesson;
}

interface IReportQuiz {
  quiz: Types.ObjectId | IQuizPopulated;
  score: number;
  percentage: number;
  passed: boolean;
  takenAt: Date;
  lesson?: { title: string };
}

export interface IReport extends Document {
  user: Types.ObjectId | IUser; // populated user
  quizzes: IReportQuiz[];
  overallAverage: number;
  status: "pending" | "approved" | "rejected";
  approvedBy?: Types.ObjectId | IUser;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quizzes: [
      {
        quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
        score: Number,
        percentage: Number,
        passed: Boolean,
        takenAt: { type: Date, default: Date.now },
        lesson: { type: Object }, 
      },
    ],
    overallAverage: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
  },
  { timestamps: true },
);

export const Report = mongoose.model<IReport>("Report", reportSchema);
