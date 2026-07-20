import React from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { C } from '../theme';
import { Mono } from './Type';

export function Card({ children, style, dark }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; dark?: boolean }) {
  return (
    <View
      style={[
        {
          backgroundColor: dark ? C.ink : C.paper,
          borderWidth: dark ? 0 : 1,
          borderColor: C.cardLine,
          borderRadius: 12,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Swatch({ color, size = 10, ring }: { color: string; size?: number; ring?: string }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 2,
        backgroundColor: color,
        borderWidth: ring ? 1.5 : 0,
        borderColor: ring,
      }}
    />
  );
}

export function OverlayToggle({
  active,
  color,
  label,
  onPress,
}: {
  active: boolean;
  color: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        paddingVertical: 9,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: C.ink,
        borderRadius: 4,
        backgroundColor: active ? color : 'transparent',
      }}
    >
      <Swatch color={color} size={8} ring="rgba(27,23,16,0.3)" />
      <Mono size={9.5} spacing={0.12} color={active ? C.paper : C.ink} medium>
        {label}
      </Mono>
    </Pressable>
  );
}

/** Row of goal-week cells. A week is white until it's inked, then black.
 * When `startWeek` + `onCellPress` are given, inked weeks that have a record become tappable. */
export function ProgressStrip({
  weeks,
  current,
  height = 18,
  startWeek,
  recordWeeks,
  onCellPress,
}: {
  weeks: number;
  current: number; // 0 = none in progress (all done); else 1-based week in progress (fallback when no records)
  height?: number;
  startWeek?: number;
  recordWeeks?: Set<number>;
  onCellPress?: (weekIndex: number) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {Array.from({ length: weeks }).map((_, k) => {
        const idx = k + 1;
        const weekIndex = startWeek != null ? startWeek + k : -1;
        // inked (black) once the week has a saved record; otherwise an uninked white square
        const inked = recordWeeks != null && startWeek != null ? recordWeeks.has(weekIndex) : current === 0 ? true : idx < current;
        const style: ViewStyle = inked
          ? { backgroundColor: C.ink }
          : { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.inputLine };
        const base = { flex: 1, height, borderRadius: 4 } as const;
        const tappable = !!(onCellPress && startWeek != null && (!recordWeeks || recordWeeks.has(weekIndex)));
        if (tappable) {
          return <Pressable key={k} hitSlop={6} onPress={() => onCellPress!(weekIndex)} style={[base, style]} />;
        }
        return <View key={k} style={[base, style]} />;
      })}
    </View>
  );
}

/** Draft strip for a new goal — all weeks start uninked (white). */
export function DraftStrip({ weeks, height = 14 }: { weeks: number; height?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {Array.from({ length: weeks }).map((_, k) => (
        <View key={k} style={{ flex: 1, height, borderRadius: 3, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.inputLine }} />
      ))}
    </View>
  );
}
