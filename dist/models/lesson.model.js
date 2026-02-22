"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lesson = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const assessmentQuestionSchema = new mongoose_1.default.Schema({
    type: {
        type: String,
        enum: ["multiple-choice", "true-false", "short-answer", "essay"],
        default: "multiple-choice",
    },
    question: { type: String, required: true },
    options: [{ type: String }],
    answer: { type: mongoose_1.default.Schema.Types.Mixed },
    points: { type: Number, default: 1 },
}, { _id: false });
const moduleContentSchema = new mongoose_1.default.Schema({
    text: { type: String },
    notes: { type: String },
    scriptureReferences: { type: [String], default: [] },
    image: { type: String },
    video: { type: String },
    audio: { type: String },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    audios: { type: [String], default: [] },
}, { _id: false });
const moduleSchema = new mongoose_1.default.Schema({
    moduleTitle: { type: String, required: true },
    order: { type: Number, default: 0 },
    content: { type: moduleContentSchema, default: () => ({}) },
    questions: { type: [assessmentQuestionSchema], default: [] },
    discussionPrompt: { type: String },
    practicalAssignment: { type: String },
    spiritualReflection: { type: String },
}, { _id: false });
const lessonQuizSchema = new mongoose_1.default.Schema({
    questions: { type: [assessmentQuestionSchema], default: [] },
    passingScore: { type: Number, default: 70 },
}, { _id: false });
const interactiveElementsSchema = new mongoose_1.default.Schema({
    discussionPrompts: { type: [String], default: [] },
    practicalAssignments: { type: [String], default: [] },
    spiritualReflections: { type: [String], default: [] },
}, { _id: false });
const lessonSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    objectives: { type: [String], default: [] },
    images: [
        {
            type: String,
        },
    ],
    videos: [
        {
            type: String,
        },
    ],
    audios: [{ type: String }],
    documents: [{ type: String }],
    durationMinutes: { type: Number, default: 0 },
    instructor: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    course: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "Lesson must belong to a course"],
    },
    order: { type: Number, default: 0 },
    category: { type: String, required: true },
    modules: { type: [moduleSchema], default: [] },
    quiz: { type: lessonQuizSchema, default: () => ({}) },
    interactiveElements: { type: interactiveElementsSchema, default: () => ({}) },
}, { timestamps: true });
exports.Lesson = mongoose_1.default.model("Lesson", lessonSchema);
