import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { globalErrorHandler } from './middlewares/error.middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { AppError } from './utils/AppError';

import adminroutes from './routes/admin.routes';
import AuthRoutes from './routes/auth.routes';
import lessonRoutes from './routes/lesson.routes';
import quizRoutes from './routes/quiz.routes';
import reportRoutes from './routes/report.routes';
import progressRoutes from "./routes/progress.route";
import courseRoutes from "./routes/course.routes";
import usersRoutes from "./routes/users.routes";
import meRoutes from "./routes/me.routes";
import postsRoutes from "./routes/posts.routes";
import chatRoutes from "./routes/chat.routes";
import statsRoutes from "./routes/stats.routes";
import homepageProgramRoutes from "./routes/homepageProgram.routes";

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Docs
app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Routes
app.use('/api/v1/admin', adminroutes)
app.use('/api/v1/auth', AuthRoutes)
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/progress", progressRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/me", meRoutes);
app.use("/api/v1/posts", postsRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/stats", statsRoutes);
app.use("/api/v1/homepage-programs", homepageProgramRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

export default app;
