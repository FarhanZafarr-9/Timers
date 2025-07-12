import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function setupNotificationChannel() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('timer-alerts', {
            name: 'Timer Alerts',
            importance: Notifications.AndroidImportance.HIGH,
            sound: true,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
            bypassDnd: true,
        });
    }
}

export async function initializeNotifications() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return;
    }
    console.log('✅ Notification permissions granted');
    await setupNotificationChannel();
}

export async function scheduleNotification(seconds, title, body, data = {}) {
    try {
        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds,
                channelId: 'timer-alerts'
            },
        });

        console.log(`✅ Scheduled notification in ${seconds}s, id:`, notificationId);
        return notificationId;
    } catch (err) {
        console.error('❌ Failed to schedule notification', err);
        return null;
    }
}

export async function cancelScheduledNotification(notificationId) {
    if (!notificationId) return;

    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log(`🗑 Cancelled notification with id: ${notificationId}`);
    } catch (err) {
        console.error('❌ Failed to cancel notification', err);
    }
}

export async function clearAllScheduledNotifications() {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('🗑 Cleared all scheduled notifications');
    } catch (err) {
        console.error('❌ Failed to clear all notifications', err);
    }
}
