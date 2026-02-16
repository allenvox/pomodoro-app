/** Session route: save completed pomodoro/break (userId, duration). */
import { Router, Request, Response } from 'express';
import { Session } from '../models/Session';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { userId, duration, taskName } = req.body;
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return res.status(400).json({ error: 'Требуется userId' });
  }
  if (typeof duration !== 'number' || duration < 0) {
    return res.status(400).json({ error: 'Требуется корректная длительность (число >= 0)' });
  }
  const name = typeof taskName === 'string' ? taskName.trim().slice(0, 200) : '';
  try {
    const session = new Session({ userId: userId.trim(), duration, taskName: name });
    await session.save();
    res.status(201).send({ success: true, id: session._id });
  } catch (error) {
    console.error('Save session error:', error);
    res.status(500).json({ error: 'Не удалось сохранить сессию' });
  }
});

export default router;
