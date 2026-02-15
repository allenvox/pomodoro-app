/** Timer: configurable work/break intervals, countdown, session logging. State lives in TimerContext so it persists when navigating away. */
import React, { useEffect, useCallback, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import api from '../api/client';
import { playAlarmSound, resumeAudioContext } from '../utils/sound';
import { useTimer } from '../context/TimerContext';
import Notification from './Notification';

const Timer: React.FC = () => {
  const [user] = useAuthState(auth);
  const timer = useTimer();
  const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const {
    timeLeft,
    isRunning,
    isWork,
    intervals,
    workMinutes,
    breakMinutes,
    setTimeLeft,
    setIsRunning,
    setWorkMinutes,
    setBreakMinutes,
    persistIntervals,
    registerCycleComplete,
  } = timer;

  // Sync timeLeft when intervals or isWork change (cap to current interval length)
  useEffect(() => {
    const workSec = intervals.work * 60;
    const breakSec = intervals.break * 60;
    if (isWork) setTimeLeft((prev) => (prev > workSec ? workSec : prev));
    else setTimeLeft((prev) => (prev > breakSec ? breakSec : prev));
  }, [intervals.work, intervals.break, isWork, setTimeLeft]);

  // Register callback for when a work/break cycle completes (runs in context even when this component is unmounted)
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    const unregister = registerCycleComplete(({ isWork: completedIsWork, duration }) => {
      if (user?.uid) {
        api.post('/api/sessions', { userId: user.uid, duration }).catch((err) => {
          if (mountedRef.current) {
            setNotification({ message: err instanceof Error ? err.message : 'Не удалось сохранить сессию', type: 'error' });
          }
        });
      }
      playAlarmSound();
      if (mountedRef.current) {
        setNotification({
          message: completedIsWork ? 'Работа завершена! Перерыв.' : 'Перерыв завершён!',
          type: 'success',
        });
      }
    });
    return () => {
      mountedRef.current = false;
      unregister();
    };
  }, [user?.uid, registerCycleComplete]);

  const handleStartPause = useCallback(() => {
    resumeAudioContext();
    setIsRunning(!isRunning);
  }, [isRunning, setIsRunning]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(isWork ? intervals.work * 60 : intervals.break * 60);
  }, [isWork, intervals.work, intervals.break, setTimeLeft, setIsRunning]);

  const handleApplyIntervals = useCallback(() => {
    const work = Math.max(1, Math.min(99, workMinutes));
    const breakM = Math.max(1, Math.min(99, breakMinutes));
    setWorkMinutes(work);
    setBreakMinutes(breakM);
    persistIntervals({ work, break: breakM });
    if (!isRunning) {
      setTimeLeft(isWork ? work * 60 : breakM * 60);
    }
    setNotification({ message: 'Интервалы сохранены', type: 'info' });
  }, [workMinutes, breakMinutes, isRunning, isWork, setWorkMinutes, setBreakMinutes, persistIntervals, setTimeLeft]);

  return (
    <div className="card">
      <p className="timer-label">{isWork ? 'Работа' : 'Перерыв'}</p>
      <div className="timer-display">
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </div>
      <div className="timer-actions">
        <button type="button" className="btn btn--primary" onClick={handleStartPause}>
          {isRunning ? 'Пауза' : 'Старт'}
        </button>
        <button type="button" className="btn btn--danger" onClick={handleReset}>
          Сброс
        </button>
      </div>

      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
        <p className="timer-label">Интервалы (мин)</p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Работа</span>
            <input
              type="number"
              min={1}
              max={99}
              value={workMinutes}
              onChange={(e) => setWorkMinutes(Number(e.target.value) || 1)}
              className="input"
              style={{ width: 64, marginBottom: 0, textAlign: 'center' }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Перерыв</span>
            <input
              type="number"
              min={1}
              max={99}
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value) || 1)}
              className="input"
              style={{ width: 64, marginBottom: 0, textAlign: 'center' }}
            />
          </label>
          <button type="button" className="btn btn--primary" onClick={handleApplyIntervals}>
            Применить
          </button>
        </div>
      </div>

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

export default Timer;
