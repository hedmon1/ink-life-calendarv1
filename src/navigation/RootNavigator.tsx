import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { TabBar } from '../components/TabBar';
import { AccountModal } from '../screens/AccountModal';
import { AuthScreen } from '../screens/AuthScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { GridScreen } from '../screens/GridScreen';
import { InfoModal } from '../screens/InfoModal';
import { MemoriesScreen } from '../screens/MemoriesScreen';
import { NewGoalModal } from '../screens/NewGoalModal';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SundayReviewModal } from '../screens/SundayReviewModal';
import { ThisWeekScreen } from '../screens/ThisWeekScreen';
import { TutorialScreen } from '../screens/TutorialScreen';
import { WallpaperModal } from '../screens/WallpaperModal';
import { WallpaperTutorialScreen } from '../screens/WallpaperTutorialScreen';
import { WeekDetailModal } from '../screens/WeekDetailModal';
import { useAuth } from '../store/auth';
import { useStore } from '../store/store';
import { C } from '../theme';
import { RootStackParamList, TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.bg } }}
    >
      <Tab.Screen name="Week" component={ThisWeekScreen} />
      <Tab.Screen name="Grid" component={GridScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Memories" component={MemoriesScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { state } = useStore();
  const { configured, authReady, user, entitlement } = useAuth();

  // gates: onboarding → account (when a backend is configured) → paywall (trial over) → app
  const needsAuth = state.onboarded && configured && authReady && !user;
  const locked = state.onboarded && !needsAuth && entitlement.status === 'expired';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
      {!state.onboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : needsAuth ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : locked ? (
        <Stack.Screen name="Paywall" component={PaywallScreen} />
      ) : (
        <>
          <Stack.Screen name="Tabs" component={Tabs} />
          <Stack.Group screenOptions={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}>
            <Stack.Screen name="Review" component={SundayReviewModal} />
            <Stack.Screen name="WeekDetail" component={WeekDetailModal} />
            <Stack.Screen name="Info" component={InfoModal} />
            <Stack.Screen name="Tutorial" component={TutorialScreen} />
            <Stack.Screen name="NewGoal" component={NewGoalModal} />
            <Stack.Screen name="Wallpaper" component={WallpaperModal} />
            <Stack.Screen name="WallpaperTutorial" component={WallpaperTutorialScreen} />
            <Stack.Screen name="Account" component={AccountModal} />
            <Stack.Screen name="Paywall" component={PaywallScreen} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
}
