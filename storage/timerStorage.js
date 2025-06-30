import AsyncStorage from '@react-native-async-storage/async-storage';

const TIMERS_KEY = 'timers_data';

export async function saveTimers(timers) {
    try {
        //console.log('Saving Timers to AsyncStorage:', timers.length);
        const jsonValue = JSON.stringify(timers);
        await AsyncStorage.setItem(TIMERS_KEY, jsonValue);
        //console.log('Timers successfully saved to AsyncStorage.');
        return true;
    } catch (e) {
        console.error('Error saving timers to storage:', e);
        throw e;
    }
}

export async function loadTimers() {
    try {
        const jsonValue = await AsyncStorage.getItem(TIMERS_KEY);
        if (!jsonValue) {
            //console.log('No timers found in AsyncStorage.');
            return [];
        }
        const timers = JSON.parse(jsonValue);
        //console.log('Loaded Timers from AsyncStorage:', timers.length);
        return timers;
    } catch (e) {
        console.error('Error loading timers from storage:', e);
        return [];
    }
}

export async function clearTimers() {
    try {
        await AsyncStorage.removeItem(TIMERS_KEY);
        //console.log('Timers cleared from AsyncStorage.');
        return true;
    } catch (e) {
        console.error('Error clearing timers:', e);
        throw e;
    }
}

// Helper function to add a single timer (optional - you can use TimerManager instead)
export async function addTimer(newTimer) {
    try {
        const timers = await loadTimers();
        timers.push(newTimer);
        await saveTimers(timers);
        //console.log('Timer added:', newTimer.id);
        return true;
    } catch (e) {
        console.error('Error adding timer:', e);
        throw e;
    }
}

// Helper function to edit a timer (optional - you can use TimerManager instead)
export async function editTimer(id, updatedFields) {
    try {
        const timers = await loadTimers();
        const timerIndex = timers.findIndex(timer => timer.id === id);

        if (timerIndex === -1) {
            throw new Error(`Timer with ID ${id} not found`);
        }

        timers[timerIndex] = { ...timers[timerIndex], ...updatedFields };
        await saveTimers(timers);
        //console.log(`Timer with ID ${id} updated:`, updatedFields);
        return true;
    } catch (e) {
        console.error('Error editing timer:', e);
        throw e;
    }
}

// Helper function to delete a timer (optional - you can use TimerManager instead)
export async function deleteTimer(id) {
    try {
        const timers = await loadTimers();
        const updatedTimers = timers.filter(timer => timer.id !== id);

        if (updatedTimers.length === timers.length) {
            throw new Error(`Timer with ID ${id} not found`);
        }

        await saveTimers(updatedTimers);
        //console.log(`Timer with ID ${id} deleted.`);
        return true;
    } catch (e) {
        console.error('Error deleting timer:', e);
        throw e;
    }
}

// Get storage stats (useful for debugging)
export async function getStorageStats() {
    try {
        const timers = await loadTimers();
        const jsonValue = JSON.stringify(timers);
        return {
            timerCount: timers.length,
            storageSize: jsonValue.length,
            lastModified: new Date().toISOString()
        };
    } catch (e) {
        console.error('Error getting storage stats:', e);
        return {
            timerCount: 0,
            storageSize: 0,
            lastModified: null,
            error: e.message
        };
    }
}