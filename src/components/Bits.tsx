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

/** Row of goal-week cells. `current` is 1-based; cells before it are inked, it is the dashed draft, the rest upcoming. */
export function ProgressStrip({
  weeks,
  current,
  variant = 'light',
  height = 18,
}: {
  weeks: number;
  current: number; // 0 = none in progress (all done)
  variant?: 'dark' | 'light';
  height?: number;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {Array.from({ length: weeks }).map((_, k) => {
        const idx = k + 1;
        const done = current === 0 ? true : idx < current;
        const isCurrent = idx === current;
        let style: ViewStyle;
        if (variant === 'dark') {
          if (isCurrent) style = { backgroundColor: C.paper, borderWidth: 1.5, borderColor: C.gold, borderStyle: 'dashed' };
          else if (done) style = { backgroundColor: C.darkBar, borderWidth: 1.5, borderColor: C.amber };
          else style = { backgroundColor: C.darkBar, borderWidth: 1.5, borderColor: 'rgba(217,166,89,0.25)' };
        } else {
          if (isCurrent) style = { backgroundColor: C.paper, borderWidth: 1.5, borderColor: C.gold, borderStyle: 'dashed' };
          else if (done) style = { backgroundColor: C.ink, borderWidth: 1.5, borderColor: C.amber };
          else style = { backgroundColor: C.pencil, borderWidth: 1.5, borderColor: C.pencilBorder };
        }
        return <View key={k} style={[{ flex: 1, height, borderRadius: 4 }, style]} />;
      })}
    </View>
  );
}

/** Dashed pencil draft strip used when penciling a new goal. */
export function DraftStrip({ weeks, height = 14 }: { weeks: number; height?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {Array.from({ length: weeks }).map((_, k) => (
        <View
          key={k}
          style={{ flex: 1, height, borderRadius: 3, backgroundColor: C.gold, borderWidth: 1.5, borderColor: C.ink, borderStyle: 'dashed' }}
        />
      ))}
    </View>
  );
}
