import app from './app';
import { connectDB } from './config/database';
import { verifyEmailService } from './config/nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8002;

connectDB().then(async () => {
  await verifyEmailService();
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});

process.on('unhandledRejection', (err: any) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
