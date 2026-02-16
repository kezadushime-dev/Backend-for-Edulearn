import mongoose from 'mongoose';
import { User } from '../src/models/user.model';
import { connectDB } from '../src/config/database';
import { env } from '../src/config/env';

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminExists = await User.findOne({ email: env.ADMIN_EMAIL });

    if (!adminExists) {
      await User.create({
        name: 'Head Master',
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        role: 'admin',
        isSeedAdmin: true, // <-- THIS IS THE NEW FLAG
      });
      console.log('✅ Admin user created successfully.');
    } else {
      console.log('⚠️ Admin already exists.');
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
};

seedAdmin();