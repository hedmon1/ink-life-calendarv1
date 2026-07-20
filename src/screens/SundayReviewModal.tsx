import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalShell } from '../components/ModalShell';
import { Stars } from '../components/Stars';
import { Mono, Serif } from '../components/Type';
import { fmt } from '../lib/calc';
import { goalCurrentWeek, isGoalFinalWeek } from '../lib/goals';
import { CURRENT_WEEK_DRAFT } from '../store/seed';
import { useStore } from '../store/store';
import { C } from '../theme';

export function SundayReviewModal() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { calc, state, activeGoal, lockCurrentWeek, recordFor } = useStore();
  const existing = recordFor(calc.lived);
  const goal = activeGoal();
  const goalEnds = goal && isGoalFinalWeek(goal, calc.lived);
  const firstEver = state.checkinWeekday == null;

  const [photos, setPhotos] = useState<string[]>(existing?.photos ?? []);
  const [sentence, setSentence] = useState(existing?.sentence ?? CURRENT_WEEK_DRAFT);
  const [rating, setRating] = useState(existing?.rating ?? 4);
  const [celebrating, setCelebrating] = useState(false);

  const addPhoto = async () => {
    if (photos.length >= 3) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled && res.assets[0]) setPhotos((p) => [...p, res.assets[0].uri].slice(0, 3));
  };

  const lock = () => {
    Keyboard.dismiss();
    lockCurrentWeek({ sentence, rating, photos });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setCelebrating(true); // brief pencil→ink moment, then the modal closes itself
  };

  return (
    <ModalShell title="WEEKLY CHECK-IN" closeLabel="CANCEL">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <Serif size={30} weight="medium">
              Week {fmt(calc.weekNumber)}
            </Serif>
            <Mono size={9} spacing={0.14} color={C.muted}>
              PENCIL → INK
            </Mono>
          </View>

          {firstEver && (
            <View style={{ backgroundColor: C.ink, borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <Mono size={8.5} spacing={0.16} color={C.gold} style={{ marginBottom: 4 }}>
                YOUR FIRST CHECK-IN
              </Mono>
              <Serif size={14.5} italic color={C.paper}>
                This sets {todayName()} as your weekly check-in day.
              </Serif>
            </View>
          )}

          <Serif size={16} color={C.body} style={{ lineHeight: 25, marginBottom: 14 }}>
            <Serif size={16} weight="semi" color={C.amber}>
              {fmt(calc.primeLeft)}
            </Serif>{' '}
            prime weeks ·{' '}
            <Serif size={16} weight="semi" color={C.slate}>
              {fmt(calc.proxLeft)}
            </Serif>{' '}
            near your people. Did this week count?
          </Serif>

          {goalEnds && (
            <View style={{ backgroundColor: C.goalTagBg, borderWidth: 1, borderColor: C.goalTagBorder, borderRadius: 8, padding: 12, marginBottom: 14 }}>
              <Mono size={8.5} spacing={0.14} color={C.goalTagText} style={{ marginBottom: 4 }}>
                GOAL ENDS THIS WEEK
              </Mono>
              <Serif size={14.5} italic color={C.goalTagText2}>
                Last week of “{goal!.name}”. Mark it done in Goals.
              </Serif>
            </View>
          )}

          {goal && !goalEnds && (
            <View style={{ backgroundColor: C.goalTagBg, borderWidth: 1, borderColor: C.goalTagBorder, borderRadius: 8, padding: 12, marginBottom: 14 }}>
              <Mono size={8.5} spacing={0.14} color={C.goalTagText} style={{ marginBottom: 4 }}>
                GOAL · WEEK {goalCurrentWeek(goal, calc.lived)} OF {goal.weeks}
              </Mono>
              <Serif size={14.5} italic color={C.goalTagText2}>
                “{goal.name}” — did it move forward?
              </Serif>
            </View>
          )}

          <Mono size={8.5} spacing={0.18} style={{ marginBottom: 7 }}>
            PHOTOS · UP TO 3
          </Mono>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {photos.map((uri, i) => (
              <Image key={i} source={{ uri }} style={{ width: 96, height: 96, borderRadius: 8, borderWidth: 1, borderColor: C.cardLine, backgroundColor: C.pencil }} />
            ))}
            {photos.length < 3 && (
              <Pressable
                onPress={addPhoto}
                style={{ width: 96, height: 96, borderRadius: 8, borderWidth: 1.5, borderColor: C.faint, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                <Serif size={22} color={C.muted} style={{ lineHeight: 24 }}>
                  +
                </Serif>
                <Mono size={7.5} spacing={0.14}>
                  ADD
                </Mono>
              </Pressable>
            )}
          </View>

          <Mono size={8.5} spacing={0.18} style={{ marginBottom: 4 }}>
            ONE SENTENCE
          </Mono>
          <TextInput
            value={sentence}
            onChangeText={setSentence}
            placeholder="What is this week remembered by?"
            placeholderTextColor={C.faint}
            style={{
              fontFamily: 'Inter_400Regular_Italic',
              fontSize: 16.5,
              color: C.ink,
              borderBottomWidth: 1,
              borderBottomColor: C.inputLine,
              paddingVertical: 7,
              marginBottom: 18,
            }}
          />

          <View style={{ marginBottom: 18 }}>
            <Mono size={8.5} spacing={0.18} style={{ marginBottom: 8 }}>
              FULFILLMENT
            </Mono>
            <Stars value={rating} size={28} onChange={setRating} />
          </View>

          <Pressable
            onPress={lock}
            style={{ backgroundColor: C.ink, borderRadius: 8, paddingVertical: 17, alignItems: 'center', marginBottom: 12 }}
          >
            <Mono size={10.5} spacing={0.16} color={C.paper}>
              {existing ? 'RE-LOCK THIS WEEK' : 'LOCK IN INK'}
            </Mono>
          </Pressable>

          <Mono size={8} spacing={0.16} color={C.faint} style={{ textAlign: 'center' }}>
            INK IS INK. NO EDITS.
          </Mono>
        </ScrollView>
      </KeyboardAvoidingView>

      {celebrating && <LockCelebration weekNumber={calc.weekNumber} onDone={() => nav.goBack()} />}
    </ModalShell>
  );
}

/** A quiet full-screen beat: one box turns from pencil to ink, then the modal closes. */
function LockCelebration({ weekNumber, onDone }: { weekNumber: number; onDone: () => void }) {
  const fade = useRef(new Animated.Value(0)).current;
  const ink = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fade, { toValue: 1, duration: 160, useNativeDriver: false }),
      Animated.timing(ink, { toValue: 1, duration: 380, useNativeDriver: false }),
      Animated.delay(700),
    ]).start(() => onDone());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const milestone =
    weekNumber % 52 === 0 ? `ROW ${weekNumber / 52} COMPLETE` : weekNumber % 100 === 0 ? `A ROUND ${fmt(weekNumber)}` : null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: C.bg,
        opacity: fade,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
      }}
    >
      <View style={{ width: 22, height: 22, borderRadius: 5, backgroundColor: C.pencil, borderWidth: 0.5, borderColor: C.pencilBorder }}>
        <Animated.View
          style={{ position: 'absolute', top: -0.5, left: -0.5, right: -0.5, bottom: -0.5, borderRadius: 5, backgroundColor: C.ink, opacity: ink }}
        />
      </View>
      <Mono size={11} spacing={0.22} color={C.ink}>
        WEEK {fmt(weekNumber)} IS INK
      </Mono>
      {milestone && (
        <Mono size={9} spacing={0.18} color={C.amber}>
          {milestone}
        </Mono>
      )}
    </Animated.View>
  );
}

function todayName(): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
}
