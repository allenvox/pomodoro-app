/** Profile: set nickname for leaderboard. */
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import api from '../api/client';
import Notification from './Notification';

const Profile: React.FC = () => {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchProfile = async () => {
      try {
        const { data } = await api.get<{ username: string }>(`/api/users/by-uid/${user.uid}`);
        setUsername(data.username ?? '');
      } catch {
        setUsername('');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.uid]);

  const handleSave = async () => {
    const name = username.trim();
    if (!name) {
      setNotification({ message: 'Введите никнейм', type: 'error' });
      return;
    }
    if (name.length > 50) {
      setNotification({ message: 'Никнейм не более 50 символов', type: 'error' });
      return;
    }
    if (!user?.uid) return;
    setSaving(true);
    setNotification(null);
    try {
      await api.patch(`/api/users/by-uid/${user.uid}`, { username: name });
      setNotification({ message: 'Никнейм сохранён', type: 'success' });
    } catch (err) {
      setNotification({
        message: err instanceof Error ? err.message : 'Не удалось сохранить',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="card card--narrow">
      <h2 style={{ marginBottom: 20, textAlign: 'center' }}>Никнейм для лидерборда</h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 16 }}>
        Это имя будет отображаться в таблице лидеров вместо части email.
      </p>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Ваш никнейм"
        className="input"
        maxLength={50}
        autoComplete="username"
      />
      <button
        type="button"
        className="btn btn--primary"
        style={{ width: '100%' }}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? '...' : 'Сохранить'}
      </button>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default Profile;
