import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

// Storage keys for all theme settings
const STORAGE_KEYS = {
    DARK_MODE: 'isDarkMode',
    FONT_SCALE: 'fontSizeScale',
    CORNER_RADIUS: 'cornerRadius',
    ZOOM_SCALE: 'zoomScale',
    VIBRATION: 'vibrationEnabled',
    HAPTIC: 'hapticFeedback',
    ANIMATION_SPEED: 'animationSpeed'
};

// Default values for all settings
const DEFAULT_VALUES = {
    DARK_MODE: true,
    FONT_SCALE: 1.0,
    CORNER_RADIUS: 8,
    ZOOM_SCALE: 1.0,
    VIBRATION: true,
    HAPTIC: true,
    ANIMATION_SPEED: 1.0
};

export function ThemeProvider({ children }) {
    // State for all theme settings
    const [isDarkMode, setIsDarkMode] = useState(DEFAULT_VALUES.DARK_MODE);
    const [fontSizeScale, setFontSizeScale] = useState(DEFAULT_VALUES.FONT_SCALE);
    const [cornerRadius, setCornerRadius] = useState(DEFAULT_VALUES.CORNER_RADIUS);
    const [zoomScale, setZoomScale] = useState(DEFAULT_VALUES.ZOOM_SCALE);
    const [vibrationEnabled, setVibrationEnabled] = useState(DEFAULT_VALUES.VIBRATION);
    const [hapticFeedback, setHapticFeedback] = useState(DEFAULT_VALUES.HAPTIC);
    const [animationSpeed, setAnimationSpeed] = useState(DEFAULT_VALUES.ANIMATION_SPEED);

    // Load all settings from storage on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const [
                    darkMode,
                    fontScale,
                    radius,
                    zoom,
                    vibration,
                    haptic,
                    animation
                ] = await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE),
                    AsyncStorage.getItem(STORAGE_KEYS.FONT_SCALE),
                    AsyncStorage.getItem(STORAGE_KEYS.CORNER_RADIUS),
                    AsyncStorage.getItem(STORAGE_KEYS.ZOOM_SCALE),
                    AsyncStorage.getItem(STORAGE_KEYS.VIBRATION),
                    AsyncStorage.getItem(STORAGE_KEYS.HAPTIC),
                    AsyncStorage.getItem(STORAGE_KEYS.ANIMATION_SPEED)
                ]);

                if (darkMode !== null) setIsDarkMode(darkMode === 'true');
                if (fontScale !== null) setFontSizeScale(parseFloat(fontScale));
                if (radius !== null) setCornerRadius(parseInt(radius));
                if (zoom !== null) setZoomScale(parseFloat(zoom));
                if (vibration !== null) setVibrationEnabled(vibration === 'true');
                if (haptic !== null) setHapticFeedback(haptic === 'true');
                if (animation !== null) setAnimationSpeed(parseFloat(animation));
            } catch (e) {
                console.error('Failed to load theme settings', e);
            }
        };

        loadSettings();
    }, []);

    // Save settings to storage when they change
    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE, isDarkMode.toString());
    }, [isDarkMode]);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.FONT_SCALE, fontSizeScale.toString());
    }, [fontSizeScale]);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.CORNER_RADIUS, cornerRadius.toString());
    }, [cornerRadius]);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.ZOOM_SCALE, zoomScale.toString());
    }, [zoomScale]);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.VIBRATION, vibrationEnabled.toString());
    }, [vibrationEnabled]);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.HAPTIC, hapticFeedback.toString());
    }, [hapticFeedback]);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.ANIMATION_SPEED, animationSpeed.toString());
    }, [animationSpeed]);

    // Toggle functions
    const toggleDarkMode = () => setIsDarkMode(prev => !prev);
    const toggleVibration = () => setVibrationEnabled(prev => !prev);
    const toggleHapticFeedback = () => setHapticFeedback(prev => !prev);

    return (
        <ThemeContext.Provider
            value={{
                // State values
                isDarkMode,
                fontSizeScale,
                cornerRadius,
                zoomScale,
                vibrationEnabled,
                hapticFeedback,
                animationSpeed,

                // Setter functions
                toggleDarkMode,
                setFontSizeScale,
                setCornerRadius,
                setZoomScale,
                toggleVibration,
                toggleHapticFeedback,
                setAnimationSpeed
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}
export { ThemeContext };
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}