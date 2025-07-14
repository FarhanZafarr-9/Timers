import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Appearance, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { headerOptions } from './functions';

const THEME_STORAGE_KEY = 'userThemePreference';
const ACCENT_STORAGE_KEY = 'userAccentPreference'
const NAVIGATION_MODE_KEY = 'navigationModePreference';
const HEADER_MODE_KEY = 'headerModePreference';
const BORDER_MODE_KEY = 'borderModePreference';
const VALID_THEMES = ['light', 'dark', 'system'];
const VALID_ACCENTS = ['default', 'blue', 'green', 'purple', 'rose'];


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

const ThemeContext = createContext(null);

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

const normalizeTheme = (theme) => {
    if (typeof theme === 'string' && VALID_THEMES.includes(theme)) {
        return theme;
    }
    return 'system';
};

const normalizeAccent = (accent) => {
    if (typeof accent === 'string' && VALID_ACCENTS.includes(accent)) {
        return accent;
    }
    return 'blue';
};

const normalizeNavigationMode = (mode) => {
    if (['floating', 'fixed', 'side'].includes(mode)) {
        return mode;
    }
    return 'floating';
};

const normalizeHeaderMode = (mode) => {
    if (['collapsible', 'fixed', 'minimized'].includes(mode)) {
        return mode;
    }
    return 'minimized';
};

const normalizeBorderMode = (mode) => {
    if (['none', 'thin', 'subtle', 'thick'].includes(mode)) {
        return mode;
    }
    return 'subtle';
};

const getSystemTheme = () => {
    try {
        const systemTheme = Appearance.getColorScheme();
        return systemTheme === 'dark' ? 'dark' : 'light';
    } catch (error) {
        console.warn('Failed to get system color scheme:', error);
        return 'light';
    }
};

export const ThemeProvider = ({ children }) => {
    const [themeMode, setThemeModeState] = useState('system');
    const [accentMode, setAccentModeState] = useState('blue');
    const [navigationMode, setNavigationMode] = useState('floating');
    const [headerMode, setHeaderMode] = useState('minimized');
    const [borderMode, setBorderMode] = useState('subtle');
    const [theme, setTheme] = useState(getSystemTheme());
    const [isLoading, setIsLoading] = useState(true);

    // Load themeMode from AsyncStorage on mount
    useEffect(() => {
        let isMounted = true;

        const loadTheme = async () => {
            try {
                const [storedTheme, storedAccent, storedNavMode, storedHeaderMode, storedBorderMode] = await Promise.all([
                    AsyncStorage.getItem(THEME_STORAGE_KEY),
                    AsyncStorage.getItem(ACCENT_STORAGE_KEY),
                    AsyncStorage.getItem(NAVIGATION_MODE_KEY),
                    AsyncStorage.getItem(HEADER_MODE_KEY),
                    AsyncStorage.getItem(BORDER_MODE_KEY),
                ]);

                if (isMounted) {
                    const loadedTheme = storedTheme && VALID_THEMES.includes(storedTheme) ? storedTheme : 'system';
                    const loadedAccent = storedAccent && VALID_ACCENTS.includes(storedAccent) ? storedAccent : 'blue';
                    const loadedFloatingNav = storedNavMode !== null ? storedNavMode : 'floating';
                    const loadedHeaderMode = storedHeaderMode !== null ? storedHeaderMode : 'minimized';
                    const loadedBorderMode = storedBorderMode !== null ? storedBorderMode : 'subtle';

                    setThemeModeState(loadedTheme);
                    setAccentModeState(loadedAccent);
                    setNavigationMode(loadedFloatingNav);
                    setHeaderMode(loadedHeaderMode);
                    setBorderMode(loadedBorderMode);

                    // Set initial theme based on loaded preference
                    setTheme(loadedTheme === 'system' ? getSystemTheme() : loadedTheme);
                    setIsLoading(false);
                }
            } catch (e) {
                console.warn('Failed to load theme mode from storage:', e);
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadTheme();

        return () => {
            isMounted = false;
        };
    }, []);

    // Save themeMode to AsyncStorage when it changes
    useEffect(() => {
        if (!isLoading) {
            AsyncStorage.setItem(THEME_STORAGE_KEY, themeMode).catch(e =>
                console.warn('Failed to save theme mode to storage:', e)
            );
        }
    }, [themeMode, isLoading]);

    useEffect(() => {
        if (!isLoading) {
            AsyncStorage.setItem(ACCENT_STORAGE_KEY, accentMode).catch(e =>
                console.warn('Failed to save accent mode to storage:', e)
            );
        }
    }, [accentMode, isLoading]);

    // Save navigationMode to AsyncStorage when it changes
    useEffect(() => {
        if (!isLoading) {
            AsyncStorage.setItem(NAVIGATION_MODE_KEY, navigationMode).catch(e =>
                console.warn('Failed to save navigation mode preference:', e)
            );
        }
    }, [navigationMode, isLoading]);

    // Save headerMode to AsyncStorage when it changes
    useEffect(() => {
        if (!isLoading) {
            AsyncStorage.setItem(HEADER_MODE_KEY, headerMode).catch(e =>
                console.warn('Failed to save header mode preference:', e)
            );
        }
    }, [headerMode, isLoading]);

    // Handle system theme changes and manual theme changes
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

        return () => {
            if (subscription?.remove) {
                subscription.remove();
            }
        };
    }, [themeMode]);

    // Handle system accent changes and manual accent changes
    useEffect(() => {
        const accent = normalizeAccent(accentMode);
        if (accent !== accentMode) {
            setAccentModeState(accentMode);
        }
    }, [accentMode]);

    // Normalize theme mode to ensure it is valid
    useEffect(() => {
        const Navigation = normalizeNavigationMode(navigationMode);
        if (Navigation !== navigationMode) {
            setNavigationMode(Navigation);
        }
    }, [navigationMode]);

    // Normalize header mode to ensure it is valid
    useEffect(() => {
        const header = normalizeHeaderMode(headerMode);
        if (header !== headerMode) {
            setHeaderMode(header);
        }
    }, [headerMode]);

    // Normalize border mode to ensure it is valid
    useEffect(() => {
        const border = normalizeBorderMode(borderMode);
        if (border !== borderMode) {
            setBorderMode(border);
        }
    }, [borderMode]);

    const setThemeMode = useCallback((mode) => {
        setThemeModeState(normalizeTheme(mode));
    }, []);

    const resolvePaletteKey = () => {
        if (accentMode === 'default') {
            return theme;
        }
        const capitalizedAccent = accentMode.charAt(0).toUpperCase() + accentMode.slice(1);
        return theme + capitalizedAccent;
    };

    const colors = palettes[resolvePaletteKey()] || palettes.dark;

    const styles = createStyles(colors);

    const contextValue = {
        theme,
        themeMode,
        accentMode,
        setAccentModeState,
        setThemeMode,
        colors,
        variables,
        styles,
        navigationMode,
        setNavigationMode,
        headerMode,
        setHeaderMode,
        borderMode,
        setBorderMode,
        isBorder: borderMode !== 'none',
        border: borderMode === 'none' ? 0 : borderMode === 'thin' ? variables.borderWidth.thin : borderMode === 'subtle' ? variables.borderWidth.regular : variables.borderWidth.thick,
        isLoading,
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const createThemedStyles = (styleFactory) => {
    return (colors, variables) => {
        try {
            const styles = styleFactory(colors, variables);
            return StyleSheet.create(styles || {});
        } catch (error) {
            console.error('Error creating themed styles:', error);
            return {};
        }
    };
};

export const useThemedStyles = (styleFactory) => {
    const { colors, variables } = useTheme();
    return createThemedStyles(styleFactory)(colors, variables);
};

export const makeStyles = (styleFactory) => {
    console.warn('makeStyles is deprecated. Use useThemedStyles hook instead.');
    return useThemedStyles(styleFactory);
};