import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mono, Serif } from '../components/Type';
import { WallpaperGrid } from '../components/WallpaperGrid';
import { useStore } from '../store/store';
import { C } from '../theme';

// Optional walkthrough: turning the grid into a self-updating lock-screen wallpaper.

function PhonePreview({ birthYear }: { birthYear: number }) {
  const w = 118;
  const h = 236;
  return (
    <View style={{ width: w + 10, height: h + 10, borderRadius: 26, borderWidth: 2, borderColor: C.inputLine, padding: 3, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: w, height: h, borderRadius: 21, overflow: 'hidden' }}>
        <WallpaperGrid width={w} height={h} birthYear={birthYear} />
      </View>
    </View>
  );
}

function MiniCard({ lines }: { lines: string[] }) {
  return (
    <View style={{ backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 18, gap: 9, width: '100%' }}>
      {lines.map((l, i) => (
        <Mono key={i} size={9.5} spacing={0.1} color={i === 0 ? C.amber : C.body}>
          {l}
        </Mono>
      ))}
    </View>
  );
}

type Step = { kicker: string; title: string; body: string; visual: (birthYear: number) => React.ReactNode };

const STEPS: Step[] = [
  {
    kicker: 'HOW IT WORKS',
    title: 'Set it up once.',
    body: 'You’ll build a two-action Shortcut, then have iOS run it weekly. Two minutes now — automatic forever after.',
    visual: (by) => <PhonePreview birthYear={by} />,
  },
  {
    kicker: 'STEP 1 · GET THE GRID',
    title: 'Start a new shortcut.',
    body: 'Open the Shortcuts app and tap ＋ in the top-right corner. Tap the “Search Actions” bar at the bottom, type Ink, and tap “Get This Week’s Grid”.',
    visual: () => <MiniCard lines={['SHORTCUTS APP → ＋ (TOP RIGHT)', 'SEARCH ACTIONS → TYPE “INK”', 'TAP “GET THIS WEEK’S GRID”']} />,
  },
  {
    kicker: 'STEP 2 · SET WALLPAPER',
    title: 'Add the second action.',
    body: 'Search actions again, type Wallpaper, and tap “Set Wallpaper”. In the new action, tap the blue word Wallpaper and choose Lock Screen — and Home Screen too, if you want it there.',
    visual: () => <MiniCard lines={['SEARCH → TAP “SET WALLPAPER”', 'TAP THE BLUE “WALLPAPER”', 'CHOOSE LOCK · HOME · OR BOTH']} />,
  },
  {
    kicker: 'STEP 3 · TEST IT',
    title: 'Turn off the preview.',
    body: 'Tap the small ▸ arrow on the Set Wallpaper action and switch off “Show Preview”. Tap Done. Now tap the shortcut once — your wallpaper should change right away.',
    visual: () => <MiniCard lines={['▸ ARROW ON SET WALLPAPER', 'SHOW PREVIEW → OFF', 'DONE → TAP ONCE TO TEST']} />,
  },
  {
    kicker: 'STEP 4 · MAKE IT WEEKLY',
    title: 'Hand it to iOS.',
    body: 'Go to the Automation tab and tap ＋, then “Time of Day”. Choose Weekly and pick any day and time. Select “Run Immediately”, tap Next — then tap your new shortcut.',
    visual: () => <MiniCard lines={['AUTOMATION → ＋ → TIME OF DAY', 'WEEKLY · PICK DAY + TIME', 'RUN IMMEDIATELY → NEXT', 'TAP YOUR SHORTCUT']} />,
  },
  {
    kicker: 'DONE',
    title: 'That’s it.',
    body: 'iOS now redraws your wallpaper every week on its own. If it ever looks zoomed in: hold the Lock Screen → Customize → pinch until the grid fits.',
    visual: (by) => <PhonePreview birthYear={by} />,
  },
];

export function WallpaperTutorialScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const [i, setI] = useState(0);

  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  const next = () => (last ? nav.goBack() : setI((n) => n + 1));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top + 14, paddingBottom: insets.bottom + 22 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 28 }}>
        <Mono size={10} spacing={0.18} color={C.muted}>
          WALLPAPER SETUP
        </Mono>
        <Pressable onPress={() => nav.goBack()} hitSlop={10}>
          <Mono size={10} spacing={0.16} color={C.muted}>
            SKIP
          </Mono>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 20 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginBottom: 28 }}>{step.visual(state.birthYear)}</View>
        <Mono size={10} spacing={0.22} color={C.muted} style={{ marginBottom: 14 }}>
          {step.kicker}
        </Mono>
        <Serif size={30} weight="medium" style={{ lineHeight: 37, marginBottom: 14 }}>
          {step.title}
        </Serif>
        <Serif size={16.5} color={C.body} style={{ lineHeight: 25 }}>
          {step.body}
        </Serif>
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28 }}>
        <View style={{ flexDirection: 'row', gap: 7 }}>
          {STEPS.map((_, k) => (
            <View key={k} style={{ width: k === i ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: k === i ? C.amber : C.inputLine }} />
          ))}
        </View>
        <Pressable onPress={next} style={{ backgroundColor: C.ink, borderRadius: 8, paddingVertical: 15, paddingHorizontal: 26 }}>
          <Mono size={10.5} spacing={0.16} color={C.paper}>
            {last ? 'GOT IT' : 'NEXT →'}
          </Mono>
        </Pressable>
      </View>
    </View>
  );
}
