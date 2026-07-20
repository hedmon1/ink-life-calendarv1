import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { clampBirthYear, lifeCalc, LifeCalc } from '../lib/calc';
import { goalPhase } from '../lib/goals';
import { buildSeed } from './seed';
import { AppState, Goal, WeekRecord } from './types';

const STORAGE_KEY = 'ink.state.v5';

const DEFAULT_STATE: AppState = {
  birthYear: 1998,
  proximityWeeks: 86,
  overlays: { prime: true, prox: false },
  goals: [],
  records: [],
  onboarded: false,
  checkinWeekday: null,
  lastCheckinAt: null,
  tutorialSeen: false,
  installWeekIndex: null,
};

type Store = {
  ready: boolean;
  state: AppState;
  calc: LifeCalc;
  // actions
  completeOnboarding: (birthYear: number) => void;
  setBirthYear: (birthYear: number) => void;
  markTutorialSeen: () => void;
  toggleOverlay: (key: 'prime' | 'prox') => void;
  addGoal: (input: { name: string; weeks: number }) => void;
  lockCurrentWeek: (input: { sentence: string; rating: number; photos: string[] }) => void;
  reset: () => void;
  // selectors
  recordFor: (weekIndex: number) => WeekRecord | undefined;
  activeGoal: () => Goal | undefined;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  // hydrate
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
      } catch {
        // ignore – fall back to defaults
      } finally {
        hydrated.current = true;
        setReady(true);
      }
    })();
  }, []);

  // persist on change (after first hydrate)
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const calc = useMemo(() => lifeCalc(state.birthYear, state.proximityWeeks), [state.birthYear, state.proximityWeeks]);

  const completeOnboarding = useCallback((birthYearRaw: number) => {
    const birthYear = clampBirthYear(birthYearRaw);
    const { goals, records } = buildSeed(birthYear);
    const installWeekIndex = lifeCalc(birthYear).lived;
    setState((s) => ({
      ...s,
      birthYear,
      goals,
      records,
      onboarded: true,
      checkinWeekday: null,
      lastCheckinAt: null,
      tutorialSeen: false,
      installWeekIndex,
    }));
  }, []);

  const setBirthYear = useCallback((birthYearRaw: number) => {
    setState((s) => ({ ...s, birthYear: clampBirthYear(birthYearRaw) }));
  }, []);

  const markTutorialSeen = useCallback(() => {
    setState((s) => ({ ...s, tutorialSeen: true }));
  }, []);

  const toggleOverlay = useCallback((key: 'prime' | 'prox') => {
    setState((s) => ({ ...s, overlays: { ...s.overlays, [key]: !s.overlays[key] } }));
  }, []);

  const addGoal = useCallback((input: { name: string; weeks: number }) => {
    setState((s) => {
      const c = lifeCalc(s.birthYear, s.proximityWeeks);
      const goal: Goal = {
        id: `g-${Date.now()}`,
        name: input.name.trim(),
        weeks: Math.max(1, Math.min(52, Math.round(input.weeks))),
        startWeek: c.lived + 1, // pencils in starting next week
        ratings: [],
        createdAt: Date.now(),
      };
      return { ...s, goals: [goal, ...s.goals] };
    });
  }, []);

  const lockCurrentWeek = useCallback((input: { sentence: string; rating: number; photos: string[] }) => {
    setState((s) => {
      const c = lifeCalc(s.birthYear, s.proximityWeeks);
      const weekIndex = c.lived;
      // which active goal (if any) owns this week
      const owning = s.goals.find((g) => goalPhase(g, c.lived) === 'active');
      const goalId = owning?.id;

      const record: WeekRecord = {
        weekIndex,
        sentence: input.sentence.trim(),
        rating: input.rating,
        photos: input.photos.slice(0, 3),
        goalId,
        lockedAt: Date.now(),
      };
      const records = [...s.records.filter((r) => r.weekIndex !== weekIndex), record];

      let goals = s.goals;
      if (owning) {
        goals = s.goals.map((g) => (g.id === owning.id ? { ...g, ratings: [...g.ratings, input.rating] } : g));
      }
      // first check-in fixes the user's weekday; later ones reuse it
      const checkinWeekday = s.checkinWeekday ?? new Date().getDay();
      return { ...s, records, goals, checkinWeekday, lastCheckinAt: Date.now() };
    });
  }, []);

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const recordFor = useCallback(
    (weekIndex: number) => state.records.find((r) => r.weekIndex === weekIndex),
    [state.records]
  );

  const activeGoal = useCallback(
    () => state.goals.find((g) => goalPhase(g, calc.lived) === 'active'),
    [state.goals, calc.lived]
  );

  const value: Store = {
    ready,
    state,
    calc,
    completeOnboarding,
    setBirthYear,
    markTutorialSeen,
    toggleOverlay,
    addGoal,
    lockCurrentWeek,
    reset,
    recordFor,
    activeGoal,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
