import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Appearance, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { headerOptions } from './functions';

const THEME_STORAGE_KEY = 'userThemePreference';
const NAVIGATION_MODE_KEY = 'navigationModePreference';
const HEADER_MODE_KEY = 'headerModePreference';
const VALID_THEMES = ['light', 'dark', 'system'];

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
        switchThumbActive: '#bbbbbb',
        border: '#55555555',
        divider: '#232323',
        highlight: '#fefefe',
        addButtonBg: 'rgba(34, 197, 94, 0.18)',
        addButtonBorder: '#22c55e',
        cancelButtonBg: 'rgba(239, 68, 68, 0.18)',
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
    if (['collapsible', 'fixed', 'floating'].includes(mode)) {
        return mode;
    }
    return 'floating';
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
    const [headerMode, setHeaderMode] = useState('floating');
    const [theme, setTheme] = useState(getSystemTheme());
    const [isLoading, setIsLoading] = useState(true);

    // Load themeMode from AsyncStorage on mount
    useEffect(() => {
        let isMounted = true;

        const loadTheme = async () => {
            try {
                const [storedTheme, storedNavMode, storedHeaderMode] = await Promise.all([
                    AsyncStorage.getItem(THEME_STORAGE_KEY),
                    AsyncStorage.getItem(NAVIGATION_MODE_KEY),
                    AsyncStorage.getItem(HEADER_MODE_KEY)
                ]);

                if (isMounted) {
                    const loadedTheme = storedTheme && VALID_THEMES.includes(storedTheme) ? storedTheme : 'system';
                    const loadedFloatingNav = storedNavMode !== null ? storedNavMode : 'floating';
                    const loadedHeaderMode = storedHeaderMode !== null ? storedHeaderMode : 'floating';

                    setThemeModeState(loadedTheme);
                    setNavigationMode(loadedFloatingNav);
                    setHeaderMode(loadedHeaderMode);

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