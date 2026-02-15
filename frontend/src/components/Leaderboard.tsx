/** Leaderboard: period filter (all/week/month), highlight current user. */
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import api from '../api/client';

export type LeaderboardEntry = {
  userId: string;
  username: string;
  sessionCount: number;
};

type Period = 'all' | 'week' | 'month';

const PERIOD_LABELS: Record<Period, string> = {
  all: 'Всё время',
  week: 'Неделя',
  month: 'Месяц',
};

const Leaderboard: React.FC = () => {
  const [user] = useAuthState(auth);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('all');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<LeaderboardEntry[]>('/api/leaderboard', {
          params: { period },
        });
        setLeaderboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [period]);

  return (
    <div className="card">
      <h2 style={{ marginBottom: 20, textAlign: 'center' }}>Лидерборд</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            className="btn"
            style={{
              background: period === p ? 'var(--color-primary)' : 'var(--color-surface-alt)',
              color: period === p ? 'white' : 'var(--color-text)',
            }}
            onClick={() => setPeriod(p)}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Загрузка...</p>
      ) : error ? (
        <p style={{ textAlign: 'center', color: 'var(--color-danger)' }}>{error}</p>
      ) : leaderboard.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Нет данных. Завершите несколько сессий!
        </p>
      ) : (
        <ul className="leaderboard-list">
          {leaderboard.map((entry, index) => (
            <li
              key={entry.userId}
              className={`leaderboard-item ${user?.uid === entry.userId ? 'leaderboard-item--current' : ''}`}
            >
              <span>
                {index + 1}. {entry.username}
                {user?.uid === entry.userId && ' (вы)'}
              </span>
              <span>{entry.sessionCount} сессий</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Leaderboard;
