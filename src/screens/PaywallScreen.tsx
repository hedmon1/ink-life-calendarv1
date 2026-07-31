import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mono, Serif } from '../components/Type';
import { PRICE_LABEL, PRIVACY_URL, TERMS_URL } from '../config/appConfig';
import { fmt } from '../lib/calc';
import { monthlyPriceLabel, purchaseMonthly, purchasesAvailable, restorePurchases } from '../lib/purchases';
import { useAuth } from '../store/auth';
import { useStore } from '../store/store';
import { C } from '../theme';

/** Full-screen gate shown when the 14-day trial has ended and there's no subscription. */
export function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const { calc } = useStore();
  const { signOutUser, refreshEntitlement, configured } = useAuth();
  const [busy, setBusy] = useState(false);
  const [price, setPrice] = useState(PRICE_LABEL);
  // when the trial truly expires the paywall is the root (no back-stack); a
  // back-stack only exists when it's opened as a preview from Account
  const isPreview = nav.canGoBack();

  useEffect(() => {
    monthlyPriceLabel().then((p) => p && setPrice(`${p} / month`));
  }, []);

  const subscribe = async () => {
    if (!purchasesAvailable()) {
      Alert.alert('Almost there', 'Purchases go live in the TestFlight/App Store build once the store products are configured.');
      return;
    }
    setBusy(true);
    try {
      const ok = await purchaseMonthly();
      await refreshEntitlement();
      if (!ok) Alert.alert('Not completed', 'The purchase didn’t finish. You weren’t charged.');
    } catch (e: any) {
      if (!String(e?.message ?? e).includes('cancel')) Alert.alert('Purchase failed', 'Nothing was charged. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    setBusy(true);
    const ok = await restorePurchases().catch(() => false);
    await refreshEntitlement();
    setBusy(false);
    if (!ok) Alert.alert('Nothing to restore', 'No active subscription found for this Apple ID.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 36, paddingBottom: insets.bottom + 22, paddingHorizontal: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <Mono size={10} spacing={0.22} color={C.amber}>
            YOUR TRIAL HAS ENDED
          </Mono>
          {isPreview && (
            <Pressable onPress={() => nav.goBack()} hitSlop={10}>
              <Mono size={10} spacing={0.16} color={C.muted}>
                CLOSE ×
              </Mono>
            </Pressable>
          )}
        </View>
        <Serif size={40} weight="medium" style={{ lineHeight: 46, marginBottom: 10 }}>
          Keep inking.
        </Serif>
        <Serif size={17} italic color={C.muted} style={{ lineHeight: 26, marginBottom: 26 }}>
          You are living week {fmt(calc.weekNumber)} of {fmt(calc.total)}. The grid only works if you keep showing up.
        </Serif>

        <View style={{ gap: 10, marginBottom: 26 }}>
          <Line text="The full grid, check-ins, goals and memories" />
          <Line text="Cloud backup — your weeks follow your account" />
          <Line text="Live home and lock-screen widgets" />
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ backgroundColor: C.paper, borderWidth: 1, borderColor: C.cardLine, borderRadius: 14, padding: 18, marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <Mono size={9.5} spacing={0.16} color={C.muted}>
              INK PRO
            </Mono>
            <Serif size={20} weight="medium">
              {price}
            </Serif>
          </View>
          <Pressable onPress={subscribe} disabled={busy} style={{ backgroundColor: C.ink, borderRadius: 8, paddingVertical: 16, alignItems: 'center', opacity: busy ? 0.6 : 1 }}>
            {busy ? (
              <ActivityIndicator color={C.paper} />
            ) : (
              <Mono size={11} spacing={0.18} color={C.paper}>
                SUBSCRIBE
              </Mono>
            )}
          </Pressable>
        </View>

        <Mono size={8} spacing={0.1} color={C.faint} style={{ lineHeight: 13, textAlign: 'center', marginBottom: 14 }}>
          AUTO-RENEWS MONTHLY UNTIL CANCELLED. CHARGED TO YOUR APPLE ID; MANAGE OR CANCEL ANYTIME IN SETTINGS.
        </Mono>

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20 }}>
          <FootLink label="RESTORE PURCHASES" onPress={restore} />
          {configured && <FootLink label="SIGN OUT" onPress={() => signOutUser().catch(() => {})} />}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 12 }}>
          <FootLink label="PRIVACY" onPress={() => Linking.openURL(PRIVACY_URL)} />
          <FootLink label="TERMS" onPress={() => Linking.openURL(TERMS_URL)} />
        </View>
      </ScrollView>
    </View>
  );
}

function Line({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 7, height: 7, borderRadius: 2, backgroundColor: C.ink }} />
      <Serif size={15} color={C.body} style={{ flex: 1 }}>
        {text}
      </Serif>
    </View>
  );
}

function FootLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Mono size={8.5} spacing={0.12} color={C.muted}>
        {label}
      </Mono>
    </Pressable>
  );
}
