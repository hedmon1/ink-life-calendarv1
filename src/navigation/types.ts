export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: undefined;
  Review: undefined;
  WeekDetail: { weekIndex: number };
  Info: { label: string; body: string; accent: string; stat?: string; statUnit?: string; note?: string };
  Tutorial: undefined;
  NewGoal: undefined;
};

export type TabParamList = {
  Week: undefined;
  Grid: undefined;
  Goals: undefined;
  Memories: undefined;
};
