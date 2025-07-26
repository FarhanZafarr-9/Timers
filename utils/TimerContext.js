import React, { createContext, useState, useEffect, useCallback } from 'react';
import { TimerManager } from '../classes/TimeManager';
import Timer from '../classes/Timer';
import * as Notifications from 'expo-notifications';
import uuid from 'react-native-uuid';
import {
    scheduleNotification,
    cancelScheduledNotification,
    clearAllScheduledNotifications
} from './Notify';
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(duration)
dayjs.extend(relativeTime)

import { getReminderOffset } from '../utils/functions';

const TimerContext = createContext();
const manager = new TimerManager();

// Helper to always work with Timer instance
const toTimer = (data) => data instanceof Timer ? data : new Timer(data);

export const TimerProvider = ({ children }) => {
    const [timers, setTimers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const syncTimers = useCallback(() => {
        const currentTimers = manager.getAllTimers();
        setTimers(currentTimers);
    }, []);

    const scheduleNotificationsOptimized = async (timerData, delayInSec) => {
        console.log('📅 Scheduling notifications with pre-calculated delay:', delayInSec, 'seconds');
        const timer = toTimer(timerData);

        let notificationId = null;
        let reminderNotificationId = null;

        // Only schedule if the timer is in the future
        if (delayInSec >= 10) {
            console.log('🔔 Scheduling main notification immediately');
            const notificationStart = Date.now();

            notificationId = await scheduleNotification(
                delayInSec,
                timer.title || "Timer Alert",
                `Timer for ${timer.personName || 'someone'} has completed!`,
                { timerId: timer.id }
            );

            console.log('✅ Main notification scheduled, took:', Date.now() - notificationStart, 'ms');

            const reminderOffset = getReminderOffset(delayInSec);
            const reminderDelay = delayInSec - reminderOffset;

            if (reminderOffset > 0 && reminderDelay >= 10) {
                console.log('🔔 Scheduling reminder notification');

                reminderNotificationId = await scheduleNotification(
                    reminderDelay,
                    timer.title || "Timer Reminder",
                    `Timer for ${timer.personName || 'someone'} is coming up!`,
                    { timerId: timer.id }
                );

                console.log('✅ Reminder notification scheduled');
            }
        }

        return { notificationId, reminderNotificationId };
    };

    const scheduleNextRecurringNotification = (tmr) => {
        if (!tmr.isRecurring) return;

        const timer = toTimer(tmr); // Convert plain object if needed
        const nextDate = timer.getEffectiveDate();
        const now = dayjs();
        const delayInSec = dayjs(nextDate).diff(now, 'second');

        if (delayInSec <= 0) return; // Don't schedule if date is already past

        scheduleNotification(timer, delayInSec); // Your existing function
    };

    // Legacy method for backward compatibility
    const scheduleNotifications = async (timerData) => {
        console.log('📅 Legacy scheduleNotifications called for timer:', timerData.id);
        const timer = toTimer(timerData);
        const now = Date.now();
        const targetTime = timer.getEffectiveDate().getTime();
        const delayInSec = Math.floor((targetTime - now) / 1000);

        return await scheduleNotificationsOptimized(timerData, delayInSec);
    };

    // Pre-calculate timing to avoid delays
    const calculateTimingForTimer = (timerData) => {
        const timer = toTimer({ ...timerData, date: dayjs(timerData.date).toDate() });
        const now = dayjs();
        const targetTime = dayjs(timer.getEffectiveDate());

        const delayInSec = targetTime.diff(now, 'second');

        console.log('⏱️ Timing calculated:', {
            now: now.format(),
            target: targetTime.format(),
            delay: delayInSec
        });

        return delayInSec;
    };

    const handleNotificationResponse = useCallback(async (response) => {
        console.log('📱 Notification response received');
        const { timerId } = response.notification.request.content.data || {};
        if (timerId) {
            console.log('🔄 Handling notification for timer:', timerId);
            const timer = manager.getTimer(timerId);
            if (timer?.isRecurring && timer.isCountdown) {
                try {
                    console.log('🔄 Rescheduling recurring timer:', timerId);
                    const delayInSec = calculateTimingForTimer(timer);
                    const notifications = await scheduleNotificationsOptimized(timer, delayInSec);

                    const updatedTimer = {
                        ...timer,
                        notificationId: notifications.notificationId,
                        reminderNotificationId: notifications.reminderNotificationId
                    };

                    await manager.editTimer(updatedTimer);
                    syncTimers();
                } catch (error) {
                    console.error('❌ Error rescheduling recurring timer:', error);
                }
            }
        }
    }, [syncTimers]);

    useEffect(() => {
        console.log('🔧 Setting up notification response listener');
        const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

        return () => {
            console.log('🧹 Cleaning up notification response listener');
            subscription.remove();
        };
    }, [handleNotificationResponse]);

    useEffect(() => {
        console.log('🚀 Initializing timers from storage');
        const loadInitialTimers = async () => {
            try {
                setIsLoading(true);
                await manager.loadFromStorage();
                syncTimers();
            } catch (error) {
                console.error('❌ Error loading initial timers:', error);
            } finally {
                setIsLoading(false);
                console.log('✅ Finished loading initial timers');
            }
        };
        loadInitialTimers();
    }, [syncTimers]);

    const isTimerDuplicate = (existing, newT) =>
        existing.title === newT.title &&
        existing.date.toString() === newT.date.toString() &&
        existing.personName === newT.personName &&
        existing.isCountdown === newT.isCountdown &&
        existing.isRecurring === newT.isRecurring &&
        existing.recurrenceInterval === newT.recurrenceInterval;

    const setTimersAndSave = async (newTimers) => {
        console.log('📦 Setting multiple timers:', newTimers.length);
        try {
            const existingTimers = manager.getAllTimers();
            const existingIds = new Set(existingTimers.map(t => t.id));
            for (let timer of newTimers) {
                if (existingTimers.some(e => isTimerDuplicate(e, timer))) continue;
                if (existingIds.has(timer.id)) timer = { ...timer, id: uuid.v4() };
                await manager.addTimer(timer);
            }
            syncTimers();
        } catch (error) {
            console.error('❌ Error setting timers:', error);
        }
    };

    const addTimer = async (timerData) => {
        const startTime = Date.now();
        console.log('⏱️ AddTimer started at:', new Date().toISOString());

        try {
            // Pre-calculate timing BEFORE any storage operations
            const delayInSec = calculateTimingForTimer(timerData);
            console.log('⏱️ Timing calculated, elapsed:', Date.now() - startTime, 'ms');

            // Prepare timer object
            const timerToAdd = {
                ...timerData,
                date: new Date(timerData.date),
                notificationId: null,
                reminderNotificationId: null
            };

            console.log('⏱️ Timer object prepared, elapsed:', Date.now() - startTime, 'ms');

            // Schedule notifications IMMEDIATELY with pre-calculated delay
            let notifications = { notificationId: null, reminderNotificationId: null };
            if (timerData.isCountdown && delayInSec >= 10) {
                console.log('🔔 Scheduling notifications immediately');
                const notificationStart = Date.now();

                notifications = await scheduleNotificationsOptimized(timerToAdd, delayInSec);

                console.log('✅ Notifications scheduled, took:', Date.now() - notificationStart, 'ms');
                console.log('📝 Notification IDs:', notifications);
            }

            // Add notification IDs to timer before storage
            const finalTimer = {
                ...timerToAdd,
                notificationId: notifications.notificationId,
                reminderNotificationId: notifications.reminderNotificationId
            };

            console.log('⏱️ About to add timer to manager, elapsed:', Date.now() - startTime, 'ms');

            // Single storage operation
            await manager.addTimer(finalTimer);

            console.log('✅ Timer added to manager, elapsed:', Date.now() - startTime, 'ms');

            // Update UI
            syncTimers();

            console.log('✅ AddTimer completed, total elapsed:', Date.now() - startTime, 'ms');

        } catch (error) {
            console.error('❌ Error adding timer:', error);
            console.error('Total time before error:', Date.now() - startTime, 'ms');
        }
    };

    const editTimer = async (timerData) => {
        const startTime = Date.now();
        console.log('✏️ EditTimer started for:', timerData.id);

        try {
            const oldTimer = manager.getTimer(timerData.id);
            console.log('📋 Old timer retrieved, elapsed:', Date.now() - startTime, 'ms');

            // Cancel old notifications first
            if (oldTimer?.notificationId) {
                await cancelScheduledNotification(oldTimer.notificationId);
            }
            if (oldTimer?.reminderNotificationId) {
                await cancelScheduledNotification(oldTimer.reminderNotificationId);
            }

            console.log('🗑️ Old notifications cancelled, elapsed:', Date.now() - startTime, 'ms');

            // Pre-calculate timing for new timer
            const delayInSec = calculateTimingForTimer(timerData);
            console.log('⏱️ New timing calculated, elapsed:', Date.now() - startTime, 'ms');

            // Prepare updated timer
            const timerToUpdate = {
                ...timerData,
                date: new Date(timerData.date),
                notificationId: null,
                reminderNotificationId: null
            };

            // Schedule new notifications immediately
            let notifications = { notificationId: null, reminderNotificationId: null };
            if (timerData.isCountdown && delayInSec >= 10) {
                console.log('🔔 Scheduling new notifications');
                const notificationStart = Date.now();

                notifications = await scheduleNotificationsOptimized(timerToUpdate, delayInSec);

                console.log('✅ New notifications scheduled, took:', Date.now() - notificationStart, 'ms');
            }

            // Final timer with notification IDs
            const finalTimer = {
                ...timerToUpdate,
                notificationId: notifications.notificationId,
                reminderNotificationId: notifications.reminderNotificationId
            };

            console.log('⏱️ About to update timer in manager, elapsed:', Date.now() - startTime, 'ms');

            // Single storage operation
            await manager.editTimer(finalTimer);

            console.log('✅ Timer updated in manager, elapsed:', Date.now() - startTime, 'ms');

            // Update UI
            syncTimers();

            console.log('✅ EditTimer completed, total elapsed:', Date.now() - startTime, 'ms');

        } catch (error) {
            console.error('❌ Error editing timer:', error);
            console.error('Total time before error:', Date.now() - startTime, 'ms');
        }
    };

    const removeTimer = async (id) => {
        console.log('🗑️ Removing timer:', id);
        try {
            const timer = manager.getTimer(id);

            // Cancel notifications using helper
            if (timer?.notificationId) {
                await cancelScheduledNotification(timer.notificationId);
            }
            if (timer?.reminderNotificationId) {
                await cancelScheduledNotification(timer.reminderNotificationId);
            }

            await manager.removeTimer(id);
            syncTimers();
        } catch (error) {
            console.error('❌ Error removing timer:', error);
        }
    };

    const clearAllTimers = async () => {
        console.log('🧹 Clearing all timers');
        try {
            // Use helper to clear all notifications
            await clearAllScheduledNotifications();
            await manager.clearAllTimers();
            syncTimers();
        } catch (error) {
            console.error('❌ Error clearing all timers:', error);
        }
    };

    const initializeTimers = async () => {
        console.log('🚀 Initializing timers');
        try {
            await manager.initializeTimers();
            syncTimers();
            console.log('✅ Timers initialized');
        } catch (error) {
            console.error('❌ Error initializing timers:', error);
        }
    };

    const refreshTimers = useCallback(async () => {
        console.log('🔄 Refreshing timers from storage');
        try {
            await manager.loadFromStorage();
            syncTimers();
            console.log('✅ Timers refreshed');
        } catch (error) {
            console.error('❌ Error refreshing timers:', error);
        }
    }, [syncTimers]);

    const toggleFavourite = async (id) => {
        try {
            await manager.toggleFavourite(id);
            syncTimers();
        } catch (error) {
            console.error('❌ Error toggling favourite:', error);
        }
    };


    return (
        <TimerContext.Provider value={{
            timers, isLoading,
            addTimer, removeTimer, clearAllTimers,
            initializeTimers, editTimer,
            setTimersAndSave, refreshTimers,
            toggleFavourite
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