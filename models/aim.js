import mongoose from 'mongoose';

const AimSchema = new mongoose.Schema({
  aim: String,
  duration: String,
});

export default mongoose.models.Aim || mongoose.model('Aim', AimSchema);
