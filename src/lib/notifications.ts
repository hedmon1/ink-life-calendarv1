import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AppState } from '../store/types';
import { lifeCalc } from './calc';

const CHANNEL_ID = 'checkin';

let configured = false;

/** Set the foreground handler + Android channel. Safe to call multiple times. */
export function setupNotifications(): void {
  if (configured) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Check-in reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    }).catch(() => {});
  }
}

async function isGranted(): Promise<boolean> {
  try {
    const p = await Notifications.getPermissionsAsync();
    return p.granted || p.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  } catch {
    return false;
  }
}

/** Prompt for permission if not yet decided. Returns whether notifications are allowed. */
export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) return true;
    if (current.status === 'denied' && !current.canAskAgain) return false;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch {
    return false;
  }
}

const MORNING = {
  hour: 7,
  minute: 30,
  title: 'It’s check-in day.',
  body: 'Lock this week into ink — one photo, one rating, one line.',
};
const NOON = {
  hour: 12,
  minute: 0,
  title: 'Still pencil.',
  body: 'This week isn’t inked yet. A minute now keeps the grid honest.',
};

/** Next future Date matching `weekday` at `hour:minute`. Skips today if `skipToday`. */
function nextAt(weekday: number, hour: number, minute: number, skipToday: boolean, now: Date): Date {
  let days = (weekday - now.getDay() + 7) % 7;
  if (days === 0 && skipToday) days = 7;
  let d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, hour, minute, 0, 0);
  if (d.getTime() <= now.getTime()) d = new Date(d.getTime() + 7 * 86400000);
  return d;
}

/**
 * Cancels existing reminders and (if permission is granted) schedules the next
 * check-in day's 7:30am reminder and 12:00pm "still not done" nudge.
 *
 * Because we re-run this after every check-in, completing the week reschedules
 * both to the following week — so the noon reminder only ever fires on a day the
 * week wasn't locked.
 */
export async function scheduleCheckinReminders(state: AppState): Promise<void> {
  try {
    if (!(await isGranted())) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (state.checkinWeekday == null) return;

    const c = lifeCalc(state.birthYear, state.proximityWeeks);
    const currentWeekLocked = state.records.some((r) => r.weekIndex === c.lived);
    const now = new Date();
    const channelId = Platform.OS === 'android' ? CHANNEL_ID : undefined;

    for (const t of [MORNING, NOON]) {
      const date = nextAt(state.checkinWeekday, t.hour, t.minute, currentWeekLocked, now);
      await Notifications.scheduleNotificationAsync({
        content: { title: t.title, body: t.body, sound: true },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId },
      });
    }
  } catch {
    // notifications are best-effort
  }
}
