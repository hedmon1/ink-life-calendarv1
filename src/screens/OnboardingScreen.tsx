import React, { useEffect, useRef, useState } from 'react';
import { Animated, InputAccessoryView, Keyboard, KeyboardEvent, Platform, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mono, Serif } from '../components/Type';
import { clampBirthYear, fmt, lifeCalc } from '../lib/calc';
import { useStore } from '../store/store';
import { C } from '../theme';

const ACCESSORY_ID = 'onboarding-year-done';

export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useStore();
  const [year, setYear] = useState('1998');

  const preview = lifeCalc(Number(year) || 1998);

  // Slide the bottom button up in sync with the iOS keyboard so it's always reachable.
  const restPad = insets.bottom + 18;
  const pad = useRef(new Animated.Value(restPad)).current;
  useEffect(() => {
    if (Platform.OS !== 'ios') return; // Android resizes the window automatically
    const show = (e: KeyboardEvent) =>
      Animated.timing(pad, { toValue: e.endCoordinates.height + 16, duration: e.duration || 250, useNativeDriver: false }).start();
    const hide = (e: KeyboardEvent) =>
      Animated.timing(pad, { toValue: restPad, duration: e.duration || 250, useNativeDriver: false }).start();
    const s = Keyboard.addListener('keyboardWillShow', show);
    const h = Keyboard.addListener('keyboardWillHide', hide);
    return () => {
      s.remove();
      h.remove();
    };
  }, [pad, restPad]);

  const submit = () => {
    Keyboard.dismiss();
    completeOnboarding(clampBirthYear(Number(year) || 1998));
  };

  return (
    <Animated.View style={{ flex: 1, backgroundColor: C.bg, paddingBottom: pad }}>
      {/* tap anywhere on the background to close the keyboard */}
      <Pressable onPress={Keyboard.dismiss} style={{ flex: 1, paddingTop: insets.top + 40, paddingHorizontal: 28 }}>
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
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={Keyboard.dismiss}
          inputAccessoryViewID={Platform.OS === 'ios' ? ACCESSORY_ID : undefined}
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
          The grid redraws around you. Each box is one week of about 80 years.
        </Serif>

        <View style={{ flex: 1, minHeight: 20 }} />

        <Pressable onPress={submit} style={{ backgroundColor: C.ink, borderRadius: 6, paddingVertical: 18, alignItems: 'center' }}>
          <Mono size={12} spacing={0.18} color={C.paper}>
            DRAW MY GRID →
          </Mono>
        </Pressable>
      </Pressable>

      {/* iOS number-pad has no return key — give it a Done bar */}
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={ACCESSORY_ID}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              backgroundColor: C.paper,
              borderTopWidth: 1,
              borderTopColor: C.line,
              paddingHorizontal: 18,
              paddingVertical: 10,
            }}
          >
            <Pressable onPress={Keyboard.dismiss} hitSlop={10}>
              <Mono size={11} spacing={0.18} color={C.amber}>
                DONE
              </Mono>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </Animated.View>
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
