import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';
import { Mono, Serif } from './Type';

/** Full-screen cream modal page with a top bar + Close — no dim void above. */
export function ModalShell({
  title,
  children,
  closeLabel = 'CLOSE',
}: {
  title?: string;
  children: React.ReactNode;
  closeLabel?: string;
}) {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 22,
          paddingBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {title ? (
          <Mono size={10} spacing={0.18} color={C.muted} medium>
            {title}
          </Mono>
        ) : (
          <View />
        )}
        <Pressable onPress={() => nav.goBack()} hitSlop={12} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Mono size={10} spacing={0.16} color={C.muted}>
            {closeLabel}
          </Mono>
          <Serif size={19} color={C.muted} style={{ lineHeight: 19 }}>
            ×
          </Serif>
        </Pressable>
      </View>
      {children}
    </View>
  );
}
