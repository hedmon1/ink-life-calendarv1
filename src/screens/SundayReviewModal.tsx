import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
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

  const addPhoto = async () => {
    if (photos.length >= 3) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled && res.assets[0]) setPhotos((p) => [...p, res.assets[0].uri].slice(0, 3));
  };

  const lock = () => {
    lockCurrentWeek({ sentence, rating, photos });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    nav.goBack();
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
                Locking now sets {todayName()} as your weekly check-in day. From here on, you can only lock on {todayName()}s.
              </Serif>
            </View>
          )}

          <Serif size={16} color={C.body} style={{ lineHeight: 25, marginBottom: 12 }}>
            This week becomes ink the moment you lock it. You have{' '}
            <Serif size={16} weight="semi" color={C.amber}>
              {fmt(calc.primeLeft)} weeks
            </Serif>{' '}
            of your physical prime and an estimated{' '}
            <Serif size={16} weight="semi" color={C.slate}>
              {fmt(calc.proxLeft)} weeks
            </Serif>{' '}
            near your family before the next move. Did this week reflect those realities?
          </Serif>

          {goalEnds && (
            <View style={{ backgroundColor: C.goalTagBg, borderWidth: 1, borderColor: C.goalTagBorder, borderRadius: 8, padding: 12, marginBottom: 14 }}>
              <Mono size={8.5} spacing={0.14} color={C.goalTagText} style={{ marginBottom: 4 }}>
                GOAL ENDS THIS WEEK
              </Mono>
              <Serif size={14.5} italic color={C.goalTagText2}>
                “{goal!.name}” closes now. Reflect on the whole {goal!.weeks} weeks, not just this one.
              </Serif>
            </View>
          )}

          {goal && !goalEnds && (
            <View style={{ backgroundColor: C.goalTagBg, borderWidth: 1, borderColor: C.goalTagBorder, borderRadius: 8, padding: 12, marginBottom: 14 }}>
              <Mono size={8.5} spacing={0.14} color={C.goalTagText} style={{ marginBottom: 4 }}>
                ACTIVE GOAL · WEEK {goalCurrentWeek(goal, calc.lived)} OF {goal.weeks}
              </Mono>
              <Serif size={14.5} italic color={C.goalTagText2}>
                “{goal.name}” — did this week move it forward? Say so in your sentence.
              </Serif>
            </View>
          )}

          <Mono size={8.5} spacing={0.18} style={{ marginBottom: 7 }}>
            IMAGES OF THE WEEK · UP TO THREE
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
              fontFamily: 'Newsreader_400Regular_Italic',
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
            NO EDITS. NO DELETIONS. INK IS INK.
          </Mono>
        </ScrollView>
      </KeyboardAvoidingView>
    </ModalShell>
  );
}

function todayName(): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
}
