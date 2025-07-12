import React, { createContext, useState, useEffect, useCallback } from 'react';
import { TimerManager } from '../classes/TimeManager';
import Timer from '../classes/Timer';
import * as Notifications from 'expo-notifications';
import uuid from 'react-native-uuid';
import Constants from 'expo-constants';

const TimerContext = createContext();
const manager = new TimerManager();
const isExpoGo = Constants.appOwnership === 'expo';

export const TimerProvider = ({ children }) => {
    const [timers, setTimers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const syncTimers = useCallback(() => {
        const currentTimers = manager.getAllTimers();
        setTimers(currentTimers);
    }, []);

    const scheduleNotificationsForDate = async (timerData, targetDate) => {
        const now = new Date();
        const timeDifferenceMs = targetDate.getTime() - now.getTime();
        let notificationId = null;
        let reminderNotificationId = null;

        if (timeDifferenceMs > 0) {
            const triggerSeconds = Math.floor(timeDifferenceMs / 1000);
            if (triggerSeconds >= 10) {
                const actualTriggerSeconds = isExpoGo ? Math.max(triggerSeconds, 60) : triggerSeconds;
                notificationId = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: timerData.title || "Timer Alert",
                        body: `Timer for ${timerData.personName || 'someone'} has completed!`,
                        sound: true,
                        data: { timerId: timerData.id },
                    },
                    trigger: { seconds: actualTriggerSeconds, channelId: 'timer-alerts' },
                });

                const reminderOffset = getReminderOffset(triggerSeconds);
                const reminderTime = triggerSeconds - reminderOffset;

                if (reminderOffset > 0 && reminderTime >= 10 && reminderTime < triggerSeconds) {
                    reminderNotificationId = await Notifications.scheduleNotificationAsync({
                        content: {
                            title: timerData.title || "Timer Reminder",
                            body: `Timer for ${timerData.personName || 'someone'} is coming up!`,
                            sound: true,
                            data: { timerId: timerData.id },
                        },
                        trigger: { seconds: reminderTime, channelId: 'timer-alerts' },
                    });
                }
            }
        }
        return { notificationId, reminderNotificationId };
    };

    const scheduleRecurringNotifications = async (timerData) => {
        // Ensure timerData is an instance of Timer
        const timer = timerData instanceof Timer ? timerData : new Timer(timerData);

        const now = new Date();
        const effectiveDate = timer.getEffectiveDate();
        let notificationId = null;
        let reminderNotificationId = null;

        if (effectiveDate > now) {
            notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: timer.title || "Timer Alert",
                    body: `Timer for ${timer.personName || 'someone'} has completed!`,
                    sound: true,
                    data: { timerId: timer.id },
                },
                trigger: { date: effectiveDate, channelId: 'timer-alerts' },
            });

            const timeDifferenceSec = Math.floor((effectiveDate.getTime() - now.getTime()) / 1000);
            const reminderOffset = getReminderOffset(timeDifferenceSec);
            if (reminderOffset > 0) {
                const reminderDate = new Date(effectiveDate.getTime() - reminderOffset * 1000);
                if (reminderDate > now) {
                    reminderNotificationId = await Notifications.scheduleNotificationAsync({
                        content: {
                            title: timer.title || "Timer Reminder",
                            body: `Timer for ${timer.personName || 'someone'} is coming up!`,
                            sound: true,
                            data: { timerId: timer.id },
                        },
                        trigger: { date: reminderDate, channelId: 'timer-alerts' },
                    });
                }
            }
        }
        return { notificationId, reminderNotificationId };
    };

    const handleNotificationResponse = useCallback(async (response) => {
        const { timerId } = response.notification.request.content.data || {};
        if (timerId) {
            const timer = manager.getTimer(timerId);
            if (timer?.isRecurring && timer.isCountdown) {
                try {
                    const notifications = await scheduleRecurringNotifications(new Timer(timer));
                    const updatedTimer = { ...timer, notificationId: notifications.notificationId, reminderNotificationId: notifications.reminderNotificationId };
                    await manager.editTimer(updatedTimer);
                    syncTimers();
                } catch (error) {
                    console.error('Error rescheduling recurring timer:', error);
                }
            }
        }
    }, [syncTimers]);

    useEffect(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
        return () => subscription.remove();
    }, [handleNotificationResponse]);

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
        return existingTimer.title === newTimer.title &&
            existingTimer.date.toString() === newTimer.date.toString() &&
            existingTimer.personName === newTimer.personName &&
            existingTimer.isCountdown === newTimer.isCountdown &&
            existingTimer.isRecurring === newTimer.isRecurring &&
            existingTimer.recurrenceInterval === newTimer.recurrenceInterval;
    }

    const setTimersAndSave = async (newTimers) => {
        try {
            const existingTimers = manager.getAllTimers();
            const existingIds = new Set(existingTimers.map(t => t.id));
            for (let timer of newTimers) {
                const isDuplicate = existingTimers.some(existing => isTimerDuplicate(existing, timer));
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
        if (secondsUntilEnd > 60 * 60 * 24 * 14) return 60 * 60 * 24 * 2;
        else if (secondsUntilEnd > 60 * 60 * 24 * 7) return 60 * 60 * 24;
        else if (secondsUntilEnd > 60 * 60 * 24) return 60 * 60 * 6;
        else if (secondsUntilEnd > 60 * 60 * 6) return 60 * 60 * 2;
        else if (secondsUntilEnd > 60 * 60) return 60 * 30;
        else if (secondsUntilEnd > 60 * 10) return 60 * 5;
        else if (secondsUntilEnd > 60) return 30;
        return 0;
    }

    const addTimer = async (timerData) => {
        try {
            let notificationId = null;
            let reminderNotificationId = null;
            if (timerData.isCountdown) {
                const notifications = await scheduleRecurringNotifications(new Timer(timerData));
                notificationId = notifications.notificationId;
                reminderNotificationId = notifications.reminderNotificationId;
            }
            const timerToAdd = { ...timerData, date: new Date(timerData.date), notificationId, reminderNotificationId };
            await manager.addTimer(timerToAdd);
            syncTimers();
        } catch (error) {
            console.error('Error adding timer:', error);
        }
    };

    const editTimer = async (timerData) => {
        try {
            const oldTimer = manager.getTimer(timerData.id);
            if (oldTimer?.notificationId) await Notifications.cancelScheduledNotificationAsync(oldTimer.notificationId);
            if (oldTimer?.reminderNotificationId) await Notifications.cancelScheduledNotificationAsync(oldTimer.reminderNotificationId);

            let notificationId = null;
            let reminderNotificationId = null;
            if (timerData.isCountdown) {
                const notifications = await scheduleRecurringNotifications(new Timer(timerData));
                notificationId = notifications.notificationId;
                reminderNotificationId = notifications.reminderNotificationId;
            }
            const timerToUpdate = { ...timerData, date: new Date(timerData.date), notificationId, reminderNotificationId };
            await manager.editTimer(timerToUpdate);
            syncTimers();
        } catch (error) {
            console.error('Error editing timer:', error);
        }
    };

    const removeTimer = async (id) => {
        try {
            const timer = manager.getTimer(id);
            if (timer?.notificationId) await Notifications.cancelScheduledNotificationAsync(timer.notificationId);
            if (timer?.reminderNotificationId) await Notifications.cancelScheduledNotificationAsync(timer.reminderNotificationId);
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
                if (timer.notificationId) await Notifications.cancelScheduledNotificationAsync(timer.notificationId);
                if (timer.reminderNotificationId) await Notifications.cancelScheduledNotificationAsync(timer.reminderNotificationId);
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
        <TimerContext.Provider value={{
            timers, isLoading,
            addTimer, removeTimer, clearAllTimers,
            initializeTimers, editTimer,
            setTimersAndSave, refreshTimers,
        }}>
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
 