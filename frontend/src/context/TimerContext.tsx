/** Timer state shared across navigation so it doesn't reset when leaving the Timer page. */
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

const STORAGE_KEY = 'pomodoro-intervals';
const DEFAULT_WORK = 25;
const DEFAULT_BREAK = 5;

export type Intervals = { work: number; break: number };

function loadIntervals(): Intervals {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const v = JSON.parse(s) as Intervals;
      if (typeof v.work === 'number' && typeof v.break === 'number' && v.work >= 1 && v.break >= 1) {
        return { work: Math.min(99, v.work), break: Math.min(99, v.break) };
      }
    }
  } catch {
    /* ignore */
  }
  return { work: DEFAULT_WORK, break: DEFAULT_BREAK };
}

type TimerState = {
  timeLeft: number;
  isRunning: boolean;
  isWork: boolean;
  intervals: Intervals;
  workMinutes: number;
  breakMinutes: number;
};

type TimerContextValue = TimerState & {
  setTimeLeft: (v: number | ((prev: number) => number)) => void;
  setIsRunning: (v: boolean | ((prev: boolean) => void)) => void;
  setIsWork: (v: boolean | ((prev: boolean) => void)) => void;
  setIntervals: (v: Intervals) => void;
  setWorkMinutes: (v: number) => void;
  setBreakMinutes: (v: number) => void;
  persistIntervals: (next: Intervals) => void;
  registerCycleComplete: (cb: (params: { isWork: boolean; duration: number }) => void) => () => void;
};

const initialState: TimerState = (() => {
  const intervals = loadIntervals();
  return {
    timeLeft: intervals.work * 60,
    isRunning: false,
    isWork: true,
    intervals,
    workMinutes: intervals.work,
    breakMinutes: intervals.break,
  };
})();

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TimerState>(initialState);
  const cycleCompleteRef = useRef<((params: { isWork: boolean; duration: number }) => void) | null>(null);

  const persistIntervals = useCallback((next: Intervals) => {
    setState((s) => ({ ...s, intervals: next, workMinutes: next.work, breakMinutes: next.break }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const registerCycleComplete = useCallback((cb: (params: { isWork: boolean; duration: number }) => void) => {
    cycleCompleteRef.current = cb;
    return () => {
      cycleCompleteRef.current = null;
    };
  }, []);

  const setTimeLeft = useCallback((v: number | ((prev: number) => number)) => {
    setState((s) => ({ ...s, timeLeft: typeof v === 'function' ? v(s.timeLeft) : v }));
  }, []);
  const setIsRunning = useCallback((v: boolean | ((prev: boolean) => void)) => {
    setState((s) => ({ ...s, isRunning: typeof v === 'function' ? (v as (p: boolean) => boolean)(s.isRunning) : v }));
  }, []);
  const setIsWork = useCallback((v: boolean | ((prev: boolean) => void)) => {
    setState((s) => ({ ...s, isWork: typeof v === 'function' ? (v as (p: boolean) => boolean)(s.isWork) : v }));
  }, []);
  const setIntervals = useCallback((v: Intervals) => {
    setState((s) => ({ ...s, intervals: v }));
  }, []);
  const setWorkMinutes = useCallback((v: number) => {
    setState((s) => ({ ...s, workMinutes: v }));
  }, []);
  const setBreakMinutes = useCallback((v: number) => {
    setState((s) => ({ ...s, breakMinutes: v }));
  }, []);

  // Run countdown in provider so it continues when user is on another page
  React.useEffect(() => {
    if (!state.isRunning || state.timeLeft <= 0) return;
    const id = setInterval(() => {
      setState((s) => {
        const next = s.timeLeft - 1;
        if (next <= 0) {
          const duration = s.isWork ? s.intervals.work * 60 : s.intervals.break * 60;
          cycleCompleteRef.current?.({ isWork: s.isWork, duration });
          return {
            ...s,
            timeLeft: s.isWork ? s.intervals.break * 60 : s.intervals.work * 60,
            isWork: !s.isWork,
            isRunning: false,
          };
        }
        return { ...s, timeLeft: next };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state.isRunning, state.timeLeft, state.isWork, state.intervals.work, state.intervals.break]);

  const value: TimerContextValue = {
    ...state,
    setTimeLeft,
    setIsRunning,
    setIsWork,
    setIntervals,
    setWorkMinutes,
    setBreakMinutes,
    persistIntervals,
    registerCycleComplete,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within TimerProvider');
  return ctx;
}
