import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';

/** Standard tab screen: warm paper background, safe-area top padding, scrollable body. */
export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: insets.top + 8, paddingHorizontal: 22 };
  if (!scroll) {
    return <View style={{ flex: 1, backgroundColor: C.bg, ...pad }}>{children}</View>;
  }
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ ...pad, paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
