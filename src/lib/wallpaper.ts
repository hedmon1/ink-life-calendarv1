import { RefObject } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { lifeCalc } from './calc';

/** Album the wallpaper images land in — the Shortcuts automation reads "latest photo" from here. */
export const WALLPAPER_ALBUM = 'Ink';

/** Absolute (0-based) week index currently being lived — the grid's tick counter. */
export function currentWeekIndex(birthYear: number, now: number = Date.now()): number {
  return lifeCalc(birthYear, undefined, now).lived;
}

/** True when a new week has ticked since the last saved wallpaper. */
export function shouldRegenerate(lastWeekIndex: number | null, birthYear: number, now: number = Date.now()): boolean {
  return lastWeekIndex !== currentWeekIndex(birthYear, now);
}

export type SaveResult = 'saved' | 'denied' | 'error';

/**
 * Capture the off-screen full-resolution WallpaperGrid and save it to the Photos
 * library, grouped into the "Ink" album so a weekly Shortcuts automation can pick
 * up the latest one. The app can never set the wallpaper itself — iOS forbids it.
 */
export async function captureAndSaveWallpaper(ref: RefObject<unknown>): Promise<SaveResult> {
  try {
    const perm = await MediaLibrary.requestPermissionsAsync();
    if (!perm.granted) return 'denied';
    const uri = await captureRef(ref as never, { format: 'png', quality: 1 });
    const asset = await MediaLibrary.createAssetAsync(uri);
    try {
      const album = await MediaLibrary.getAlbumAsync(WALLPAPER_ALBUM);
      if (album) await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      else await MediaLibrary.createAlbumAsync(WALLPAPER_ALBUM, asset, false);
    } catch {
      // asset still saved to the camera roll even if album grouping fails
    }
    return 'saved';
  } catch {
    return 'error';
  }
}
