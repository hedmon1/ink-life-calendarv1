import { RouteProp, useRoute } from '@react-navigation/native';
import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalShell } from '../components/ModalShell';
import { Stars } from '../components/Stars';
import { Mono, Serif } from '../components/Type';
import { fmt, weekDateRange } from '../lib/calc';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/store';
import { C } from '../theme';

export function WeekDetailModal() {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<RootStackParamList, 'WeekDetail'>>();
  const { state, recordFor } = useStore();
  const rec = recordFor(route.params.weekIndex);
  const goal = rec?.goalId ? state.goals.find((g) => g.id === rec.goalId) : undefined;

  return (
    <ModalShell title="INKED WEEK">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        {!rec ? (
          <Serif size={17} italic color={C.muted} style={{ paddingVertical: 30, textAlign: 'center' }}>
            This week is still pencil. Nothing inked yet.
          </Serif>
        ) : (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <Serif size={30} weight="medium">
                Week {fmt(rec.weekIndex + 1)}
              </Serif>
              <Stars value={rec.rating} size={16} />
            </View>
            <Mono size={9} spacing={0.14} color={C.muted} style={{ marginBottom: 16 }}>
              {weekDateRange(state.birthYear, rec.weekIndex)}
            </Mono>

            {goal && (
              <View style={{ alignSelf: 'flex-start', backgroundColor: C.goalTagBg, borderWidth: 1, borderColor: C.goalTagBorder, borderRadius: 3, paddingVertical: 7, paddingHorizontal: 11, marginBottom: 16 }}>
                <Mono size={9} spacing={0.16} color={C.goalTagText}>
                  GOAL: {goal.name.toUpperCase()}
                </Mono>
              </View>
            )}

            {rec.photos.map((uri, i) => (
              <Image key={i} source={{ uri }} style={{ width: '100%', height: 260, borderRadius: 12, backgroundColor: C.pencil, marginBottom: 14 }} />
            ))}

            <Serif size={23} italic style={{ lineHeight: 32, marginBottom: 20 }}>
              “{rec.sentence}”
            </Serif>

            <Mono size={8} spacing={0.16} color={C.faint}>
              INK · NO EDITS, NO DELETIONS
            </Mono>
          </>
        )}
      </ScrollView>
    </ModalShell>
  );
}
