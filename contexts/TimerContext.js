import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { TimerManager } from '../classes/TimeManager';
import Timer from '../classes/Timer';
import * as Notifications from 'expo-notifications';
import { clearAllScheduledNotifications, cancelScheduledNotification } from '../utils/notifications/Notify';
import { AppState } from 'react-native';

const TimerContext = createContext();
const manager = new TimerManager();

const toTimer = (data) => data instanceof Timer ? data : new Timer(data);

export const TimerProvider = ({ children }) => {
    const [timers, setTimers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const refreshIntervalRef = useRef(null);
    const appStateRef = useRef(AppState.currentState);

    const syncTimers = useCallback(() => {
        setTimers(manager.getAllTimers());
    }, []);

    const handleNotificationResponse = useCallback(async (response) => {
        const { timerId, type } = response?.notification?.request?.content?.data || {};
        if (!timerId) return;

        console.log(`📱 Notification response received: ${type} for ${timerId}`);

        const T = manager.getTimer(timerId);
        if (!T) return;

        // Handle main timer notification
        if (type === 'timer_complete' && T.isRecurring && T.isCountdown) {
            try {
                await manager.advanceRecurringTimer(timerId);
                syncTimers();
                console.log(`🔄 Advanced recurring timer: ${T.title}`);
            } catch (error) {
                console.error('❌ Failed to advance recurring timer:', error);
            }
        }
    }, [syncTimers]);

    const handleAppStateChange = useCallback(async (nextAppState) => {
        if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
            console.log('📱 App became active - refreshing timers');

            // Handle any expired recurring timers
            await manager.handleExpiredTimers();

            // Refresh all timers to ensure accuracy
            await manager.refreshTimers();
            syncTimers();
        }
        appStateRef.current = nextAppState;
    }, [syncTimers]);

    useEffect(() => {
        const notificationSubscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            notificationSubscription.remove();
            appStateSubscription?.remove();
        };
    }, [handleNotificationResponse, handleAppStateChange]);

    // Set up periodic refresh for active timers
    useEffect(() => {
        const startPeriodicRefresh = () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }

            refreshIntervalRef.current = setInterval(async () => {
                try {
                    await manager.handleExpiredTimers();
                    syncTimers();
                } catch (error) {
                    console.error('❌ Periodic refresh error:', error);
                }
            }, 30000); // Check every 30 seconds
        };

        if (timers.length > 0) {
            startPeriodicRefresh();
        }

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [timers.length, syncTimers]);

    useEffect(() => {
        const init = async () => {
            try {
                setIsLoading(true);
                await manager.loadFromStorage();
                syncTimers();
            } catch (e) {
                console.error('Error loading timers:', e);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [syncTimers]);

    const addTimer = async (data) => {
        try {
            const timer = toTimer({ ...data, date: new Date(data.date) });
            await manager.addTimer(timer);
            syncTimers();
            console.log(`✅ Successfully added timer: ${timer.title}`);
        } catch (e) {
            console.error('Error adding timer:', e);
            throw e; // Re-throw to allow UI error handling
        }
    };

    const editTimer = async (data) => {
        try {
            const timer = toTimer({ ...data, date: new Date(data.date) });
            await manager.editTimer(timer);
            syncTimers();
            console.log(`✅ Successfully edited timer: ${timer.title}`);
        } catch (e) {
            console.error('Error editing timer:', e);
            throw e;
        }
    };

    const removeTimer = async (id) => {
        try {
            await manager.removeTimer(id);
            syncTimers();
            console.log(`✅ Successfully removed timer: ${id}`);
        } catch (e) {
            console.error('Error removing timer:', e);
            throw e;
        }
    };

    const clearAllTimers = async () => {
        try {
            await manager.clearAllTimers();
            syncTimers();
            console.log('✅ Successfully cleared all timers');
        } catch (e) {
            console.error('Error clearing timers:', e);
            throw e;
        }
    };

    const initializeTimers = async () => {
        try {
            await manager.initializeTimers();
            syncTimers();
            console.log('✅ Successfully initialized timers');
        } catch (e) {
            console.error('Error initializing timers:', e);
            throw e;
        }
    };

    const refreshTimers = useCallback(async () => {
        try {
            await manager.refreshTimers();
            syncTimers();
            console.log('✅ Successfully refreshed timers');
        } catch (e) {
            console.error('Error refreshing timers:', e);
            throw e;
        }
    }, [syncTimers]);

    const toggleFavourite = async (id) => {
        try {
            await manager.toggleFavourite(id);
            syncTimers();
            console.log(`✅ Successfully toggled favourite for: ${id}`);
        } catch (e) {
            console.error('Error toggling favourite:', e);
            throw e;
        }
    };

    const setTimersAndSave = async (newTimers) => {
        try {
            const existing = manager.getAllTimers();
            const existingIds = new Set(existing.map(t => t.id));

            for (let timer of newTimers) {
                const T = toTimer(timer);

                // Skip if identical timer already exists
                if (existing.find(e =>
                    e.title === T.title &&
                    e.date.toString() === T.date.toString() &&
                    e.personName === T.personName &&
                    e.isCountdown === T.isCountdown &&
                    e.isRecurring === T.isRecurring &&
                    e.recurrenceInterval === T.recurrenceInterval
                )) continue;

                // Generate new ID if conflict exists
                if (existingIds.has(T.id)) {
                    T.id = uuid.v4();
                }

                await manager.addTimer(T);
            }

            syncTimers();
            console.log(`✅ Successfully imported ${newTimers.length} timers`);
        } catch (e) {
            console.error('Error saving timers:', e);
            throw e;
        }
    };

    // NEW: Get timers that need user attention
    const getTimersNeedingAttention = useCallback(() => {
        return manager.getTimersNeedingAttention();
    }, []);

    // NEW: Manually advance a recurring timer
    const advanceRecurringTimer = async (id) => {
        try {
            await manager.advanceRecurringTimer(id);
            syncTimers();
            console.log(`✅ Successfully advanced recurring timer: ${id}`);
        } catch (e) {
            console.error('Error advancing recurring timer:', e);
            throw e;
        }
    };

    // NEW: Force refresh all notification schedules
    const rescheduleAllNotifications = async () => {
        try {
            setIsLoading(true);

            // Cancel all existing notifications
            await clearAllScheduledNotifications();

            // Clear notification IDs from all timers
            manager.getAllTimers().forEach(timer => {
                timer.notificationId = null;
                timer.reminderNotificationId = null;
                timer.notificationScheduledFor = null;
            });

            // Reschedule all active countdown timers
            const activeTimers = manager.getAllTimers().filter(timer =>
                timer.isCountdown && timer.isActive()
            );

            for (const timer of activeTimers) {
                await timer.scheduleNotification();
            }

            await manager.saveTimers();
            syncTimers();

            console.log(`✅ Rescheduled notifications for ${activeTimers.length} timers`);
        } catch (e) {
            console.error('Error rescheduling notifications:', e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const contextValue = {
        // State
        timers,
        isLoading,

        // Basic CRUD operations
        addTimer,
        editTimer,
        removeTimer,
        clearAllTimers,

        // Initialization and refresh
        initializeTimers,
        refreshTimers,

        // Import/Export
        setTimersAndSave,

        // Timer management
        toggleFavourite,
        advanceRecurringTimer,

        // Utility functions
        getTimersNeedingAttention,
        rescheduleAllNotifications,
    };

    return (
        <TimerContext.Provider value={contextValue}>
            {children}
        </TimerContext.Provider>
    );
};

export const useTimers = () => {
    const context = React.useContext(TimerContext);
    if (!context) {
        throw new Error('useTimers must be used within a TimerProvider');
    }
    return context;
}