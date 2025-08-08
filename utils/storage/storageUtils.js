import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_SHOWN_VERSION_KEY = "lastShownVersion";
const ENCRYPTION_KEY_STORAGE = 'ENCRYPTION_KEY';

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
    } catch { }
};

export const getStoredItem = async (key) => {
    try {
        return await AsyncStorage.getItem(key);
    } catch {
        return null;
    }
};

export const setStoredItem = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value);
    } catch { }
};

export { ENCRYPTION_KEY_STORAGE };
