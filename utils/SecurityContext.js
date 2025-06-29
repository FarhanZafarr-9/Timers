// src/contexts/SecurityContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lockoutOptions } from './functions';

const SecurityContext = createContext();

const FINGERPRINT_KEY = 'isFingerprintEnabled';
const PASSWORD_LOCK_KEY = 'isPasswordLockEnabled';
const PASSWORD_KEY = 'appLockPassword';
const PRIVACY_MODE_KEY = 'privacyMode';
const LOCKOUT_MODE_KEY = 'lockoutMode';
const LAST_ACTIVE_TIME_KEY = 'lastActiveTime';

// Helper function to get timeout value by mode
const getTimeoutByMode = (mode) => {
    const option = lockoutOptions.find(opt => opt.value === mode);
    return option ? (option.value === null ? null : parseInt(option.value, 10)) : null;
};

export const SecurityProvider = ({ children }) => {
    const [isSensorAvailable, setIsSensorAvailable] = useState(false);
    const [loading, setLoading] = useState(true);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [justSetPassword, setJustSetPassword] = useState(false);
    const [isPasswordLockEnabled, setIsPasswordLockEnabled] = useState(undefined);
    const [isFingerprintEnabled, setIsFingerprintEnabled] = useState(undefined);
    const [privacyMode, setPrivacyMode] = useState(undefined);
    const [password, setPassword] = useState(undefined);
    const [lockoutMode, setLockoutMode] = useState(undefined);

    // New state for lockout functionality
    const [isAppLocked, setIsAppLocked] = useState(false);
    const [lastActiveTime, setLastActiveTime] = useState(null);
    const [appState, setAppState] = useState(AppState.currentState);

    // Refs for timers
    const lockoutTimerRef = useRef(null);
    const appStateRef = useRef(appState);

    // Load settings from storage on mount
    useEffect(() => {
        (async () => {
            try {
                const storedFingerprint = await AsyncStorage.getItem(FINGERPRINT_KEY);
                setIsFingerprintEnabled(storedFingerprint === null ? false : storedFingerprint === 'true');

                const storedPasswordLock = await AsyncStorage.getItem(PASSWORD_LOCK_KEY);
                setIsPasswordLockEnabled(storedPasswordLock === null ? false : storedPasswordLock === 'true');

                const storedPassword = await AsyncStorage.getItem(PASSWORD_KEY);
                setPassword(storedPassword || '');

                const storedPrivacyMode = await AsyncStorage.getItem(PRIVACY_MODE_KEY);
                setPrivacyMode(storedPrivacyMode === null || storedPrivacyMode === undefined ? 'off' : storedPrivacyMode);

                const storedLockoutMode = await AsyncStorage.getItem(LOCKOUT_MODE_KEY);
                setLockoutMode(storedLockoutMode === null || storedLockoutMode === undefined ? lockoutOptions[lockoutOptions.length - 1].value : storedLockoutMode);

                const storedLastActiveTime = await AsyncStorage.getItem(LAST_ACTIVE_TIME_KEY);
                if (storedLastActiveTime) {
                    setLastActiveTime(parseInt(storedLastActiveTime, 10));
                }
            } catch (e) {
                setIsFingerprintEnabled(false);
                setIsPasswordLockEnabled(false);
                setPassword('');
                setPrivacyMode('off');
                setLockoutMode(lockoutOptions[lockoutOptions.length - 1].value); // Default to "Never"
                setLastActiveTime(null);
            }

            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
            setIsSensorAvailable(hasHardware && supportedTypes.length > 0);
            setLoading(false);
        })();
    }, []);

    // App state change handler for lockout functionality
    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
                // App has come to the foreground
                checkLockoutStatus();
            } else if (appStateRef.current === 'active' && nextAppState.match(/inactive|background/)) {
                // App is going to background
                handleAppGoingToBackground();
            }

            appStateRef.current = nextAppState;
            setAppState(nextAppState);
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription?.remove();
            if (lockoutTimerRef.current) {
                clearTimeout(lockoutTimerRef.current);
            }
        };
    }, [lockoutMode, isPasswordLockEnabled, isFingerprintEnabled]);

    // Check if app should be locked when coming to foreground
    const checkLockoutStatus = async () => {
        if (!shouldUseLockout()) return;

        const currentTime = Date.now();
        const storedLastActiveTime = await AsyncStorage.getItem(LAST_ACTIVE_TIME_KEY);

        if (storedLastActiveTime) {
            const lastActive = parseInt(storedLastActiveTime, 10);
            const timeInBackground = currentTime - lastActive;
            const lockoutTimeout = getTimeoutByMode(lockoutMode);

            if (lockoutTimeout !== null && timeInBackground >= lockoutTimeout) {
                setIsAppLocked(true);
            }
        }
    };

    // Handle app going to background
    const handleAppGoingToBackground = async () => {
        if (!shouldUseLockout()) return;

        const currentTime = Date.now();
        setLastActiveTime(currentTime);
        await AsyncStorage.setItem(LAST_ACTIVE_TIME_KEY, currentTime.toString());

        // Set immediate lock if lockout mode is '0' (Instant)
        if (lockoutMode === '0') {
            setIsAppLocked(true);
        } else {
            // Set timer for other lockout modes
            const lockoutTimeout = getTimeoutByMode(lockoutMode);
            if (lockoutTimeout && lockoutTimeout > 0) {
                lockoutTimerRef.current = setTimeout(() => {
                    setIsAppLocked(true);
                }, lockoutTimeout);
            }
        }
    };

    // Check if lockout should be used based on current settings
    const shouldUseLockout = () => {
        
        return (
            (isPasswordLockEnabled || isFingerprintEnabled)
        );
    };

    // Clear lockout timer
    const clearLockoutTimer = () => {
        if (lockoutTimerRef.current) {
            clearTimeout(lockoutTimerRef.current);
            lockoutTimerRef.current = null;
        }
    };

    const logEverything = () => {
        console.log('isFingerprintEnabled:', isFingerprintEnabled);
        console.log('isPasswordLockEnabled:', isPasswordLockEnabled);
        console.log('password:', password);
        console.log('privacyMode:', privacyMode);
        console.log('lockoutMode:', lockoutMode);
        console.log('isAppLocked:', isAppLocked);
        console.log('lastActiveTime:', lastActiveTime);
        console.log('appState:', appState);
        console.log('isSensorAvailable:', isSensorAvailable);
        console.log('shouldUseLockout:', shouldUseLockout());
        console.log('lockoutOptions:', lockoutOptions);
        console.log('lockoutTimerRef:', lockoutTimerRef.current);
        console.log('appStateRef:', appStateRef.current);
    };

    // Update last active time when user interacts with app
    const updateLastActiveTime = async () => {
        const currentTime = Date.now();
        setLastActiveTime(currentTime);
        await AsyncStorage.setItem(LAST_ACTIVE_TIME_KEY, currentTime.toString());
        clearLockoutTimer();
    };

    // Unlock the app after successful authentication
    const unlockApp = async () => {
        setIsAppLocked(false);
        await updateLastActiveTime();
    };

    // Save fingerprint setting to storage when it changes
    useEffect(() => {
        if (isFingerprintEnabled !== undefined) {
            AsyncStorage.setItem(FINGERPRINT_KEY, isFingerprintEnabled ? 'true' : 'false');
        }
    }, [isFingerprintEnabled]);

    // Save password lock setting to storage when it changes
    useEffect(() => {
        if (isPasswordLockEnabled !== undefined) {
            AsyncStorage.setItem(PASSWORD_LOCK_KEY, isPasswordLockEnabled ? 'true' : 'false');
        }
    }, [isPasswordLockEnabled]);

    // Save privacy mode to storage when it changes
    useEffect(() => {
        if (privacyMode !== undefined) {
            AsyncStorage.setItem(PRIVACY_MODE_KEY, privacyMode);
        }
    }, [privacyMode]);

    // Save password to storage when it changes
    useEffect(() => {
        if (isPasswordLockEnabled && password) {
            AsyncStorage.setItem(PASSWORD_KEY, password);
        }
    }, [isPasswordLockEnabled, password]);

    // Save lockout mode to storage when it changes
    useEffect(() => {
        if (lockoutMode !== undefined) {
            AsyncStorage.setItem(LOCKOUT_MODE_KEY, lockoutMode);
        }
    }, [lockoutMode]);

    // Toggle fingerprint authentication
    const toggleFingerprint = () => {
        if (isSensorAvailable) {
            setIsFingerprintEnabled((prev) => !prev);
        }
    };

    const togglePasswordLock = () => {
        setIsPasswordLockEnabled((prev) => !prev);
    };

    // Set privacy mode to a specific value
    const setPrivacyModeValue = (mode) => {
        setPrivacyMode(mode);
    };

    // Set lockout mode to a specific value
    const setLockoutModeValue = (mode) => {
        setLockoutMode(mode);
        // Clear any existing timer when changing lockout mode
        clearLockoutTimer();
    };

    // Set password and enable password lock
    const savePassword = async (newPassword) => {
        setPassword(newPassword);
        setIsPasswordLockEnabled(true);
        setJustSetPassword(true);
        await AsyncStorage.setItem(PASSWORD_KEY, newPassword);
    };

    // Remove password and disable password lock
    const clearPassword = async () => {
        setPassword('');
        setIsPasswordLockEnabled(false);
        await AsyncStorage.removeItem(PASSWORD_KEY);
        await AsyncStorage.setItem(PASSWORD_LOCK_KEY, 'false');
    };

    // Authenticate user with biometrics
    const authenticate = async () => {
        if (!isSensorAvailable) return false;
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authenticate',
            fallbackLabel: 'Enter Passcode',
            disableDeviceFallback: false,
        });

        if (result.success) {
            await updateLastActiveTime();
        }

        return result.success;
    };

    // Check password
    const checkPassword = (input) => password && input === password;

    // Get formatted time remaining until lockout (for UI display)
    const getTimeUntilLockout = () => {
        if (!shouldUseLockout() || !lastActiveTime) return null;

        const currentTime = Date.now();
        const timeInBackground = currentTime - lastActiveTime;
        const lockoutTimeout = getTimeoutByMode(lockoutMode);

        if (!lockoutTimeout || lockoutTimeout === 0) return null;

        const timeRemaining = lockoutTimeout - timeInBackground;
        return timeRemaining > 0 ? timeRemaining : 0;
    };

    return (
        <SecurityContext.Provider
            value={{
                isFingerprintEnabled,
                toggleFingerprint,
                isSensorAvailable,
                authenticate,
                loading,
                isPasswordLockEnabled,
                togglePasswordLock,
                setIsPasswordLockEnabled,
                password,
                savePassword,
                clearPassword,
                checkPassword,
                passwordModalVisible,
                setPasswordModalVisible,
                justSetPassword,
                setJustSetPassword,
                privacyMode,
                setPrivacyMode,
                setPrivacyModeValue,
                lockoutMode,
                setLockoutMode,
                setLockoutModeValue,
                isAppLocked,
                setIsAppLocked,
                unlockApp,
                updateLastActiveTime,
                getTimeUntilLockout,
                shouldUseLockout,
                lockoutOptions,
                lastActiveTime,
                appState,
                logEverything
            }}
        >
            {children}
        </SecurityContext.Provider>
    );
};

export const useSecurity = () => useContext(SecurityContext);