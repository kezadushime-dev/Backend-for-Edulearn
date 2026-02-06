"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lesson = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const lessonSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    images: [
        {
            type: String,
        },
    ],
    instructor: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    order: { type: Number, default: 0 },
    category: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
exports.Lesson = mongoose_1.default.model("Lesson", lessonSchema);
