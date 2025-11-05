import mongoose from 'mongoose';

const mealProgressSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  mealsCompleted: [{ time: String, description: String, completed: Boolean }],
  progress: { type: Number, default: 0 }, // Estimated progress (0-100%)
  startDate: { type: Date }, // User’s profile start date (optional)
  changePercent: { type: Number, required: true }, // Copied from UserProfile
}, { timestamps: true });

const MealProgress = mongoose.models.MealProgress || mongoose.model('MealProgress', mealProgressSchema);
export default MealProgress;