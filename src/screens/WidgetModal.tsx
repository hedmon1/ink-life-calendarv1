import React from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalShell } from '../components/ModalShell';
import { Mono, Serif } from '../components/Type';
import { HomeWidgetPreview, LARGE_W, LOCK_W, LockWidgetPreview } from '../components/WidgetPreview';
import { useStore } from '../store/store';
import { C } from '../theme';

export function WidgetModal() {
  const insets = useSafeAreaInsets();
  const { calc } = useStore();
  const { width } = useWindowDimensions();

  // both widgets are drawn at the same scale, so their relative sizes are honest
  const content = Math.min(width, 460) - 44;
  const homeW = Math.min(content - 28, 300);
  const lockW = LOCK_W * (homeW / LARGE_W);

  return (
    <ModalShell title="ON YOUR SCREEN">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: insets.bottom + 28 }} showsVerticalScrollIndicator={false}>
        <Serif size={28} weight="medium" style={{ marginBottom: 6 }}>
          Your life, on your screen.
        </Serif>
        <Serif size={15} italic color={C.muted} style={{ marginBottom: 20 }}>
          One square inks itself every week. Nothing to do after you add it.
        </Serif>

        {/* what the widgets actually look like */}
        <Panel>
          <HomeWidgetPreview width={homeW} lived={calc.lived} />
          <Caption text="HOME SCREEN · YOUR WHOLE LIFE" />
        </Panel>

        <Panel>
          <LockWidgetPreview width={lockW} />
          <Caption text="LOCK SCREEN · THIS YEAR" />
        </Panel>

        <View style={{ backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 16, padding: 18, marginBottom: 14 }}>
          <Mono size={9} spacing={0.16} color={C.amber} style={{ marginBottom: 12 }}>
            ADD TO THE HOME SCREEN
          </Mono>
          <Step text="Hold a widget on your Home Screen → Edit Stack → ＋ (top left) → search “Ink”." />
          <Step text="No widgets yet? Hold empty Home Screen space → ＋ → search “Ink”." />
        </View>

        <View style={{ backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 16, padding: 18 }}>
          <Mono size={9} spacing={0.16} color={C.amber} style={{ marginBottom: 12 }}>
            ADD TO THE LOCK SCREEN
          </Mono>
          <Step text="Hold your Lock Screen until the wallpapers zoom out." />
          <Step text="Tap Customize, then tap Lock Screen." />
          <Step text="Tap the widget box under the clock." />
          <Step text="Search “Ink” and tap the wide grid, then Done." />
        </View>
      </ScrollView>
    </ModalShell>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: C.stone, borderRadius: 22, paddingVertical: 16, alignItems: 'center', gap: 12, marginBottom: 14 }}>
      {children}
    </View>
  );
}

function Caption({ text }: { text: string }) {
  return (
    <Mono size={8.5} spacing={0.18} color={C.faint}>
      {text}
    </Mono>
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
