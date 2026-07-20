import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';
import { TabIcon } from './Icons';
import { Mono } from './Type';

const LABELS: Record<string, string> = {
  Week: 'WEEK',
  Grid: 'GRID',
  Goals: 'GOALS',
  Memories: 'MEMORIES',
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: C.line,
        backgroundColor: C.paper,
        paddingTop: 10,
        paddingHorizontal: 10,
        paddingBottom: Math.max(insets.bottom, 12),
      }}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const tint = focused ? C.ink : C.faint;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <Pressable key={route.key} onPress={onPress} style={{ flex: 1, alignItems: 'center', gap: 5, paddingVertical: 2 }}>
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                marginBottom: 1,
                backgroundColor: focused ? C.amber : 'transparent',
              }}
            />
            <TabIcon name={route.name} color={tint} size={23} active={focused} />
            <Mono size={9} spacing={0.16} color={tint} medium={focused}>
              {LABELS[route.name] ?? route.name.toUpperCase()}
            </Mono>
          </Pressable>
        );
      })}
    </View>
  );
}
