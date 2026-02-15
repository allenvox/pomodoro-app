/** User: linked to Firebase UID, username, friends list. */
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true },
  username: { type: String, required: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

export const User = mongoose.model('User', UserSchema);
