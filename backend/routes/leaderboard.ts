/** Leaderboard: users sorted by session count; optional period filter (week/month/all). */
import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { Session } from '../models/Session';

const router = Router();

function getStartOfPeriod(period: 'week' | 'month' | 'all'): Date | null {
  if (period === 'all') return null;
  const d = new Date();
  if (period === 'week') {
    d.setDate(d.getDate() - 7);
    return d;
  }
  d.setMonth(d.getMonth() - 1);
  return d;
}

router.get('/', async (req: Request, res: Response) => {
  const period = (req.query.period as string) || 'all';
  if (!['week', 'month', 'all'].includes(period)) {
    return res.status(400).json({ error: 'period должен быть week, month или all' });
  }
  const from = getStartOfPeriod(period as 'week' | 'month' | 'all');
  try {
    const users = await User.find();
    const sessionFilter = from ? { date: { $gte: from } } : {};
    const leaderboard = await Promise.all(
      users.map(async (user) => {
        const count = await Session.countDocuments({
          userId: user.firebaseUid,
          ...sessionFilter,
        });
        return {
          userId: user.firebaseUid,
          username: user.username,
          sessionCount: count,
        };
      })
    );
    const sorted = leaderboard.sort((a, b) => b.sessionCount - a.sessionCount);
    res.status(200).send(sorted);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Не удалось загрузить лидерборд' });
  }
});

export default router;
