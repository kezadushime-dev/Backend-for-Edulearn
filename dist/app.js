"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const error_middleware_1 = require("./middlewares/error.middleware");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const AppError_1 = require("./utils/AppError");
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const lesson_routes_1 = __importDefault(require("./routes/lesson.routes"));
const quiz_routes_1 = __importDefault(require("./routes/quiz.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const progress_route_1 = __importDefault(require("./routes/progress.route"));
const course_routes_1 = __importDefault(require("./routes/course.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const me_routes_1 = __importDefault(require("./routes/me.routes"));
const posts_routes_1 = __importDefault(require("./routes/posts.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const stats_routes_1 = __importDefault(require("./routes/stats.routes"));
const homepageProgram_routes_1 = __importDefault(require("./routes/homepageProgram.routes"));
const app = (0, express_1.default)();
// Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Docs
app.use('/api/v1/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// Routes
app.use('/api/v1/admin', admin_routes_1.default);
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/lessons', lesson_routes_1.default);
app.use('/api/v1/quizzes', quiz_routes_1.default);
app.use("/api/v1/reports", report_routes_1.default);
app.use("/api/v1/progress", progress_route_1.default);
app.use("/api/v1/courses", course_routes_1.default);
app.use("/api/v1/users", users_routes_1.default);
app.use("/api/v1/me", me_routes_1.default);
app.use("/api/v1/posts", posts_routes_1.default);
app.use("/api/v1/chat", chat_routes_1.default);
app.use("/api/v1/stats", stats_routes_1.default);
app.use("/api/v1/homepage-programs", homepageProgram_routes_1.default);
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// 404 handler
app.all('*', (req, res, next) => {
    next(new AppError_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Global error handler
app.use(error_middleware_1.globalErrorHandler);
exports.default = app;
