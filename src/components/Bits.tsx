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
      <Swatch color={color} size={8} ring="rgba(255,255,255,0.22)" />
      <Mono size={9.5} spacing={0.12} color={active ? C.paper : C.ink} medium>
        {label}
      </Mono>
    </Pressable>
  );
}

