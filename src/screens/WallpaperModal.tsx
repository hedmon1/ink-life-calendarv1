import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import { Alert, Dimensions, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalShell } from '../components/ModalShell';
import { Mono, Serif } from '../components/Type';
import { WallpaperGrid } from '../components/WallpaperGrid';
import { captureAndSaveWallpaper, currentWeekIndex } from '../lib/wallpaper';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/store';
import { C } from '../theme';

export function WallpaperModal() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { state, markWallpaperSaved } = useStore();
  const screen = Dimensions.get('screen');
  const shotRef = useRef<View>(null);
  const [saving, setSaving] = useState(false);
  const enabled = state.lastWallpaperWeek != null;

  const previewW = Math.min(190, screen.width * 0.5);
  const previewH = previewW * (screen.height / screen.width);

  // Save this week's grid to the Ink album; this also switches on the weekly
  // auto-refresh (WallpaperAutoUpdater re-captures each new week), then walks the
  // user through the one-time Shortcut that applies it automatically.
  const enableAuto = async () => {
    setSaving(true);
    const r = await captureAndSaveWallpaper(shotRef);
    setSaving(false);
    if (r === 'saved') {
      const firstTime = state.lastWallpaperWeek == null;
      markWallpaperSaved(currentWeekIndex(state.birthYear));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      if (firstTime) {
        nav.navigate('WallpaperTutorial');
      } else {
        Alert.alert('Grid saved', 'This week’s grid is in your “Ink” album. Your weekly Shortcut will apply it.');
      }
    } else if (r === 'denied') {
      Alert.alert('Photos access needed', 'Allow photo access in Settings so Ink can save the wallpaper image.');
    } else {
      Alert.alert('Couldn’t save', 'Something went wrong generating the image. Try again.');
    }
  };

  return (
    <ModalShell title="ON YOUR SCREEN">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: insets.bottom + 28 }} showsVerticalScrollIndicator={false}>
        <Serif size={28} weight="medium" style={{ marginBottom: 6 }}>
          Your life, on your screen.
        </Serif>
        <Serif size={15} italic color={C.muted} style={{ marginBottom: 22 }}>
          Two ways to keep the grid in front of you — both tick a square every week.
        </Serif>

        {/* preview */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: previewW, height: previewH, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: C.cardLine }}>
            <WallpaperGrid width={previewW} height={previewH} birthYear={state.birthYear} />
          </View>
        </View>

        {/* option 1 — auto-updating wallpaper */}
        <View style={{ backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 16, padding: 18, marginBottom: 14 }}>
          <Mono size={9} spacing={0.16} color={C.amber} style={{ marginBottom: 8 }}>
            AUTO-UPDATING WALLPAPER
          </Mono>
          <Serif size={14.5} color={C.body} style={{ lineHeight: 22, marginBottom: 16 }}>
            Ink re-saves your grid every week; a one-time Shortcut sets it as your lock screen automatically.
          </Serif>
          <Pressable onPress={enableAuto} disabled={saving} style={{ backgroundColor: C.ink, borderRadius: 9, paddingVertical: 15, alignItems: 'center', opacity: saving ? 0.6 : 1 }}>
            <Mono size={10.5} spacing={0.16} color={C.paper}>
              {saving ? 'SAVING…' : enabled ? 'SAVE THIS WEEK’S GRID' : 'SET UP AUTO WALLPAPER'}
            </Mono>
          </Pressable>
          <Pressable onPress={() => nav.navigate('WallpaperTutorial')} style={{ paddingVertical: 12, alignItems: 'center' }}>
            <Mono size={9} spacing={0.14} color={C.muted}>
              {enabled ? 'REVIEW SHORTCUT SETUP →' : 'HOW IT WORKS →'}
            </Mono>
          </Pressable>
          {enabled && (
            <Mono size={8.5} spacing={0.12} color={C.faint} style={{ textAlign: 'center', marginTop: 2 }}>
              ON · REFRESHES EACH WEEK YOU OPEN INK
            </Mono>
          )}
        </View>

        {/* option 2 — widget */}
        <View style={{ backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 16, padding: 18 }}>
          <Mono size={9} spacing={0.16} color={C.amber} style={{ marginBottom: 8 }}>
            LIVE WIDGET · ZERO SETUP
          </Mono>
          <Serif size={14.5} color={C.body} style={{ lineHeight: 22, marginBottom: 14 }}>
            Add the Ink widget and it inks a new square every week on its own — no Shortcut needed.
          </Serif>
          <Step text="Home Screen: long-press → ＋ → search “Ink” → add Life in Weeks." />
          <Step text="Lock Screen: Customize → add the Ink widget by the clock." />
        </View>
      </ScrollView>

      {/* off-screen full-resolution capture target */}
      <View
        ref={shotRef}
        collapsable={false}
        pointerEvents="none"
        style={{ position: 'absolute', left: -100000, top: 0, width: screen.width, height: screen.height }}
      >
        <WallpaperGrid width={screen.width} height={screen.height} birthYear={state.birthYear} />
      </View>
    </ModalShell>
  );
}

function Step({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
      <Mono size={11} color={C.amber} style={{ width: 10 }}>
        •
      </Mono>
      <Serif size={13.5} color={C.body} style={{ flex: 1, lineHeight: 20 }}>
        {text}
      </Serif>
    </View>
  );
}
