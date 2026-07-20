import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mono, Serif } from '../components/Type';
import { clampBirthYear, lifeCalc, fmt } from '../lib/calc';
import { useStore } from '../store/store';
import { C } from '../theme';

export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useStore();
  const [year, setYear] = useState('1998');

  const preview = lifeCalc(Number(year) || 1998);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top + 40, paddingHorizontal: 28, paddingBottom: insets.bottom + 24 }}>
      <Mono size={11} spacing={0.24} style={{ marginBottom: 22 }}>
        A LIFE CALENDAR IN TWO LAYERS
      </Mono>
      <Serif size={56} weight="semi" italic style={{ marginBottom: 6 }}>
        Ink.
      </Serif>
      <Serif size={22} italic color={C.muted} style={{ marginBottom: 36 }}>
        You have {fmt(preview.left)} weeks left. Probably fewer.
      </Serif>

      <Mono size={11} spacing={0.18} style={{ marginBottom: 10 }}>
        BORN
      </Mono>
      <TextInput
        value={year}
        onChangeText={setYear}
        keyboardType="number-pad"
        maxLength={4}
        style={{
          fontFamily: 'IBMPlexMono_500Medium',
          fontSize: 34,
          color: C.ink,
          borderBottomWidth: 1,
          borderBottomColor: C.inputLine,
          paddingBottom: 8,
          marginBottom: 28,
        }}
      />

      <View style={{ flexDirection: 'row', gap: 26, marginBottom: 12 }}>
        <Stat label="THIS WEEK" value={fmt(preview.weekNumber)} />
        <Stat label="PRIME LEFT" value={fmt(preview.primeLeft)} />
        <Stat label="PROXIMITY" value={fmt(preview.proxLeft)} />
      </View>
      <Serif size={15} italic color={C.muted}>
        The grid redraws around you. Each box is one week of about 90 years.
      </Serif>

      <View style={{ flex: 1 }} />

      <Pressable
        onPress={() => completeOnboarding(clampBirthYear(Number(year) || 1998))}
        style={{ backgroundColor: C.ink, borderRadius: 6, paddingVertical: 18, alignItems: 'center' }}
      >
        <Mono size={12} spacing={0.18} color={C.paper}>
          DRAW MY GRID →
        </Mono>
      </Pressable>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Serif size={30} weight="medium" style={{ marginBottom: 2 }}>
        {value}
      </Serif>
      <Mono size={8.5} spacing={0.14} color={C.faint}>
        {label}
      </Mono>
    </View>
  );
}
