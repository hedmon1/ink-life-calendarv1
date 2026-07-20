import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Swatch } from '../components/Bits';
import { ModalShell } from '../components/ModalShell';
import { Mono, Serif } from '../components/Type';
import { RootStackParamList } from '../navigation/types';
import { C } from '../theme';

export function InfoModal() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Info'>>();

  return (
    <ModalShell>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 26 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <Swatch color={params.accent} size={12} />
          <Mono size={11} spacing={0.2} color={params.accent}>
            {params.label}
          </Mono>
        </View>

        {!!params.stat && (
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
            <Serif size={54} weight="medium">
              {params.stat}
            </Serif>
            <Serif size={18} italic color={C.muted}>
              {params.statUnit ?? 'weeks left'}
            </Serif>
          </View>
        )}

        <Serif size={19} color={C.body} style={{ lineHeight: 29, marginBottom: 18 }}>
          {params.body}
        </Serif>

        {!!params.note && (
          <Mono size={9.5} spacing={0.14} color={C.faint} style={{ lineHeight: 16, marginBottom: 26 }}>
            {params.note}
          </Mono>
        )}

        <Pressable onPress={() => nav.goBack()} style={{ borderWidth: 1.5, borderColor: C.ink, borderRadius: 6, paddingVertical: 14, alignItems: 'center' }}>
          <Mono size={10} spacing={0.18} color={C.ink}>
            GOT IT
          </Mono>
        </Pressable>
      </ScrollView>
    </ModalShell>
  );
}
