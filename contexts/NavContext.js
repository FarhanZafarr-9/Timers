import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NavBarContext = createContext();
const SHOULD_HIDE_KEY = 'navbar_should_hide';

export function NavBarProvider({ children }) {
    const visible = useRef(true);
    const shouldHide = useRef(false);
    const timeoutRef = useRef(null);
    const [, update] = useState(0);

    useEffect(() => {
        const loadShouldHide = async () => {
            try {
                const savedValue = await AsyncStorage.getItem(SHOULD_HIDE_KEY);
                if (savedValue !== null) {
                    shouldHide.current = savedValue === 'true';
                    update(Math.random());
                }
            } catch (e) {
                console.warn('Failed to load shouldHide preference:', e);
            }
        };

        loadShouldHide();
    }, []);

    const setVisible = useCallback((val = true) => {
        visible.current = val;
        update(Math.random());
    }, []);

    const setShouldHide = useCallback(async (val = true) => {
        shouldHide.current = val;

        try {
            await AsyncStorage.setItem(SHOULD_HIDE_KEY, String(val));
        } catch (e) {
            console.warn('Failed to save shouldHide preference:', e);
        }

        if (!val && timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        update(Math.random());
    }, []);

    const resetTimeout = useCallback(() => {
        if (!shouldHide.current) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            visible.current = false;
            update(Math.random());
        }, 4000);
    }, []);

    const trigger = useCallback(() => {
        if (!visible.current) setVisible(true);
        resetTimeout();
    }, [resetTimeout, setVisible]);

    return (
        <NavBarContext.Provider value={{
            visible: visible.current,
            shouldHide: shouldHide.current,
            trigger,
            setShouldHide
        }}>
            {children}
        </NavBarContext.Provider>
    );
}

export const useNavBar = () => useContext(NavBarContext);