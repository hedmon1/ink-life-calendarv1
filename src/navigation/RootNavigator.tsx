import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { TabBar } from '../components/TabBar';
import { GoalsScreen } from '../screens/GoalsScreen';
import { GridScreen } from '../screens/GridScreen';
import { InfoModal } from '../screens/InfoModal';
import { MemoriesScreen } from '../screens/MemoriesScreen';
import { NewGoalModal } from '../screens/NewGoalModal';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SundayReviewModal } from '../screens/SundayReviewModal';
import { ThisWeekScreen } from '../screens/ThisWeekScreen';
import { TutorialScreen } from '../screens/TutorialScreen';
import { WeekDetailModal } from '../screens/WeekDetailModal';
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
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
      {!state.onboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <>
          <Stack.Screen name="Tabs" component={Tabs} />
          <Stack.Group screenOptions={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}>
            <Stack.Screen name="Review" component={SundayReviewModal} />
            <Stack.Screen name="WeekDetail" component={WeekDetailModal} />
            <Stack.Screen name="Info" component={InfoModal} />
            <Stack.Screen name="Tutorial" component={TutorialScreen} />
            <Stack.Screen name="NewGoal" component={NewGoalModal} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
}
