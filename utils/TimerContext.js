import React, { createContext, useState, useEffect, useCallback } from 'react';
import { TimerManager } from '../classes/TimeManager';
import Timer from '../classes/Timer';
import * as Notifications from 'expo-notifications';
import { clearAllScheduledNotifications, cancelScheduledNotification } from './Notify';

const TimerContext = createContext();
const manager = new TimerManager();

const toTimer = (data) => data instanceof Timer ? data : new Timer(data);

export const TimerProvider = ({ children }) => {
    const [timers, setTimers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const syncTimers = useCallback(() => {
        setTimers(manager.getAllTimers());
    }, []);

    const handleNotificationResponse = useCallback(async (response) => {
        const { timerId } = response?.notification?.request?.content?.data || {};
        if (!timerId) return;

        const T = manager.getTimer(timerId);
        if (!T || !T.isRecurring || !T.isCountdown) return;

        const timer = toTimer(T);
        timer.scheduleNotification();
        await manager.editTimer(timer);
        syncTimers();
    }, [syncTimers]);

    useEffect(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
        return () => subscription.remove();
    }, [handleNotificationResponse]);

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
            if (timer.isCountdown) timer.scheduleNotification();
            await manager.addTimer(timer);
            syncTimers();
        } catch (e) {
            console.error('Error adding timer:', e);
        }
    };

    const editTimer = async (data) => {
        try {
            const timer = toTimer({ ...data, date: new Date(data.date) });
            const old = manager.getTimer(timer.id);

            if (old?.notificationId) await cancelScheduledNotification(old.notificationId);

            if (timer.isCountdown) timer.scheduleNotification();
            await manager.editTimer(timer);
            syncTimers();
        } catch (e) {
            console.error('Error editing timer:', e);
        }
    };

    const removeTimer = async (id) => {
        try {
            const T = manager.getTimer(id);
            if (T?.notificationId) await cancelScheduledNotification(T.notificationId);
            await manager.removeTimer(id);
            syncTimers();
        } catch (e) {
            console.error('Error removing timer:', e);
        }
    };

    const clearAllTimers = async () => {
        try {
            await clearAllScheduledNotifications();
            await manager.clearAllTimers();
            syncTimers();
        } catch (e) {
            console.error('Error clearing timers:', e);
        }
    };

    const initializeTimers = async () => {
        try {
            await manager.initializeTimers();
            syncTimers();
        } catch (e) {
            console.error('Error initializing timers:', e);
        }
    };

    const refreshTimers = useCallback(async () => {
        try {
            await manager.loadFromStorage();
            syncTimers();
        } catch (e) {
            console.error('Error refreshing timers:', e);
        }
    }, [syncTimers]);

    const toggleFavourite = async (id) => {
        try {
            await manager.toggleFavourite(id);
            syncTimers();
        } catch (e) {
            console.error('Error toggling favourite:', e);
        }
    };

    const setTimersAndSave = async (newTimers) => {
        try {
            const existing = manager.getAllTimers();
            const existingIds = new Set(existing.map(t => t.id));

            for (let timer of newTimers) {
                const T = toTimer(timer);
                if (existing.find(e =>
                    e.title === T.title &&
                    e.date.toString() === T.date.toString() &&
                    e.personName === T.personName &&
                    e.isCountdown === T.isCountdown &&
                    e.isRecurring === T.isRecurring &&
                    e.recurrenceInterval === T.recurrenceInterval
                )) continue;

                if (existingIds.has(T.id)) T.id = uuid.v4();
                if (T.isCountdown) T.scheduleNotification();

                await manager.addTimer(T);
            }

            syncTimers();
        } catch (e) {
            console.error('Error saving timers:', e);
        }
    };

    return (
        <TimerContext.Provider value={{
            timers, isLoading,
            addTimer, editTimer, removeTimer,
            clearAllTimers, initializeTimers,
            setTimersAndSave, refreshTimers,
            toggleFavourite
        }}>
            {children}
        </TimerContext.Provider>
    );
};

export const useTimers = () => {
    const context = React.useContext(TimerContext);
    if (!context) throw new Error('useTimers must be used within a TimerProvider');
    return context;
};
