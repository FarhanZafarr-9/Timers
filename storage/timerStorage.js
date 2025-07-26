import AsyncStorage from '@react-native-async-storage/async-storage';

const TIMERS_KEY = 'timers_data';

export const saveTimers = async (timers) => {
    try {
        await AsyncStorage.setItem(TIMERS_KEY, JSON.stringify(timers));
        return true;
    } catch (e) {
        console.error('Failed to save timers:', e);
        throw e;
    }
};

export const loadTimers = async () => {
    try {
        const raw = await AsyncStorage.getItem(TIMERS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Failed to load timers:', e);
        return [];
    }
};

export const clearTimers = async () => {
    try {
        await AsyncStorage.removeItem(TIMERS_KEY);
        return true;
    } catch (e) {
        console.error('Failed to clear timers:', e);
        throw e;
    }
};

export const addTimer = async (newTimer) => {
    try {
        const timers = await loadTimers();
        timers.push(newTimer);
        return await saveTimers(timers);
    } catch (e) {
        console.error('Failed to add timer:', e);
        throw e;
    }
};

export const editTimer = async (id, updates) => {
    try {
        const timers = await loadTimers();
        const index = timers.findIndex(T => T.id === id);
        if (index === -1) throw new Error(`Timer with ID ${id} not found`);

        timers[index] = { ...timers[index], ...updates };
        return await saveTimers(timers);
    } catch (e) {
        console.error('Failed to edit timer:', e);
        throw e;
    }
};

export const deleteTimer = async (id) => {
    try {
        const timers = await loadTimers();
        const updated = timers.filter(T => T.id !== id);
        if (updated.length === timers.length)
            throw new Error(`Timer with ID ${id} not found`);

        return await saveTimers(updated);
    } catch (e) {
        console.error('Failed to delete timer:', e);
        throw e;
    }
};

export const getStorageStats = async () => {
    try {
        const timers = await loadTimers();
        const size = JSON.stringify(timers).length;
        return {
            timerCount: timers.length,
            storageSize: size,
            lastModified: new Date().toISOString()
        };
    } catch (e) {
        console.error('Failed to get stats:', e);
        return {
            timerCount: 0,
            storageSize: 0,
            lastModified: null,
            error: e.message
        };
    }
};