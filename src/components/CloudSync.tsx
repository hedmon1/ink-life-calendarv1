import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useRef } from 'react';
import { fbDb } from '../lib/firebase';
import { useAuth } from '../store/auth';
import { useStore } from '../store/store';
import { AppState as InkState } from '../store/types';

/**
 * Keeps the signed-in user's Ink state backed up in Firestore (users/{uid}.state).
 * - On sign-in: if the cloud has a saved state and this device looks fresh
 *   (no self-logged weeks), the cloud copy is restored.
 * - After that: every local change is pushed (debounced).
 * Photos are device files; only https photo URLs survive the round-trip —
 * sentences, ratings, goals and settings all sync.
 */
export function CloudSync() {
  const { user, configured } = useAuth();
  const { ready, state, importState } = useStore();
  const pulledFor = useRef<string | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextPush = useRef(false);

  // pull once per sign-in
  useEffect(() => {
    if (!configured || !user || !ready || pulledFor.current === user.uid) return;
    pulledFor.current = user.uid;
    (async () => {
      try {
        const snap = await getDoc(doc(fbDb(), 'users', user.uid));
        const cloud = snap.exists() ? (snap.data().state as InkState | undefined) : undefined;
        const localIsFresh = !state.records.some((r) => !r.seed);
        if (cloud && cloud.onboarded && localIsFresh) {
          skipNextPush.current = true;
          importState(cloud);
        }
      } catch {
        // offline — local state stands
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, user, ready]);

  // debounced push on change
  useEffect(() => {
    if (!configured || !user || !ready) return;
    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      const sanitized: InkState = {
        ...state,
        records: state.records.map((r) => ({ ...r, photos: r.photos.filter((p) => p.startsWith('http')) })),
      };
      setDoc(doc(fbDb(), 'users', user.uid), { state: sanitized }, { merge: true }).catch(() => {});
    }, 2500);
    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [configured, user, ready, state]);

  return null;
}
