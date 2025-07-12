import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_SHOWN_VERSION_KEY = "lastShownVersion";

export const getLastShownVersion = async () => {
    try {
        return await AsyncStorage.getItem(LAST_SHOWN_VERSION_KEY);
    } catch {
        return null;
    }
};

export const setLastShownVersion = async (version) => {
    try {
        await AsyncStorage.setItem(LAST_SHOWN_VERSION_KEY, version);
    } catch {
        // handle if needed
    }
};