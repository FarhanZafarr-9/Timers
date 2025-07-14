import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Appearance, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { headerOptions } from './functions';

const THEME_STORAGE_KEY = 'userThemePreference';
const NAVIGATION_MODE_KEY = 'navigationModePreference';
const HEADER_MODE_KEY = 'headerModePreference';
const BORDER_MODE_KEY = 'borderModePreference';
const VALID_THEMES = ['light', 'dark', 'system', 'darkBlue', 'darkGreen', 'darkPurple', 'darkRose'];

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
        modalBtnOkBg: 'rgba(239, 68, 68, 0.16)',
        modalBtnOkText: '#ef4444',
        switchTrack: '#444',
        switchTrackActive: '#556',
        switchThumb: '#e0e0e0',
        switchThumbActive: '#ededed',
        border: '#55575A55',
        divider: '#23252C',
        highlight: '#fefefe',
        addButtonBg: 'rgba(34, 197, 94, 0.16)',
        addButtonBorder: '#22c55e',
        cancelButtonBg: 'rgba(239, 68, 68, 0.16)',
        cancelButtonBorder: '#ef4444',
    },
    darkGreen: {
        background: '#101311',        // dark with a hint of greenish tint
        card: '#161d18',              // slightly richer green-black
        cardLighter: '#1e2721',       // lifted green-gray
        cardBorder: '#4d5a4d55',      // dark olive
        settingBlock: '#19221c',
        text: '#fefefe',
        textSecondary: '#bac8ba',     // soft moss gray
        textTitle: '#ffffff',
        textDesc: '#a9b8a9',
        snackbarBg: '#161d18',
        snackbarText: '#ffffff',
        modalBg: '#161d18',
        modalText: '#fefefe',
        modalBtnBg: '#233027',        // dark leafy
        modalBtnText: '#bac8ba',
        modalBtnOkBg: 'rgba(34, 197, 94, 0.20)',
        modalBtnOkText: '#22c55e',
        switchTrack: '#384838',
        switchTrackActive: '#4a6850',
        switchThumb: '#e0e0e0',
        switchThumbActive: '#ededed',
        border: '#4d5a4d55',
        divider: '#1e2721',
        highlight: '#fefefe',
        addButtonBg: 'rgba(34, 197, 94, 0.20)',
        addButtonBorder: '#22c55e',
        cancelButtonBg: 'rgba(239, 68, 68, 0.16)',
        cancelButtonBorder: '#ef4444',
    },
    darkPurple: {
        background: '#131016',        // dark with a muted plum cast
        card: '#1a1720',
        cardLighter: '#231f2c',
        cardBorder: '#564d5a55',      // subtle violet-gray
        settingBlock: '#1d1927',
        text: '#fefefe',
        textSecondary: '#c6b8cc',     // lavender-gray
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
        switchTrack: '#4a384f',
        switchTrackActive: '#6b4a7a',
        switchThumb: '#e0e0e0',
        switchThumbActive: '#ededed',
        border: '#564d5a55',
        divider: '#231f2c',
        highlight: '#fefefe',
        addButtonBg: 'rgba(168, 85, 247, 0.20)',
        addButtonBorder: '#a855f7',
        cancelButtonBg: 'rgba(239, 68, 68, 0.16)',
        cancelButtonBorder: '#ef4444',
    },
    darkRose: {
        background: '#141012',         // dark with faint rose-brown tone
        card: '#1c1618',
        cardLighter: '#261e21',
        cardBorder: '#5a4d4d55',       // warm gray-rose
        settingBlock: '#211a1d',
        text: '#fefefe',
        textSecondary: '#c8b8b8',      // rose-tinted gray
        textTitle: '#ffffff',
        textDesc: '#bdaaaa',
        snackbarBg: '#1c1618',
        snackbarText: '#ffffff',
        modalBg: '#1c1618',
        modalText: '#fefefe',
        modalBtnBg: '#322628',
        modalBtnText: '#c8b8b8',
        modalBtnOkBg: 'rgba(244, 63, 94, 0.20)',  // rose accent
        modalBtnOkText: '#f43f5e',
        switchTrack: '#553f44',
        switchTrackActive: '#7a4a5e',
        switchThumb: '#e0e0e0',
        switchThumbActive: '#ededed',
        border: '#5a4d4d55',
        divider: '#261e21',
        highlight: '#fefefe',
        addButtonBg: 'rgba(244, 63, 94, 0.20)',
        addButtonBorder: '#f43f5e',
        cancelButtonBg: 'rgba(239, 68, 68, 0.16)',
        cancelButtonBorder: '#ef4444',
    },
};

const variables = {
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
    radius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, circle: 999 },
    borderWidth: { thin: 0.5, regular: 1, thick: 2 },
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
    if (['none', 'subtle'].includes(mode)) {
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
                const [storedTheme, storedNavMode, storedHeaderMode, storedBorderMode] = await Promise.all([
                    AsyncStorage.getItem(THEME_STORAGE_KEY),
                    AsyncStorage.getItem(NAVIGATION_MODE_KEY),
                    AsyncStorage.getItem(HEADER_MODE_KEY),
                    AsyncStorage.getItem(BORDER_MODE_KEY),
                ]);

                if (isMounted) {
                    const loadedTheme = storedTheme && VALID_THEMES.includes(storedTheme) ? storedTheme : 'system';
                    const loadedFloatingNav = storedNavMode !== null ? storedNavMode : 'floating';
                    const loadedHeaderMode = storedHeaderMode !== null ? storedHeaderMode : 'minimized';
                    const loadedBorderMode = storedBorderMode !== null ? storedBorderMode : 'subtle';

                    setThemeModeState(loadedTheme);
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

    const colors = palettes[theme] || palettes.light;
    const styles = createStyles(colors);

    const contextValue = {
        theme,
        themeMode,
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
        isBorder: borderMode === 'subtle',
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