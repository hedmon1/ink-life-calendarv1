import Constants from 'expo-constants';
import React from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../components/Bits';
import { ModalShell } from '../components/ModalShell';
import { Mono, Serif } from '../components/Type';
import { PRIVACY_URL, SUPPORT_URL } from '../config/appConfig';
import { C } from '../theme';

export function SettingsModal() {
  const insets = useSafeAreaInsets();
  const version = Constants.expoConfig?.version ?? '1.0';

  return (
    <ModalShell title="ABOUT">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <Card style={{ marginBottom: 18 }}>
          <Mono size={9} spacing={0.16} color={C.muted} style={{ marginBottom: 6 }}>
            INK · VERSION {version}
          </Mono>
          <Serif size={18} weight="medium" style={{ marginBottom: 8 }}>
            Free, and yours alone.
          </Serif>
          <Serif size={14.5} italic color={C.muted} style={{ lineHeight: 22 }}>
            No account, no subscription. Your weeks, photos and goals live on this device — nothing is uploaded.
          </Serif>
        </Card>

        <Row label="PRIVACY POLICY" onPress={() => Linking.openURL(PRIVACY_URL)} />
        <Row label="SUPPORT" onPress={() => Linking.openURL(SUPPORT_URL)} />
      </ScrollView>
    </ModalShell>
  );
}

function Row({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ borderWidth: 1, borderColor: C.inputLine, borderRadius: 8, paddingVertical: 13, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}
    >
      <Mono size={9.5} spacing={0.16} color={C.ink}>
        {label}
      </Mono>
      <View>
        <Serif size={15} color={C.muted} style={{ lineHeight: 15 }}>
          ↗
        </Serif>
      </View>
    </Pressable>
  );
}
