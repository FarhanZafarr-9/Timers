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
    ACCENTS: ['default', 'blue', 'green', 'purple', 'rose', 'amber', 'teal', 'indigo', 'cyan', 'lime', 'fuchsia', 'slate', 'subtle'],
    UNITS: ['seconds', 'minutes', 'hours', 'days', 'months', 'years', 'auto'],
    BACKGROUND_PATTERNS: ['none', 'grid', 'polka', 'waves', 'noise', 'diagonal', 'cross'],
    NAVIGATION_MODES: ['floating', 'fixed', 'side'],
    HEADER_MODES: ['collapsible', 'fixed', 'minimized'],
    BORDER_MODES: ['none', 'thin', 'subtle', 'thick'],
    LAYOUT_MODES: ['list', 'grid'],
    PROGRESS_MODES: ['linear', 'halfWave', 'fullWave']
};

// Base theme definitions - these define the core colors and variations for each theme
const BASE_THEMES = {
    light: {
        backgrounds: {
            primary: '#f5f5f5',
            card: '#fafafa',
            cardLighter: '#f8f8f8',
            setting: '#f2f2f2',
            modal: '#fafafa',
            snackbar: '#fafafa'
        },
        texts: {
            primary: '#2a2a2a',
            secondary: '#4a4a4a',
            title: '#1f1f1f',
            desc: '#7a7a7a'
        },
        borders: {
            primary: '#e0e0e0',
            divider: '#ebebeb',
            card: '#e0e0e0'
        },
        buttons: {
            modalBg: '#f2f2f2',
            modalText: '#4a4a4a',
            cancelBg: 'rgba(42, 42, 42, 0.03)',
            cancelBorder: '#a0a0a0'
        },
        switch: {
            track: '#d0d0d0',
            thumb: '#fafafa'
        }
    },
    dark: {
        backgrounds: {
            primary: '#0a0a0a',
            card: '#161616',
            cardLighter: '#1f1f1f',
            setting: '#1a1a1a',
            modal: '#161616',
            snackbar: '#1a1a1a'
        },
        texts: {
            primary: '#f5f5f5',
            secondary: '#a8a8a8',
            title: '#ffffff',
            desc: '#888888'
        },
        borders: {
            primary: '#55555555',
            divider: '#242424',
            card: '#2a2a2a55'
        },
        buttons: {
            modalBg: '#2a2a2a',
            modalText: '#a8a8a8',
            cancelBg: 'rgba(255, 255, 255, 0.06)',
            cancelBorder: '#555555'
        },
        switch: {
            track: '#333333',
            thumb: '#d4d4d4'
        }
    }
};

// Accent color definitions with their specific theme variations
const ACCENT_THEMES = {
    blue: {
        light: {
            backgrounds: {
                primary: '#f7f8fb',
                card: '#fafbfd',
                cardLighter: '#f5f6fa',
                setting: '#f0f4f9',
                modal: '#fafbfd',
                snackbar: '#fafbfd'
            },
            borders: {
                primary: '#dde4f0',
                divider: '#eeeff6',
                card: '#dde4f0'
            },
            accent: '#5b8ce8',
            accentText: '#4a7bc8',
            accentBg: 'rgba(59, 130, 246, 0.06)',
            accentBorder: '#7a9ed4',
            addButtonBg: 'rgba(59, 130, 246, 0.04)'
        },
        dark: {
            backgrounds: {
                primary: '#0a0b0f',
                card: '#141620',
                cardLighter: '#1a1d28',
                setting: '#171a24',
                modal: '#141620',
                snackbar: '#141620'
            },
            borders: {
                primary: '#2a2d3855',
                divider: '#1f2229',
                card: '#2a2d3855'
            },
            accent: '#3b82f6',
            accentText: '#5b9cf6',
            accentBg: 'rgba(59, 130, 246, 0.12)',
            accentBorder: '#4f76c7',
            addButtonBg: 'rgba(59, 130, 246, 0.08)'
        }
    },
    green: {
        light: {
            backgrounds: {
                primary: '#f7faf8',
                card: '#fafdfa',
                cardLighter: '#f5f9f6',
                setting: '#edf9f0',
                modal: '#fafdfa',
                snackbar: '#fafdfa'
            },
            borders: {
                primary: '#d8f0e1',
                divider: '#eeeff6',
                card: '#d8f0e1'
            },
            accent: '#4ade80',
            accentText: '#2d8f5a',
            accentBg: 'rgba(34, 197, 94, 0.06)',
            accentBorder: '#2d8f5a',
            addButtonBg: 'rgba(34, 197, 94, 0.04)'
        },
        dark: {
            backgrounds: {
                primary: '#0a0f0b',
                card: '#141a16',
                cardLighter: '#1a221c',
                setting: '#171f19',
                modal: '#141a16',
                snackbar: '#141a16'
            },
            borders: {
                primary: '#2a342c55',
                divider: '#1f2722',
                card: '#2a342c55'
            },
            accent: '#22c55e',
            accentText: '#4ade80',
            accentBg: 'rgba(34, 197, 94, 0.12)',
            accentBorder: '#1e9a4f',
            addButtonBg: 'rgba(34, 197, 94, 0.08)'
        }
    },
    purple: {
        light: {
            backgrounds: {
                primary: '#faf8fc',
                card: '#fdfdfe',
                cardLighter: '#f8f6fb',
                setting: '#f5f0fa',
                modal: '#fdfdfe',
                snackbar: '#fdfdfe'
            },
            borders: {
                primary: '#e9dff2',
                divider: '#eeeff6',
                card: '#e9dff2'
            },
            accent: '#a855f7',
            accentText: '#8b5dd6',
            accentBg: 'rgba(168, 85, 247, 0.06)',
            accentBorder: '#9b6cd8',
            addButtonBg: 'rgba(168, 85, 247, 0.04)'
        },
        dark: {
            backgrounds: {
                primary: '#0f0a0f',
                card: '#1a1420',
                cardLighter: '#221a28',
                setting: '#1f1724',
                modal: '#1a1420',
                snackbar: '#1a1420'
            },
            borders: {
                primary: '#342a3855',
                divider: '#271f29',
                card: '#342a3855'
            },
            accent: '#a855f7',
            accentText: '#c4a4f7',
            accentBg: 'rgba(168, 85, 247, 0.12)',
            accentBorder: '#8b46d4',
            addButtonBg: 'rgba(168, 85, 247, 0.08)'
        }
    },
    rose: {
        light: {
            backgrounds: {
                primary: '#fcf8f9',
                card: '#fefbfc',
                cardLighter: '#faf6f7',
                setting: '#faf0f2',
                modal: '#fefbfc',
                snackbar: '#fefbfc'
            },
            borders: {
                primary: '#f2dfe3',
                divider: '#eeeff6',
                card: '#f2dfe3'
            },
            accent: '#f43f5e',
            accentText: '#d83961',
            accentBg: 'rgba(244, 63, 94, 0.06)',
            accentBorder: '#d83961',
            addButtonBg: 'rgba(244, 63, 94, 0.04)'
        },
        dark: {
            backgrounds: {
                primary: '#0f0a0c',
                card: '#201416',
                cardLighter: '#281a1c',
                setting: '#241719',
                modal: '#201416',
                snackbar: '#201416'
            },
            borders: {
                primary: '#382a2c55',
                divider: '#271f21',
                card: '#382a2c55'
            },
            accent: '#f43f5e',
            accentText: '#f472a6',
            accentBg: 'rgba(244, 63, 94, 0.12)',
            accentBorder: '#d63650',
            addButtonBg: 'rgba(244, 63, 94, 0.08)'
        }
    },
    amber: {
        light: {
            backgrounds: {
                primary: '#fcfaf6',
                card: '#fefcf8',
                cardLighter: '#faf8f3',
                setting: '#fcf8f1',
                modal: '#fefcf8',
                snackbar: '#fefcf8'
            },
            borders: {
                primary: '#f5e184',
                divider: '#eeeff6',
                card: '#f5e184'
            },
            accent: '#f59e0b',
            accentText: '#cc8a0a',
            accentBg: 'rgba(245, 158, 11, 0.06)',
            accentBorder: '#cc8a0a',
            addButtonBg: 'rgba(245, 158, 11, 0.04)'
        },
        dark: {
            backgrounds: {
                primary: '#0f0d0a',
                card: '#201a14',
                cardLighter: '#28221a',
                setting: '#241e17',
                modal: '#201a14',
                snackbar: '#201a14'
            },
            borders: {
                primary: '#38322a55',
                divider: '#272119',
                card: '#38322a55'
            },
            accent: '#f59e0b',
            accentText: '#fbbf24',
            accentBg: 'rgba(245, 158, 11, 0.12)',
            accentBorder: '#d18509',
            addButtonBg: 'rgba(245, 158, 11, 0.08)'
        }
    },
    teal: {
        light: {
            backgrounds: {
                primary: '#f6fbfa',
                card: '#f9fdfc',
                cardLighter: '#f3f9f7',
                setting: '#edf9f6',
                modal: '#f9fdfc',
                snackbar: '#f9fdfc'
            },
            borders: {
                primary: '#ceeee7',
                divider: '#eeeff6',
                card: '#ceeee7'
            },
            accent: '#14b8a6',
            accentText: '#199d88',
            accentBg: 'rgba(20, 184, 166, 0.06)',
            accentBorder: '#199d88',
            addButtonBg: 'rgba(20, 184, 166, 0.04)'
        },
        dark: {
            backgrounds: {
                primary: '#0a0f0e',
                card: '#141f1e',
                cardLighter: '#1a2827',
                setting: '#172420',
                modal: '#141f1e',
                snackbar: '#141f1e'
            },
            borders: {
                primary: '#2a383555',
                divider: '#1f2f2a',
                card: '#2a383555'
            },
            accent: '#14b8a6',
            accentText: '#5eead4',
            accentBg: 'rgba(20, 184, 166, 0.12)',
            accentBorder: '#0d9488',
            addButtonBg: 'rgba(20, 184, 166, 0.08)'
        }
    },
    indigo: {
        light: {
            backgrounds: {
                primary: '#f7f8fb',
                card: '#fafbfd',
                cardLighter: '#f5f6fa',
                setting: '#eef4fb',
                modal: '#fafbfd',
                snackbar: '#fafbfd'
            },
            borders: {
                primary: '#dde2fa',
                divider: '#eeeff6',
                card: '#dde2fa'
            },
            accent: '#6366f1',
            accentText: '#5d60d1',
            accentBg: 'rgba(99, 102, 241, 0.06)',
            accentBorder: '#6064d4',
            addButtonBg: 'rgba(99, 102, 241, 0.04)'
        },
        dark: {
            backgrounds: {
                primary: '#0a0a0f',
                card: '#14141f',
                cardLighter: '#1a1a28',
                setting: '#171724',
                modal: '#14141f',
                snackbar: '#14141f'
            },
            borders: {
                primary: '#2a2a3855',
                divider: '#1f1f29',
                card: '#2a2a3855'
            },
            accent: '#6366f1',
            accentText: '#818cf8',
            accentBg: 'rgba(99, 102, 241, 0.12)',
            accentBorder: '#5855d6',
            addButtonBg: 'rgba(99, 102, 241, 0.08)'
        }
    },
    cyan: {
        light: {
            backgrounds: {
                primary: '#f6fafe',
                card: '#f9fcfe',
                cardLighter: '#f3f8fd',
                setting: '#ebfafd',
                modal: '#f9fcfe',
                snackbar: '#f9fcfe'
            },
            borders: {
                primary: '#ccf7fb',
                divider: '#eeeff6',
                card: '#ccf7fb'
            },
            accent: '#06b6d4',
            accentText: '#0e9bb0',
            accentBg: 'rgba(6, 182, 212, 0.06)',
            accentBorder: '#0e9bb0',
            addButtonBg: 'rgba(6, 182, 212, 0.04)'
        },
        dark: {
            backgrounds: {
                primary: '#0a0f0f',
                card: '#141f20',
                cardLighter: '#1a2829',
                setting: '#172425',
                modal: '#141f20',
                snackbar: '#141f20'
            },
            borders: {
                primary: '#2a383955',
                divider: '#1f2f31',
                card: '#2a383955'
            },
            accent: '#06b6d4',
            accentText: '#67e8f9',
            accentBg: 'rgba(6, 182, 212, 0.12)',
            accentBorder: '#0891b2',
            addButtonBg: 'rgba(6, 182, 212, 0.08)'
        }
    },
    lime: {
        light: {
            backgrounds: {
                primary: '#f9fcf5',
                card: '#fbfdf8',
                cardLighter: '#f7fbf2',
                setting: '#f5fce4',
                modal: '#fbfdf8',
                snackbar: '#fbfdf8'
            },
            borders: {
                primary: '#d6f598',
                divider: '#eeeff6',
                card: '#d6f598'
            },
            accent: '#84cc16',
            accentText: '#6b9515',
            accentBg: 'rgba(132, 204, 22, 0.06)',
            accentBorder: '#6b9515',
            addButtonBg: 'rgba(132, 204, 22, 0.04)'
        },
        dark: {
            backgrounds: {
                primary: '#0c0f0a',
                card: '#171f14',
                cardLighter: '#1e281a',
                setting: '#1a2417',
                modal: '#171f14',
                snackbar: '#171f14'
            },
            borders: {
                primary: '#2e382a55',
                divider: '#222f1f',
                card: '#2e382a55'
            },
            accent: '#84cc16',
            accentText: '#a3e635',
            accentBg: 'rgba(132, 204, 22, 0.12)',
            accentBorder: '#65a30d',
            addButtonBg: 'rgba(132, 204, 22, 0.08)'
        }
    },
    fuchsia: {
        light: {
            backgrounds: {
                primary: '#fbf8fe',
                card: '#fdfbfe',
                cardLighter: '#f9f3fd',
                setting: '#f8f2fd',
                modal: '#fdfbfe',
                snackbar: '#fdfbfe'
            },
            borders: {
                primary: '#f0cbfb',
                divider: '#eeeff6',
                card: '#f0cbfb'
            },
            accent: '#d946ef',
            accentText: '#b544c7',
            accentBg: 'rgba(217, 70, 239, 0.06)',
            accentBorder: '#bb53ca',
            addButtonBg: 'rgba(217, 70, 239, 0.04)'
        },
        dark: {
            backgrounds: {
                primary: '#0f0a0f',
                card: '#1f1420',
                cardLighter: '#281a28',
                setting: '#241724',
                modal: '#1f1420',
                snackbar: '#1f1420'
            },
            borders: {
                primary: '#382a3855',
                divider: '#271f29',
                card: '#382a3855'
            },
            accent: '#d946ef',
            accentText: '#e879f9',
            accentBg: 'rgba(217, 70, 239, 0.12)',
            accentBorder: '#c026d3',
            addButtonBg: 'rgba(217, 70, 239, 0.08)'
        }
    },
    slate: {
        light: {
            backgrounds: {
                primary: '#f9f9fa',
                card: '#fcfcfd',
                cardLighter: '#f6f7f8',
                setting: '#f5f7f9',
                modal: '#fcfcfd',
                snackbar: '#fcfcfd'
            },
            borders: {
                primary: '#dde3eb',
                divider: '#eeeff6',
                card: '#dde3eb'
            },
            accent: '#64748b',
            accentText: '#586575',
            accentBg: 'rgba(100, 116, 139, 0.06)',
            accentBorder: '#5d6b7a',
            addButtonBg: 'rgba(100, 116, 139, 0.04)'
        },
        dark: {
            backgrounds: {
                primary: '#0a0c0d',
                card: '#141819',
                cardLighter: '#1a2022',
                setting: '#171c1e',
                modal: '#141819',
                snackbar: '#141819'
            },
            borders: {
                primary: '#2a323555',
                divider: '#1f2629',
                card: '#2a323555'
            },
            accent: '#64748b',
            accentText: '#94a3b8',
            accentBg: 'rgba(100, 116, 139, 0.12)',
            accentBorder: '#475569',
            addButtonBg: 'rgba(100, 116, 139, 0.08)'
        }
    },
    subtle: {
        light: {
            backgrounds: {
                primary: '#f8f8f8',
                card: '#fcfcfc',
                cardLighter: '#fefefe',
                setting: '#f5f5f5',
                modal: '#fcfcfc',
                snackbar: '#fcfcfc'
            },
            borders: {
                primary: '#ececec',
                divider: '#f2f2f2',
                card: '#eaeaea'
            },
            accent: '#4a4a4a',
            accentText: '#3a3a3a',
            accentBg: 'rgba(74, 74, 74, 0.05)',
            accentBorder: '#5a5a5a',
            addButtonBg: 'rgba(74, 74, 74, 0.03)'
        },
        dark: {
            backgrounds: {
                primary: '#0f0f0f',
                card: '#141414',
                cardLighter: '#181818',
                setting: '#131313',
                modal: '#141414',
                snackbar: '#141414'
            },
            borders: {
                primary: '#1a1a1a88',
                divider: '#1c1c1c',
                card: '#1c1c1c88'
            },
            accent: '#e5e5e5',
            accentText: '#f0f0f0',
            accentBg: 'rgba(229, 229, 229, 0.1)',
            accentBorder: '#c8c8c8',
            addButtonBg: 'rgba(229, 229, 229, 0.06)'
        }
    }
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
        return 'dark';
    }
};

// Generate palette based on theme and accent
const generatePalette = (isDark, accentMode) => {
    const themeKey = isDark ? 'dark' : 'light';
    const baseTheme = BASE_THEMES[themeKey];

    // Use default theme or accent-specific theme
    let accentTheme = null;
    if (accentMode !== 'default' && ACCENT_THEMES[accentMode]) {
        accentTheme = ACCENT_THEMES[accentMode][themeKey];
    }

    // Merge base theme with accent theme
    const backgrounds = accentTheme?.backgrounds || baseTheme.backgrounds;
    const borders = accentTheme?.borders || baseTheme.borders;
    const highlight = accentTheme?.accent || (isDark ? '#f5f5f5' : '#2a2a2a');
    const accentText = accentTheme?.accentText || highlight;
    const accentBg = accentTheme?.accentBg || (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(42, 42, 42, 0.06)');
    const accentBorder = accentTheme?.accentBorder || (isDark ? '#666666' : '#707070');
    const addButtonBg = accentTheme?.addButtonBg || (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(42, 42, 42, 0.05)');

    return {
        background: backgrounds.primary,
        card: backgrounds.card,
        cardLighter: backgrounds.cardLighter,
        cardBorder: borders.card,
        settingBlock: backgrounds.setting,
        text: baseTheme.texts.primary,
        textSecondary: baseTheme.texts.secondary,
        textTitle: baseTheme.texts.title,
        textDesc: baseTheme.texts.desc,
        snackbarBg: backgrounds.snackbar,
        snackbarText: baseTheme.texts.primary,
        modalBg: backgrounds.modal,
        modalText: baseTheme.texts.primary,
        modalBtnBg: baseTheme.buttons.modalBg,
        modalBtnText: baseTheme.buttons.modalText,
        modalBtnOkBg: accentBg,
        modalBtnOkText: accentText,
        switchTrack: highlight + '50',
        switchTrackActive: highlight,
        switchThumb: baseTheme.switch.thumb,
        switchThumbActive: isDark && accentMode !=='default' ? '#ffffff' : baseTheme.switch.thumb,
        border: borders.primary,
        divider: borders.divider,
        highlight: highlight,
        addButtonBg: addButtonBg,
        addButtonBorder: accentBorder,
        cancelButtonBg: baseTheme.buttons.cancelBg,
        cancelButtonBorder: baseTheme.buttons.cancelBorder,
    };
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

    // Generate colors using the palette system
    const isDarkMode = theme === 'dark';
    const colors = generatePalette(isDarkMode, accentMode);
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
                setTheme(normalizeValue(initialTheme, ['light', 'dark'], 'dark'));

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
        isDarkMode,
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

// Variables object
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