import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  image: { type: String }, // optional question image URL
  options: [{ type: String, required: true }],
  optionImages: [{ type: String }], // optional images per option
  correctOptionIndex: { type: Number, required: true },
  points: { type: Number, default: 1 },
});

const quizSchema = new mongoose.Schema(
  {
    lesson: { type: String, required: true },
    title: { type: String, required: true },
    questions: [questionSchema],
    passingScore: { type: Number, default: 70 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true }, // optional: who created quiz
  },
  {
    timestamps: true, 
  });

export const Quiz = mongoose.model('Quiz', quizSchema);
