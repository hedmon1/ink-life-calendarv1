// Check-in scheduling. The first check-in is available immediately; doing it
// fixes the user's weekday. Every check-in after that is only available on that
// same weekday — and once a week's been locked, you wait for the next one.

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WEEKDAYS_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export type CheckinInfo = {
  firstEver: boolean;
  isCheckinDay: boolean;
  currentWeekLocked: boolean;
  canCheckIn: boolean;
  weekday: number | null;
  weekdayName: string | null;
  daysUntil: number;
};

export function checkinInfo(
  checkinWeekday: number | null,
  currentWeekLocked: boolean,
  now: number = Date.now()
): CheckinInfo {
  const today = new Date(now).getDay();
  const firstEver = checkinWeekday == null;
  const isCheckinDay = !firstEver && today === checkinWeekday;
  const canCheckIn = !currentWeekLocked && (firstEver || isCheckinDay);

  let daysUntil = 0;
  if (!firstEver && checkinWeekday != null) {
    let diff = (((checkinWeekday - today) % 7) + 7) % 7;
    if (diff === 0 && currentWeekLocked) diff = 7; // already locked today → next week
    daysUntil = diff;
  }

  return {
    firstEver,
    isCheckinDay,
    currentWeekLocked,
    canCheckIn,
    weekday: firstEver ? null : checkinWeekday,
    weekdayName: firstEver || checkinWeekday == null ? null : WEEKDAYS[checkinWeekday],
    daysUntil,
  };
}
