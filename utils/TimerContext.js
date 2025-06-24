import React, { createContext, useState, useEffect, useCallback } from 'react';
import { TimerManager } from '../classes/TimeManager';
import * as Notifications from 'expo-notifications';

const TimerContext = createContext();

const manager = new TimerManager();

export const TimerProvider = ({ children }) => {
    const [timers, setTimers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Function to sync timers from manager to state
    const syncTimers = useCallback(() => {
        const currentTimers = manager.getAllTimers();
        setTimers(currentTimers);
    }, []);

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

    const setTimersAndSave = async (newTimers) => {
        try {
            await manager.clearAllTimers();
            for (const timer of newTimers) {
                await manager.addTimer(timer);
            }
            syncTimers(); // Sync state after operations
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
        } else if (secondsUntilEnd > 60 * 30) { // > 30 minutes
            return 60 * 10; // 10 minutes before
        } else if (secondsUntilEnd > 60 * 5) { // > 5 minutes
            return 60 * 2; // 2 minutes before
        } else if (secondsUntilEnd > 30) { // > 30 seconds
            return 10; // 10 seconds before
        }
        return 0; // Too short, no reminder
    }

    const addTimer = async (timerData) => {
        try {
            let notificationId = null;
            let reminderNotificationId = null;

            if (timerData.isCountdown) {
                const targetDate = new Date(timerData.date);
                const now = new Date();

                console.log('Scheduling notification:', {
                    now: now.toISOString(),
                    target: targetDate.toISOString(),
                    differenceMs: targetDate - now
                });

                if (targetDate > now) {
                    const triggerSeconds = Math.floor((targetDate - now) / 1000);

                    // Main notification
                    notificationId = await Notifications.scheduleNotificationAsync({
                        content: {
                            title: timerData.title || "Timer Alert",
                            body: `Timer for ${timerData.personName || 'someone'} has completed!`,
                            sound: true,
                        },
                        trigger: {
                            seconds: triggerSeconds,
                            channelId: 'timer-alerts'
                        },
                    });

                    // Reminder notification
                    const reminderOffset = getReminderOffset(triggerSeconds);
                    if (reminderOffset > 0) {
                        const reminderTime = triggerSeconds - reminderOffset;
                        if (reminderTime > 0) {
                            reminderNotificationId = await Notifications.scheduleNotificationAsync({
                                content: {
                                    title: timerData.title || "Timer Reminder",
                                    body: `Timer for ${timerData.personName || 'someone'} is coming up!`,
                                    sound: true,
                                },
                                trigger: {
                                    seconds: reminderTime,
                                    channelId: 'timer-alerts'
                                },
                            });
                        }
                    }
                }
            }

            // Create the timer with notification IDs
            const timerToAdd = {
                ...timerData,
                date: new Date(timerData.date),
                notificationId,
                reminderNotificationId
            };

            await manager.addTimer(timerToAdd);
            syncTimers(); // Sync state after adding
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
                const targetDate = new Date(timerData.date);
                const now = new Date();

                if (targetDate > now) {
                    const triggerSeconds = Math.floor((targetDate - now) / 1000);

                    notificationId = await Notifications.scheduleNotificationAsync({
                        content: {
                            title: timerData.title || "Timer Alert",
                            body: `Timer for ${timerData.personName || 'someone'} has completed!`,
                            sound: true,
                        },
                        trigger: {
                            seconds: triggerSeconds,
                            channelId: 'timer-alerts'
                        },
                    });

                    const reminderOffset = getReminderOffset(triggerSeconds);
                    if (reminderOffset > 0) {
                        const reminderTime = triggerSeconds - reminderOffset;
                        if (reminderTime > 0) {
                            reminderNotificationId = await Notifications.scheduleNotificationAsync({
                                content: {
                                    title: timerData.title || "Timer Reminder",
                                    body: `Timer for ${timerData.personName || 'someone'} is coming up!`,
                                    sound: true,
                                },
                                trigger: {
                                    seconds: reminderTime,
                                    channelId: 'timer-alerts'
                                },
                            });
                        }
                    }
                }
            }

            const timerToUpdate = {
                ...timerData,
                date: new Date(timerData.date),
                notificationId,
                reminderNotificationId
            };

            await manager.editTimer(timerToUpdate);
            syncTimers(); // Sync state after editing
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
            syncTimers(); // Sync state after removing
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
            syncTimers(); // Sync state after clearing
        } catch (error) {
            console.error('Error clearing all timers:', error);
        }
    };

    const initializeTimers = async () => {
        try {
            await manager.initializeTimers();
            syncTimers(); // Sync state after initialization
        } catch (error) {
            console.error('Error initializing timers:', error);
        }
    };

    // Refresh function to manually sync timers (useful for debugging or force updates)
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
                refreshTimers, // Added for manual refresh capability
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