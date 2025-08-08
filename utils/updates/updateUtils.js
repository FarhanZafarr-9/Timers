// utils/updates/updateUtils.js
import { useEffect, useState } from 'react';
import { changelog } from '../constants/appInfo';
import { getLastShownVersion } from '../storage/storageUtils';
import * as Updates from 'expo-updates';

export const useCheckForUpdate = () => {
    const [showChangelog, setShowChangelog] = useState(false);

    useEffect(() => {
        const checkVersion = async () => {
            const lastVersion = await getLastShownVersion();
            if (lastVersion !== changelog[0].version) {
                setShowChangelog(true);
            }
        };
        checkVersion();
    }, []);

    return [showChangelog, setShowChangelog];
};

export async function checkForUpdateAndReload() {
    if (__DEV__) {
        console.log("🚀 Skipping OTA check in Expo Go (__DEV__ mode).");
        return 'dev-mode';
    }

    try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
            console.log("✅ New update found, downloading...");
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
            return 'updated';
        } else {
            console.log("👍 App is up to date.");
            return 'up-to-date';
        }
    } catch (err) {
        console.log("⚠️ Expo update check failed:", err);
        return 'error';
    }
}
