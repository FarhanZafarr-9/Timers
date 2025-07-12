// utils/useCheckForUpdate.js
import { useEffect, useState } from 'react';
import { getLastShownVersion } from './updateStorage';
import { changelog } from './functions';

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