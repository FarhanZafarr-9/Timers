import React, { createContext, useState, useEffect, useCallback } from 'react';
import { TimerManager } from '../classes/TimeManager';
import * as Notifications from 'expo-notifications';
import uuid from 'react-native-uuid';
import Constants from 'expo-constants';

const TimerContext = createContext();

const manager = new TimerManager();

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

export const TimerProvider = ({ children }) => {
    const [timers, setTimers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Function to sync timers from manager to state
    const syncTimers = useCallback(() => {
        const currentTimers = manager.getAllTimers();
        setTimers(currentTimers);
    }, []);

    // Helper function to schedule notifications for a specific date
    const scheduleNotificationsForDate = async (timerData, targetDate) => {
        const now = new Date();
        const timeDifferenceMs = targetDate.getTime() - now.getTime();

        console.log('Scheduling notification for:', targetDate);
        console.log('Time difference (ms):', timeDifferenceMs);
        console.log('Time difference (seconds):', Math.floor(timeDifferenceMs / 1000));

        let notificationId = null;
        let reminderNotificationId = null;

        // Only schedule notifications if the target date is in the future
        if (timeDifferenceMs > 0) {
            const triggerSeconds = Math.floor(timeDifferenceMs / 1000);

            console.log('About to schedule notification with trigger seconds:', triggerSeconds);

            // Schedule main notification only if there's at least 10 seconds remaining
            // Note: Expo Go has issues with scheduled notifications, test on device/emulator
            if (triggerSeconds >= 10) {
                // Add extra delay for Expo Go compatibility
                const actualTriggerSeconds = isExpoGo ? Math.max(triggerSeconds, 60) : triggerSeconds;

                if (isExpoGo && actualTriggerSeconds > triggerSeconds) {
                    console.warn('⚠️  Expo Go detected: Minimum 60 second delay applied. Test on device/emulator for accurate timing.');
                }
                console.log('Scheduling main notification...');
                notificationId = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: timerData.title || "Timer Alert",
                        body: `Timer for ${timerData.personName || 'someone'} has completed!`,
                        sound: true,
                        data: { timerId: timerData.id }, // Add timer ID to notification data
                    },
                    trigger: {
                        seconds: actualTriggerSeconds, // Use adjusted trigger time
                        channelId: 'timer-alerts'
                    },
                });
                console.log('Main notification scheduled with ID:', notificationId, 'for', actualTriggerSeconds, 'seconds');

                // Calculate reminder time
                const reminderOffset = getReminderOffset(triggerSeconds);
                const reminderTime = triggerSeconds - reminderOffset;

                console.log('Reminder offset:', reminderOffset, 'Reminder time:', reminderTime);

                // Only schedule reminder if conditions are met
                if (reminderOffset > 0 && reminderTime >= 10 && reminderTime < triggerSeconds) {
                    console.log('Scheduling reminder notification...');
                    reminderNotificationId = await Notifications.scheduleNotificationAsync({
                        content: {
                            title: timerData.title || "Timer Reminder",
                            body: `Timer for ${timerData.personName || 'someone'} is coming up!`,
                            sound: true,
                            data: { timerId: timerData.id }, // Add timer ID to notification data
                        },
                        trigger: {
                            seconds: reminderTime,
                            channelId: 'timer-alerts'
                        },
                    });
                    console.log('Reminder notification scheduled with ID:', reminderNotificationId);
                }
            } else {
                console.log('Trigger time too short, not scheduling notification');
            }
        } else {
            console.log('Target date is in the past, not scheduling notification');
        }

        return { notificationId, reminderNotificationId };
    };

    // Helper function to schedule recurring notifications
    const scheduleRecurringNotifications = async (timerData) => {
        if (!timerData.isRecurring || !timerData.recurrenceInterval) {
            return await scheduleNotificationsForDate(timerData, new Date(timerData.date));
        }

        const now = new Date();
        const originalDate = new Date(timerData.date);

        console.log('Original date:', originalDate);
        console.log('Current time:', now);
        console.log('Recurrence interval:', timerData.recurrenceInterval);

        // Parse recurrence interval
        let count = 1, unit = '';
        if (typeof timerData.recurrenceInterval === 'string' && timerData.recurrenceInterval.split(' ').length > 1) {
            [count, unit] = timerData.recurrenceInterval.split(' ');
            count = parseInt(count, 10) || 1;
            unit = unit.toLowerCase().endsWith('s') ? unit.toLowerCase().slice(0, -1) : unit.toLowerCase();
        }

        console.log('Parsed count:', count, 'unit:', unit);

        // Find the next occurrence
        let nextDate = new Date(originalDate);
        const addMap = {
            second: (date, n) => { date.setSeconds(date.getSeconds() + n); return date; },
            minute: (date, n) => { date.setMinutes(date.getMinutes() + n); return date; },
            hour: (date, n) => { date.setHours(date.getHours() + n); return date; },
            day: (date, n) => { date.setDate(date.getDate() + n); return date; },
            week: (date, n) => { date.setDate(date.getDate() + n * 7); return date; },
            month: (date, n) => { date.setMonth(date.getMonth() + n); return date; },
            year: (date, n) => { date.setFullYear(date.getFullYear() + n); return date; },
        };

        // Advance to next occurrence if original date has passed
        if (originalDate <= now && addMap[unit]) {
            console.log('Original date has passed, advancing to next occurrence');
            while (nextDate <= now) {
                console.log('Advancing from:', nextDate);
                nextDate = addMap[unit](nextDate, count);
                console.log('Advanced to:', nextDate);
            }
        }

        console.log('Final scheduled date:', nextDate);

        // Schedule notification for the next occurrence
        const notifications = await scheduleNotificationsForDate(timerData, nextDate);

        // Store the next occurrence date for the timer card logic
        timerData.nextDate = nextDate.getTime();

        return notifications;
    };

    // Handle notification responses for recurring timers
    const handleNotificationResponse = useCallback(async (response) => {
        const { timerId } = response.notification.request.content.data || {};

        if (timerId) {
            console.log('Handling notification response for timer:', timerId);

            // Find the timer
            const timer = manager.getTimer(timerId);

            if (timer?.isRecurring && timer.isCountdown) {
                console.log('Rescheduling recurring timer:', timer.title);

                try {
                    // Schedule the next notification
                    const notifications = await scheduleRecurringNotifications(timer);

                    // Update the timer with new notification IDs
                    const updatedTimer = {
                        ...timer,
                        notificationId: notifications.notificationId,
                        reminderNotificationId: notifications.reminderNotificationId
                    };

                    // Update the timer in storage
                    await manager.editTimer(updatedTimer);

                    // Sync with state
                    syncTimers();

                    console.log('Successfully rescheduled recurring timer');
                } catch (error) {
                    console.error('Error rescheduling recurring timer:', error);
                }
            }
        }
    }, [syncTimers]);

    // Set up notification response listener
    useEffect(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
        return () => subscription.remove();
    }, [handleNotificationResponse]);

    // Load initial timers
    useEffect(() => {
        const loadInitialTimers = async () => {
            try {
                setIsLoading(true);
                await manager.loadFromStorage();
                syncTimers();
            } catch (error) {
                console.error('Error loading initial timers:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialTimers();
    }, [syncTimers]);

    function isTimerDuplicate(existingTimer, newTimer) {
        return (
            existingTimer.title === newTimer.title &&
            existingTimer.date.toString() === newTimer.date.toString() &&
            existingTimer.personName === newTimer.personName &&
            existingTimer.isCountdown === newTimer.isCountdown &&
            existingTimer.isRecurring === newTimer.isRecurring &&
            existingTimer.recurrenceInterval === newTimer.recurrenceInterval
        );
    }

    const setTimersAndSave = async (newTimers) => {
        try {
            const existingTimers = manager.getAllTimers();
            const existingIds = new Set(existingTimers.map(t => t.id));

            for (let timer of newTimers) {
                const isDuplicate = existingTimers.some(existing =>
                    isTimerDuplicate(existing, timer)
                );
                if (isDuplicate) continue;

                if (existingIds.has(timer.id)) {
                    timer = { ...timer, id: uuid.v4() };
                }
                await manager.addTimer(timer);
            }

            syncTimers();
        } catch (error) {
            console.error('Error setting timers:', error);
        }
    };

    function getReminderOffset(secondsUntilEnd) {
        if (secondsUntilEnd > 60 * 60 * 24 * 14) { // > 2 weeks
            return 60 * 60 * 24 * 2; // 2 days before
        } else if (secondsUntilEnd > 60 * 60 * 24 * 7) { // > 1 week
            return 60 * 60 * 24; // 1 day before
        } else if (secondsUntilEnd > 60 * 60 * 24) { // > 1 day
            return 60 * 60 * 6; // 6 hours before
        } else if (secondsUntilEnd > 60 * 60 * 6) { // > 6 hours
            return 60 * 60 * 2; // 2 hours before
        } else if (secondsUntilEnd > 60 * 60) { // > 1 hour
            return 60 * 30; // 30 minutes before
        } else if (secondsUntilEnd > 60 * 10) { // > 10 minutes
            return 60 * 5; // 5 minutes before
        } else if (secondsUntilEnd > 60) { // > 1 minute
            return 30; // 30 seconds before
        }
        return 0; // Too short, no reminder
    }

    const addTimer = async (timerData) => {
        try {
            let notificationId = null;
            let reminderNotificationId = null;

            if (timerData.isCountdown) {
                const notifications = await scheduleRecurringNotifications(timerData);
                notificationId = notifications.notificationId;
                reminderNotificationId = notifications.reminderNotificationId;
            }

            const timerToAdd = {
                ...timerData,
                date: new Date(timerData.date),
                notificationId,
                reminderNotificationId
            };

            await manager.addTimer(timerToAdd);
            syncTimers();
        } catch (error) {
            console.error('Error adding timer:', error);
        }
    };

    const editTimer = async (timerData) => {
        try {
            // Cancel previous notifications
            const oldTimer = manager.getTimer(timerData.id);
            if (oldTimer?.notificationId) {
                await Notifications.cancelScheduledNotificationAsync(oldTimer.notificationId);
            }
            if (oldTimer?.reminderNotificationId) {
                await Notifications.cancelScheduledNotificationAsync(oldTimer.reminderNotificationId);
            }

            let notificationId = null;
            let reminderNotificationId = null;

            if (timerData.isCountdown) {
                const notifications = await scheduleRecurringNotifications(timerData);
                notificationId = notifications.notificationId;
                reminderNotificationId = notifications.reminderNotificationId;
            }

            const timerToUpdate = {
                ...timerData,
                date: new Date(timerData.date),
                notificationId,
                reminderNotificationId
            };

            await manager.editTimer(timerToUpdate);
            syncTimers();
        } catch (error) {
            console.error('Error editing timer:', error);
        }
    };

    const removeTimer = async (id) => {
        try {
            const timer = manager.getTimer(id);
            if (timer?.notificationId) {
                await Notifications.cancelScheduledNotificationAsync(timer.notificationId);
            }
            if (timer?.reminderNotificationId) {
                await Notifications.cancelScheduledNotificationAsync(timer.reminderNotificationId);
            }
            await manager.removeTimer(id);
            syncTimers();
        } catch (error) {
            console.error('Error removing timer:', error);
        }
    };

    const clearAllTimers = async () => {
        try {
            const allTimers = manager.getAllTimers();
            for (const timer of allTimers) {
                if (timer.notificationId) {
                    await Notifications.cancelScheduledNotificationAsync(timer.notificationId);
                }
                if (timer.reminderNotificationId) {
                    await Notifications.cancelScheduledNotificationAsync(timer.reminderNotificationId);
                }
            }
            await manager.clearAllTimers();
            syncTimers();
        } catch (error) {
            console.error('Error clearing all timers:', error);
        }
    };

    const initializeTimers = async () => {
        try {
            await manager.initializeTimers();
            syncTimers();
        } catch (error) {
            console.error('Error initializing timers:', error);
        }
    };

    const refreshTimers = useCallback(async () => {
        try {
            await manager.loadFromStorage();
            syncTimers();
        } catch (error) {
            console.error('Error refreshing timers:', error);
        }
    }, [syncTimers]);

    return (
        <TimerContext.Provider
            value={{
                timers,
                isLoading,
                addTimer,
                removeTimer,
                clearAllTimers,
                initializeTimers,
                editTimer,
                setTimersAndSave,
                refreshTimers,
            }}
        >
            {children}
        </TimerContext.Provider>
    );
};

export const useTimers = () => {
    const context = React.useContext(TimerContext);
    if (context === undefined) {
        throw new Error('useTimers must be used within a TimerProvider');
    }
    return context;
};