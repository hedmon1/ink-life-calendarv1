import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Card, DraftStrip, ProgressStrip } from '../components/Bits';
import { Screen } from '../components/Screen';
import { Stars } from '../components/Stars';
import { Mono, Serif } from '../components/Type';
import { fmt, shortDate } from '../lib/calc';
import { checkinInfo } from '../lib/checkin';
import { goalAvg, goalCurrentWeek, goalPhase, goalWeekRange } from '../lib/goals';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/store';
import { C } from '../theme';
import { Goal } from '../store/types';

const MIN_W = 1;
const MAX_W = 26;

export function GoalsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { calc, state, addGoal, recordFor } = useStore();
  const [name, setName] = useState('');
  const [weeks, setWeeks] = useState(12);

  const start = calc.lived + 1;
  const inPrime = Math.max(0, Math.min(weeks, calc.primeEnd - start));
  const allInPrime = inPrime >= weeks;

  // a new goal begins the day after the next check-in
  const ci = checkinInfo(state.checkinWeekday, !!recordFor(calc.lived));
  const startLabel = shortDate(Date.now() + (ci.daysUntil + 1) * 86400000);

  const recordWeeks = useMemo(() => new Set(state.records.map((r) => r.weekIndex)), [state.records]);
  const openWeek = (weekIndex: number) => nav.navigate('WeekDetail', { weekIndex });

  const pencilIn = () => {
    if (!name.trim()) return;
    addGoal({ name, weeks });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setName('');
    setWeeks(12);
  };

  const order: Record<string, number> = { active: 0, penciled: 1, finished: 2 };
  const goals = [...state.goals].sort((a, b) => order[goalPhase(a, calc.lived)] - order[goalPhase(b, calc.lived)]);

  return (
    <Screen>
      <Serif size={30} weight="medium" style={{ marginBottom: 14 }}>
        Goals
      </Serif>

      {/* new goal */}
      <View style={{ backgroundColor: C.paper, borderWidth: 1.5, borderColor: C.muted, borderStyle: 'dashed', borderRadius: 12, padding: 18, marginBottom: 14 }}>
        <Mono size={9.5} spacing={0.18} style={{ marginBottom: 10 }}>
          NEW GOAL · PENCIL
        </Mono>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Run a sub-3:30 marathon"
          placeholderTextColor={C.faint}
          style={{
            fontFamily: 'Newsreader_400Regular_Italic',
            fontSize: 19,
            color: C.ink,
            borderBottomWidth: 1,
            borderBottomColor: C.inputLine,
            paddingBottom: 8,
            marginBottom: 14,
          }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Mono size={9.5} spacing={0.16} color={C.body}>
            TIME FRAME
          </Mono>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <StepBtn label="−" onPress={() => setWeeks((w) => Math.max(MIN_W, w - 1))} />
            <View style={{ minWidth: 84, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
              <Serif size={22} weight="medium">
                {weeks}
              </Serif>
              <Serif size={22} weight="medium">
                {' '}
                wks
              </Serif>
            </View>
            <StepBtn label="+" onPress={() => setWeeks((w) => Math.min(MAX_W, w + 1))} />
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <DraftStrip weeks={weeks} />
        </View>

        <Serif size={14} italic color={C.muted} style={{ marginBottom: 14 }}>
          Starts {startLabel}, the day after your next check-in.{' '}
          {allInPrime ? `All ${weeks} weeks land inside your prime window.` : `${inPrime} of ${weeks} weeks land inside your prime window.`}
        </Serif>

        <Pressable onPress={pencilIn} style={{ backgroundColor: name.trim() ? C.ink : C.inputLine, borderRadius: 6, paddingVertical: 14, alignItems: 'center' }}>
          <Mono size={10} spacing={0.18} color={C.paper}>
            PENCIL IT IN
          </Mono>
        </Pressable>
      </View>

      {/* goal list */}
      {goals.map((g) => (
        <GoalRow key={g.id} goal={g} lived={calc.lived} recordWeeks={recordWeeks} onOpenWeek={openWeek} />
      ))}
    </Screen>
  );
}

function StepBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: C.ink, alignItems: 'center', justifyContent: 'center' }}>
      <Serif size={20} color={C.ink} style={{ lineHeight: 22 }}>
        {label}
      </Serif>
    </Pressable>
  );
}

function GoalRow({
  goal,
  lived,
  recordWeeks,
  onOpenWeek,
}: {
  goal: Goal;
  lived: number;
  recordWeeks: Set<number>;
  onOpenWeek: (weekIndex: number) => void;
}) {
  const phase = goalPhase(goal, lived);
  const range = goalWeekRange(goal);

  if (phase === 'active') {
    return (
      <Card dark style={{ paddingVertical: 16, paddingHorizontal: 18, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <Mono size={9} spacing={0.16} color={C.darkLabel}>
            ACTIVE
          </Mono>
          <Mono size={9} spacing={0.12} color={C.gold}>
            WK {goalCurrentWeek(goal, lived)} / {goal.weeks}
          </Mono>
        </View>
        <Serif size={18} weight="medium" color={C.paper} style={{ marginBottom: 12 }}>
          {goal.name}
        </Serif>
        <ProgressStrip
          weeks={goal.weeks}
          current={goalCurrentWeek(goal, lived)}
          variant="dark"
          height={16}
          startWeek={goal.startWeek}
          recordWeeks={recordWeeks}
          onCellPress={onOpenWeek}
        />
        <Mono size={8.5} spacing={0.12} color={C.darkLabel} style={{ marginTop: 10 }}>
          WK {fmt(range.from)} – {fmt(range.to)} · TAP AN INKED WEEK TO REOPEN IT
        </Mono>
      </Card>
    );
  }

  if (phase === 'penciled') {
    return (
      <View style={{ backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <Mono size={9} spacing={0.16} color={C.muted}>
            PENCILED · STARTS SOON
          </Mono>
          <Mono size={9} spacing={0.12} color={C.muted}>
            {goal.weeks} WKS
          </Mono>
        </View>
        <Serif size={18} weight="medium" style={{ marginBottom: 10 }}>
          {goal.name}
        </Serif>
        <DraftStrip weeks={goal.weeks} height={12} />
        <Mono size={8.5} spacing={0.12} color={C.faint} style={{ marginTop: 10 }}>
          WILL RUN WK {fmt(range.from)} – {fmt(range.to)}
        </Mono>
      </View>
    );
  }

  // finished
  return (
    <Card style={{ paddingVertical: 16, paddingHorizontal: 18, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Mono size={9} spacing={0.16} color={C.muted}>
          FINISHED
        </Mono>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Stars value={Math.round(goalAvg(goal))} size={11} />
          <Mono size={9} spacing={0.12} color={C.amber}>
            {goalAvg(goal).toFixed(1)} AVG
          </Mono>
        </View>
      </View>
      <Serif size={18} weight="medium" style={{ marginBottom: 10 }}>
        {goal.name}
      </Serif>
      <ProgressStrip
        weeks={goal.weeks}
        current={0}
        variant="light"
        height={14}
        startWeek={goal.startWeek}
        recordWeeks={recordWeeks}
        onCellPress={onOpenWeek}
      />
      <Mono size={8.5} spacing={0.12} color={C.faint} style={{ marginTop: 10 }}>
        RAN WK {fmt(range.from)} – {fmt(range.to)} · TAP AN INKED WEEK TO REOPEN IT
      </Mono>
    </Card>
  );
}
