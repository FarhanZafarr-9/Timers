import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Appearance, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const STORAGE_KEYS = {
    THEME: 'userThemePreference',
    ACCENT: 'userAccentPreference',
    NAVIGATION: 'navigationModePreference',
    LAYOUT: 'layoutModePreference',
    HEADER: 'headerModePreference',
    PROGRESS: 'progressModePreference',
    UNIT: 'defaultUnitPreference',
    BORDER: 'borderModePreference',
    FIXED_BORDER: 'fixedBorderPreference',
    BACKGROUND_PATTERN: 'backgroundPatternPreference'
};

const VALID_VALUES = {
    THEMES: ['light', 'dark', 'system'],
    ACCENTS: ['default', 'blue', 'green', 'purple', 'rose', 'amber', 'teal', 'indigo', 'cyan', 'lime', 'fuchsia', 'slate'],
    UNITS: ['seconds', 'minutes', 'hours', 'days', 'months', 'years', 'auto'],
    BACKGROUND_PATTERNS: ['none', 'grid', 'polka', 'waves', 'noise', 'diagonal', 'cross'],
    NAVIGATION_MODES: ['floating', 'fixed', 'side'],
    HEADER_MODES: ['collapsible', 'fixed', 'minimized'],
    BORDER_MODES: ['none', 'thin', 'subtle', 'thick'],
    LAYOUT_MODES: ['list', 'grid'],
    PROGRESS_MODES: ['linear', 'halfWave', 'fullWave']
};

// Helper functions
const normalizeValue = (value, validValues, defaultValue) => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'boolean') return value;
    if (validValues.includes(value)) return value;
    return defaultValue;
};

const getSystemTheme = () => {
    try {
        return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
    } catch (error) {
        console.warn('Failed to get system color scheme:', error);
        return 'light';
    }
};

// Theme Context
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    // State
    const [isLoading, setIsLoading] = useState(true);
    const [themeMode, setThemeModeState] = useState('system');
    const [theme, setTheme] = useState(getSystemTheme());
    const [accentMode, setAccentModeState] = useState('blue');
    const [navigationMode, setNavigationMode] = useState('floating');
    const [layoutMode, setLayoutMode] = useState('list');
    const [headerMode, setHeaderMode] = useState('minimized');
    const [progressMode, setProgressMode] = useState('linear');
    const [borderMode, setBorderMode] = useState('subtle');
    const [defaultUnit, setDefaultUnit] = useState('auto');
    const [fixedBorder, setFixedBorder] = useState(false);
    const [backgroundPattern, setBackgroundPattern] = useState('none');

    // Derived values
    const resolvePaletteKey = () => {
        if (accentMode === 'default') return theme;
        return theme + accentMode.charAt(0).toUpperCase() + accentMode.slice(1);
    };

    const colors = palettes[resolvePaletteKey()] || palettes.dark;
    const styles = createStyles(colors);
    const borderWidth = borderMode === 'none' ? 0 :
        borderMode === 'thin' ? variables.borderWidth.thin :
            borderMode === 'subtle' ? variables.borderWidth.regular :
                variables.borderWidth.thick;

    // Effect: Load all preferences
    useEffect(() => {
        let isMounted = true;

        const loadPreferences = async () => {
            try {
                const storedValues = await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.THEME),
                    AsyncStorage.getItem(STORAGE_KEYS.ACCENT),
                    AsyncStorage.getItem(STORAGE_KEYS.NAVIGATION),
                    AsyncStorage.getItem(STORAGE_KEYS.HEADER),
                    AsyncStorage.getItem(STORAGE_KEYS.LAYOUT),
                    AsyncStorage.getItem(STORAGE_KEYS.BORDER),
                    AsyncStorage.getItem(STORAGE_KEYS.PROGRESS),
                    AsyncStorage.getItem(STORAGE_KEYS.UNIT),
                    AsyncStorage.getItem(STORAGE_KEYS.FIXED_BORDER),
                    AsyncStorage.getItem(STORAGE_KEYS.BACKGROUND_PATTERN)
                ]);

                if (!isMounted) return;

                // Set all preferences with normalization
                setThemeModeState(normalizeValue(storedValues[0], VALID_VALUES.THEMES, 'system'));
                setAccentModeState(normalizeValue(storedValues[1], VALID_VALUES.ACCENTS, 'blue'));
                setNavigationMode(normalizeValue(storedValues[2], VALID_VALUES.NAVIGATION_MODES, 'floating'));
                setHeaderMode(normalizeValue(storedValues[3], VALID_VALUES.HEADER_MODES, 'minimized'));
                setLayoutMode(normalizeValue(storedValues[4], VALID_VALUES.LAYOUT_MODES, 'list'));
                setBorderMode(normalizeValue(storedValues[5], VALID_VALUES.BORDER_MODES, 'subtle'));
                setProgressMode(normalizeValue(storedValues[6], VALID_VALUES.PROGRESS_MODES, 'linear'));
                setDefaultUnit(normalizeValue(storedValues[7], VALID_VALUES.UNITS, 'auto'));
                setFixedBorder(storedValues[8] === 'true');
                setBackgroundPattern(normalizeValue(storedValues[9], VALID_VALUES.BACKGROUND_PATTERNS, 'none'));

                // Set initial theme
                const initialTheme = storedValues[0] === 'system' ? getSystemTheme() : storedValues[0];
                setTheme(normalizeValue(initialTheme, ['light', 'dark'], 'light'));

                setIsLoading(false);
            } catch (e) {
                console.warn('Failed to load preferences:', e);
                if (isMounted) setIsLoading(false);
            }
        };

        loadPreferences();
        return () => { isMounted = false; };
    }, []);

    // Effect: Save preferences when they change
    const useSavePreference = (key, value) => {
        useEffect(() => {
            if (!isLoading) {
                const storageValue = typeof value === 'boolean' ? String(value) : value;
                AsyncStorage.setItem(key, storageValue).catch(e =>
                    console.warn(`Failed to save ${key} preference:`, e)
                );
            }
        }, [value, isLoading]);
    };

    useSavePreference(STORAGE_KEYS.THEME, themeMode);
    useSavePreference(STORAGE_KEYS.ACCENT, accentMode);
    useSavePreference(STORAGE_KEYS.NAVIGATION, navigationMode);
    useSavePreference(STORAGE_KEYS.HEADER, headerMode);
    useSavePreference(STORAGE_KEYS.LAYOUT, layoutMode);
    useSavePreference(STORAGE_KEYS.BORDER, borderMode);
    useSavePreference(STORAGE_KEYS.PROGRESS, progressMode);
    useSavePreference(STORAGE_KEYS.UNIT, defaultUnit);
    useSavePreference(STORAGE_KEYS.FIXED_BORDER, fixedBorder);
    useSavePreference(STORAGE_KEYS.BACKGROUND_PATTERN, backgroundPattern);

    // Effect: Handle system theme changes
    useEffect(() => {
        let subscription = null;

        if (themeMode === 'system') {
            subscription = Appearance.addChangeListener(({ colorScheme }) => {
                setTheme(colorScheme === 'dark' ? 'dark' : 'light');
            });
            setTheme(getSystemTheme());
        } else {
            setTheme(themeMode);
        }

        return () => subscription?.remove?.();
    }, [themeMode]);

    // Context value
    const contextValue = {
        theme,
        themeMode,
        setThemeMode: (mode) => setThemeModeState(normalizeValue(mode, VALID_VALUES.THEMES, 'system')),
        isDarkMode: theme === 'dark' || (theme==='system' && Appearance.getColorScheme() === 'dark'),
        accentMode,
        setAccentMode: (accent) => setAccentModeState(normalizeValue(accent, VALID_VALUES.ACCENTS, 'blue')),
        navigationMode,
        setNavigationMode: (mode) => setNavigationMode(normalizeValue(mode, VALID_VALUES.NAVIGATION_MODES, 'floating')),
        headerMode,
        setHeaderMode: (mode) => setHeaderMode(normalizeValue(mode, VALID_VALUES.HEADER_MODES, 'minimized')),
        layoutMode,
        setLayoutMode: (mode) => setLayoutMode(normalizeValue(mode, VALID_VALUES.LAYOUT_MODES, 'list')),
        borderMode,
        setBorderMode: (mode) => setBorderMode(normalizeValue(mode, VALID_VALUES.BORDER_MODES, 'subtle')),
        progressMode,
        setProgressMode: (mode) => setProgressMode(normalizeValue(mode, VALID_VALUES.PROGRESS_MODES, 'linear')),
        defaultUnit,
        setDefaultUnit: (unit) => setDefaultUnit(normalizeValue(unit, VALID_VALUES.UNITS, 'auto')),
        fixedBorder,
        setFixedBorder,
        backgroundPattern,
        setBackgroundPattern: (pattern) => setBackgroundPattern(normalizeValue(pattern, VALID_VALUES.BACKGROUND_PATTERNS, 'none')),
        colors,
        variables,
        styles,
        isBorder: borderMode !== 'none',
        border: borderWidth,
        isLoading
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

// Keep these unchanged (they're already clean)
export const useTheme = () => useContext(ThemeContext);
export const createThemedStyles = (styleFactory) => (colors, variables) => StyleSheet.create(styleFactory(colors, variables) || {});
export const useThemedStyles = (styleFactory) => createThemedStyles(styleFactory)(useTheme().colors, useTheme().variables);
export const makeStyles = (styleFactory) => (console.warn('makeStyles is deprecated. Use useThemedStyles hook instead.'), useThemedStyles(styleFactory));

// Keep your palettes and variables objects unchanged
const palettes = {
    light: {
        background: '#f5f5f5',
        card: '#fafafa',
        cardLighter: '#f8f8f8',
        cardBorder: '#e0e0e0',
        settingBlock: '#f2f2f2',
        text: '#2a2a2a',
        textSecondary: '#4a4a4a',
        textTitle: '#1f1f1f',
        textDesc: '#7a7a7a',
        snackbarBg: '#fafafa',
        snackbarText: '#2a2a2a',
        modalBg: '#fafafa',
        modalText: '#2a2a2a',
        modalBtnBg: '#f2f2f2',
        modalBtnText: '#4a4a4a',
        modalBtnOkBg: 'rgba(42, 42, 42, 0.06)',
        modalBtnOkText: '#2a2a2a',
        switchTrack: '#d0d0d0',
        switchTrackActive: '#4a4a4a',
        switchThumb: '#fafafa',
        switchThumbActive: '#fafafa',
        border: '#e0e0e0',
        divider: '#ebebeb',
        highlight: '#2a2a2a',
        addButtonBg: 'rgba(42, 42, 42, 0.05)',
        addButtonBorder: '#707070',
        cancelButtonBg: 'rgba(42, 42, 42, 0.03)',
        cancelButtonBorder: '#a0a0a0',
    },

    lightBlue: {
        background: '#f7f8fb',
        card: '#fafbfd',
        cardLighter: '#f5f6fa',
        cardBorder: '#dde4f0',
        settingBlock: '#f0f4f9',
        text: '#2c3e50',
        textSecondary: '#485563',
        textTitle: '#1e2a36',
        textDesc: '#6b7c8b',
        snackbarBg: '#fafbfd',
        snackbarText: '#2c3e50',
        modalBg: '#fafbfd',
        modalText: '#2c3e50',
        modalBtnBg: '#eeeff6',
        modalBtnText: '#485563',
        modalBtnOkBg: 'rgba(59, 130, 246, 0.06)',
        modalBtnOkText: '#4a7bc8',
        switchTrack: '#c5d1e0',
        switchTrackActive: '#5b8ce8',
        switchThumb: '#fafbfd',
        switchThumbActive: '#fafbfd',
        border: '#dde4f0',
        divider: '#eeeff6',
        highlight: '#5b8ce8',
        addButtonBg: 'rgba(59, 130, 246, 0.04)',
        addButtonBorder: '#7a9ed4',
        cancelButtonBg: 'rgba(44, 62, 80, 0.03)',
        cancelButtonBorder: '#9aa8b5',
    },

    lightGreen: {
        background: '#f7faf8',
        card: '#fafdfa',
        cardLighter: '#f5f9f6',
        cardBorder: '#d8f0e1',
        settingBlock: '#edf9f0',
        text: '#2c3e50',
        textSecondary: '#485563',
        textTitle: '#1e2a36',
        textDesc: '#6b7c8b',
        snackbarBg: '#fafdfa',
        snackbarText: '#2c3e50',
        modalBg: '#fafdfa',
        modalText: '#2c3e50',
        modalBtnBg: '#eeeff6',
        modalBtnText: '#485563',
        modalBtnOkBg: 'rgba(34, 197, 94, 0.06)',
        modalBtnOkText: '#2d8f5a',
        switchTrack: '#c5d1e0',
        switchTrackActive: '#4ade80',
        switchThumb: '#fafdfa',
        switchThumbActive: '#fafdfa',
        border: '#d8f0e1',
        divider: '#eeeff6',
        highlight: '#4ade80',
        addButtonBg: 'rgba(34, 197, 94, 0.04)',
        addButtonBorder: '#2d8f5a',
        cancelButtonBg: 'rgba(44, 62, 80, 0.03)',
        cancelButtonBorder: '#9aa8b5',
    },

    lightPurple: {
        background: '#faf8fc',
        card: '#fdfdfe',
        cardLighter: '#f8f6fb',
        cardBorder: '#e9dff2',
        settingBlock: '#f5f0fa',
        text: '#2c3e50',
        textSecondary: '#485563',
        textTitle: '#1e2a36',
        textDesc: '#6b7c8b',
        snackbarBg: '#fdfdfe',
        snackbarText: '#2c3e50',
        modalBg: '#fdfdfe',
        modalText: '#2c3e50',
        modalBtnBg: '#eeeff6',
        modalBtnText: '#485563',
        modalBtnOkBg: 'rgba(168, 85, 247, 0.06)',
        modalBtnOkText: '#8b5dd6',
        switchTrack: '#c5d1e0',
        switchTrackActive: '#a855f7',
        switchThumb: '#fdfdfe',
        switchThumbActive: '#fdfdfe',
        border: '#e9dff2',
        divider: '#eeeff6',
        highlight: '#a855f7',
        addButtonBg: 'rgba(168, 85, 247, 0.04)',
        addButtonBorder: '#9b6cd8',
        cancelButtonBg: 'rgba(44, 62, 80, 0.03)',
        cancelButtonBorder: '#9aa8b5',
    },

    lightRose: {
        background: '#fcf8f9',
        card: '#fefbfc',
        cardLighter: '#faf6f7',
        cardBorder: '#f2dfe3',
        settingBlock: '#faf0f2',
        text: '#2c3e50',
        textSecondary: '#485563',
        textTitle: '#1e2a36',
        textDesc: '#6b7c8b',
        snackbarBg: '#fefbfc',
        snackbarText: '#2c3e50',
        modalBg: '#fefbfc',
        modalText: '#2c3e50',
        modalBtnBg: '#eeeff6',
        modalBtnText: '#485563',
        modalBtnOkBg: 'rgba(244, 63, 94, 0.06)',
        modalBtnOkText: '#d83961',
        switchTrack: '#c5d1e0',
        switchTrackActive: '#f43f5e',
        switchThumb: '#fefbfc',
        switchThumbActive: '#fefbfc',
        border: '#f2dfe3',
        divider: '#eeeff6',
        highlight: '#f43f5e',
        addButtonBg: 'rgba(244, 63, 94, 0.04)',
        addButtonBorder: '#d83961',
        cancelButtonBg: 'rgba(44, 62, 80, 0.03)',
        cancelButtonBorder: '#9aa8b5',
    },

    lightAmber: {
        background: '#fcfaf6',
        card: '#fefcf8',
        cardLighter: '#faf8f3',
        cardBorder: '#f5e184',
        settingBlock: '#fcf8f1',
        text: '#2c3e50',
        textSecondary: '#485563',
        textTitle: '#1e2a36',
        textDesc: '#6b7c8b',
        snackbarBg: '#fefcf8',
        snackbarText: '#2c3e50',
        modalBg: '#fefcf8',
        modalText: '#2c3e50',
        modalBtnBg: '#eeeff6',
        modalBtnText: '#485563',
        modalBtnOkBg: 'rgba(245, 158, 11, 0.06)',
        modalBtnOkText: '#cc8a0a',
        switchTrack: '#c5d1e0',
        switchTrackActive: '#f59e0b',
        switchThumb: '#fefcf8',
        switchThumbActive: '#fefcf8',
        border: '#f5e184',
        divider: '#eeeff6',
        highlight: '#f59e0b',
        addButtonBg: 'rgba(245, 158, 11, 0.04)',
        addButtonBorder: '#cc8a0a',
        cancelButtonBg: 'rgba(44, 62, 80, 0.03)',
        cancelButtonBorder: '#9aa8b5',
    },

    lightTeal: {
        background: '#f6fbfa',
        card: '#f9fdfc',
        cardLighter: '#f3f9f7',
        cardBorder: '#ceeee7',
        settingBlock: '#edf9f6',
        text: '#2c3e50',
        textSecondary: '#485563',
        textTitle: '#1e2a36',
        textDesc: '#6b7c8b',
        snackbarBg: '#f9fdfc',
        snackbarText: '#2c3e50',
        modalBg: '#f9fdfc',
        modalText: '#2c3e50',
        modalBtnBg: '#eeeff6',
        modalBtnText: '#485563',
        modalBtnOkBg: 'rgba(20, 184, 166, 0.06)',
        modalBtnOkText: '#199d88',
        switchTrack: '#c5d1e0',
        switchTrackActive: '#14b8a6',
        switchThumb: '#f9fdfc',
        switchThumbActive: '#f9fdfc',
        border: '#ceeee7',
        divider: '#eeeff6',
        highlight: '#14b8a6',
        addButtonBg: 'rgba(20, 184, 166, 0.04)',
        addButtonBorder: '#199d88',
        cancelButtonBg: 'rgba(44, 62, 80, 0.03)',
        cancelButtonBorder: '#9aa8b5',
    },

    lightIndigo: {
        background: '#f7f8fb',
        card: '#fafbfd',
        cardLighter: '#f5f6fa',
        cardBorder: '#dde2fa',
        settingBlock: '#eef4fb',
        text: '#2c3e50',
        textSecondary: '#485563',
        textTitle: '#1e2a36',
        textDesc: '#6b7c8b',
        snackbarBg: '#fafbfd',
        snackbarText: '#2c3e50',
        modalBg: '#fafbfd',
        modalText: '#2c3e50',
        modalBtnBg: '#eeeff6',
        modalBtnText: '#485563',
        modalBtnOkBg: 'rgba(99, 102, 241, 0.06)',
        modalBtnOkText: '#5d60d1',
        switchTrack: '#c5d1e0',
        switchTrackActive: '#6366f1',
        switchThumb: '#fafbfd',
        switchThumbActive: '#fafbfd',
        border: '#dde2fa',
        divider: '#eeeff6',
        highlight: '#6366f1',
        addButtonBg: 'rgba(99, 102, 241, 0.04)',
        addButtonBorder: '#6064d4',
        cancelButtonBg: 'rgba(44, 62, 80, 0.03)',
        cancelButtonBorder: '#9aa8b5',
    },

    lightCyan: {
        background: '#f6fafe',
        card: '#f9fcfe',
        cardLighter: '#f3f8fd',
        cardBorder: '#ccf7fb',
        settingBlock: '#ebfafd',
        text: '#2c3e50',
        textSecondary: '#485563',
        textTitle: '#1e2a36',
        textDesc: '#6b7c8b',
        snackbarBg: '#f9fcfe',
        snackbarText: '#2c3e50',
        modalBg: '#f9fcfe',
        modalText: '#2c3e50',
        modalBtnBg: '#eeeff6',
        modalBtnText: '#485563',
        modalBtnOkBg: 'rgba(6, 182, 212, 0.06)',
        modalBtnOkText: '#0e9bb0',
        switchTrack: '#c5d1e0',
        switchTrackActive: '#06b6d4',
        switchThumb: '#f9fcfe',
        switchThumbActive: '#f9fcfe',
        border: '#ccf7fb',
        divider: '#eeeff6',
        highlight: '#06b6d4',
        addButtonBg: 'rgba(6, 182, 212, 0.04)',
        addButtonBorder: '#0e9bb0',
        cancelButtonBg: 'rgba(44, 62, 80, 0.03)',
        cancelButtonBorder: '#9aa8b5',
    },

    lightLime: {
        background: '#f9fcf5',
        card: '#fbfdf8',
        cardLighter: '#f7fbf2',
        cardBorder: '#d6f598',
        settingBlock: '#f5fce4',
        text: '#2c3e50',
        textSecondary: '#485563',
        textTitle: '#1e2a36',
        textDesc: '#6b7c8b',
        snackbarBg: '#fbfdf8',
        snackbarText: '#2c3e50',
        modalBg: '#fbfdf8',
        modalText: '#2c3e50',
        modalBtnBg: '#eeeff6',
        modalBtnText: '#485563',
        modalBtnOkBg: 'rgba(132, 204, 22, 0.06)',
        modalBtnOkText: '#6b9515',
        switchTrack: '#c5d1e0',
        switchTrackActive: '#84cc16',
        switchThumb: '#fbfdf8',
        switchThumbActive: '#fbfdf8',
        border: '#d6f598',
        divider: '#eeeff6',
        highlight: '#84cc16',
        addButtonBg: 'rgba(132, 204, 22, 0.04)',
        addButtonBorder: '#6b9515',
        cancelButtonBg: 'rgba(44, 62, 80, 0.03)',
        cancelButtonBorder: '#9aa8b5',
    },

    lightFuchsia: {
        background: '#fbf8fe',
        card: '#fdfbfe',
        cardLighter: '#f9f3fd',
        cardBorder: '#f0cbfb',
        settingBlock: '#f8f2fd',
        text: '#2c3e50',
        textSecondary: '#485563',
        textTitle: '#1e2a36',
        textDesc: '#6b7c8b',
        snackbarBg: '#fdfbfe',
        snackbarText: '#2c3e50',
        modalBg: '#fdfbfe',
        modalText: '#2c3e50',
        modalBtnBg: '#eeeff6',
        modalBtnText: '#485563',
        modalBtnOkBg: 'rgba(217, 70, 239, 0.06)',
        modalBtnOkText: '#b544c7',
        switchTrack: '#c5d1e0',
        switchTrackActive: '#d946ef',
        switchThumb: '#fdfbfe',
        switchThumbActive: '#fdfbfe',
        border: '#f0cbfb',
        divider: '#eeeff6',
        highlight: '#d946ef',
        addButtonBg: 'rgba(217, 70, 239, 0.04)',
        addButtonBorder: '#bb53ca',
        cancelButtonBg: 'rgba(44, 62, 80, 0.03)',
        cancelButtonBorder: '#9aa8b5',
    },

    lightSlate: {
        background: '#f9f9fa',
        card: '#fcfcfd',
        cardLighter: '#f6f7f8',
        cardBorder: '#dde3eb',
        settingBlock: '#f5f7f9',
        text: '#2c3e50',
        textSecondary: '#485563',
        textTitle: '#1e2a36',
        textDesc: '#6b7c8b',
        snackbarBg: '#fcfcfd',
        snackbarText: '#2c3e50',
        modalBg: '#fcfcfd',
        modalText: '#2c3e50',
        modalBtnBg: '#eeeff6',
        modalBtnText: '#485563',
        modalBtnOkBg: 'rgba(100, 116, 139, 0.06)',
        modalBtnOkText: '#586575',
        switchTrack: '#c5d1e0',
        switchTrackActive: '#64748b',
        switchThumb: '#fcfcfd',
        switchThumbActive: '#fcfcfd',
        border: '#dde3eb',
        divider: '#eeeff6',
        highlight: '#64748b',
        addButtonBg: 'rgba(100, 116, 139, 0.04)',
        addButtonBorder: '#5d6b7a',
        cancelButtonBg: 'rgba(44, 62, 80, 0.03)',
        cancelButtonBorder: '#9aa8b5',
    },
    dark: {
        background: '#0a0a0a',
        card: '#161616',
        cardLighter: '#1f1f1f',
        cardBorder: '#2a2a2a55',
        settingBlock: '#1a1a1a',
        text: '#f5f5f5',
        textSecondary: '#a8a8a8',
        textTitle: '#ffffff',
        textDesc: '#888888',
        snackbarBg: '#1a1a1a',
        snackbarText: '#f5f5f5',
        modalBg: '#161616',
        modalText: '#f5f5f5',
        modalBtnBg: '#2a2a2a',
        modalBtnText: '#a8a8a8',
        modalBtnOkBg: 'rgba(255, 255, 255, 0.08)',
        modalBtnOkText: '#f5f5f5',
        switchTrack: '#333333',
        switchTrackActive: '#666666',
        switchThumb: '#d4d4d4',
        switchThumbActive: '#f5f5f5',
        border: '#55555555',
        divider: '#242424',
        highlight: '#f5f5f5',
        addButtonBg: 'rgba(255, 255, 255, 0.08)',
        addButtonBorder: '#666666',
        cancelButtonBg: 'rgba(255, 255, 255, 0.06)',
        cancelButtonBorder: '#555555',
    },
    darkBlue: {
        background: '#0a0b0f',
        card: '#141620',
        cardLighter: '#1a1d28',
        cardBorder: '#2a2d3855',
        settingBlock: '#171a24',
        text: '#f5f6fa',
        textSecondary: '#a8adb8',
        textTitle: '#ffffff',
        textDesc: '#888d98',
        snackbarBg: '#141620',
        snackbarText: '#f5f6fa',
        modalBg: '#141620',
        modalText: '#f5f6fa',
        modalBtnBg: '#242834',
        modalBtnText: '#a8adb8',
        modalBtnOkBg: 'rgba(59, 130, 246, 0.12)',
        modalBtnOkText: '#5b9cf6',
        switchTrack: '#333853',
        switchTrackActive: '#3b82f6',
        switchThumb: '#d4d4d8',
        switchThumbActive: '#ffffff',
        border: '#2a2d3855',
        divider: '#1f2229',
        highlight: '#3b82f6',
        addButtonBg: 'rgba(59, 130, 246, 0.08)',
        addButtonBorder: '#4f76c7',
        cancelButtonBg: 'rgba(255, 255, 255, 0.06)',
        cancelButtonBorder: '#555555',
    },

    darkGreen: {
        background: '#0a0f0b',
        card: '#141a16',
        cardLighter: '#1a221c',
        cardBorder: '#2a342c55',
        settingBlock: '#171f19',
        text: '#f5faf6',
        textSecondary: '#a8b8aa',
        textTitle: '#ffffff',
        textDesc: '#889a8a',
        snackbarBg: '#141a16',
        snackbarText: '#f5faf6',
        modalBg: '#141a16',
        modalText: '#f5faf6',
        modalBtnBg: '#242f26',
        modalBtnText: '#a8b8aa',
        modalBtnOkBg: 'rgba(34, 197, 94, 0.12)',
        modalBtnOkText: '#4ade80',
        switchTrack: '#335338',
        switchTrackActive: '#22c55e',
        switchThumb: '#d4d8d4',
        switchThumbActive: '#ffffff',
        border: '#2a342c55',
        divider: '#1f2722',
        highlight: '#22c55e',
        addButtonBg: 'rgba(34, 197, 94, 0.08)',
        addButtonBorder: '#1e9a4f',
        cancelButtonBg: 'rgba(255, 255, 255, 0.06)',
        cancelButtonBorder: '#555555',
    },

    darkPurple: {
        background: '#0f0a0f',
        card: '#1a1420',
        cardLighter: '#221a28',
        cardBorder: '#342a3855',
        settingBlock: '#1f1724',
        text: '#faf5fa',
        textSecondary: '#b8a8b8',
        textTitle: '#ffffff',
        textDesc: '#9a889a',
        snackbarBg: '#1a1420',
        snackbarText: '#faf5fa',
        modalBg: '#1a1420',
        modalText: '#faf5fa',
        modalBtnBg: '#2f2434',
        modalBtnText: '#b8a8b8',
        modalBtnOkBg: 'rgba(168, 85, 247, 0.12)',
        modalBtnOkText: '#c4a4f7',
        switchTrack: '#533853',
        switchTrackActive: '#a855f7',
        switchThumb: '#d8d4d8',
        switchThumbActive: '#ffffff',
        border: '#342a3855',
        divider: '#271f29',
        highlight: '#a855f7',
        addButtonBg: 'rgba(168, 85, 247, 0.08)',
        addButtonBorder: '#8b46d4',
        cancelButtonBg: 'rgba(255, 255, 255, 0.06)',
        cancelButtonBorder: '#555555',
    },

    darkRose: {
        background: '#0f0a0c',
        card: '#201416',
        cardLighter: '#281a1c',
        cardBorder: '#382a2c55',
        settingBlock: '#241719',
        text: '#faf5f6',
        textSecondary: '#b8a8aa',
        textTitle: '#ffffff',
        textDesc: '#9a888a',
        snackbarBg: '#201416',
        snackbarText: '#faf5f6',
        modalBg: '#201416',
        modalText: '#faf5f6',
        modalBtnBg: '#342426',
        modalBtnText: '#b8a8aa',
        modalBtnOkBg: 'rgba(244, 63, 94, 0.12)',
        modalBtnOkText: '#f472a6',
        switchTrack: '#533838',
        switchTrackActive: '#f43f5e',
        switchThumb: '#d8d4d4',
        switchThumbActive: '#ffffff',
        border: '#382a2c55',
        divider: '#271f21',
        highlight: '#f43f5e',
        addButtonBg: 'rgba(244, 63, 94, 0.08)',
        addButtonBorder: '#d63650',
        cancelButtonBg: 'rgba(255, 255, 255, 0.06)',
        cancelButtonBorder: '#555555',
    },

    darkAmber: {
        background: '#0f0d0a',
        card: '#201a14',
        cardLighter: '#28221a',
        cardBorder: '#38322a55',
        settingBlock: '#241e17',
        text: '#faf8f5',
        textSecondary: '#b8b0a8',
        textTitle: '#ffffff',
        textDesc: '#9a9288',
        snackbarBg: '#201a14',
        snackbarText: '#faf8f5',
        modalBg: '#201a14',
        modalText: '#faf8f5',
        modalBtnBg: '#342e24',
        modalBtnText: '#b8b0a8',
        modalBtnOkBg: 'rgba(245, 158, 11, 0.12)',
        modalBtnOkText: '#fbbf24',
        switchTrack: '#534638',
        switchTrackActive: '#f59e0b',
        switchThumb: '#d8d6d4',
        switchThumbActive: '#ffffff',
        border: '#38322a55',
        divider: '#272119',
        highlight: '#f59e0b',
        addButtonBg: 'rgba(245, 158, 11, 0.08)',
        addButtonBorder: '#d18509',
        cancelButtonBg: 'rgba(255, 255, 255, 0.06)',
        cancelButtonBorder: '#555555',
    },

    darkTeal: {
        background: '#0a0f0e',
        card: '#141f1e',
        cardLighter: '#1a2827',
        cardBorder: '#2a383555',
        settingBlock: '#172420',
        text: '#f5faf9',
        textSecondary: '#a8b8b6',
        textTitle: '#ffffff',
        textDesc: '#889a98',
        snackbarBg: '#141f1e',
        snackbarText: '#f5faf9',
        modalBg: '#141f1e',
        modalText: '#f5faf9',
        modalBtnBg: '#24342f',
        modalBtnText: '#a8b8b6',
        modalBtnOkBg: 'rgba(20, 184, 166, 0.12)',
        modalBtnOkText: '#5eead4',
        switchTrack: '#335350',
        switchTrackActive: '#14b8a6',
        switchThumb: '#d4d8d6',
        switchThumbActive: '#ffffff',
        border: '#2a383555',
        divider: '#1f2f2a',
        highlight: '#14b8a6',
        addButtonBg: 'rgba(20, 184, 166, 0.08)',
        addButtonBorder: '#0d9488',
        cancelButtonBg: 'rgba(255, 255, 255, 0.06)',
        cancelButtonBorder: '#555555',
    },

    darkIndigo: {
        background: '#0a0a0f',
        card: '#14141f',
        cardLighter: '#1a1a28',
        cardBorder: '#2a2a3855',
        settingBlock: '#171724',
        text: '#f5f5fa',
        textSecondary: '#a8a8b8',
        textTitle: '#ffffff',
        textDesc: '#888898',
        snackbarBg: '#14141f',
        snackbarText: '#f5f5fa',
        modalBg: '#14141f',
        modalText: '#f5f5fa',
        modalBtnBg: '#242434',
        modalBtnText: '#a8a8b8',
        modalBtnOkBg: 'rgba(99, 102, 241, 0.12)',
        modalBtnOkText: '#818cf8',
        switchTrack: '#383853',
        switchTrackActive: '#6366f1',
        switchThumb: '#d4d4d8',
        switchThumbActive: '#ffffff',
        border: '#2a2a3855',
        divider: '#1f1f29',
        highlight: '#6366f1',
        addButtonBg: 'rgba(99, 102, 241, 0.08)',
        addButtonBorder: '#5855d6',
        cancelButtonBg: 'rgba(255, 255, 255, 0.06)',
        cancelButtonBorder: '#555555',
    },

    darkCyan: {
        background: '#0a0f0f',
        card: '#141f20',
        cardLighter: '#1a2829',
        cardBorder: '#2a383955',
        settingBlock: '#172425',
        text: '#f5fafa',
        textSecondary: '#a8b8b9',
        textTitle: '#ffffff',
        textDesc: '#889a9b',
        snackbarBg: '#141f20',
        snackbarText: '#f5fafa',
        modalBg: '#141f20',
        modalText: '#f5fafa',
        modalBtnBg: '#243435',
        modalBtnText: '#a8b8b9',
        modalBtnOkBg: 'rgba(6, 182, 212, 0.12)',
        modalBtnOkText: '#67e8f9',
        switchTrack: '#335358',
        switchTrackActive: '#06b6d4',
        switchThumb: '#d4d8d9',
        switchThumbActive: '#ffffff',
        border: '#2a383955',
        divider: '#1f2f31',
        highlight: '#06b6d4',
        addButtonBg: 'rgba(6, 182, 212, 0.08)',
        addButtonBorder: '#0891b2',
        cancelButtonBg: 'rgba(255, 255, 255, 0.06)',
        cancelButtonBorder: '#555555',
    },

    darkLime: {
        background: '#0c0f0a',
        card: '#171f14',
        cardLighter: '#1e281a',
        cardBorder: '#2e382a55',
        settingBlock: '#1a2417',
        text: '#f7faf5',
        textSecondary: '#b0b8a8',
        textTitle: '#ffffff',
        textDesc: '#929a88',
        snackbarBg: '#171f14',
        snackbarText: '#f7faf5',
        modalBg: '#171f14',
        modalText: '#f7faf5',
        modalBtnBg: '#273424',
        modalBtnText: '#b0b8a8',
        modalBtnOkBg: 'rgba(132, 204, 22, 0.12)',
        modalBtnOkText: '#a3e635',
        switchTrack: '#465338',
        switchTrackActive: '#84cc16',
        switchThumb: '#d6d8d4',
        switchThumbActive: '#ffffff',
        border: '#2e382a55',
        divider: '#222f1f',
        highlight: '#84cc16',
        addButtonBg: 'rgba(132, 204, 22, 0.08)',
        addButtonBorder: '#65a30d',
        cancelButtonBg: 'rgba(255, 255, 255, 0.06)',
        cancelButtonBorder: '#555555',
    },

    darkFuchsia: {
        background: '#0f0a0f',
        card: '#1f1420',
        cardLighter: '#281a28',
        cardBorder: '#382a3855',
        settingBlock: '#241724',
        text: '#faf5fa',
        textSecondary: '#b8a8b8',
        textTitle: '#ffffff',
        textDesc: '#9a889a',
        snackbarBg: '#1f1420',
        snackbarText: '#faf5fa',
        modalBg: '#1f1420',
        modalText: '#faf5fa',
        modalBtnBg: '#342434',
        modalBtnText: '#b8a8b8',
        modalBtnOkBg: 'rgba(217, 70, 239, 0.12)',
        modalBtnOkText: '#e879f9',
        switchTrack: '#533853',
        switchTrackActive: '#d946ef',
        switchThumb: '#d8d4d8',
        switchThumbActive: '#ffffff',
        border: '#382a3855',
        divider: '#271f29',
        highlight: '#d946ef',
        addButtonBg: 'rgba(217, 70, 239, 0.08)',
        addButtonBorder: '#c026d3',
        cancelButtonBg: 'rgba(255, 255, 255, 0.06)',
        cancelButtonBorder: '#555555',
    },

    darkSlate: {
        background: '#0a0c0d',
        card: '#141819',
        cardLighter: '#1a2022',
        cardBorder: '#2a323555',
        settingBlock: '#171c1e',
        text: '#f5f7f8',
        textSecondary: '#a8b0b3',
        textTitle: '#ffffff',
        textDesc: '#889093',
        snackbarBg: '#141819',
        snackbarText: '#f5f7f8',
        modalBg: '#141819',
        modalText: '#f5f7f8',
        modalBtnBg: '#242c2f',
        modalBtnText: '#a8b0b3',
        modalBtnOkBg: 'rgba(100, 116, 139, 0.12)',
        modalBtnOkText: '#94a3b8',
        switchTrack: '#384146',
        switchTrackActive: '#64748b',
        switchThumb: '#d4d7d9',
        switchThumbActive: '#ffffff',
        border: '#2a323555',
        divider: '#1f2629',
        highlight: '#64748b',
        addButtonBg: 'rgba(100, 116, 139, 0.08)',
        addButtonBorder: '#475569',
        cancelButtonBg: 'rgba(255, 255, 255, 0.06)',
        cancelButtonBorder: '#555555',
    },

};

const variables = {
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
    radius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, circle: 999 },
    borderWidth: { thin: 0.75, regular: 1.25, thick: 2 },
    shadow: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 3,
        },
    },
    fontSizes: { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 32 },
};

const createStyles = (colors) => StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        flex: 1,
        padding: variables.spacing.md,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: variables.radius.md,
        padding: variables.spacing.md,
        borderWidth: variables.borderWidth.regular,
        borderColor: colors.border,
    },
    buttonPrimary: {
        backgroundColor: colors.highlight,
        padding: variables.spacing.md,
        borderRadius: variables.radius.sm,
    },
    input: {
        borderWidth: variables.borderWidth.regular,
        borderColor: colors.border,
        borderRadius: variables.radius.sm,
        padding: variables.spacing.sm,
        backgroundColor: colors.card,
        color: colors.text,
    },
    divider: {
        height: variables.borderWidth.regular,
        backgroundColor: colors.divider,
        marginVertical: variables.spacing.md,
    },
    textHeader: {
        fontSize: variables.fontSizes.xl,
        color: colors.text,
        fontWeight: 'bold',
        marginBottom: variables.spacing.sm,
    },
    textSubheader: {
        fontSize: variables.fontSizes.lg,
        color: colors.textSecondary,
        marginBottom: variables.spacing.xs,
    },
});