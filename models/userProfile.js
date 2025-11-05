import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  age: Number,
  gender: String,
  weight: Number,
  goal: String, // e.g., "weight loss", "muscle gain"
  changePercent: Number, // e.g., 20 for 20% change (positive for gain, negative for loss)
  duration: String, // e.g., "3 months"
  allergies: [String],
  preferences: [String],
}, { timestamps: true });

const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema);
export default UserProfile;