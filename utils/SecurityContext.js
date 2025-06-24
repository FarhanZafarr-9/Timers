import React, { createContext, useContext, useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SecurityContext = createContext();

const FINGERPRINT_KEY = 'isFingerprintEnabled';
const PASSWORD_LOCK_KEY = 'isPasswordLockEnabled';
const PASSWORD_KEY = 'appLockPassword';
const PRIVACY_KEY = 'isPrivacyEnabled';
const PRIVACY_MODE_KEY = 'privacyMode';

export const SecurityProvider = ({ children }) => {

    const [isSensorAvailable, setIsSensorAvailable] = useState(false);
    const [loading, setLoading] = useState(true);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [justSetPassword, setJustSetPassword] = useState(false);
    const [isPasswordLockEnabled, setIsPasswordLockEnabled] = useState(undefined);
    const [isFingerprintEnabled, setIsFingerprintEnabled] = useState(undefined);
    const [privacyMode, setPrivacyMode] = useState('off');
    const [password, setPassword] = useState(undefined);

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
                setPrivacyMode(storedPrivacyMode || 'off');
            } catch (e) {
                setIsFingerprintEnabled(false);
                setIsPasswordLockEnabled(false);
                setIsPrivacyEnabled(false);
                setPassword('');
            }
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
            setIsSensorAvailable(hasHardware && supportedTypes.length > 0);
            setLoading(false);
        })();
    }, []);

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

    // Toggle fingerprint authentication
    const toggleFingerprint = () => {
        if (isSensorAvailable) {
            setIsFingerprintEnabled((prev) => !prev);
        }
    };

    // Toggle privacy setting
    const togglePrivacy = () => {
        setIsPrivacyEnabled((prev) => {
            const newValue = !prev;
            AsyncStorage.setItem(PRIVACY_KEY, newValue ? 'true' : 'false');
            return newValue;
        });
    };

    // Set password and enable password lock
    const savePassword = async (newPassword) => {
        setPassword(newPassword);
        setIsPasswordLockEnabled(true);
        setJustSetPassword(true);
        await AsyncStorage.setItem(PASSWORD_KEY, newPassword);
        //await AsyncStorage.setItem(PASSWORD_LOCK_KEY, 'true');
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
        return result.success;
    };

    // Check password
    const checkPassword = (input) => password && input === password;

    return (
        <SecurityContext.Provider
            value={{
                isFingerprintEnabled,
                toggleFingerprint,
                isSensorAvailable,
                authenticate,
                loading,
                isPasswordLockEnabled,
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
            }}
        >
            {children}
        </SecurityContext.Provider>
    );
};

export const useSecurity = () => useContext(SecurityContext);