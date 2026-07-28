import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { clampBirthYear, lifeCalc, LifeCalc } from '../lib/calc';
import { writeWidgetData } from '../lib/extensionStorage';
import { goalPhase } from '../lib/goals';
import { ensureNotificationPermission, scheduleCheckinReminders, setupNotifications } from '../lib/notifications';
import { repairPhotoRecords } from '../lib/photoStore';
import { buildSeed } from './seed';
import { AppState, Goal, WeekRecord } from './types';

const STORAGE_KEY = 'ink.state.v8';

const DEFAULT_STATE: AppState = {
  birthYear: 1998,
  proximityWeeks: 86,
  overlays: { prime: false, prox: false },
  goals: [],
  records: [],
  onboarded: false,
  checkinWeekday: null,
  lastCheckinAt: null,
  tutorialSeen: false,
  installWeekIndex: null,
  installedAt: null,
  lastWallpaperWeek: null,
  wallpaperReminders: false,
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
  completeGoal: (id: string) => void;
  deleteGoal: (id: string) => void;
  lockCurrentWeek: (input: { sentence: string; rating: number; photos: string[] }) => void;
  clearExampleMemories: () => void;
  markWallpaperSaved: (weekIndex: number) => void;
  setWallpaperReminders: (on: boolean) => void;
  /** replace local state with a cloud backup (CloudSync restore) */
  importState: (incoming: AppState) => void;
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
  const stateRef = useRef(state);
  stateRef.current = state;

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

  // notifications: foreground handler + Android channel
  useEffect(() => {
    setupNotifications();
  }, []);

  // keep the weekly check-in reminders in sync (silently — only if permission is granted)
  useEffect(() => {
    if (!ready) return;
    scheduleCheckinReminders(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, state.checkinWeekday, state.records, state.birthYear, state.proximityWeeks, state.wallpaperReminders]);

  // keep the home/lock-screen widgets' shared birth year in sync
  useEffect(() => {
    if (!ready) return;
    writeWidgetData(state.birthYear);
  }, [ready, state.birthYear]);

  // stamp the first-ever open — this anchors the free trial and syncs to the
  // user's cloud backup, so deleting and reinstalling doesn't reset it
  useEffect(() => {
    if (!ready) return;
    if (stateRef.current.installedAt == null) {
      setState((s) => (s.installedAt == null ? { ...s, installedAt: Date.now() } : s));
    }
  }, [ready]);

  // once per launch: migrate photos stored as absolute temp URIs (they break on
  // every app update) into permanent storage, pruning refs whose file is gone
  const repaired = useRef(false);
  useEffect(() => {
    if (!ready || repaired.current) return;
    repaired.current = true;
    repairPhotoRecords(stateRef.current.records)
      .then((fixed) => {
        if (fixed) setState((s) => ({ ...s, records: fixed }));
      })
      .catch(() => {});
  }, [ready]);

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
        weeks: Math.max(1, Math.min(26, Math.round(input.weeks))),
        startWeek: c.lived, // starts immediately — active this week
        createdAt: Date.now(),
      };
      return { ...s, goals: [goal, ...s.goals] };
    });
  }, []);

  const completeGoal = useCallback((id: string) => {
    setState((s) => ({ ...s, goals: s.goals.map((g) => (g.id === id ? { ...g, outcome: 'done' as const } : g)) }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
  }, []);

  const markWallpaperSaved = useCallback((weekIndex: number) => {
    setState((s) => ({ ...s, lastWallpaperWeek: weekIndex }));
  }, []);

  const setWallpaperReminders = useCallback((on: boolean) => {
    setState((s) => ({ ...s, wallpaperReminders: on }));
  }, []);

  const clearExampleMemories = useCallback(() => {
    setState((s) => ({
      ...s,
      records: s.records.filter((r) => !(r.seed || r.photos.some((p) => p.includes('picsum.photos')))),
    }));
  }, []);

  const lockCurrentWeek = useCallback((input: { sentence: string; rating: number; photos: string[] }) => {
    setState((s) => {
      const c = lifeCalc(s.birthYear, s.proximityWeeks);
      const weekIndex = c.lived;
      // tag the record with the active goal (if any) so WeekDetail can show it
      const owning = s.goals.find((g) => goalPhase(g, c.lived) === 'active');

      const record: WeekRecord = {
        weekIndex,
        sentence: input.sentence.trim(),
        rating: input.rating,
        photos: input.photos.slice(0, 3),
        goalId: owning?.id,
        lockedAt: Date.now(),
      };
      const records = [...s.records.filter((r) => r.weekIndex !== weekIndex), record];

      // first check-in fixes the user's weekday; later ones reuse it
      const checkinWeekday = s.checkinWeekday ?? new Date().getDay();
      return { ...s, records, checkinWeekday, lastCheckinAt: Date.now() };
    });
    // ask for notification permission on the first check-in, then (re)schedule reminders
    ensureNotificationPermission().then((granted) => {
      if (granted) scheduleCheckinReminders(stateRef.current);
    });
  }, []);

  const importState = useCallback((incoming: AppState) => {
    setState({ ...DEFAULT_STATE, ...incoming });
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
    completeGoal,
    deleteGoal,
    lockCurrentWeek,
    clearExampleMemories,
    markWallpaperSaved,
    setWallpaperReminders,
    importState,
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
