import { getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, initializeFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import { FIREBASE_CONFIG } from '../config/firebase.config';

/** False until firebase.config.ts is filled in — the app then runs in local dev mode. */
export const isFirebaseConfigured = FIREBASE_CONFIG.apiKey !== 'TODO' && FIREBASE_CONFIG.apiKey.length > 10;

let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

function app() {
  return getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
}

export function fbAuth(): Auth {
  if (cachedAuth) return cachedAuth;
  if (Platform.OS === 'web') {
    cachedAuth = getAuth(app());
  } else {
    // React Native build of firebase/auth — persist sessions in AsyncStorage
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    cachedAuth = initializeAuth(app(), { persistence: getReactNativePersistence(AsyncStorage) }) as Auth;
  }
  return cachedAuth!;
}

export function fbDb(): Firestore {
  if (!cachedDb) {
    cachedDb = initializeFirestore(app(), { experimentalAutoDetectLongPolling: true });
  }
  return cachedDb;
}
