import React, { useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mono, Serif } from '../components/Type';
import { FOUNDER_DEADLINE_LABEL, FOUNDER_DEADLINE_MS, TRIAL_DAYS } from '../config/appConfig';
import { useAuth } from '../store/auth';
import { C } from '../theme';

function friendly(code: string): string {
  if (code.includes('email-already-in-use')) return 'That email already has an account — sign in instead.';
  if (code.includes('invalid-email')) return 'That email doesn’t look right.';
  if (code.includes('weak-password')) return 'Password needs at least 6 characters.';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found'))
    return 'Email or password is wrong.';
  if (code.includes('network')) return 'No connection. Try again.';
  return 'Something went wrong. Try again.';
}

export function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState<'up' | 'in'>('up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const inFounderWindow = Date.now() <= FOUNDER_DEADLINE_MS;

  const submit = async () => {
    if (!email.trim() || !password || busy) return;
    Keyboard.dismiss();
    setBusy(true);
    setError('');
    try {
      if (mode === 'up') await signUp(email, password);
      else await signIn(email, password);
      // the auth listener takes it from here
    } catch (e: any) {
      setError(friendly(String(e?.code ?? e?.message ?? e)));
      setBusy(false);
    }
  };

  const field = {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    color: C.ink,
    borderBottomWidth: 1,
    borderBottomColor: C.inputLine,
    paddingVertical: 10,
    marginBottom: 22,
  } as const;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24, paddingHorizontal: 28 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Serif size={40} weight="semi" italic style={{ marginBottom: 6 }}>
          Ink.
        </Serif>
        <Serif size={17} italic color={C.muted} style={{ marginBottom: 26 }}>
          {mode === 'up' ? 'Create an account. Your grid follows you.' : 'Welcome back.'}
        </Serif>

        {mode === 'up' && inFounderWindow && (
          <View style={{ backgroundColor: C.goalTagBg, borderWidth: 1, borderColor: C.goalTagBorder, borderRadius: 10, padding: 13, marginBottom: 24 }}>
            <Mono size={8.5} spacing={0.16} color={C.goalTagText} style={{ marginBottom: 4 }}>
              FOUNDING MEMBER
            </Mono>
            <Serif size={14} italic color={C.goalTagText2}>
              Accounts created before {FOUNDER_DEADLINE_LABEL} are free for life.
            </Serif>
          </View>
        )}

        <Mono size={9.5} spacing={0.18} style={{ marginBottom: 4 }}>
          EMAIL
        </Mono>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={C.faint}
          style={field}
        />

        <Mono size={9.5} spacing={0.18} style={{ marginBottom: 4 }}>
          PASSWORD
        </Mono>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={mode === 'up' ? 'new-password' : 'current-password'}
          placeholder="At least 6 characters"
          placeholderTextColor={C.faint}
          style={field}
          onSubmitEditing={submit}
        />

        {!!error && (
          <Serif size={14} italic color={C.amber} style={{ marginBottom: 16 }}>
            {error}
          </Serif>
        )}

        <Pressable onPress={submit} disabled={busy} style={{ backgroundColor: C.ink, borderRadius: 8, paddingVertical: 17, alignItems: 'center', opacity: busy ? 0.6 : 1 }}>
          {busy ? (
            <ActivityIndicator color={C.paper} />
          ) : (
            <Mono size={11} spacing={0.18} color={C.paper}>
              {mode === 'up' ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </Mono>
          )}
        </Pressable>

        {mode === 'up' && (
          <Mono size={8.5} spacing={0.12} color={C.faint} style={{ textAlign: 'center', marginTop: 14, lineHeight: 14 }}>
            {TRIAL_DAYS} DAYS FREE · THEN A SUBSCRIPTION KEEPS INK RUNNING
          </Mono>
        )}

        <View style={{ flex: 1, minHeight: 24 }} />

        <Pressable onPress={() => { setMode((m) => (m === 'up' ? 'in' : 'up')); setError(''); }} hitSlop={10} style={{ alignItems: 'center' }}>
          <Mono size={10} spacing={0.14} color={C.muted}>
            {mode === 'up' ? 'HAVE AN ACCOUNT? SIGN IN' : 'NEW HERE? CREATE AN ACCOUNT'}
          </Mono>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
