import { Platform } from 'react-native';

/** App Group shared between the app and the widget extension (see app.json + expo-target.config.js). */
export const APP_GROUP = 'group.com.ink.lifecalendar';

/**
 * Write the birth year into the shared App Group and reload the widgets so the
 * home/lock-screen grid reflects it. Only `birthYear` crosses the boundary — the
 * Swift widget computes the lived/this-week cells itself on each timeline refresh,
 * so the grid keeps ticking even if the app is never opened.
 *
 * No-op on Android/web and in Expo Go (the native module only exists in a dev build).
 */
export function writeWidgetData(birthYear: number): void {
  if (Platform.OS !== 'ios') return;
  try {
    // require lazily so bundlers on web/Expo Go never touch the native module
    const { ExtensionStorage } = require('@bacons/apple-targets');
    const storage = new ExtensionStorage(APP_GROUP);
    storage.set('birthYear', birthYear);
    ExtensionStorage.reloadWidget();
  } catch {
    // native module unavailable — safe to ignore
  }
}
