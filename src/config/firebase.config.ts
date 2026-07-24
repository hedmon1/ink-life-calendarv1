/**
 * Firebase web-app config for Ink.
 *
 * TODO before TestFlight: create a Firebase project (console.firebase.google.com)
 * → Add app → Web → copy the config object here, then enable:
 *   - Authentication → Sign-in method → Email/Password
 *   - Cloud Firestore (production mode) with the rules from store/APP_STORE_CHECKLIST.md
 *
 * These web config values are safe to ship in the app binary (they are not
 * secrets); access is controlled by Firestore security rules.
 *
 * While apiKey is left as 'TODO', the app runs in local "dev mode": no account
 * gate, no trial countdown, everything on-device.
 */
export const FIREBASE_CONFIG = {
  apiKey: 'TODO',
  authDomain: 'TODO.firebaseapp.com',
  projectId: 'TODO',
  storageBucket: 'TODO.appspot.com',
  messagingSenderId: 'TODO',
  appId: 'TODO',
};
