import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../components/Bits';
import { ModalShell } from '../components/ModalShell';
import { Mono, Serif } from '../components/Type';
import { MANAGE_SUBSCRIPTIONS_URL, PRIVACY_URL, TERMS_URL } from '../config/appConfig';
import { restorePurchases } from '../lib/purchases';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../store/auth';
import { C } from '../theme';

export function AccountModal() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { configured, user, entitlement, signOutUser, deleteAccount, refreshEntitlement } = useAuth();
  const [busy, setBusy] = useState(false);

  const statusLine = () => {
    switch (entitlement.status) {
      case 'dev':
        return 'Local mode — no account backend configured yet.';
      case 'lifetime':
        return 'Founding member — free for life.';
      case 'subscribed':
        return 'Ink Pro — subscription active.';
      case 'trial':
        return `Free trial — ${entitlement.trialDaysLeft} day${entitlement.trialDaysLeft === 1 ? '' : 's'} left.`;
      case 'expired':
        return 'Trial ended — subscribe to keep inking.';
    }
  };

  const onRestore = async () => {
    setBusy(true);
    const ok = await restorePurchases().catch(() => false);
    await refreshEntitlement();
    setBusy(false);
    Alert.alert(ok ? 'Restored' : 'Nothing to restore', ok ? 'Your subscription is active.' : 'No active subscription was found for this Apple ID.');
  };

  const onSignOut = () =>
    Alert.alert('Sign out?', 'Your weeks stay backed up to your account.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOutUser().catch(() => {}) },
    ]);

  const onDelete = () => {
    const run = (password: string) => {
      if (!password) return;
      setBusy(true);
      deleteAccount(password)
        .then(() => Alert.alert('Account deleted', 'Your account and cloud data are gone. The app keeps working on this device.'))
        .catch(() => Alert.alert('Couldn’t delete', 'Check your password and connection, then try again.'))
        .finally(() => setBusy(false));
    };
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Delete account?',
        'This permanently deletes your account and everything backed up to it. Enter your password to confirm.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete forever', style: 'destructive', onPress: (pw?: string) => run(pw ?? '') },
        ],
        'secure-text'
      );
    } else {
      Alert.alert('Delete account', 'Deletion needs your password — available on iOS.');
    }
  };

  const Btn = ({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) => (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={{ borderWidth: 1, borderColor: danger ? C.goalTagBorder : C.inputLine, borderRadius: 8, paddingVertical: 13, alignItems: 'center', marginBottom: 10, opacity: busy ? 0.5 : 1 }}
    >
      <Mono size={9.5} spacing={0.16} color={danger ? C.amber : C.ink}>
        {label}
      </Mono>
    </Pressable>
  );

  return (
    <ModalShell title="ACCOUNT">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <Card style={{ marginBottom: 18 }}>
          <Mono size={9} spacing={0.16} color={C.muted} style={{ marginBottom: 6 }}>
            {configured && user ? 'SIGNED IN AS' : 'ACCOUNT'}
          </Mono>
          <Serif size={18} weight="medium" style={{ marginBottom: 8 }}>
            {configured && user ? user.email : 'Not signed in'}
          </Serif>
          <Serif size={14.5} italic color={C.muted}>
            {statusLine()}
          </Serif>
        </Card>

        {configured && user ? (
          <>
            {(entitlement.status === 'subscribed' || entitlement.status === 'expired') && (
              <Btn label="MANAGE SUBSCRIPTION" onPress={() => Linking.openURL(MANAGE_SUBSCRIPTIONS_URL)} />
            )}
            <Btn label="RESTORE PURCHASES" onPress={onRestore} />
            <Btn label="SIGN OUT" onPress={onSignOut} />
            <Btn label="DELETE ACCOUNT" onPress={onDelete} danger />
          </>
        ) : (
          <Serif size={14.5} italic color={C.muted} style={{ marginBottom: 14 }}>
            Accounts, cloud backup and membership switch on once the backend is configured (see store/APP_STORE_CHECKLIST.md).
          </Serif>
        )}

        {__DEV__ && !configured && <Btn label="PREVIEW PAYWALL (DEV)" onPress={() => nav.navigate('Paywall')} />}

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 12 }}>
          <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} hitSlop={8}>
            <Mono size={8.5} spacing={0.12} color={C.faint}>
              PRIVACY
            </Mono>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(TERMS_URL)} hitSlop={8}>
            <Mono size={8.5} spacing={0.12} color={C.faint}>
              TERMS
            </Mono>
          </Pressable>
        </View>
      </ScrollView>
    </ModalShell>
  );
}
