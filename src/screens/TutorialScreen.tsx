import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressStrip, Swatch } from '../components/Bits';
import { ProgressBar } from '../components/ProgressBar';
import { Stars } from '../components/Stars';
import { Mono, Serif } from '../components/Type';
import { picsum } from '../store/seed';
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

function MiniThisWeek() {
  return (
    <View style={{ width: '100%', backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 12, padding: 16 }}>
      <Mono size={8.5} spacing={0.2} color={C.muted} style={{ marginBottom: 4 }}>
        YOU ARE LIVING WEEK
      </Mono>
      <Serif size={40} weight="medium" style={{ lineHeight: 42 }}>
        1,461
      </Serif>
      <Serif size={13} italic color={C.muted} style={{ marginTop: 2, marginBottom: 12 }}>
        of your 4,160 weeks.
      </Serif>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Swatch color={C.amber} size={9} />
        <View style={{ flex: 1 }}>
          <ProgressBar pct={0.8} color={C.amber} />
        </View>
        <Mono size={8} spacing={0.1} color={C.faint}>
          80% SPENT
        </Mono>
      </View>
    </View>
  );
}

function MiniMemories() {
  const items: [string, string, number][] = [
    ['ink42', '1,460', 5],
    ['ink39', '1,459', 4],
    ['ink37', '1,458', 5],
    ['ink34', '1,457', 3],
  ];
  return (
    <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {items.map(([seed, wk, r]) => (
        <View key={seed} style={{ width: '48%', marginBottom: 8, backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 10, overflow: 'hidden' }}>
          <Image source={{ uri: picsum(seed, 400, 240) }} style={{ width: '100%', height: 52, backgroundColor: C.pencil }} />
          <View style={{ paddingHorizontal: 8, paddingVertical: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Mono size={7.5} spacing={0.1} color={C.muted}>
              WK {wk}
            </Mono>
            <Stars value={r} size={9} />
          </View>
        </View>
      ))}
    </View>
  );
}

function MiniGoal() {
  return (
    <View style={{ width: '100%', backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 12, padding: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <Mono size={8.5} spacing={0.16} color={C.muted}>
          ACTIVE GOAL
        </Mono>
        <Mono size={8.5} spacing={0.12} color={C.amber}>
          WK 6 / 8
        </Mono>
      </View>
      <Serif size={17} weight="medium" color={C.ink} style={{ marginBottom: 10 }}>
        Launch the company
      </Serif>
      <ProgressStrip weeks={8} current={6} height={14} />
    </View>
  );
}

function MiniCheckin() {
  return (
    <View style={{ width: '100%', backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 12, padding: 14, gap: 11 }}>
      <Image source={{ uri: picsum('ink42', 600, 300) }} style={{ width: '100%', height: 80, borderRadius: 8, backgroundColor: C.pencil }} />
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

function MiniDetail() {
  return (
    <View style={{ width: '100%', backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 12, overflow: 'hidden' }}>
      <Image source={{ uri: picsum('ink42', 600, 360) }} style={{ width: '100%', height: 104, backgroundColor: C.pencil }} />
      <View style={{ padding: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Mono size={8.5} spacing={0.16} color={C.muted}>
            WK 1,460
          </Mono>
          <Stars value={5} size={13} />
        </View>
        <Serif size={14} italic color={C.ink}>
          “Signed the office lease. Pencil becomes ink.”
        </Serif>
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
    body: 'About 4,160 in a life. Black is inked and permanent; pale is pencil ahead. The outlined box is this week, the green one is where you started.',
  },
  {
    visual: <MiniThisWeek />,
    kicker: 'THIS WEEK',
    title: 'Your week, at a glance.',
    body: 'Your daily anchor: the week you’re living, how many remain, and how much of each window you’ve spent.',
  },
  {
    visual: <MiniWindows />,
    kicker: 'THE WINDOWS',
    title: 'Two windows are closing.',
    body: 'Prime (amber) closes around 35. Proximity (slate) is the weeks left near your people. Tap either, or shade them onto the grid.',
  },
  {
    visual: <MiniGoal />,
    kicker: 'GOALS',
    title: 'Set goals in weeks.',
    body: 'Name a goal, give it weeks — it starts now. Keep one at a time; the tab remembers every week it ran.',
  },
  {
    visual: <MiniCheckin />,
    kicker: 'THE CHECK-IN',
    title: 'Check in once a week.',
    body: 'A photo, a rating, a sentence — and a nudge to reflect on your goal. It locks into ink and sets your check-in day.',
  },
  {
    visual: <MiniMemories />,
    kicker: 'MEMORIES',
    title: 'Every photo, kept.',
    body: 'Each photographed week, gathered in one place — scroll it, or search by week or word.',
  },
  {
    visual: <MiniDetail />,
    kicker: 'LOOK BACK',
    title: 'Ink is ink.',
    body: 'Tap any inked week to reopen its photo and sentence. Nothing is edited or deleted.',
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
