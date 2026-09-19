import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const NOTIFICATION_ID_KEY = 'ico_study_reminder_id';
const CHANNEL_ID = 'study-reminder';

async function requestPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Recordatorio de estudio',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: null,
  });
}

export async function scheduleStudyReminder(): Promise<boolean> {
  const granted = await requestPermission();
  if (!granted) return false;

  await ensureChannel();
  await cancelStudyReminder();

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_ID_KEY,
    content: {
      title: '📚 Hora de estudiar',
      body: 'Mantén tu racha activa. ¡Unos minutos al día marcan la diferencia!',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 17,
      minute: 0,
    },
  });

  return true;
}

export async function cancelStudyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID_KEY).catch(() => {});
}
