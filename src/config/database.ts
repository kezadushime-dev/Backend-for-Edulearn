import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ndagedeo061_db_user:wjNj9eKKH3rXRoOL@e-learning-cluster.zwk96xy.mongodb.net/?appName=E-learning-Cluster');
    console.log(`MongoDB Connected👌: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};