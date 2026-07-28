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

  const previewW = Math.min(190, screen.width * 0.5);
  const previewH = previewW * (screen.height / screen.width);

  // The auto route needs no Photos access at all — the Shortcut renders the grid
  // itself. Saving to Photos is the manual fallback (and switches on the weekly
  // album refresh via WallpaperAutoUpdater for people who set it by hand).
  const saveToPhotos = async () => {
    setSaving(true);
    const r = await captureAndSaveWallpaper(shotRef);
    setSaving(false);
    if (r === 'saved') {
      markWallpaperSaved(currentWeekIndex(state.birthYear));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Alert.alert('Grid saved', 'This week’s grid is in Photos, in the “Ink” album. Set it from Settings → Wallpaper.');
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
            A two-minute Shortcut, set up once. iOS then redraws your wallpaper every week by itself — sized and centered for this exact screen.
          </Serif>
          <Pressable onPress={() => nav.navigate('WallpaperTutorial')} style={{ backgroundColor: C.ink, borderRadius: 9, paddingVertical: 15, alignItems: 'center' }}>
            <Mono size={10.5} spacing={0.16} color={C.paper}>
              SET UP AUTO WALLPAPER →
            </Mono>
          </Pressable>
          <Pressable onPress={saveToPhotos} disabled={saving} style={{ paddingVertical: 12, alignItems: 'center', opacity: saving ? 0.6 : 1 }}>
            <Mono size={9} spacing={0.14} color={C.muted}>
              {saving ? 'SAVING…' : 'OR SAVE THIS WEEK’S GRID TO PHOTOS'}
            </Mono>
          </Pressable>
        </View>

        {/* option 2 — widget */}
        <View style={{ backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 16, padding: 18 }}>
          <Mono size={9} spacing={0.16} color={C.amber} style={{ marginBottom: 8 }}>
            LIVE WIDGET · ZERO SETUP
          </Mono>
          <Serif size={14.5} color={C.body} style={{ lineHeight: 22, marginBottom: 14 }}>
            Add the Ink widget and it inks a new square every week on its own — no Shortcut needed.
          </Serif>
          <Step text="Hold a widget on your Home Screen → Edit Stack → ＋ (top left) → search “Ink”." />
          <Step text="No widgets yet? Hold empty Home Screen space → ＋ → search “Ink”." />
          <Step text="Lock Screen: hold it → Customize → add Ink by the clock." />
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
