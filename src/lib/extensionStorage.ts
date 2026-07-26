import { Dimensions, PixelRatio, Platform } from 'react-native';

/** App Group shared between the app and the widget extension (see app.json + expo-target.config.js). */
export const APP_GROUP = 'group.com.ink.lifecalendar';

/**
 * Write the birth year (plus the device's pixel size, used by the wallpaper
 * App Intent to render at exact lock-screen resolution) into the shared App
 * Group, then reload the widgets. Only static values cross the boundary — the
 * Swift side computes lived/this-week itself on each refresh, so everything
 * keeps ticking even if the app is never opened.
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
    const screen = Dimensions.get('screen');
    storage.set('wallW', PixelRatio.getPixelSizeForLayoutSize(screen.width));
    storage.set('wallH', PixelRatio.getPixelSizeForLayoutSize(screen.height));
    ExtensionStorage.reloadWidget();
  } catch {
    // native module unavailable — safe to ignore
  }
}
