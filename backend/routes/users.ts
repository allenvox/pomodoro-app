/** User routes: create user (idempotent), add friend. */
import mongoose from 'mongoose';
import { Router, Request, Response } from 'express';
import { User } from '../models/User';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { firebaseUid, username } = req.body;
  if (!firebaseUid || !username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ error: 'Требуются firebaseUid и username' });
  }
  try {
    const existing = await User.findOne({ firebaseUid });
    if (existing) {
      return res.status(200).send(existing);
    }
    const user = new User({ firebaseUid, username: username.trim(), friends: [] });
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Не удалось создать пользователя' });
  }
});

/** Get current user by Firebase UID (for profile / nickname). */
router.get('/by-uid/:uid', async (req: Request, res: Response) => {
  const { uid } = req.params;
  if (!uid?.trim()) return res.status(400).json({ error: 'Требуется uid' });
  try {
    const user = await User.findOne({ firebaseUid: uid }).select('username firebaseUid');
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.status(200).json({ username: user.username, firebaseUid: user.firebaseUid });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Не удалось загрузить пользователя' });
  }
});

/** Update nickname (username) for leaderboard. */
router.patch('/by-uid/:uid', async (req: Request, res: Response) => {
  const { uid } = req.params;
  const { username } = req.body;
  if (!uid?.trim()) return res.status(400).json({ error: 'Требуется uid' });
  const name = typeof username === 'string' ? username.trim() : '';
  if (!name || name.length > 50) return res.status(400).json({ error: 'Никнейм от 1 до 50 символов' });
  try {
    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      { username: name },
      { new: true, runValidators: true }
    ).select('username firebaseUid');
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.status(200).json({ username: user.username, firebaseUid: user.firebaseUid });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Не удалось обновить никнейм' });
  }
});

router.post('/:userId/friends', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { friendId } = req.body;
  if (!friendId) {
    return res.status(400).json({ error: 'Требуется friendId' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    if (user.friends.some((f: mongoose.Types.ObjectId) => f.toString() === friendId)) {
      return res.status(200).send({ success: true });
    }
    user.friends.push(friendId as any);
    await user.save();
    res.status(200).send({ success: true });
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({ error: 'Не удалось добавить друга' });
  }
});

export default router;
