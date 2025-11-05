import mongoose from 'mongoose';

let isConnected = false;

export default async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('✅ DB Connected');
  } catch (error) {
    console.error('❌ DB Connection Error:', error);
  }
}
