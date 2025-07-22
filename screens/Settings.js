// Settings.js
import React, {
    memo,
    useCallback,
    useMemo,
    useState,
    useRef,
    useEffect,
} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Icons } from '../assets/icons';
import { useTimers } from '../utils/TimerContext';
import { useSecurity } from '../utils/SecurityContext';
import { useTheme } from '../utils/ThemeContext';
import { useNavBar } from '../utils/NavContext';
import HeaderScreen from '../components/HeaderScreen';
import PickerSheet from '../components/PickerSheet';
import Switch from '../components/Switch';
import ConfirmSheet from '../components/ConfirmSheet';
import PasswordPrompt from '../components/PasswordPrompt';
import ChnageLogSheet from '../components/ChnageLogSheet';
import { checkForUpdateAndReload, useRenderLogger } from '../utils/functions';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {
    themeOptions,
    accentOptions,
    layoutOptions,
    navOptions,
    headerOptions,
    privacyOptions,
    lockoutOptions,
    borderOptions,
    progressOptions,
    unitOptions,
    backgroundOptions,
} from '../utils/functions';
import Timer from '../classes/Timer';
import { Linking } from 'react-native';

const DIRECTORY_KEY = 'download_directory_uri';

/* ------------------------------------------------------------------ */
/*  Generic helpers                                                   */
/* ------------------------------------------------------------------ */
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const showToast = (type, text1, text2 = '') =>
    Toast.show({ type, text1, text2 });

/* ------------------------------------------------------------------ */
/*  Format & PathDisplay                                               */
/* ------------------------------------------------------------------ */
const useFormatDirectoryPath = () =>
    useCallback((uri) => {
        if (!uri) return '';
        try {
            let path = decodeURIComponent(uri)
                .replace(/^.*?(primary:|tree\/primary:)/i, '')
                .replace(/%20/g, ' ');
            let parts = path.split('/').filter(Boolean);
            if (parts.length > 3) parts = ['...', ...parts.slice(-3)];
            return parts.join(' > ');
        } catch {
            return uri;
        }
    }, []);

const PathDisplay = memo(({ path, style }) => {
    const format = useFormatDirectoryPath();
    if (!path) return null;
    return <Text style={style}>{format(path)}</Text>;
});

/* ------------------------------------------------------------------ */
/*  Section header                                                    */
/* ------------------------------------------------------------------ */
const SectionHeader = memo(({ children, onPress }) => {
    const { colors } = useTheme();
    const styles = useMemo(
        () =>
            StyleSheet.create({
                sectionHeader: { paddingVertical: 10, paddingHorizontal: 15 },
                sectionHeaderText: {
                    fontSize: 13,
                    fontWeight: 'bold',
                    color: colors.highlight,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                },
            }),
        [colors]
    );
    return (
        <TouchableOpacity style={styles.sectionHeader} onPress={onPress} activeOpacity={1}>
            <Text style={styles.sectionHeaderText}>{children}</Text>
        </TouchableOpacity>
    );
});

/* ------------------------------------------------------------------ */
/*  Animated card wrapper                                             */
/* ------------------------------------------------------------------ */
const AnimatedCard = memo(({ animatedStyle, children }) => (
    <Animated.View style={animatedStyle}>
        <CardShell>{children}</CardShell>
    </Animated.View>
));

const CardShell = memo(({ children }) => {
    const { colors, variables, border } = useTheme();
    const styles = useMemo(
        () =>
            StyleSheet.create({
                card: {
                    backgroundColor: 'transparent',
                    marginBottom: 15,
                    borderRadius: variables.radius.lg,
                    overflow: 'hidden',
                    borderWidth: border,
                    borderColor: colors.cardBorder,
                },
            }),
        [colors, variables, border]
    );
    return <View style={styles.card}>{children}</View>;
});

/* ------------------------------------------------------------------ */
/*  Re-usable setting row                                             */
/* ------------------------------------------------------------------ */
const SettingRow = memo(
    ({
        icon,
        title,
        desc,
        onPress,
        children,
        noBorder,
        disabled,
        extraStyle,
    }) => {
        const { colors, border } = useTheme();
        const styles = useMemo(
            () =>
                StyleSheet.create({
                    settingBlock: {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: 18,
                        paddingBottom: 14,
                        paddingHorizontal: 20,
                        backgroundColor: colors.settingBlock + 'f5',
                        borderBottomWidth: border,
                        borderBottomColor: colors.border,
                    },
                    settingTextBlock: { flex: 1 },
                    settingTitle: {
                        fontSize: 16,
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: 2,
                        height: 22,
                    },
                    settingDesc: {
                        fontSize: 13,
                        color: colors.textDesc,
                        opacity: 0.85,
                        height: 18,
                    },
                }),
            [colors, border]
        );
        return (
            <TouchableOpacity
                style={[styles.settingBlock, noBorder && { borderBottomWidth: 0 }, extraStyle]}
                onPress={onPress}
                activeOpacity={disabled ? 1 : 0.7}
                disabled={disabled}
            >
                {icon && (
                    <Icons.Ion
                        name={icon}
                        size={14}
                        color={colors.highlight}
                        style={{ marginRight: 15 }}
                    />
                )}
                <View style={styles.settingTextBlock}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    <Text style={styles.settingDesc}>{desc}</Text>
                </View>
                {children}
            </TouchableOpacity>
        );
    }
);

/* ------------------------------------------------------------------ */
/*  Card 1 – Appearance                                               */
/* ------------------------------------------------------------------ */
const AppearanceCard = memo(({ animatedStyle }) => {
    const {
        accentMode,
        setAccentMode,
        colors,
        variables,
        themeMode,
        setThemeMode,
        borderMode,
        setBorderMode,
        progressMode,
        setProgressMode,
        backgroundPattern,
        setBackgroundPattern,
    } = useTheme();

    const [showExtra, setShowExtra] = useState(false);
    const addMessage = useCallback(
        (text, type = 'info') => showToast(type, capitalize(type), text),
        []
    );

    return (
        <AnimatedCard animatedStyle={animatedStyle}>
            <SettingRow
                icon="color-palette-outline"
                title="Theme"
                desc="Choose app theme"
            >
                <PickerSheet
                    value={themeMode}
                    options={themeOptions}
                    onChange={setThemeMode}
                    title="Theme"
                    placeholder="Select theme"
                    colors={colors}
                    variables={variables}
                />
            </SettingRow>

            <SettingRow
                icon="brush-outline"
                title="Accent"
                desc="Choose app accent"
            >
                <PickerSheet
                    value={accentMode}
                    options={accentOptions}
                    onChange={setAccentMode}
                    title="Accent"
                    placeholder="Select accent"
                    colors={colors}
                    variables={variables}
                    defaultValue="default"
                    pillsPerRow={3}
                />
            </SettingRow>

            <SettingRow
                icon="rocket-outline"
                title="Experimental UI"
                desc="Experimental UI options"
                noBorder={!showExtra}
            >
                <Switch
                    value={showExtra}
                    onValueChange={(v) => {
                        setShowExtra(v);
                        addMessage(`Extra appearance options ${v ? 'enabled' : 'disabled'}.`);
                        if (!v) {
                            setBorderMode('subtle');
                            setProgressMode('linear');
                            setBackgroundPattern('none');
                        }
                    }}
                    trackColor={{ false: colors.switchTrack, true: colors.switchTrackActive }}
                    thumbColor={!showExtra ? colors.switchThumbActive : colors.switchThumb}
                    style={{ transform: [{ scaleY: 1 }] }}
                />
            </SettingRow>

            {showExtra && (
                <>
                    <SettingRow
                        icon="analytics-outline"
                        title="Progress"
                        desc="Choose progress mode"
                    >
                        <PickerSheet
                            value={progressMode}
                            options={progressOptions}
                            onChange={setProgressMode}
                            title="Progress"
                            placeholder="Select progress"
                            colors={colors}
                            variables={variables}
                            defaultValue="linear"
                            note="Wavy motion completely stabled and working fluidly, enjoy ✨"
                        />
                    </SettingRow>

                    <SettingRow
                        icon="color-palette-outline"
                        title="Border"
                        desc="Choose border mode"
                    >
                        <PickerSheet
                            value={borderMode}
                            options={borderOptions}
                            onChange={setBorderMode}
                            title="Border"
                            placeholder="Select Border mode"
                            colors={colors}
                            variables={variables}
                            defaultValue="subtle"
                        />
                    </SettingRow>

                    <SettingRow icon="color-fill-outline" title="Background" desc="Select background pattern" noBorder>
                        <PickerSheet
                            value={backgroundPattern}
                            options={backgroundOptions}
                            onChange={setBackgroundPattern}
                            title="Background"
                            placeholder="Select background pattern"
                            colors={colors}
                            variables={variables}
                            defaultValue="none"
                            note="Still under development, so use carefully."
                        />
                    </SettingRow>
                </>
            )}
        </AnimatedCard>
    );
});

/* ------------------------------------------------------------------ */
/*  Card 2 – Layout                                                   */
/* ------------------------------------------------------------------ */
const LayoutCard = memo(({ animatedStyle }) => {
    const {
        colors,
        variables,
        headerMode,
        setHeaderMode,
        navigationMode,
        setNavigationMode,
        layoutMode,
        setLayoutMode,
        defaultUnit,
        setDefaultUnit,
        fixedBorder,
        setFixedBorder,
    } = useTheme();
    const { shouldHide, setShouldHide } = useNavBar();

    const [showExtra, setShowExtra] = useState(false);
    const addMessage = useCallback(
        (text, type = 'info') => showToast(type, capitalize(type), text),
        []
    );

    return (
        <AnimatedCard animatedStyle={animatedStyle}>
            <SettingRow
                icon="ellipsis-horizontal"
                title="Header"
                desc="Choose header mode"
            >
                <PickerSheet
                    value={headerMode}
                    options={headerOptions}
                    onChange={setHeaderMode}
                    title="Header"
                    placeholder="Select header mode"
                    colors={colors}
                    variables={variables}
                    defaultValue="minimized"
                />
            </SettingRow>

            <SettingRow
                icon="navigate-outline"
                title="Navigation"
                desc="Select navigation mode"
            >
                <PickerSheet
                    value={navigationMode}
                    options={navOptions}
                    onChange={setNavigationMode}
                    title="Navigation"
                    placeholder="Select navigation mode"
                    colors={colors}
                    variables={variables}
                    defaultValue="floating"
                />
            </SettingRow>

            <SettingRow
                icon="construct-outline"
                title="Experimental"
                desc="Layout Test Features"
                noBorder={!showExtra}
            > 
                <Switch
                    value={showExtra}
                    onValueChange={(v) => {
                        setShowExtra(v);
                        addMessage(`Extra Layout options ${v ? 'enabled' : 'disabled'}.`);
                        if (!v) {
                            setDefaultUnit('auto');
                            setFixedBorder(false);
                            setShouldHide(false);
                            setLayoutMode('list');
                        }
                    }}
                    trackColor={{ false: colors.switchTrack, true: colors.switchTrackActive }}
                    thumbColor={!showExtra ? colors.switchThumbActive : colors.switchThumb}
                    style={{ transform: [{ scaleY: 1 }] }}
                />
            </SettingRow>

            {showExtra && (
                <>
                    <SettingRow icon="grid-outline" title="Layout" desc="Select layout mode" noBorder={(headerMode === 'fixed' || navigationMode === 'fixed') ? false : true}>
                        <PickerSheet
                            value={layoutMode}
                            options={layoutOptions}
                            onChange={setLayoutMode}
                            title="Layout"
                            placeholder="Layout"
                            colors={colors}
                            variables={variables}
                            defaultValue="list"
                            note="Grid layout minimizes privacy text for easier view"
                        />
                    </SettingRow>

                    {layoutMode === 'grid' && (
                        <SettingRow icon="speedometer-outline" title="Default Unit" desc="Card unit setting">
                            <PickerSheet
                                value={defaultUnit}
                                options={unitOptions}
                                onChange={setDefaultUnit}
                                title="Unit"
                                placeholder="Unit"
                                colors={colors}
                                variables={variables}
                                defaultValue="auto"
                                note="This default unit is only considered in grid mode"
                            />
                        </SettingRow>
                    )}

                    {(navigationMode === 'fixed' || headerMode === 'fixed') && (
                        <>
                            <SettingRow
                                icon="crop-outline"
                                title="Border radius"
                                desc="Fixed mode corners"
                            >
                                <Switch
                                    value={!!fixedBorder}
                                    onValueChange={(v) => {
                                        setFixedBorder(v);
                                        addMessage(`Fixed Rounded borders ${v ? 'enabled' : 'disabled'}.`);
                                    }}
                                    trackColor={{ false: colors.switchTrack, true: colors.switchTrackActive }}
                                    thumbColor={!fixedBorder ? colors.switchThumbActive : colors.switchThumb}
                                    style={{ transform: [{ scaleY: 1 }] }}
                                />
                            </SettingRow>

                            <SettingRow
                                icon="expand-outline"
                                title="Immerse"
                                desc="Auto-hide fixed modes"
                                noBorder
                            >
                                <Switch
                                    value={!!shouldHide}
                                    onValueChange={(v) => {
                                        setShouldHide(v);
                                        addMessage(`Auto hide fixed modes ${v ? 'enabled' : 'disabled'}.`);
                                    }}
                                    trackColor={{ false: colors.switchTrack, true: colors.switchTrackActive }}
                                    thumbColor={!shouldHide ? colors.switchThumbActive : colors.switchThumb}
                                    style={{ transform: [{ scaleY: 1 }] }}
                                />
                            </SettingRow>
                        </>
                    )}
                </>
            )}
        </AnimatedCard>
    );
});

/* ------------------------------------------------------------------ */
/*  Card 3 – Security                                                 */
/* ------------------------------------------------------------------ */
const SecurityCard = memo(({ animatedStyle }) => {
    const {
        isFingerprintEnabled,
        toggleFingerprint,
        isSensorAvailable,
        isPasswordLockEnabled,
        togglePasswordLock,
        savePassword,
        clearPassword,
        password,
        privacyMode,
        setPrivacyModeValue,
        lockoutMode,
        setLockoutModeValue,
        shouldUseLockout,
        loading,
        PasswordPromptVisible,
        setPasswordPromptVisible,
    } = useSecurity();
    const { colors, variables } = useTheme();

    const [mode, setMode] = useState('set');
    const addMessage = useCallback(
        (text, type = 'info') => showToast(type, capitalize(type), text),
        []
    );

    return (
        <AnimatedCard animatedStyle={animatedStyle}>
            <SettingRow icon="eye-off-outline" title="Privacy Mode" desc="Masks timer names and titles">
                <PickerSheet
                    value={privacyMode}
                    options={privacyOptions}
                    onChange={setPrivacyModeValue}
                    title="Privacy"
                    placeholder="Select mode"
                    colors={colors}
                    variables={variables}
                    note="Emoji mode has been re enabled, enjoy ✨"
                />
            </SettingRow>

            {isSensorAvailable && (
                <SettingRow
                    icon="finger-print-outline"
                    title="Fingerprint Unlock"
                    desc="Enable fingerprint authentication"
                >
                    <Switch
                        value={!!isFingerprintEnabled}
                        onValueChange={() => {
                            toggleFingerprint();
                            addMessage(`Fingerprint unlock ${!isFingerprintEnabled ? 'enabled' : 'disabled'}.`);
                        }}
                        trackColor={{ false: colors.switchTrack, true: colors.switchTrackActive }}
                        thumbColor={!isFingerprintEnabled ? colors.switchThumbActive : colors.switchThumb}
                        style={{ transform: [{ scaleY: 1 }] }}
                    />
                </SettingRow>
            )}

            <SettingRow
                icon={isPasswordLockEnabled ? 'lock-closed-outline' : 'lock-open-outline'}
                title="Password Lock"
                desc="Enable password authentication"
                noBorder={!isPasswordLockEnabled}
            >
                <Switch
                    value={!!isPasswordLockEnabled}
                    onValueChange={(v) => {
                        if (loading) return;
                        if (v) {
                            setMode('set');
                            setPasswordPromptVisible(true);
                        } else {
                            clearPassword();
                            addMessage('Password lock disabled.');
                        }
                    }}
                    trackColor={{ false: colors.switchTrack, true: colors.switchTrackActive }}
                    thumbColor={!isPasswordLockEnabled ? colors.switchThumbActive : colors.switchThumb}
                    style={{ transform: [{ scale: 1 }] }}
                />
            </SettingRow>

            {isPasswordLockEnabled && (
                <>
                    <SettingRow
                        icon="key-outline"
                        title={isPasswordLockEnabled ? 'Change Password' : 'Set Password'}
                        desc={
                            isPasswordLockEnabled
                                ? 'Change your current password'
                                : 'Set a password for extra security'
                        }
                        noBorder={!shouldUseLockout()}
                        onPress={() => {
                            setMode(isPasswordLockEnabled ? 'change' : 'set');
                            setPasswordPromptVisible(true);
                        }}
                    />
                    {shouldUseLockout() && (
                        <SettingRow icon="timer-outline" title="Lockout" desc="Set duration for reauthentication" noBorder>
                            <PickerSheet
                                value={lockoutMode}
                                options={lockoutOptions}
                                onChange={setLockoutModeValue}
                                title="Lockout"
                                placeholder="Select lockout"
                                colors={colors}
                                variables={variables}
                                pillsPerRow={3}
                            />
                        </SettingRow>
                    )}
                </>
            )}
            <PasswordPrompt
                visible={PasswordPromptVisible}
                onClose={() => setPasswordPromptVisible(false)}
                onSave={(newPassword) => {
                    savePassword(newPassword);
                    setPasswordPromptVisible(false);
                    addMessage('Password updated.', 'success');
                }}
                currentPassword={password}
                mode={mode}
                colors={colors}
                variables={variables}
            />
        </AnimatedCard>
    );
});

/* ------------------------------------------------------------------ */
/*  Card 4 – Timer Management                                         */
/* ------------------------------------------------------------------ */
const TimerManagementCard = memo(({ animatedStyle }) => {
    const { initializeTimers, clearAllTimers, timers, setTimersAndSave } = useTimers();
    const [directoryUri, setDirectoryUri] = useState(null);
    const [populateDisabled, setPopulateDisabled] = useState(false);
    const [showExtra, setShowExtra] = useState(0);
    const addMessage = useCallback(
        (text, type = 'info') => showToast(type, capitalize(type), text),
        []
    );

    const format = useFormatDirectoryPath();

    /* Directory load & export helpers */
    useEffect(() => {
        (async () => {
            const uri = await AsyncStorage.getItem(DIRECTORY_KEY);
            setDirectoryUri(uri);
        })();
    }, []);

    const exportToJson = useCallback(async () => {
        try {
            let uri = directoryUri;
            if (!uri) {
                const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (!permission.granted) {
                    addMessage('Export cancelled - no folder selected', 'error');
                    return;
                }
                uri = permission.directoryUri;
                await AsyncStorage.setItem(DIRECTORY_KEY, uri);
                setDirectoryUri(uri);
                addMessage(`Export folder set to: ${format(uri)}`);
            }
            const json = JSON.stringify(timers, null, 2);
            const fileName = `timers-export-${new Date().toISOString().split('T')[0]}.json`;
            const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                uri,
                fileName,
                'application/json'
            );
            await FileSystem.writeAsStringAsync(fileUri, json, {
                encoding: FileSystem.EncodingType.UTF8,
            });
            addMessage(`Exported to: ${format(uri)}`, 'success');
        } catch (e) {
            addMessage('Export failed: ' + (e.message || ''), 'error');
        }
    }, [directoryUri, timers, format, addMessage]);

    const loadFromJson = useCallback(async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
                multiple: false,
            });
            if (!result.canceled && result.assets?.length) {
                const file = result.assets[0];
                const content = await FileSystem.readAsStringAsync(file.uri, {
                    encoding: FileSystem.EncodingType.UTF8,
                });
                const loaded = JSON.parse(content);
                if (Array.isArray(loaded)) {
                    setTimersAndSave(loaded.map((o) => new Timer(o)));
                    addMessage('Timers loaded from JSON.', 'success');
                } else {
                    addMessage('Invalid JSON format.', 'error');
                }
            } else {
                addMessage('No file selected.');
            }
        } catch (e) {
            addMessage('Failed to load timers.', 'error');
        }
    }, [setTimersAndSave, addMessage]);

    const populateTimers = useCallback(async () => {
        if (populateDisabled) return;
        setPopulateDisabled(true);
        await initializeTimers();
        addMessage('Sample timers have been added.', 'success');
        setTimeout(() => setPopulateDisabled(false), 2000);
    }, [populateDisabled, initializeTimers, addMessage]);

    const changeDir = useCallback(async () => {
        try {
            const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (permission.granted) {
                const uri = permission.directoryUri;
                await AsyncStorage.setItem(DIRECTORY_KEY, uri);
                setDirectoryUri(uri);
                addMessage(`Export folder set to: ${format(uri)}`);
            }
        } catch {
            addMessage('Failed to change directory', 'error');
        }
    }, [format, addMessage]);

    const { colors } = useTheme();
    const styles = useMemo(
        () =>
            StyleSheet.create({
                pathDisplay: { fontSize: 12, marginLeft: 12, color: colors.textDesc },
            }),
        [colors]
    );

    return (
        <AnimatedCard animatedStyle={animatedStyle}>
            {showExtra === 3 && (
                <SettingRow
                    icon="refresh"
                    title="Populate Timers"
                    desc="Add sample timers for quick testing"
                    disabled={populateDisabled}
                    onPress={populateTimers}
                />
            )}

            <SettingRow icon="trash" title="Clear All Timers" desc="Remove all timers from your device" />

            <SettingRow
                icon="download"
                title="Export Timers"
                desc={
                    directoryUri
                        ? `Save to: ${format(directoryUri)}`
                        : 'Save all timers as a JSON file'
                }
                onPress={exportToJson}
            />

            <SettingRow
                icon="folder-open-outline"
                title="Change Export Folder"
                desc={directoryUri ? `Current: ${format(directoryUri)}` : 'No folder selected'}
                onPress={changeDir}
            />

            <SettingRow
                icon="cloud-upload-outline"
                title="Import Timers"
                desc="Load timers from a JSON file"
                noBorder
                onPress={loadFromJson}
            />
        </AnimatedCard>
    );
});

/* ------------------------------------------------------------------ */
/*  Card 5 – App Updates                                              */
/* ------------------------------------------------------------------ */
const AppUpdatesCard = memo(({ animatedStyle }) => {
    const [showChangelog, setShowChangelog] = useState(false);
    const { colors } = useTheme();
    const addMessage = useCallback(
        (text, type = 'info') => showToast(type, capitalize(type), text),
        []
    );

    const handleReportBug = useCallback(() => {
        Linking.openURL(
            'mailto:farhanzafarr.9@gmail.com?subject=Bug Report - ChronoX App&body=Please describe the bug you encountered:'
        );
    }, []);

    const handleSuggestion = useCallback(() => {
        Linking.openURL(
            'mailto:farhanzafarr.9@gmail.com?subject=Suggestion - ChronoX App&body=Please describe the suggestion you came upon:'
        );
    }, []);

    const checkUpdates = useCallback(async () => {
        const status = await checkForUpdateAndReload();
        if (status === 'up-to-date') addMessage('Already on latest version', 'success');
        else if (status === 'error') addMessage('Update check failed.', 'error');
        else if (status === 'dev-mode') addMessage('Skipped update check in dev mode.', 'info');
    }, [addMessage]);

    return (
        <AnimatedCard animatedStyle={animatedStyle}>
            <SettingRow
                icon="cloud-download-outline"
                title="Check for Updates"
                desc="Fetch latest app updates"
                onPress={checkUpdates}
            />
            <SettingRow
                icon="document-text-outline"
                title="Show Changelog"
                desc="View recent changes"
                onPress={() => setShowChangelog(true)}
            />
            <SettingRow icon="bug-outline" title="Report Bug" desc="Found a problem? Let us know" onPress={handleReportBug} />
            <SettingRow
                icon="sparkles-outline"
                title="Send Suggestion"
                desc="Share your ideas or improvements"
                noBorder
                onPress={handleSuggestion}
            />
            <ChnageLogSheet visible={showChangelog} onClose={() => setShowChangelog(false)} forced />
        </AnimatedCard>
    );
});

/* ------------------------------------------------------------------ */
/*  Main Settings Screen                                              */
/* ------------------------------------------------------------------ */
export default memo(function Settings() {
    useRenderLogger('Settings');
    const { loading: themeLoading } = useTheme();
    const {
        loading: securityLoading,
        isPasswordLockEnabled,
        isFingerprintEnabled,
        privacyMode,
        lockoutMode,
    } = useSecurity();
    const { navigationMode } = useTheme();

    /* quick early return */
    if (
        themeLoading ||
        securityLoading ||
        isPasswordLockEnabled === undefined ||
        isFingerprintEnabled === undefined ||
        privacyMode === undefined ||
        lockoutMode === undefined ||
        navigationMode === undefined
    )
        return null;

    /* --------------------------------------------------------------- */
    /*  Animation refs                                                 */
    /* --------------------------------------------------------------- */
    const card1Translate = useRef(new Animated.Value(-50)).current;
    const card2Translate = useRef(new Animated.Value(-50)).current;
    const card3Translate = useRef(new Animated.Value(-50)).current;
    const card4Translate = useRef(new Animated.Value(-50)).current;
    const card5Translate = useRef(new Animated.Value(-50)).current;

    const card1Opacity = useRef(new Animated.Value(0)).current;
    const card2Opacity = useRef(new Animated.Value(0)).current;
    const card3Opacity = useRef(new Animated.Value(0)).current;
    const card4Opacity = useRef(new Animated.Value(0)).current;
    const card5Opacity = useRef(new Animated.Value(0)).current;

    const [mounted, setMounted] = useState(false);

    /* one-shot stagger animation */
    useEffect(() => {
        const t = setTimeout(() => {
            setMounted(true);
            Animated.stagger(120, [
                Animated.parallel([
                    Animated.spring(card1Translate, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
                    Animated.timing(card1Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                ]),
                Animated.parallel([
                    Animated.spring(card2Translate, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
                    Animated.timing(card2Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                ]),
                Animated.parallel([
                    Animated.spring(card3Translate, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
                    Animated.timing(card3Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                ]),
                Animated.parallel([
                    Animated.spring(card4Translate, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
                    Animated.timing(card4Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                ]),
                Animated.parallel([
                    Animated.spring(card5Translate, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
                    Animated.timing(card5Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                ]),
            ]).start();
        }, 50);
        return () => clearTimeout(t);
    }, []);

    const { colors, variables } = useTheme();

    return (
        <HeaderScreen
            headerIcon={<Icons.Ion name="settings" color={colors.highlight} />}
            headerTitle="Settings"
            borderRadius={variables.radius.lg}
            paddingMargin={15}
            colors={colors}
            contentContainerStyle={{ paddingBottom: 95, overflow: 'visible' }}
            useFlatList={false}
            paddingX={15}
        >
            {mounted && (
                <>
                    <SectionHeader>Appearance</SectionHeader>
                    <AppearanceCard
                        animatedStyle={{
                            transform: [{ translateX: card1Translate }],
                            opacity: card1Opacity,
                        }}
                    />

                    <SectionHeader>Layout Management</SectionHeader>
                    <LayoutCard
                        animatedStyle={{
                            transform: [{ translateX: card2Translate }],
                            opacity: card2Opacity,
                        }}
                    />

                    <SectionHeader>Security & Privacy</SectionHeader>
                    <SecurityCard
                        animatedStyle={{
                            transform: [{ translateX: card3Translate }],
                            opacity: card3Opacity,
                        }}
                    />

                    <SectionHeader>Timer Management</SectionHeader>
                    <TimerManagementCard
                        animatedStyle={{
                            transform: [{ translateX: card4Translate }],
                            opacity: card4Opacity,
                        }}
                    />

                    <SectionHeader>App management</SectionHeader>
                    <AppUpdatesCard
                        animatedStyle={{
                            transform: [{ translateX: card5Translate }],
                            opacity: card5Opacity,
                        }}
                    />


                </>
            )}
        </HeaderScreen>
    );
});