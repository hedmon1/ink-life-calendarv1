import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useRef } from 'react';
import { Image, Pressable, View } from 'react-native';
import { Card, Swatch } from '../components/Bits';
import { CheckIcon, InfoIcon, LockIcon } from '../components/Icons';
import { ProgressBar } from '../components/ProgressBar';
import { Screen } from '../components/Screen';
import { Mono, Serif } from '../components/Type';
import { fmt, todayLabel } from '../lib/calc';
import { checkinInfo } from '../lib/checkin';
import { goalCurrentWeek, goalProgress } from '../lib/goals';
import { checkinStreak } from '../lib/streak';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/store';
import { C } from '../theme';

export function ThisWeekScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { calc, state, activeGoal, recordFor } = useStore();
  const goal = activeGoal();
  const locked = recordFor(calc.lived);
  const ci = checkinInfo(state.checkinWeekday, !!locked);
  const streak = useMemo(() => checkinStreak(state.records, calc.lived), [state.records, calc.lived]);

  // a look back: this week one year ago, or the oldest photographed week ≥ 26 weeks out
  const memory = useMemo(() => {
    const own = state.records.filter((r) => !r.seed && r.photos.length > 0);
    return (
      own.find((r) => r.weekIndex === calc.lived - 52) ??
      own.filter((r) => calc.lived - r.weekIndex >= 26).sort((a, b) => a.weekIndex - b.weekIndex)[0]
    );
  }, [state.records, calc.lived]);

  // show the brief tutorial once, right after onboarding
  const tutorialShown = useRef(false);
  useEffect(() => {
    if (!state.tutorialSeen && !tutorialShown.current) {
      tutorialShown.current = true;
      const t = setTimeout(() => nav.navigate('Tutorial'), 350);
      return () => clearTimeout(t);
    }
  }, [state.tutorialSeen, nav]);

  const primePct = calc.primeEnd > 0 ? calc.lived / calc.primeEnd : 1;
  const proxPct = calc.lived + calc.proxLeft > 0 ? calc.lived / (calc.lived + calc.proxLeft) : 0;

  const openPrimeInfo = () =>
    nav.navigate('Info', {
      label: 'THE PRIME WINDOW',
      accent: C.amber,
      stat: fmt(calc.primeLeft),
      statUnit: 'weeks left',
      body: 'The weeks your body still says yes — the risky startup, the hard race, the move abroad. For most people it closes around 35.',
      note: `PRIME ENDS AT AGE 35 · ${fmt(calc.primeEnd)} WEEKS TOTAL`,
    });

  const openProxInfo = () =>
    nav.navigate('Info', {
      label: 'THE PROXIMITY WINDOW',
      accent: C.slate,
      stat: fmt(calc.proxLeft),
      statUnit: 'weeks left',
      body: 'The weeks you still live near your people, before the next chapter scatters everyone. Almost always shorter than you think.',
      note: `AN ESTIMATE · CAPPED AT ${fmt(state.proximityWeeks)} WEEKS`,
    });

  return (
    <Screen>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <Serif size={24} weight="semi" italic>
          Ink.
        </Serif>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Mono size={9.5} spacing={0.18}>
            {todayLabel()}
          </Mono>
          <Pressable
            onPress={() => nav.navigate('Tutorial')}
            hitSlop={10}
            style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: C.inputLine, alignItems: 'center', justifyContent: 'center' }}
          >
            <Mono size={12} color={C.muted}>
              ?
            </Mono>
          </Pressable>
          <Pressable
            onPress={() => nav.navigate('Account')}
            hitSlop={10}
            style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: C.inputLine, alignItems: 'center', justifyContent: 'center' }}
          >
            <Mono size={11} color={C.muted}>
              ⋯
            </Mono>
          </Pressable>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <Mono size={10} spacing={0.22}>
          YOU ARE LIVING WEEK
        </Mono>
        {streak >= 2 && (
          <Mono size={9} spacing={0.14} color={C.amber}>
            {streak} WKS IN INK
          </Mono>
        )}
      </View>
      <Serif size={64} weight="medium" style={{ lineHeight: 66 }}>
        {fmt(calc.weekNumber)}
      </Serif>
      <Serif size={17} italic color={C.muted} style={{ marginTop: 6, marginBottom: 20 }}>
        of your {fmt(calc.total)} weeks.
      </Serif>

      {/* check-in — the most visible action */}
      <CheckinBlock ci={ci} locked={locked} onOpen={() => nav.navigate('Review')} />

      {/* window cards (tap for an explanation) */}
      <View style={{ gap: 10, marginTop: 18, marginBottom: 18 }}>
        <WindowCard color={C.amber} label="PRIME WINDOW" value={calc.primeLeft} pct={primePct} onPress={openPrimeInfo} />
        <WindowCard color={C.slate} label="PROXIMITY WINDOW" value={calc.proxLeft} pct={proxPct} onPress={openProxInfo} />
      </View>

      {/* active goal */}
      {goal ? (
        <Card style={{ padding: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <Mono size={9.5} spacing={0.18} color={C.muted}>
              GOAL
            </Mono>
            <Mono size={9.5} spacing={0.14} color={C.amber}>
              WEEK {goalCurrentWeek(goal, calc.lived)} OF {goal.weeks}
            </Mono>
          </View>
          <Serif size={21} weight="medium" color={C.ink} style={{ marginBottom: 14 }}>
            {goal.name}
          </Serif>
          <ProgressBar pct={goalProgress(goal, calc.lived)} color={C.amber} />
        </Card>
      ) : (
        <Card style={{ borderStyle: 'dashed', borderColor: C.inputLine, borderWidth: 1.5 }}>
          <Mono size={9.5} spacing={0.18} color={C.muted}>
            NO ACTIVE GOAL
          </Mono>
        </Card>
      )}

      {/* a memory resurfaces */}
      {memory && (
        <Pressable onPress={() => nav.navigate('WeekDetail', { weekIndex: memory.weekIndex })} style={{ marginTop: 12 }}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
            <Image source={{ uri: memory.photos[0] }} style={{ width: 52, height: 52, borderRadius: 8, backgroundColor: C.pencil }} />
            <View style={{ flex: 1 }}>
              <Mono size={8.5} spacing={0.16} color={C.muted} style={{ marginBottom: 3 }}>
                {memory.weekIndex === calc.lived - 52 ? 'ONE YEAR AGO' : `FROM WEEK ${fmt(memory.weekIndex + 1)}`}
              </Mono>
              <Serif size={14} italic numberOfLines={1}>
                “{memory.sentence}”
              </Serif>
            </View>
          </Card>
        </Pressable>
      )}
    </Screen>
  );
}

function CheckinBlock({
  ci,
  locked,
  onOpen,
}: {
  ci: ReturnType<typeof checkinInfo>;
  locked: ReturnType<ReturnType<typeof useStore>['recordFor']>;
  onOpen: () => void;
}) {
  // already inked this week
  if (locked) {
    return (
      <Card style={{ borderColor: C.amber }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Mono size={10} spacing={0.16} color={C.amber}>
            THIS WEEK IS INK
          </Mono>
          <Mono size={9} spacing={0.12} color={C.amber}>
            ★ {locked.rating}/5
          </Mono>
        </View>
        <Serif size={16} italic style={{ marginBottom: ci.weekdayName ? 10 : 0 }}>
          “{locked.sentence}”
        </Serif>
        {ci.weekdayName && (
          <Mono size={9} spacing={0.14} color={C.muted}>
            NEXT CHECK-IN · {ci.weekdayName.toUpperCase()} · IN {ci.daysUntil} DAY{ci.daysUntil === 1 ? '' : 'S'}
          </Mono>
        )}
      </Card>
    );
  }

  // available now (first ever, or it's the chosen weekday)
  if (ci.canCheckIn) {
    return (
      <Pressable onPress={onOpen} style={{ backgroundColor: C.amber, borderRadius: 12, padding: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <CheckIcon color={C.paper} size={18} />
              <Mono size={11} spacing={0.16} color={C.paper} medium>
                {ci.firstEver ? 'DO YOUR FIRST CHECK-IN' : `CHECK IN · ${ci.weekdayName?.toUpperCase()}`}
              </Mono>
            </View>
            <Serif size={15} italic color={C.paper}>
              {ci.firstEver ? 'Sets your weekly check-in day.' : 'Lock this week into ink.'}
            </Serif>
          </View>
          <Serif size={26} color={C.paper}>
            →
          </Serif>
        </View>
      </Pressable>
    );
  }

  // off-day: must wait for the chosen weekday
  return (
    <View style={{ backgroundColor: C.paper, borderWidth: 1.5, borderColor: C.inputLine, borderStyle: 'dashed', borderRadius: 12, padding: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <LockIcon color={C.muted} size={16} />
        <Mono size={10} spacing={0.16} color={C.muted}>
          NEXT CHECK-IN · {ci.weekdayName?.toUpperCase()} · IN {ci.daysUntil} DAY{ci.daysUntil === 1 ? '' : 'S'}
        </Mono>
      </View>
      <Serif size={15} italic color={C.muted}>
        Come back {ci.weekdayName} to ink this week.
      </Serif>
    </View>
  );
}

function WindowCard({
  color,
  label,
  value,
  pct,
  onPress,
}: {
  color: string;
  label: string;
  value: number;
  pct: number;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <Swatch color={color} />
            <Mono size={10} spacing={0.16} color={C.body}>
              {label}
            </Mono>
            <InfoIcon color={C.faint} size={14} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
            <Serif size={22} weight="medium">
              {fmt(value)}
            </Serif>
            <Serif size={13} italic color={C.muted}>
              wks left
            </Serif>
          </View>
        </View>
        <ProgressBar pct={pct} color={color} />
        <Mono size={8.5} spacing={0.14} color={C.faint} style={{ marginTop: 6 }}>
          {Math.round(pct * 100)}% SPENT
        </Mono>
      </Card>
    </Pressable>
  );
}
