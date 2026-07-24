import React, { useCallback, useEffect, useRef } from 'react';
import { AppState, Dimensions, View } from 'react-native';
import { captureAndSaveWallpaper, currentWeekIndex, shouldRegenerate } from '../lib/wallpaper';
import { useStore } from '../store/store';
import { WallpaperGrid } from './WallpaperGrid';

/**
 * Once the user has saved a wallpaper at least once, this keeps the "Ink" album's
 * image current: whenever the app comes to the foreground in a new week, it silently
 * re-captures the grid (photo permission already granted) so the weekly Shortcuts
 * automation always applies the freshest square. The live widgets tick on their own;
 * this only refreshes the wallpaper image. No-op until the feature is first used.
 */
export function WallpaperAutoUpdater() {
  const { state, markWallpaperSaved } = useStore();
  const { lastWallpaperWeek, birthYear } = state;
  const screen = Dimensions.get('screen');
  const ref = useRef<View>(null);
  const busy = useRef(false);

  const maybeRegen = useCallback(async () => {
    if (lastWallpaperWeek == null) return;
    if (busy.current || !shouldRegenerate(lastWallpaperWeek, birthYear)) return;
    busy.current = true;
    const r = await captureAndSaveWallpaper(ref);
    busy.current = false;
    if (r === 'saved') markWallpaperSaved(currentWeekIndex(birthYear));
  }, [lastWallpaperWeek, birthYear, markWallpaperSaved]);

  useEffect(() => {
    maybeRegen();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') maybeRegen();
    });
    return () => sub.remove();
  }, [maybeRegen]);

  if (lastWallpaperWeek == null) return null; // don't mount the hidden grid until the feature is used

  return (
    <View
      ref={ref}
      collapsable={false}
      pointerEvents="none"
      style={{ position: 'absolute', left: -100000, top: 0, width: screen.width, height: screen.height }}
    >
      <WallpaperGrid width={screen.width} height={screen.height} birthYear={birthYear} />
    </View>
  );
}
