"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const responseSchema = new mongoose_1.default.Schema({
    questionId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    selectedOptionIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true }
});
const resultSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    responses: [responseSchema],
    completedAt: { type: Date, default: Date.now }
});
exports.Result = mongoose_1.default.model('Result', resultSchema);
