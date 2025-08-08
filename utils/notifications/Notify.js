import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const requestNotificationPermissions = async () => {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('⚠️ Notification permissions not granted');
            return false;
        }

        // Configure notification channel for Android
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('timer-notifications', {
                name: 'Timer Notifications',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF0088',
                sound: 'default',
            });

            await Notifications.setNotificationChannelAsync('timer-reminders', {
                name: 'Timer Reminders',
                importance: Notifications.AndroidImportance.DEFAULT,
                vibrationPattern: [0, 100, 100, 100],
                lightColor: '#0088FF',
                sound: 'default',
            });
        }

        console.log('✅ Notification permissions granted');
        return true;
    } catch (error) {
        console.error('❌ Failed to request notification permissions:', error);
        return false;
    }
};

export const scheduleNotification = async (seconds, title, body, data = {}) => {
    try {
        // Ensure permissions are granted
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
            throw new Error('Notification permissions not granted');
        }

        // Determine notification channel based on type
        const channelId = data.type === 'timer_reminder' ? 'timer-reminders' : 'timer-notifications';

        const notificationConfig = {
            content: {
                title,
                body,
                data,
                sound: 'default',
                priority: data.type === 'timer_reminder' ? 'normal' : 'high',
            },
            trigger: {
                seconds: Math.max(1, Math.floor(seconds)), // Ensure at least 1 second
            },
        };

        // Add Android-specific configuration
        if (Platform.OS === 'android') {
            notificationConfig.content.channelId = channelId;
            notificationConfig.content.categoryIdentifier = 'timer';
        }

        const notificationId = await Notifications.scheduleNotificationAsync(notificationConfig);

        const scheduleTime = new Date(Date.now() + seconds * 1000);
        console.log(`🔔 Scheduled ${data.type || 'notification'} "${title}" for ${scheduleTime.toLocaleTimeString()}`);

        return notificationId;
    } catch (error) {
        console.error('❌ Failed to schedule notification:', error);
        throw error;
    }
};

export const cancelScheduledNotification = async (notificationId) => {
    if (!notificationId) {
        console.warn('⚠️ No notification ID provided for cancellation');
        return false;
    }

    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log(`❌ Cancelled notification: ${notificationId}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to cancel notification ${notificationId}:`, error);
        return false;
    }
};

export const clearAllScheduledNotifications = async () => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('🧹 Cleared all scheduled notifications');
        return true;
    } catch (error) {
        console.error('❌ Failed to clear all notifications:', error);
        return false;
    }
};

export const getScheduledNotifications = async () => {
    try {
        const notifications = await Notifications.getAllScheduledNotificationsAsync();
        console.log(`📋 Found ${notifications.length} scheduled notifications`);
        return notifications;
    } catch (error) {
        console.error('❌ Failed to get scheduled notifications:', error);
        return [];
    }
};

// NEW: Debug function to check notification status
export const debugNotifications = async () => {
    try {
        const scheduled = await getScheduledNotifications();
        const permissions = await Notifications.getPermissionsAsync();

        console.log('🔍 Notification Debug Info:');
        console.log(`  Permissions: ${permissions.status}`);
        console.log(`  Scheduled notifications: ${scheduled.length}`);

        scheduled.forEach((notif, index) => {
            const trigger = notif.trigger;
            const scheduledFor = trigger.type === 'date'
                ? new Date(trigger.timestamp).toLocaleString()
                : `${trigger.seconds}s from now`;

            console.log(`  ${index + 1}. ${notif.content.title} - ${scheduledFor}`);
        });

        return {
            permissions: permissions.status,
            scheduledCount: scheduled.length,
            scheduled: scheduled.map(n => ({
                id: n.identifier,
                title: n.content.title,
                trigger: n.trigger
            }))
        };
    } catch (error) {
        console.error('❌ Failed to debug notifications:', error);
        return null;
    }
};

// NEW: Helper to validate notification timing
export const validateNotificationTiming = (targetDate) => {
    const now = new Date();
    const timeDiff = targetDate.getTime() - now.getTime();
    const secondsUntil = Math.floor(timeDiff / 1000);

    const issues = [];

    if (secondsUntil <= 0) {
        issues.push('Target time is in the past');
    }

    if (secondsUntil < 1) {
        issues.push('Target time is too soon (< 1 second)');
    }

    if (secondsUntil > 365 * 24 * 60 * 60) { // 1 year
        issues.push('Target time is too far in the future (> 1 year)');
    }

    return {
        isValid: issues.length === 0,
        secondsUntil,
        issues,
        targetDate: targetDate.toISOString()
    };
};



// need time-out from this shit for now