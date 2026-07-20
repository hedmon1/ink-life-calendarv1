import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { Card, ProgressStrip, Swatch } from '../components/Bits';
import { CheckIcon, InfoIcon, LockIcon } from '../components/Icons';
import { ProgressBar } from '../components/ProgressBar';
import { Screen } from '../components/Screen';
import { Mono, Serif } from '../components/Type';
import { fmt, todayLabel } from '../lib/calc';
import { checkinInfo } from '../lib/checkin';
import { goalCurrentWeek, isGoalFinalWeek } from '../lib/goals';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/store';
import { C } from '../theme';

export function ThisWeekScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { calc, state, activeGoal, recordFor } = useStore();
  const goal = activeGoal();
  const locked = recordFor(calc.lived);
  const ci = checkinInfo(state.checkinWeekday, !!locked);

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
      body:
        'The weeks your body still says yes — the high-risk startup, the grueling race, the move across the world. For most people this window closes around age 35. After it, the big physical bets get far more expensive.',
      note: `PRIME ENDS AT AGE 35 · ${fmt(calc.primeEnd)} WEEKS TOTAL.\nYOU'VE SPENT ${Math.round(primePct * 100)}% OF IT.`,
    });

  const openProxInfo = () =>
    nav.navigate('Info', {
      label: 'THE PROXIMITY WINDOW',
      accent: C.slate,
      stat: fmt(calc.proxLeft),
      statUnit: 'weeks left',
      body:
        "The weeks you'll still live near your people — before a career move, a marriage, or the next chapter scatters everyone. It is almost always shorter than you think, so spend it on purpose.",
      note: `AN ESTIMATE OF HIGH-FREQUENCY TIME LEFT WITH FAMILY · CAPPED AT ${fmt(state.proximityWeeks)} WEEKS.`,
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
        </View>
      </View>

      <Mono size={10} spacing={0.22} style={{ marginBottom: 6 }}>
        YOU ARE LIVING WEEK
      </Mono>
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
        <Card dark style={{ padding: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <Mono size={9.5} spacing={0.18} color={C.darkLabel}>
              ACTIVE GOAL
            </Mono>
            <Mono size={9.5} spacing={0.14} color={C.gold}>
              WEEK {goalCurrentWeek(goal, calc.lived)} OF {goal.weeks}
            </Mono>
          </View>
          <Serif size={21} weight="medium" color={C.paper} style={{ marginBottom: 14 }}>
            {goal.name}
          </Serif>
          <ProgressStrip weeks={goal.weeks} current={goalCurrentWeek(goal, calc.lived)} variant="dark" height={20} />
          <Serif size={14} italic color={C.darkLabel} style={{ marginTop: 12 }}>
            {isGoalFinalWeek(goal, calc.lived)
              ? "Final week. Your next review will ask you to reflect on the whole goal."
              : `${goal.weeks - goalCurrentWeek(goal, calc.lived)} weeks of pencil left before this inks.`}
          </Serif>
        </Card>
      ) : (
        <Card style={{ borderStyle: 'dashed', borderColor: C.inputLine, borderWidth: 1.5 }}>
          <Mono size={9.5} spacing={0.18} style={{ marginBottom: 8 }}>
            NO ACTIVE GOAL
          </Mono>
          <Serif size={17} italic color={C.muted}>
            Nothing penciled in. Open Goals to draft one against a real window.
          </Serif>
        </Card>
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
              {ci.firstEver
                ? 'Lock this week into ink. It sets your weekly check-in day.'
                : 'It’s your day. Lock this week into ink.'}
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
        Come back on {ci.weekdayName} to lock this week into ink. The grid waits for no one.
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
