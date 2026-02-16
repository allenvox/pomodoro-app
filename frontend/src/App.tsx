/** Root: router, auth-based nav, Timer / Leaderboard or Login. */
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import api from './api/client';
import { TimerProvider } from './context/TimerContext';
import { useTheme } from './context/ThemeContext';
import Timer from './components/Timer';
import Login from './components/Login';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';

function App() {
  const [user, loading] = useAuthState(auth);
  const { theme, toggleTheme } = useTheme();

  // Ensure user exists in backend (create if missing, e.g. after sign-in or DB reset)
  useEffect(() => {
    if (!user?.uid) return;
    api.post('/api/users', {
      firebaseUid: user.uid,
      username: (user.email ?? '').split('@')[0] || 'user',
    }).catch(() => { /* ignore; user may be created later on profile save */ });
  }, [user?.uid, user?.email]);

  if (loading) {
    return (
      <div className="app-layout">
        <p className="app-loading">Загрузка...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-layout">
        <h1 className="app-title">Pomodoro Таймер</h1>
        {user && (
          <nav className="nav">
            <Link to="/" className="nav__link">Таймер</Link>
            <Link to="/leaderboard" className="nav__link">Лидерборд</Link>
            <Link to="/profile" className="nav__link">Никнейм</Link>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
              aria-label={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => auth.signOut()}
            >
              Выйти
            </button>
          </nav>
        )}
        {user ? (
          <TimerProvider>
            <Routes>
              <Route path="/" element={<Timer />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </TimerProvider>
        ) : (
          <Login />
        )}
      </div>
    </Router>
  );
}

export default App;
