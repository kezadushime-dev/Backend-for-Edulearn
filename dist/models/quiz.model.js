"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quiz = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const questionSchema = new mongoose_1.default.Schema({
    questionText: { type: String, required: true },
    image: { type: String }, // optional question image URL
    options: [{ type: String, required: true }],
    optionImages: [{ type: String }], // optional images per option
    correctOptionIndex: { type: Number, required: true },
    points: { type: Number, default: 1 },
});
const quizSchema = new mongoose_1.default.Schema({
    lesson: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Lesson", required: true },
    title: { type: String, required: true },
    questions: [questionSchema],
    passingScore: { type: Number, default: 70 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }, // optional: who created quiz
}, {
    timestamps: true, // adds createdAt and updatedAt automatically
});
exports.Quiz = mongoose_1.default.model('Quiz', quizSchema);
