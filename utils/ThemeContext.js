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
export const useTheme = () => useContext(ThemeContext) ;
export const createThemedStyles = (styleFactory) => (colors, variables) => StyleSheet.create(styleFactory(colors, variables) || {});
export const useThemedStyles = (styleFactory) => createThemedStyles(styleFactory)(useTheme().colors, useTheme().variables);
export const makeStyles = (styleFactory) => (console.warn('makeStyles is deprecated. Use useThemedStyles hook instead.'), useThemedStyles(styleFactory));

// Keep your palettes and variables objects unchanged
const palettes = {
    light: {
        background: '#eeeeee',
        card: '#d0d0d0',
        cardLighter: '#e6e6e6',
        cardBorder: '#28282828',
        settingBlock: '#dedede',
        text: '#333333',
        textSecondary: '#444444',
        textTitle: '#222222',
        textDesc: '#888888',
        snackbarBg: '#f0f0f0',
        snackbarText: '#222222',
        modalBg: '#ffffff',
        modalText: '#222222',
        modalBtnBg: '#eeeeee',
        modalBtnText: '#333',
        modalBtnOkBg: 'rgba(239, 68, 68, 0.18)',
        modalBtnOkText: '#ef4444',
        switchTrack: '#767577',
        switchTrackActive: '#282828',
        switchThumb: '#f0f0f0',
        switchThumbActive: '#fefefe',
        border: '#dddddd',
        divider: '#e0e0e0',
        highlight: '#282828',
        addButtonBg: 'rgba(34, 197, 94, 0.18)',
        addButtonBorder: '#22c55e',
        cancelButtonBg: 'rgba(239, 68, 68, 0.18)',
        cancelButtonBorder: '#ef4444',
    },
    lightBlue: {
        background: '#f3f6fc',
        card: '#dce4f4',
        cardLighter: '#eaf0fa',
        cardBorder: '#a3b8d155',
        settingBlock: '#e3ebf8',
        text: '#1f2937',
        textSecondary: '#374151',
        textTitle: '#111827',
        textDesc: '#6b7280',
        snackbarBg: '#dce4f4',
        snackbarText: '#1f2937',
        modalBg: '#eaf0fa',
        modalText: '#1f2937',
        modalBtnBg: '#c9d6ee',
        modalBtnText: '#374151',
        modalBtnOkBg: 'rgba(59, 130, 246, 0.20)',
        modalBtnOkText: '#3b82f6',
        switchTrack: '#9fb3d1',
        switchTrackActive: '#3b82f6',
        switchThumb: '#ffffff',
        switchThumbActive: '#f0f6ff',
        border: '#a3b8d155',
        divider: '#dce4f4',
        highlight: '#3b82f6',
        addButtonBg: 'rgba(59, 130, 246, 0.12)',
        addButtonBorder: '#3b82f6',
        cancelButtonBg: 'rgba(239, 68, 68, 0.14)',
        cancelButtonBorder: '#ef4444',
    },
    lightGreen: {
        background: '#f3f9f5',
        card: '#d7e9dd',
        cardLighter: '#e9f4eb',
        cardBorder: '#a5d6b055',
        settingBlock: '#e2f1e5',
        text: '#1f2937',
        textSecondary: '#374151',
        textTitle: '#111827',
        textDesc: '#6b7280',
        snackbarBg: '#d7e9dd',
        snackbarText: '#1f2937',
        modalBg: '#e9f4eb',
        modalText: '#1f2937',
        modalBtnBg: '#cbe3d1',
        modalBtnText: '#374151',
        modalBtnOkBg: 'rgba(34, 197, 94, 0.20)',
        modalBtnOkText: '#22c55e',
        switchTrack: '#9fc8af',
        switchTrackActive: '#22c55e',
        switchThumb: '#ffffff',
        switchThumbActive: '#f3faf6',
        border: '#a5d6b055',
        divider: '#d7e9dd',
        highlight: '#22c55e',
        addButtonBg: 'rgba(34, 197, 94, 0.12)',
        addButtonBorder: '#22c55e',
        cancelButtonBg: 'rgba(239, 68, 68, 0.14)',
        cancelButtonBorder: '#ef4444',
    },
    lightPurple: {
        background: '#f9f7fc',
        card: '#e6dff0',
        cardLighter: '#f1eaf8',
        cardBorder: '#cab3e155',
        settingBlock: '#efe5f5',
        text: '#1f2937',
        textSecondary: '#374151',
        textTitle: '#111827',
        textDesc: '#6b7280',
        snackbarBg: '#e6dff0',
        snackbarText: '#1f2937',
        modalBg: '#f1eaf8',
        modalText: '#1f2937',
        modalBtnBg: '#d8cbe8',
        modalBtnText: '#374151',
        modalBtnOkBg: 'rgba(168, 85, 247, 0.20)',
        modalBtnOkText: '#a855f7',
        switchTrack: '#c0aee0',
        switchTrackActive: '#a855f7',
        switchThumb: '#ffffff',
        switchThumbActive: '#faf5ff',
        border: '#cab3e155',
        divider: '#e6dff0',
        highlight: '#a855f7',
        addButtonBg: 'rgba(168, 85, 247, 0.12)',
        addButtonBorder: '#a855f7',
        cancelButtonBg: 'rgba(239, 68, 68, 0.14)',
        cancelButtonBorder: '#ef4444',
    },
    lightRose: {
        background: '#fcf7f8',
        card: '#f1d8db',
        cardLighter: '#f8e6e8',
        cardBorder: '#d1a3aa55',
        settingBlock: '#f5e2e5',
        text: '#1f2937',
        textSecondary: '#374151',
        textTitle: '#111827',
        textDesc: '#6b7280',
        snackbarBg: '#f1d8db',
        snackbarText: '#1f2937',
        modalBg: '#f8e6e8',
        modalText: '#1f2937',
        modalBtnBg: '#e8cbd0',
        modalBtnText: '#374151',
        modalBtnOkBg: 'rgba(244, 63, 94, 0.20)',
        modalBtnOkText: '#f43f5e',
        switchTrack: '#e0aeb5',
        switchTrackActive: '#f43f5e',
        switchThumb: '#ffffff',
        switchThumbActive: '#fff5f7',
        border: '#d1a3aa55',
        divider: '#f1d8db',
        highlight: '#f43f5e',
        addButtonBg: 'rgba(244, 63, 94, 0.12)',
        addButtonBorder: '#f43f5e',
        cancelButtonBg: 'rgba(239, 68, 68, 0.14)',
        cancelButtonBorder: '#ef4444',
    },
    lightAmber: {
        background: '#fdf9f3',
        card: '#f8e8d0',
        cardLighter: '#fbf0dc',
        cardBorder: '#e7cfa355',
        settingBlock: '#f9ecd9',
        text: '#1f2937',
        textSecondary: '#374151',
        textTitle: '#111827',
        textDesc: '#6b7280',
        snackbarBg: '#f8e8d0',
        snackbarText: '#1f2937',
        modalBg: '#fbf0dc',
        modalText: '#1f2937',
        modalBtnBg: '#edd7b8',
        modalBtnText: '#374151',
        modalBtnOkBg: 'rgba(245, 158, 11, 0.20)',
        modalBtnOkText: '#f59e0b',
        switchTrack: '#e8be7c',
        switchTrackActive: '#f59e0b',
        switchThumb: '#ffffff',
        switchThumbActive: '#fffaf1',
        border: '#e7cfa355',
        divider: '#f8e8d0',
        highlight: '#f59e0b',
        addButtonBg: 'rgba(245, 158, 11, 0.12)',
        addButtonBorder: '#f59e0b',
        cancelButtonBg: 'rgba(239, 68, 68, 0.14)',
        cancelButtonBorder: '#ef4444',
    },
    lightTeal: {
        background: '#f3faf9',
        card: '#d0ebe5',
        cardLighter: '#e0f4ef',
        cardBorder: '#a3d9ce55',
        settingBlock: '#d8f0ea',
        text: '#1f2937',
        textSecondary: '#374151',
        textTitle: '#111827',
        textDesc: '#6b7280',
        snackbarBg: '#d0ebe5',
        snackbarText: '#1f2937',
        modalBg: '#e0f4ef',
        modalText: '#1f2937',
        modalBtnBg: '#c1e2da',
        modalBtnText: '#374151',
        modalBtnOkBg: 'rgba(20, 184, 166, 0.20)',
        modalBtnOkText: '#14b8a6',
        switchTrack: '#83d3c4',
        switchTrackActive: '#14b8a6',
        switchThumb: '#ffffff',
        switchThumbActive: '#f3faf9',
        border: '#a3d9ce55',
        divider: '#d0ebe5',
        highlight: '#14b8a6',
        addButtonBg: 'rgba(20, 184, 166, 0.12)',
        addButtonBorder: '#14b8a6',
        cancelButtonBg: 'rgba(239, 68, 68, 0.14)',
        cancelButtonBorder: '#ef4444',
    },
    lightIndigo: {
        background: '#f5f6fc',
        card: '#dcdff4',
        cardLighter: '#e8eaf8',
        cardBorder: '#a3a8d155',
        settingBlock: '#e3e5f8',
        text: '#1f2937',
        textSecondary: '#374151',
        textTitle: '#111827',
        textDesc: '#6b7280',
        snackbarBg: '#dcdff4',
        snackbarText: '#1f2937',
        modalBg: '#e8eaf8',
        modalText: '#1f2937',
        modalBtnBg: '#c9cce9',
        modalBtnText: '#374151',
        modalBtnOkBg: 'rgba(99, 102, 241, 0.20)',
        modalBtnOkText: '#6366f1',
        switchTrack: '#a5a8f0',
        switchTrackActive: '#6366f1',
        switchThumb: '#ffffff',
        switchThumbActive: '#f5f6fc',
        border: '#a3a8d155',
        divider: '#dcdff4',
        highlight: '#6366f1',
        addButtonBg: 'rgba(99, 102, 241, 0.12)',
        addButtonBorder: '#6366f1',
        cancelButtonBg: 'rgba(239, 68, 68, 0.14)',
        cancelButtonBorder: '#ef4444',
    },
    lightCyan: {
        background: '#f3fbfc',
        card: '#d0eff4',
        cardLighter: '#e0f6fa',
        cardBorder: '#a3d8df55',
        settingBlock: '#d8f3f7',
        text: '#1f2937',
        textSecondary: '#374151',
        textTitle: '#111827',
        textDesc: '#6b7280',
        snackbarBg: '#d0eff4',
        snackbarText: '#1f2937',
        modalBg: '#e0f6fa',
        modalText: '#1f2937',
        modalBtnBg: '#c1e6eb',
        modalBtnText: '#374151',
        modalBtnOkBg: 'rgba(6, 182, 212, 0.20)',
        modalBtnOkText: '#06b6d4',
        switchTrack: '#7edce7',
        switchTrackActive: '#06b6d4',
        switchThumb: '#ffffff',
        switchThumbActive: '#f3fbfc',
        border: '#a3d8df55',
        divider: '#d0eff4',
        highlight: '#06b6d4',
        addButtonBg: 'rgba(6, 182, 212, 0.12)',
        addButtonBorder: '#06b6d4',
        cancelButtonBg: 'rgba(239, 68, 68, 0.14)',
        cancelButtonBorder: '#ef4444',
    },
    lightLime: {
        background: '#f8fcf3',
        card: '#e3f4d0',
        cardLighter: '#eef9df',
        cardBorder: '#c3e7a355',
        settingBlock: '#ebf7d8',
        text: '#1f2937',
        textSecondary: '#374151',
        textTitle: '#111827',
        textDesc: '#6b7280',
        snackbarBg: '#e3f4d0',
        snackbarText: '#1f2937',
        modalBg: '#eef9df',
        modalText: '#1f2937',
        modalBtnBg: '#d6efc1',
        modalBtnText: '#374151',
        modalBtnOkBg: 'rgba(132, 204, 22, 0.20)',
        modalBtnOkText: '#84cc16',
        switchTrack: '#b4e280',
        switchTrackActive: '#84cc16',
        switchThumb: '#ffffff',
        switchThumbActive: '#f8fcf3',
        border: '#c3e7a355',
        divider: '#e3f4d0',
        highlight: '#84cc16',
        addButtonBg: 'rgba(132, 204, 22, 0.12)',
        addButtonBorder: '#84cc16',
        cancelButtonBg: 'rgba(239, 68, 68, 0.14)',
        cancelButtonBorder: '#ef4444',
    },
    lightFuchsia: {
        background: '#fcf5fc',
        card: '#f3d0f4',
        cardLighter: '#f9e0fa',
        cardBorder: '#e7a3e755',
        settingBlock: '#f7d8f8',
        text: '#1f2937',
        textSecondary: '#374151',
        textTitle: '#111827',
        textDesc: '#6b7280',
        snackbarBg: '#f3d0f4',
        snackbarText: '#1f2937',
        modalBg: '#f9e0fa',
        modalText: '#1f2937',
        modalBtnBg: '#eec1f0',
        modalBtnText: '#374151',
        modalBtnOkBg: 'rgba(217, 70, 239, 0.20)',
        modalBtnOkText: '#d946ef',
        switchTrack: '#e48ae4',
        switchTrackActive: '#d946ef',
        switchThumb: '#ffffff',
        switchThumbActive: '#fcf5fc',
        border: '#e7a3e755',
        divider: '#f3d0f4',
        highlight: '#d946ef',
        addButtonBg: 'rgba(217, 70, 239, 0.12)',
        addButtonBorder: '#d946ef',
        cancelButtonBg: 'rgba(239, 68, 68, 0.14)',
        cancelButtonBorder: '#ef4444',
    },
    lightSlate: {
        background: '#f7f9fa',
        card: '#d9dde1',
        cardLighter: '#e6eaee',
        cardBorder: '#b0b9c355',
        settingBlock: '#e2e6eb',
        text: '#1f2937',
        textSecondary: '#374151',
        textTitle: '#111827',
        textDesc: '#6b7280',
        snackbarBg: '#d9dde1',
        snackbarText: '#1f2937',
        modalBg: '#e6eaee',
        modalText: '#1f2937',
        modalBtnBg: '#c8cfd6',
        modalBtnText: '#374151',
        modalBtnOkBg: 'rgba(100, 116, 139, 0.20)',
        modalBtnOkText: '#64748b',
        switchTrack: '#adb9c7',
        switchTrackActive: '#64748b',
        switchThumb: '#ffffff',
        switchThumbActive: '#f7f9fa',
        border: '#b0b9c355',
        divider: '#d9dde1',
        highlight: '#64748b',
        addButtonBg: 'rgba(100, 116, 139, 0.12)',
        addButtonBorder: '#64748b',
        cancelButtonBg: 'rgba(239, 68, 68, 0.14)',
        cancelButtonBorder: '#ef4444',
    },
    dark: {
        background: '#121212',
        card: '#181818',
        cardLighter: '#242424',
        cardBorder: '#55555555',
        settingBlock: '#202020',
        text: '#fefefe',
        textSecondary: '#bbbbbb',
        textTitle: '#ffffff',
        textDesc: '#b0b0b0',
        snackbarBg: '#181818',
        snackbarText: '#ffffff',
        modalBg: '#181818',
        modalText: '#fefefe',
        modalBtnBg: '#333333',
        modalBtnText: '#bbbbbb',
        modalBtnOkBg: 'rgba(239, 68, 68, 0.18)',
        modalBtnOkText: '#ef4444',
        switchTrack: '#444',
        switchTrackActive: '#888',
        switchThumb: '#e0e0e0',
        switchThumbActive: '#ededed',
        border: '#55555555',
        divider: '#232323',
        highlight: '#fefefe',
        addButtonBg: 'rgba(34, 197, 94, 0.18)',
        addButtonBorder: '#22c55e',
        cancelButtonBg: 'rgba(239, 68, 68, 0.18)',
        cancelButtonBorder: '#ef4444',
    },
    darkBlue: {
        background: '#12131A',
        card: '#181A20',
        cardLighter: '#23252C',
        cardBorder: '#55575A55',
        settingBlock: '#1e2027',
        text: '#fefefe',
        textSecondary: '#b8bcc5',
        textTitle: '#ffffff',
        textDesc: '#aaadb7',
        snackbarBg: '#181A20',
        snackbarText: '#ffffff',
        modalBg: '#181A20',
        modalText: '#fefefe',
        modalBtnBg: '#2b2d35',
        modalBtnText: '#b8bcc5',
        modalBtnOkBg: 'rgba(59, 130, 246, 0.20)', // blue
        modalBtnOkText: '#3b82f6',
        switchTrack: '#3b82f6aa',
        switchTrackActive: '#3b82f6',
        switchThumb: '#e0e0e0',
        switchThumbActive: '#3b82f6',
        border: '#55575A55',
        divider: '#23252C',
        highlight: '#3b82f6', // BLUE
        addButtonBg: 'rgba(59, 130, 246, 0.20)',
        addButtonBorder: '#3b82f6',
        cancelButtonBg: 'rgba(239, 68, 68, 0.16)',
        cancelButtonBorder: '#ef4444',
    },
    darkGreen: {
        background: '#101311',
        card: '#161d18',
        cardLighter: '#1e2721',
        cardBorder: '#4d5a4d55',
        settingBlock: '#19221c',
        text: '#fefefe',
        textSecondary: '#bac8ba',
        textTitle: '#ffffff',
        textDesc: '#a9b8a9',
        snackbarBg: '#161d18',
        snackbarText: '#ffffff',
        modalBg: '#161d18',
        modalText: '#fefefe',
        modalBtnBg: '#233027',
        modalBtnText: '#bac8ba',
        modalBtnOkBg: 'rgba(34, 197, 94, 0.20)',
        modalBtnOkText: '#22c55e',
        switchTrack: '#22c55e88',
        switchTrackActive: '#22c55e',
        switchThumb: '#e0e0e0',
        switchThumbActive: '#22c55e',
        border: '#4d5a4d55',
        divider: '#1e2721',
        highlight: '#22c55e', // GREEN
        addButtonBg: 'rgba(34, 197, 94, 0.20)',
        addButtonBorder: '#22c55e',
        cancelButtonBg: 'rgba(239, 68, 68, 0.16)',
        cancelButtonBorder: '#ef4444',
    },
    darkPurple: {
        background: '#131016',
        card: '#1a1720',
        cardLighter: '#231f2c',
        cardBorder: '#564d5a55',
        settingBlock: '#1d1927',
        text: '#fefefe',
        textSecondary: '#c6b8cc',
        textTitle: '#ffffff',
        textDesc: '#b6a9c0',
        snackbarBg: '#1a1720',
        snackbarText: '#ffffff',
        modalBg: '#1a1720',
        modalText: '#fefefe',
        modalBtnBg: '#2b2635',
        modalBtnText: '#c6b8cc',
        modalBtnOkBg: 'rgba(168, 85, 247, 0.20)',
        modalBtnOkText: '#a855f7',
        switchTrack: '#a855f788',
        switchTrackActive: '#a855f7',
        switchThumb: '#e0e0e0',
        switchThumbActive: '#a855f7',
        border: '#564d5a55',
        divider: '#231f2c',
        highlight: '#a855f7', // PURPLE
        addButtonBg: 'rgba(168, 85, 247, 0.20)',
        addButtonBorder: '#a855f7',
        cancelButtonBg: 'rgba(239, 68, 68, 0.16)',
        cancelButtonBorder: '#ef4444',
    },
    darkRose: {
        background: '#141012',
        card: '#1c1618',
        cardLighter: '#261e21',
        cardBorder: '#5a4d4d55',
        settingBlock: '#211a1d',
        text: '#fefefe',
        textSecondary: '#c8b8b8',
        textTitle: '#ffffff',
        textDesc: '#bdaaaa',
        snackbarBg: '#1c1618',
        snackbarText: '#ffffff',
        modalBg: '#1c1618',
        modalText: '#fefefe',
        modalBtnBg: '#322628',
        modalBtnText: '#c8b8b8',
        modalBtnOkBg: 'rgba(244, 63, 94, 0.20)',
        modalBtnOkText: '#f43f5e',
        switchTrack: '#f43f5e88',
        switchTrackActive: '#f43f5e',
        switchThumb: '#e0e0e0',
        switchThumbActive: '#f43f5e',
        border: '#5a4d4d55',
        divider: '#261e21',
        highlight: '#f43f5e', // ROSE
        addButtonBg: 'rgba(244, 63, 94, 0.20)',
        addButtonBorder: '#f43f5e',
        cancelButtonBg: 'rgba(239, 68, 68, 0.16)',
        cancelButtonBorder: '#ef4444',
    },
    darkAmber: {
        background: '#191512',
        card: '#231b14',
        cardLighter: '#2e2219',
        cardBorder: '#5a4d3b55',
        settingBlock: '#271f17',
        text: '#fefefe',
        textSecondary: '#dcc9b8',
        textTitle: '#ffffff',
        textDesc: '#cdbba9',
        snackbarBg: '#231b14',
        snackbarText: '#ffffff',
        modalBg: '#231b14',
        modalText: '#fefefe',
        modalBtnBg: '#3a2e22',
        modalBtnText: '#dcc9b8',
        modalBtnOkBg: 'rgba(245, 158, 11, 0.20)',
        modalBtnOkText: '#f59e0b',
        switchTrack: '#f59e0b88',
        switchTrackActive: '#f59e0b',
        switchThumb: '#e0e0e0',
        switchThumbActive: '#f59e0b',
        border: '#5a4d3b55',
        divider: '#2e2219',
        highlight: '#f59e0b',
        addButtonBg: 'rgba(245, 158, 11, 0.20)',
        addButtonBorder: '#f59e0b',
        cancelButtonBg: 'rgba(239, 68, 68, 0.16)',
        cancelButtonBorder: '#ef4444',
    },
    darkTeal: {
        background: '#101413',
        card: '#16201f',
        cardLighter: '#1d2928',
        cardBorder: '#4d5a5855',
        settingBlock: '#1a2524',
        text: '#fefefe',
        textSecondary: '#b8ccc9',
        textTitle: '#ffffff',
        textDesc: '#a9bfbf',
        snackbarBg: '#16201f',
        snackbarText: '#ffffff',
        modalBg: '#16201f',
        modalText: '#fefefe',
        modalBtnBg: '#233230',
        modalBtnText: '#b8ccc9',
        modalBtnOkBg: 'rgba(20, 184, 166, 0.20)',
        modalBtnOkText: '#14b8a6',
        switchTrack: '#14b8a688',
        switchTrackActive: '#14b8a6',
        switchThumb: '#e0e0e0',
        switchThumbActive: '#14b8a6',
        border: '#4d5a5855',
        divider: '#1d2928',
        highlight: '#14b8a6',
        addButtonBg: 'rgba(20, 184, 166, 0.20)',
        addButtonBorder: '#14b8a6',
        cancelButtonBg: 'rgba(239, 68, 68, 0.16)',
        cancelButtonBorder: '#ef4444',
    },
    darkIndigo: {
        background: '#12121a',
        card: '#181820',
        cardLighter: '#22222c',
        cardBorder: '#55555a55',
        settingBlock: '#1e1e27',
        text: '#fefefe',
        textSecondary: '#c5c5d9',
        textTitle: '#ffffff',
        textDesc: '#b0b0c5',
        snackbarBg: '#181820',
        snackbarText: '#ffffff',
        modalBg: '#181820',
        modalText: '#fefefe',
        modalBtnBg: '#2a2a35',
        modalBtnText: '#c5c5d9',
        modalBtnOkBg: 'rgba(99, 102, 241, 0.20)',
        modalBtnOkText: '#6366f1',
        switchTrack: '#6366f188',
        switchTrackActive: '#6366f1',
        switchThumb: '#e0e0e0',
        switchThumbActive: '#6366f1',
        border: '#55555a55',
        divider: '#22222c',
        highlight: '#6366f1',
        addButtonBg: 'rgba(99, 102, 241, 0.20)',
        addButtonBorder: '#6366f1',
        cancelButtonBg: 'rgba(239, 68, 68, 0.16)',
        cancelButtonBorder: '#ef4444',
    },
    darkCyan: {
        background: '#101415',
        card: '#162021',
        cardLighter: '#1d292a',
        cardBorder: '#4d5a5a55',
        settingBlock: '#192425',
        text: '#fefefe',
        textSecondary: '#b8cdce',
        textTitle: '#ffffff',
        textDesc: '#a9c0c0',
        snackbarBg: '#162021',
        snackbarText: '#ffffff',
        modalBg: '#162021',
        modalText: '#fefefe',
        modalBtnBg: '#233334',
        modalBtnText: '#b8cdce',
        modalBtnOkBg: 'rgba(6, 182, 212, 0.20)',
        modalBtnOkText: '#06b6d4',
        switchTrack: '#06b6d488',
        switchTrackActive: '#06b6d4',
        switchThumb: '#e0e0e0',
        switchThumbActive: '#06b6d4',
        border: '#4d5a5a55',
        divider: '#1d292a',
        highlight: '#06b6d4',
        addButtonBg: 'rgba(6, 182, 212, 0.20)',
        addButtonBorder: '#06b6d4',
        cancelButtonBg: 'rgba(239, 68, 68, 0.16)',
        cancelButtonBorder: '#ef4444',
    },
    darkLime: {
        background: '#121410',
        card: '#192014',
        cardLighter: '#21291a',
        cardBorder: '#4d5a3f55',
        settingBlock: '#1c2517',
        text: '#fefefe',
        textSecondary: '#c9d6b8',
        textTitle: '#ffffff',
        textDesc: '#b8c6a9',
        snackbarBg: '#192014',
        snackbarText: '#ffffff',
        modalBg: '#192014',
        modalText: '#fefefe',
        modalBtnBg: '#2a3323',
        modalBtnText: '#c9d6b8',
        modalBtnOkBg: 'rgba(132, 204, 22, 0.20)',
        modalBtnOkText: '#84cc16',
        switchTrack: '#84cc1688',
        switchTrackActive: '#84cc16',
        switchThumb: '#e0e0e0',
        switchThumbActive: '#84cc16',
        border: '#4d5a3f55',
        divider: '#21291a',
        highlight: '#84cc16',
        addButtonBg: 'rgba(132, 204, 22, 0.20)',
        addButtonBorder: '#84cc16',
        cancelButtonBg: 'rgba(239, 68, 68, 0.16)',
        cancelButtonBorder: '#ef4444',
    },
    darkFuchsia: {
        background: '#141014',
        card: '#1c161c',
        cardLighter: '#261e26',
        cardBorder: '#5a4d5a55',
        settingBlock: '#211a21',
        text: '#fefefe',
        textSecondary: '#e3b8e3',
        textTitle: '#ffffff',
        textDesc: '#d8aad8',
        snackbarBg: '#1c161c',
        snackbarText: '#ffffff',
        modalBg: '#1c161c',
        modalText: '#fefefe',
        modalBtnBg: '#322632',
        modalBtnText: '#e3b8e3',
        modalBtnOkBg: 'rgba(217, 70, 239, 0.20)',
        modalBtnOkText: '#d946ef',
        switchTrack: '#d946ef88',
        switchTrackActive: '#d946ef',
        switchThumb: '#e0e0e0',
        switchThumbActive: '#d946ef',
        border: '#5a4d5a55',
        divider: '#261e26',
        highlight: '#d946ef',
        addButtonBg: 'rgba(217, 70, 239, 0.20)',
        addButtonBorder: '#d946ef',
        cancelButtonBg: 'rgba(239, 68, 68, 0.16)',
        cancelButtonBorder: '#ef4444',
    },
    darkSlate: {
        background: '#121415',
        card: '#181c1e',
        cardLighter: '#22282a',
        cardBorder: '#4f585a55',
        settingBlock: '#1c2224',
        text: '#fefefe',
        textSecondary: '#c0c8cd',
        textTitle: '#ffffff',
        textDesc: '#b2bbc0',
        snackbarBg: '#181c1e',
        snackbarText: '#ffffff',
        modalBg: '#181c1e',
        modalText: '#fefefe',
        modalBtnBg: '#293134',
        modalBtnText: '#c0c8cd',
        modalBtnOkBg: 'rgba(100, 116, 139, 0.20)',
        modalBtnOkText: '#64748b',
        switchTrack: '#64748b88',
        switchTrackActive: '#64748b',
        switchThumb: '#e0e0e0',
        switchThumbActive: '#64748b',
        border: '#4f585a55',
        divider: '#22282a',
        highlight: '#64748b',
        addButtonBg: 'rgba(100, 116, 139, 0.20)',
        addButtonBorder: '#64748b',
        cancelButtonBg: 'rgba(239, 68, 68, 0.16)',
        cancelButtonBorder: '#ef4444',
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