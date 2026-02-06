import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },

  description: { type: String, required: true },

  content: { type: String, required: true },

  images: [
    {
      type: String,
    },
  ],

  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  order: { type: Number, default: 0 },

  category: { type: String, required: true },

  createdAt: { type: Date, default: Date.now },
});

export const Lesson = mongoose.model("Lesson", lessonSchema);

// import mongoose from 'mongoose';

// const questionSchema = new mongoose.Schema({
//   questionText: { type: String, required: true },
//   options: [{ type: String, required: true }],
//   correctOptionIndex: { type: Number, required: true },
//   points: { type: Number, default: 1 }
// });

// const quizSchema = new mongoose.Schema({
//   lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
//   title: { type: String, required: true },
//   questions: [questionSchema],
//   passingScore: { type: Number, default: 70 },
//   createdAt: { type: Date, default: Date.now }
// });

// export const Quiz = mongoose.model('Quiz', quizSchema);

// import mongoose from 'mongoose';

// const responseSchema = new mongoose.Schema({
//   questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
//   selectedOptionIndex: { type: Number, required: true },
//   isCorrect: { type: Boolean, required: true }
// });

// const resultSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
//   score: { type: Number, required: true },
//   percentage: { type: Number, required: true },
//   passed: { type: Boolean, required: true },
//   responses: [responseSchema],
//   completedAt: { type: Date, default: Date.now }
// });

// export const Result = mongoose.model('Result', resultSchema);  import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'] },

  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true 
  },

  password: { 
    type: String, 
    required: [true, 'Password is required'], 
    minlength: 8, 
    select: false 
  },

  role: { 
    type: String, 
    enum: ['learner', 'instructor', 'admin'], 
    default: 'learner' 
  },

  image: {
    type: String,      
    required: false
  },

  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword: string, userPassword: string) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export const User = mongoose.model('User', userSchema);
