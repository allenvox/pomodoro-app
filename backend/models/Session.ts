/** Session: one completed work or break interval (userId, duration, date). */
import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  taskName: { type: String, default: '' },
});

export const Session = mongoose.model('Session', SessionSchema);
