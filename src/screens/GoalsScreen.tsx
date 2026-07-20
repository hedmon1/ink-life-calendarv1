import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Card, ProgressStrip } from '../components/Bits';
import { Screen } from '../components/Screen';
import { Stars } from '../components/Stars';
import { Mono, Serif } from '../components/Type';
import { fmt } from '../lib/calc';
import { goalAvg, goalCurrentWeek, goalPhase, goalWeekRange } from '../lib/goals';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/store';
import { C } from '../theme';
import { Goal } from '../store/types';

export function GoalsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { calc, state, deleteGoal } = useStore();

  const recordWeeks = useMemo(() => new Set(state.records.map((r) => r.weekIndex)), [state.records]);
  const openWeek = (weekIndex: number) => nav.navigate('WeekDetail', { weekIndex });

  const confirmDelete = (g: Goal) =>
    Alert.alert('Delete this goal?', `“${g.name}” will be removed. Any inked weeks stay in Memories.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteGoal(g.id) },
    ]);

  const order: Record<string, number> = { active: 0, penciled: 1, finished: 2 };
  const goals = [...state.goals].sort((a, b) => order[goalPhase(a, calc.lived)] - order[goalPhase(b, calc.lived)]);

  return (
    <Screen>
      <Serif size={30} weight="medium" style={{ marginBottom: 4 }}>
        Goals
      </Serif>
      <Serif size={14.5} italic color={C.muted} style={{ marginBottom: 16 }}>
        One big goal at a time beats five half-finished ones.
      </Serif>

      {/* tap to open the new-goal form */}
      <Pressable
        onPress={() => nav.navigate('NewGoal')}
        style={{ backgroundColor: C.ink, borderRadius: 10, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 18 }}
      >
        <Serif size={19} color={C.paper} style={{ lineHeight: 19 }}>
          +
        </Serif>
        <Mono size={10.5} spacing={0.18} color={C.paper}>
          NEW GOAL
        </Mono>
      </Pressable>

      {goals.length === 0 && (
        <Serif size={16} italic color={C.muted} style={{ paddingVertical: 8 }}>
          No goals yet. Tap “New Goal” to draft one against a real window.
        </Serif>
      )}

      {goals.map((g) => (
        <GoalRow key={g.id} goal={g} lived={calc.lived} recordWeeks={recordWeeks} onOpenWeek={openWeek} onDelete={() => confirmDelete(g)} />
      ))}
    </Screen>
  );
}

function DeleteBtn({ onPress, dark }: { onPress: () => void; dark?: boolean }) {
  return (
    <Pressable onPress={onPress} hitSlop={12} style={{ paddingLeft: 4 }}>
      <Serif size={19} color={dark ? C.darkLabel : C.faint} style={{ lineHeight: 19 }}>
        ×
      </Serif>
    </Pressable>
  );
}

function GoalRow({
  goal,
  lived,
  recordWeeks,
  onOpenWeek,
  onDelete,
}: {
  goal: Goal;
  lived: number;
  recordWeeks: Set<number>;
  onOpenWeek: (weekIndex: number) => void;
  onDelete: () => void;
}) {
  const phase = goalPhase(goal, lived);
  const range = goalWeekRange(goal);

  if (phase === 'active') {
    return (
      <Card style={{ paddingVertical: 16, paddingHorizontal: 18, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Mono size={9} spacing={0.16} color={C.muted}>
            ACTIVE{goal.seed ? ' · EXAMPLE' : ''}
          </Mono>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Mono size={9} spacing={0.12} color={C.amber}>
              WK {goalCurrentWeek(goal, lived)} / {goal.weeks}
            </Mono>
            <DeleteBtn onPress={onDelete} />
          </View>
        </View>
        <Serif size={18} weight="medium" style={{ marginBottom: 12 }}>
          {goal.name}
        </Serif>
        <ProgressStrip weeks={goal.weeks} current={goalCurrentWeek(goal, lived)} height={16} startWeek={goal.startWeek} recordWeeks={recordWeeks} onCellPress={onOpenWeek} />
        <Mono size={8.5} spacing={0.12} color={C.faint} style={{ marginTop: 10 }}>
          WK {fmt(range.from)} – {fmt(range.to)} · TAP AN INKED WEEK TO REOPEN IT
        </Mono>
      </Card>
    );
  }

  if (phase === 'penciled') {
    return (
      <Card style={{ paddingVertical: 16, paddingHorizontal: 18, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Mono size={9} spacing={0.16} color={C.muted}>
            PENCILED · STARTS SOON
          </Mono>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Mono size={9} spacing={0.12} color={C.muted}>
              {goal.weeks} WKS
            </Mono>
            <DeleteBtn onPress={onDelete} />
          </View>
        </View>
        <Serif size={18} weight="medium" style={{ marginBottom: 10 }}>
          {goal.name}
        </Serif>
        <ProgressStrip weeks={goal.weeks} current={1} height={14} />
        <Mono size={8.5} spacing={0.12} color={C.faint} style={{ marginTop: 10 }}>
          WILL RUN WK {fmt(range.from)} – {fmt(range.to)}
        </Mono>
      </Card>
    );
  }

  // finished
  return (
    <Card style={{ paddingVertical: 16, paddingHorizontal: 18, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Mono size={9} spacing={0.16} color={C.muted}>
          FINISHED
        </Mono>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Stars value={Math.round(goalAvg(goal))} size={11} />
          <Mono size={9} spacing={0.12} color={C.amber}>
            {goalAvg(goal).toFixed(1)} AVG
          </Mono>
          <DeleteBtn onPress={onDelete} />
        </View>
      </View>
      <Serif size={18} weight="medium" style={{ marginBottom: 10 }}>
        {goal.name}
      </Serif>
      <ProgressStrip weeks={goal.weeks} current={0} height={14} startWeek={goal.startWeek} recordWeeks={recordWeeks} onCellPress={onOpenWeek} />
      <Mono size={8.5} spacing={0.12} color={C.faint} style={{ marginTop: 10 }}>
        RAN WK {fmt(range.from)} – {fmt(range.to)} · TAP AN INKED WEEK TO REOPEN IT
      </Mono>
    </Card>
  );
}
