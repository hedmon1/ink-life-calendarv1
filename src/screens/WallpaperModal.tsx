import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import { Alert, Dimensions, Pressable, ScrollView, Switch, View } from 'react-native';
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
  const { state, markWallpaperSaved, setWallpaperReminders } = useStore();
  const screen = Dimensions.get('screen');
  const shotRef = useRef<View>(null);
  const [saving, setSaving] = useState(false);

  const previewW = Math.min(200, screen.width * 0.52);
  const previewH = previewW * (screen.height / screen.width);

  const onSave = async () => {
    setSaving(true);
    const r = await captureAndSaveWallpaper(shotRef);
    setSaving(false);
    if (r === 'saved') {
      markWallpaperSaved(currentWeekIndex(state.birthYear));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Alert.alert(
        'Saved to Photos',
        'Your grid is in the "Ink" album. Set it: Settings → Wallpaper → Add New Wallpaper → Photos → pick it.'
      );
    } else if (r === 'denied') {
      Alert.alert('Photos access needed', 'Allow photo access in Settings so Ink can save the wallpaper image.');
    } else {
      Alert.alert('Couldn’t save', 'Something went wrong generating the image. Try again.');
    }
  };

  return (
    <ModalShell title="WALLPAPER">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: insets.bottom + 28 }} showsVerticalScrollIndicator={false}>
        <Serif size={28} weight="medium" style={{ marginBottom: 6 }}>
          Your life, on your screen.
        </Serif>
        <Serif size={15} italic color={C.muted} style={{ marginBottom: 14 }}>
          Save the full grid as a wallpaper. It re-inks one square each week.
        </Serif>

        <Pressable
          onPress={() => nav.navigate('WallpaperTutorial')}
          style={{ alignSelf: 'flex-start', borderWidth: 1, borderColor: C.inputLine, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 13, marginBottom: 20 }}
        >
          <Mono size={9} spacing={0.14} color={C.ink}>
            STEP-BY-STEP SETUP →
          </Mono>
        </Pressable>

        {/* preview */}
        <View style={{ alignItems: 'center', marginBottom: 22 }}>
          <View style={{ width: previewW, height: previewH, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: C.cardLine }}>
            <WallpaperGrid width={previewW} height={previewH} birthYear={state.birthYear} />
          </View>
        </View>

        <Pressable onPress={onSave} disabled={saving} style={{ backgroundColor: C.ink, borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginBottom: 14, opacity: saving ? 0.6 : 1 }}>
          <Mono size={11} spacing={0.16} color={C.paper}>
            {saving ? 'SAVING…' : 'SAVE TO PHOTOS'}
          </Mono>
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 22 }}>
          <Serif size={14} italic color={C.muted} style={{ flex: 1, marginRight: 12 }}>
            Remind me weekly to refresh it
          </Serif>
          <Switch
            value={state.wallpaperReminders}
            onValueChange={setWallpaperReminders}
            trackColor={{ true: C.amber, false: C.inputLine }}
            thumbColor={C.paper}
          />
        </View>

        {/* live widgets */}
        <Section kicker="LIVE WIDGETS · AUTO-TICK">
          <Step n="•" text="Long-press the Home Screen → + → search “Ink” → add the large Life in Weeks widget." />
          <Step n="•" text="On the Lock Screen: Customize → add the Ink widget above or below the clock." />
          <Serif size={13.5} italic color={C.muted} style={{ marginTop: 4 }}>
            Widgets ink a new square every week on their own — no wallpaper needed.
          </Serif>
        </Section>

        {/* auto wallpaper via shortcuts */}
        <Section kicker="AUTO-UPDATE THE WALLPAPER (OPTIONAL)">
          <Serif size={13.5} color={C.body} style={{ lineHeight: 21, marginBottom: 12 }}>
            iOS won’t let an app change your wallpaper, but a one-time Shortcut can swap it weekly:
          </Serif>
          <Step n="1" text="Shortcuts app → Automation → New → Weekly (pick a day/time)." />
          <Step n="2" text="Add action “Get Latest Photos”, set Album to “Ink”, count 1." />
          <Step n="3" text="Add action “Set Wallpaper” → Lock Screen, feed it that photo, turn off Show Preview." />
          <Step n="4" text="Turn off “Ask Before Running”. Each week it applies the freshest grid." />
          <Serif size={12.5} italic color={C.faint} style={{ marginTop: 8, lineHeight: 18 }}>
            The “Set Wallpaper” action’s availability depends on your iOS version. If it’s missing, just re-open Ink weekly and tap Save, then set it yourself.
          </Serif>
        </Section>
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

function Section({ kicker, children }: { kicker: string; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 14, padding: 16, marginBottom: 14 }}>
      <Mono size={9} spacing={0.16} color={C.muted} style={{ marginBottom: 12 }}>
        {kicker}
      </Mono>
      {children}
    </View>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
      <Mono size={11} color={C.amber} style={{ width: 12 }}>
        {n}
      </Mono>
      <Serif size={13.5} color={C.body} style={{ flex: 1, lineHeight: 20 }}>
        {text}
      </Serif>
    </View>
  );
}
