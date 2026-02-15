/** Login/sign-up form; creates user in API on first sign-up. */
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import api from '../api/client';
import Notification from './Notification';

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      showNotification('Введите email и пароль', 'error');
      return;
    }
    setLoading(true);
    setNotification(null);
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await api.post('/api/users', {
          firebaseUid: userCredential.user.uid,
          username: email.split('@')[0] || 'user',
        });
        showNotification('Регистрация прошла успешно', 'success');
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        showNotification('Вход выполнен', 'success');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Неизвестная ошибка';
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card--narrow">
      <h2 style={{ marginBottom: 20, textAlign: 'center' }}>
        {isRegister ? 'Регистрация' : 'Вход'}
      </h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="input"
        autoComplete="email"
      />
      <div className="input-with-icon">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="input"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
        />
        <button
          type="button"
          className="input-icon-btn"
          onClick={() => setShowPassword((v) => !v)}
          title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      <button
        type="button"
        className="btn btn--primary"
        style={{ width: '100%' }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? '...' : isRegister ? 'Зарегистрироваться' : 'Войти'}
      </button>
      <button
        type="button"
        className="btn btn--text"
        style={{ width: '100%', marginTop: 12 }}
        onClick={() => {
          setIsRegister(!isRegister);
          setNotification(null);
        }}
      >
        {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
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

export default Login;
