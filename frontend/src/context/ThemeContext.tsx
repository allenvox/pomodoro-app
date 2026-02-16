/** Theme (light/dark) with localStorage persistence. */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'pomodoro-theme';
type Theme = 'light' | 'dark';

function loadTheme(): Theme {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === 'dark' || s === 'light') return s;
  } catch {
    /* ignore */
  }
  return 'light';
}

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(loadTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(() => setThemeState((prev) => (prev === 'light' ? 'dark' : 'light')), []);

  const value: ThemeContextValue = { theme, setTheme, toggleTheme };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
