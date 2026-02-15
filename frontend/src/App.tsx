/** Root: router, auth-based nav, Timer / Leaderboard or Login. */
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { TimerProvider } from './context/TimerContext';
import Timer from './components/Timer';
import Login from './components/Login';
import Leaderboard from './components/Leaderboard';

function App() {
  const [user] = useAuthState(auth);

  return (
    <Router>
      <div className="app-layout">
        <h1 className="app-title">Pomodoro Таймер</h1>
        {user && (
          <nav className="nav">
            <Link to="/" className="nav__link">Таймер</Link>
            <Link to="/leaderboard" className="nav__link">Лидерборд</Link>
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
