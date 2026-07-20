import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { C } from '../theme';

export function Stars({
  value,
  size = 14,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (n: number) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <Text style={{ fontSize: size, lineHeight: size * 1.1, color: n <= value ? C.amber : C.starOff }}>★</Text>
        );
        if (!onChange) return <View key={n}>{star}</View>;
        return (
          <Pressable key={n} hitSlop={6} onPress={() => onChange(n)}>
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}
