import React from 'react';
import { View } from 'react-native';
import { C } from '../theme';

export function ProgressBar({
  pct,
  color,
  track = C.pencil,
  height = 6,
}: {
  pct: number; // 0..1
  color: string;
  track?: string;
  height?: number;
}) {
  const w = Math.max(0, Math.min(1, pct));
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${w * 100}%`, backgroundColor: color, borderRadius: height / 2 }} />
    </View>
  );
}
