import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Pressable, ScrollView, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressStrip, Swatch } from '../components/Bits';
import { ProgressBar } from '../components/ProgressBar';
import { Stars } from '../components/Stars';
import { Mono, Serif } from '../components/Type';
import { useStore } from '../store/store';
import { C } from '../theme';

// ---- mini app previews shown on each step ----

function MiniGrid() {
  const rows = 7;
  const cols = 14;
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const row: React.ReactNode[] = [];
    for (let c = 0; c < cols; c++) {
      let st: ViewStyle;
      if (r === 3 && c === 4) st = { backgroundColor: C.ink, borderWidth: 1.5, borderColor: C.green };
      else if (r === 3 && c === 10) st = { backgroundColor: C.paper, borderWidth: 1, borderColor: C.ink };
      else if (r < 4) st = { backgroundColor: C.ink };
      else if (r === 4) st = { backgroundColor: C.amber };
      else st = { backgroundColor: C.pencil, borderWidth: 0.5, borderColor: C.pencilBorder };
      row.push(<View key={c} style={[{ width: 11, height: 11, borderRadius: 2, margin: 1.5 }, st]} />);
    }
    out.push(
      <View key={r} style={{ flexDirection: 'row' }}>
        {row}
      </View>
    );
  }
  return <View>{out}</View>;
}

function WinRow({ color, label, pct, val }: { color: string; label: string; pct: number; val: string }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Swatch color={color} size={9} />
          <Mono size={9} spacing={0.14} color={C.body}>
            {label}
          </Mono>
        </View>
        <Serif size={14} weight="medium">
          {val}
        </Serif>
      </View>
      <ProgressBar pct={pct} color={color} />
    </View>
  );
}

function MiniWindows() {
  return (
    <View style={{ width: '100%', gap: 14 }}>
      <WinRow color={C.amber} label="PRIME" pct={0.8} val="360 wks" />
      <WinRow color={C.slate} label="PROXIMITY" pct={0.94} val="86 wks" />
    </View>
  );
}

function MiniGoal() {
  return (
    <View style={{ width: '100%', backgroundColor: C.ink, borderRadius: 12, padding: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <Mono size={8.5} spacing={0.16} color={C.darkLabel}>
          ACTIVE GOAL
        </Mono>
        <Mono size={8.5} spacing={0.12} color={C.gold}>
          WK 8 / 8
        </Mono>
      </View>
      <Serif size={17} weight="medium" color={C.paper} style={{ marginBottom: 10 }}>
        Launch the company
      </Serif>
      <ProgressStrip weeks={8} current={8} variant="dark" height={14} />
    </View>
  );
}

function MiniCheckin() {
  return (
    <View style={{ width: '100%', backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 12, padding: 14, gap: 11 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Mono size={8.5} spacing={0.16} color={C.muted}>
          FULFILLMENT
        </Mono>
        <Stars value={4} size={16} />
      </View>
      <Serif size={15} italic color={C.ink}>
        “Signed the office lease.”
      </Serif>
      <View style={{ backgroundColor: C.ink, borderRadius: 6, paddingVertical: 11, alignItems: 'center' }}>
        <Mono size={9} spacing={0.16} color={C.paper}>
          LOCK IN INK
        </Mono>
      </View>
    </View>
  );
}

type Step = { visual: React.ReactNode; kicker: string; title: string; body: string };

const STEPS: Step[] = [
  {
    visual: <MiniGrid />,
    kicker: 'THE GRID',
    title: 'Every box is one week.',
    body: 'About 4,680 in a long life. The weeks behind you are ink — permanent. The ones ahead are pencil. The green square is the week you opened Ink.',
  },
  {
    visual: <MiniWindows />,
    kicker: 'THE WINDOWS',
    title: 'The amber is your prime.',
    body: 'Those shaded weeks are the years your body still says yes — they close around 35. Tap a window on the Week tab for the full story, and toggle proximity on when you want it.',
  },
  {
    visual: <MiniGoal />,
    kicker: 'GOALS',
    title: 'Set goals in weeks.',
    body: 'Name a goal and give it a number of weeks. The Goals tab remembers the weeks each one ran, so you can search those weeks later in Memories.',
  },
  {
    visual: <MiniCheckin />,
    kicker: 'THE CHECK-IN',
    title: 'Check in once a week.',
    body: 'One sentence, one rating, one photo — then the week locks into ink. No edits. Your first check-in sets the weekday you’ll check in from then on.',
  },
];

export function TutorialScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { markTutorialSeen } = useStore();
  const [i, setI] = useState(0);

  const finish = () => {
    markTutorialSeen();
    nav.goBack();
  };
  const next = () => (i >= STEPS.length - 1 ? finish() : setI((n) => n + 1));

  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top + 14, paddingBottom: insets.bottom + 22 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 28 }}>
        <Serif size={20} weight="semi" italic>
          Ink.
        </Serif>
        <Pressable onPress={finish} hitSlop={10}>
          <Mono size={10} spacing={0.16} color={C.muted}>
            SKIP
          </Mono>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 20 }} showsVerticalScrollIndicator={false}>
        <View
          style={{
            backgroundColor: C.stone,
            borderWidth: 1,
            borderColor: C.cardLine,
            borderRadius: 18,
            paddingVertical: 22,
            paddingHorizontal: 20,
            marginBottom: 30,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 150,
          }}
        >
          {step.visual}
        </View>

        <Mono size={10} spacing={0.22} color={C.muted} style={{ marginBottom: 14 }}>
          {step.kicker}
        </Mono>
        <Serif size={32} weight="medium" style={{ lineHeight: 39, marginBottom: 16 }}>
          {step.title}
        </Serif>
        <Serif size={17.5} color={C.body} style={{ lineHeight: 27 }}>
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
            {last ? 'START INKING' : 'NEXT →'}
          </Mono>
        </Pressable>
      </View>
    </View>
  );
}
