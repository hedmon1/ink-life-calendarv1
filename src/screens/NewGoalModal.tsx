import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DraftStrip } from '../components/Bits';
import { ModalShell } from '../components/ModalShell';
import { Mono, Serif } from '../components/Type';
import { useStore } from '../store/store';
import { C } from '../theme';

const MIN_W = 1;
const MAX_W = 26;

export function NewGoalModal() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { calc, addGoal } = useStore();
  const [name, setName] = useState('');
  const [weeks, setWeeks] = useState(12);

  const inPrime = Math.max(0, Math.min(weeks, calc.primeEnd - calc.lived));
  const allInPrime = inPrime >= weeks;

  const create = () => {
    if (!name.trim()) return;
    addGoal({ name, weeks });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    nav.goBack();
  };

  return (
    <ModalShell title="NEW GOAL" closeLabel="CANCEL">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Serif size={28} weight="medium" style={{ marginBottom: 6 }}>
            Name your goal.
          </Serif>
          <Serif size={15} italic color={C.muted} style={{ marginBottom: 24 }}>
            One real thing, with a hard time frame.
          </Serif>

          <Mono size={9.5} spacing={0.18} style={{ marginBottom: 8 }}>
            GOAL
          </Mono>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Run a sub-3:30 marathon"
            placeholderTextColor={C.faint}
            autoFocus
            style={{
              fontFamily: 'Inter_400Regular_Italic',
              fontSize: 21,
              color: C.ink,
              borderBottomWidth: 1,
              borderBottomColor: C.inputLine,
              paddingBottom: 10,
              marginBottom: 26,
            }}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Mono size={9.5} spacing={0.16} color={C.body}>
              TIME FRAME
            </Mono>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <StepBtn label="−" onPress={() => setWeeks((w) => Math.max(MIN_W, w - 1))} />
              <Serif size={24} weight="medium" style={{ minWidth: 86, textAlign: 'center' }}>
                {weeks} wks
              </Serif>
              <StepBtn label="+" onPress={() => setWeeks((w) => Math.min(MAX_W, w + 1))} />
            </View>
          </View>

          <View style={{ marginBottom: 14 }}>
            <DraftStrip weeks={weeks} />
          </View>

          <Serif size={14.5} italic color={C.muted} style={{ marginBottom: 24 }}>
            Starts now — it becomes your active goal.{' '}
            {allInPrime ? `All ${weeks} weeks land inside your prime window.` : `${inPrime} of ${weeks} weeks land inside your prime window.`}
          </Serif>

          <Pressable onPress={create} style={{ backgroundColor: name.trim() ? C.ink : C.inputLine, borderRadius: 8, paddingVertical: 16, alignItems: 'center' }}>
            <Mono size={11} spacing={0.18} color={C.paper}>
              PENCIL IT IN
            </Mono>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ModalShell>
  );
}

function StepBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: C.ink, alignItems: 'center', justifyContent: 'center' }}>
      <Serif size={21} color={C.ink} style={{ lineHeight: 23 }}>
        {label}
      </Serif>
    </Pressable>
  );
}
