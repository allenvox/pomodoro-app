/** Leaderboard: users sorted by total work time (sum of session durations); optional period filter. */
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
        const sessions = await Session.find(
          { userId: user.firebaseUid, ...sessionFilter },
          { duration: 1 }
        );
        const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration ?? 0), 0);
        return {
          userId: user.firebaseUid,
          username: user.username,
          totalSeconds,
          sessionCount: sessions.length,
        };
      })
    );
    const sorted = leaderboard.sort((a, b) => b.totalSeconds - a.totalSeconds);
    res.status(200).send(sorted);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Не удалось загрузить лидерборд' });
  }
});

export default router;
