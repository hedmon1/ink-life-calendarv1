import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { FOUNDER_DEADLINE_MS, TRIAL_MS } from '../config/appConfig';
import { fbAuth, fbDb, isFirebaseConfigured } from '../lib/firebase';
import { hasActiveSubscription, initPurchases } from '../lib/purchases';

export type Profile = {
  email: string;
  createdAt: number;
  /** free lifetime membership — account created inside the founding window */
  founder: boolean;
};

export type EntitlementStatus = 'dev' | 'lifetime' | 'subscribed' | 'trial' | 'expired';
export type Entitlement = { status: EntitlementStatus; trialDaysLeft: number };

type AuthCtx = {
  /** false → Firebase not configured; the app runs locally with no gate */
  configured: boolean;
  /** auth state (and profile, when signed in) has been resolved */
  authReady: boolean;
  user: { uid: string; email: string } | null;
  profile: Profile | null;
  entitlement: Entitlement;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  /** re-authenticates, deletes cloud data, then deletes the account (App Review 5.1.1(v)) */
  deleteAccount: (password: string) => Promise<void>;
  /** re-check the subscription with the store (after purchase/restore) */
  refreshEntitlement: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

function computeEntitlement(configured: boolean, profile: Profile | null, subscribed: boolean): Entitlement {
  if (!configured) return { status: 'dev', trialDaysLeft: 0 };
  if (!profile) return { status: 'trial', trialDaysLeft: 14 }; // resolving — never flash the paywall
  if (profile.founder) return { status: 'lifetime', trialDaysLeft: 0 };
  if (subscribed) return { status: 'subscribed', trialDaysLeft: 0 };
  const left = profile.createdAt + TRIAL_MS - Date.now();
  if (left > 0) return { status: 'trial', trialDaysLeft: Math.max(1, Math.ceil(left / 86400000)) };
  return { status: 'expired', trialDaysLeft: 0 };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isFirebaseConfigured;
  const [user, setUser] = useState<{ uid: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [authReady, setAuthReady] = useState(!configured);

  const loadProfile = useCallback(async (u: User) => {
    const snap = await getDoc(doc(fbDb(), 'users', u.uid));
    if (snap.exists()) {
      const d = snap.data() as Partial<Profile>;
      setProfile({
        email: d.email ?? u.email ?? '',
        createdAt: typeof d.createdAt === 'number' ? d.createdAt : Date.now(),
        founder: !!d.founder,
      });
    } else {
      // profile missing (older account) — create one now, founder if still in window
      const p: Profile = { email: u.email ?? '', createdAt: Date.now(), founder: Date.now() <= FOUNDER_DEADLINE_MS };
      await setDoc(doc(fbDb(), 'users', u.uid), p, { merge: true });
      setProfile(p);
    }
  }, []);

  useEffect(() => {
    if (!configured) return;
    initPurchases();
    const unsub = onAuthStateChanged(fbAuth(), async (u) => {
      if (u) {
        setUser({ uid: u.uid, email: u.email ?? '' });
        try {
          await loadProfile(u);
        } catch {
          // offline — keep last known profile
        }
        hasActiveSubscription().then(setSubscribed);
      } else {
        setUser(null);
        setProfile(null);
        setSubscribed(false);
      }
      setAuthReady(true);
    });
    return unsub;
  }, [configured, loadProfile]);

  const signUp = useCallback(async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(fbAuth(), email.trim(), password);
    const p: Profile = { email: email.trim(), createdAt: Date.now(), founder: Date.now() <= FOUNDER_DEADLINE_MS };
    await setDoc(doc(fbDb(), 'users', cred.user.uid), p, { merge: true });
    setProfile(p);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(fbAuth(), email.trim(), password);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(fbAuth());
  }, []);

  const deleteAccount = useCallback(async (password: string) => {
    const u = fbAuth().currentUser;
    if (!u || !u.email) throw new Error('not-signed-in');
    await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, password));
    await deleteDoc(doc(fbDb(), 'users', u.uid));
    await deleteUser(u);
  }, []);

  const refreshEntitlement = useCallback(async () => {
    setSubscribed(await hasActiveSubscription());
    const u = fbAuth().currentUser;
    if (u) await loadProfile(u).catch(() => {});
  }, [loadProfile]);

  const entitlement = computeEntitlement(configured, user ? profile : null, subscribed);

  return (
    <Ctx.Provider value={{ configured, authReady, user, profile, entitlement, signUp, signIn, signOutUser, deleteAccount, refreshEntitlement }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
