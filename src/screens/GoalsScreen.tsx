import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Card } from '../components/Bits';
import { ProgressBar } from '../components/ProgressBar';
import { Screen } from '../components/Screen';
import { Mono, Serif } from '../components/Type';
import { goalCurrentWeek, goalPhase, goalProgress } from '../lib/goals';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/store';
import { Goal } from '../store/types';
import { C } from '../theme';

export function GoalsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { calc, state, completeGoal, deleteGoal } = useStore();

  const confirmDelete = (g: Goal) =>
    Alert.alert('Delete this goal?', `“${g.name}” will be removed. Inked weeks stay in Memories.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteGoal(g.id) },
    ]);

  const active = state.goals.filter((g) => goalPhase(g, calc.lived) === 'active');
  const past = state.goals.filter((g) => goalPhase(g, calc.lived) !== 'active');

  return (
    <Screen>
      <Serif size={30} weight="medium" style={{ marginBottom: 4 }}>
        Goals
      </Serif>
      <Serif size={14.5} italic color={C.muted} style={{ marginBottom: 16 }}>
        One at a time.
      </Serif>

      {/* one active goal at a time — the button only shows when there isn't one */}
      {active.length === 0 && (
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
      )}

      {state.goals.length === 0 && (
        <Serif size={16} italic color={C.muted} style={{ paddingVertical: 8 }}>
          No goals yet.
        </Serif>
      )}

      {active.map((g) => (
        <ActiveGoalCard key={g.id} goal={g} lived={calc.lived} onDone={() => completeGoal(g.id)} onDelete={() => confirmDelete(g)} />
      ))}

      {past.length > 0 && (
        <>
          <Mono size={9} spacing={0.18} color={C.faint} style={{ marginTop: 10, marginBottom: 10 }}>
            HISTORY
          </Mono>
          {past.map((g) => (
            <HistoryRow key={g.id} goal={g} lived={calc.lived} onDelete={() => confirmDelete(g)} />
          ))}
        </>
      )}
    </Screen>
  );
}

function DeleteBtn({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={12} style={{ paddingLeft: 4 }}>
      <Serif size={19} color={C.faint} style={{ lineHeight: 19 }}>
        ×
      </Serif>
    </Pressable>
  );
}

function ActiveGoalCard({ goal, lived, onDone, onDelete }: { goal: Goal; lived: number; onDone: () => void; onDelete: () => void }) {
  return (
    <Card style={{ paddingVertical: 18, paddingHorizontal: 18, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Mono size={9} spacing={0.16} color={C.muted}>
          ACTIVE
        </Mono>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Mono size={9} spacing={0.12} color={C.amber}>
            WEEK {goalCurrentWeek(goal, lived)} OF {goal.weeks}
          </Mono>
          <DeleteBtn onPress={onDelete} />
        </View>
      </View>
      <Serif size={20} weight="medium" style={{ marginBottom: 14 }}>
        {goal.name}
      </Serif>
      <ProgressBar pct={goalProgress(goal, lived)} color={C.amber} />
      <Pressable onPress={onDone} style={{ backgroundColor: C.ink, borderRadius: 8, paddingVertical: 13, alignItems: 'center', marginTop: 16 }}>
        <Mono size={9.5} spacing={0.16} color={C.paper}>
          MARK DONE
        </Mono>
      </Pressable>
    </Card>
  );
}

function HistoryRow({ goal, lived, onDelete }: { goal: Goal; lived: number; onDelete: () => void }) {
  const done = goalPhase(goal, lived) === 'done';
  return (
    <Card style={{ paddingVertical: 13, paddingHorizontal: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
      <Serif size={15.5} weight="medium" style={{ flex: 1, marginRight: 10 }} numberOfLines={1}>
        {goal.name}
      </Serif>
      <Mono size={8.5} spacing={0.12} color={done ? C.green : C.muted}>
        {goal.weeks} WKS · {done ? 'DONE ✓' : 'TIME UP'}
      </Mono>
      <DeleteBtn onPress={onDelete} />
    </Card>
  );
}
