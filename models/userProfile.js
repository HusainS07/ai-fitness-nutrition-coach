import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  goal: String,
  weight: Number,
});

export default mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema);