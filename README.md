# Digital Learning & Assessment Platform Backend

A robust, enterprise-grade backend infrastructure for an e-learning platform featuring automated MCQ grading, lesson management, and detailed analytics.

## Features

- **Authentication**: Secure JWT-based auth with bcrypt password hashing
- **Role-Based Access Control (RBAC)**: Distinct permissions for `learner`, `instructor`, and `admin`
- **Quiz Engine**: 
  - Automated MCQ scoring
  - Custom passing thresholds
  - Result persistence and detailed feedback
- **Analytics**: Advanced MongoDB aggregations for performance tracking
- **Security**: Includes `helmet` protection, `cors` management, and input validation via `Joi`
- **Architecture**: Modular service-controller pattern with TypeScript

## Prerequisites

- Node.js (v16+)
- MongoDB (Running locally or on Atlas)
- npm or yarn

## Installation

1. Clone the repository and navigate into the folder.
2. Install dependencies:
    npm install

3. Create a `.env` file in the root directory:
    PORT=5000
    NODE_ENV=development
    MONGODB_URI=mongodb://localhost:27017/learning_platform
    JWT_SECRET=your_super_secret_key_change_in_production
    JWT_EXPIRES_IN=90d

## Running the Application

1. **Development Mode**: runs with `ts-node-dev` for hot reloading.
    npm run dev

2. **Build for Production**:
    npm run build
    npm start

3. **Seed Initial Data**: Populates the database with a test instructor, learner, lesson, and quiz.
    npm run seed

## API Endpoints

### Auth
- `POST /api/v1/auth/register` - Create new user
- `POST /api/v1/auth/login` - Get access token

### Lessons
- `GET /api/v1/lessons` - List all lessons (Learner+)
- `POST /api/v1/lessons` - Create a lesson (Instructor/Admin)
- `GET /api/v1/lessons/:id` - Get specific lesson

### Quizzes
- `POST /api/v1/quizzes` - Create a quiz (Instructor/Admin)
- `GET /api/v1/quizzes/lesson/:lessonId` - Get quiz for a lesson
- `POST /api/v1/quizzes/:id/submit` - Submit answers and get instant grade
- `GET /api/v1/quizzes/analytics` - View performance stats (Instructor/Admin)

## Project Structure Explanation

- `src/models`: Mongoose schemas for Users, Lessons, Quizzes, and Results.
- `src/services`: Contains `ResultService` which handles the business logic for grading.
- `src/middleware`: Includes `protect` and `restrictTo` for auth/authorization and a global error handling wrapper.
- `src/validations`: Joi schemas ensuring safe API inputs.
- `src/utils`: Reusable helper classes like `AppError`.

## Troubleshooting

- **MongoDB Connection Error**: Ensure your MongoDB server is running or provide a valid connection string in the `.env` file.
- **Unauthorized Errors**: Ensure you have provided the Bearer token in the Authorization header for protected routes.
