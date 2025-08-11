// React and React Native Imports
import {
    memo,
    useCallback,
    useMemo,
    useState,
    useRef,
    useEffect,
} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated
} from 'react-native';

// Custom Components
import HeaderScreen from '../components/navigation/HeaderScreen';
import PickerSheet from '../components/sheets/PickerSheet';
import Switch from '../components/ui/Switch';
import ConfirmSheet from '../components/sheets/ConfirmSheet';
import PasswordPrompt from '../components/sheets/PasswordPrompt';
import ChangeLogSheet from '../components/sheets/ChangeLogSheet';
import QRShareSheet from '../components/sheets/ShareSheet';
import { ExtraSheet as BottomSheet } from '../components/sheets/ExtraSheet';

// Contexts
import { useTimers } from '../contexts/TimerContext';
import { useSecurity } from '../contexts/SecurityContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavBar } from '../contexts/NavContext';

// Utilities and Functions
import {
    checkForUpdateAndReload,
    useRenderLogger
} from '../utils/functions';
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
    linkOptions,
    encryptData,
    decryptData
} from '../utils/functions';
import { Icons } from '../assets/icons';

// Expo and Third-Party Libraries
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Linking } from 'react-native';

// Classes
import Timer from '../classes/Timer';
import { populateTimers as populate } from '../utils/timer/populateTimers';
import { TimerManager } from '../classes/TimeManager';

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
                    gap: 3
                },
            }),
        [colors, variables, border]
    );
    return <View style={styles.card}>{children}</View>;
});

/* ------------------------------------------------------------------ */
/*  Re-usable setting row                                             */
/* ------------------------------------------------------------------ */
const SettingRow = memo(({
    icon,
    title,
    desc,
    onPress,
    children,
    disabled,
    extraStyle,
    pillText,
    pillPosition = 'top-right', // 'top-left', 'top-center', 'top-right', 
    // 'center-left', 'center', 'center-right',
    // 'bottom-left', 'bottom-center', 'bottom-right'
    pillMargin = [0, 0, 0, 0],  // additional margin adjustment top, right, bottom , left
    destructive = false,
    isExtra = false
}) => {
    const { colors, border, variables } = useTheme();
    const styles = useMemo(
        () => StyleSheet.create({
            settingRowContainer: {
                position: 'relative',
            },
            settingBlock: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 18,
                paddingBottom: 14,
                paddingHorizontal: 20,
                backgroundColor: !isExtra ? colors.settingBlock : colors.highlight + '10',
                borderRadius: 5,
                opacity: disabled ? 0.5 : 1,
            },
            settingTextBlock: {
                flex: 1
            },
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
            pillContainer: {
                position: 'absolute',
                zIndex: 10,
                ...(pillPosition.includes('top') && { top: -8 + pillMargin[0] }),
                ...(pillPosition.includes('center') && { top: '50%', marginTop: -8 }),
                ...(pillPosition.includes('bottom') && { bottom: -8 + pillMargin[2] }),
                ...(pillPosition.includes('left') && { left: 12 + pillMargin[3] }),
                ...(pillPosition.includes('center') && pillPosition.split('-')[1] === 'center' && {
                    left: '50%',
                    transform: [{ translateX: -50 }]
                }),
                ...(pillPosition.includes('right') && { right: 12 + pillMargin[1] }),
            },
            pill: {
                backgroundColor: destructive ? '#F4433620' : colors.highlight,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: destructive ? '#F44336c0' : colors.border,
                opacity: disabled ? 0.5 : 1,
            },
            pillText: {
                fontSize: 10,
                fontWeight: '700',
                color: destructive ? '#F44336' : colors.background,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                lineHeight: 12,
            },
        }),
        [colors, border, variables, pillPosition, pillMargin, destructive]
    );

    return (
        <View style={styles.settingRowContainer}>
            {pillText && (
                <View style={styles.pillContainer}>
                    <View style={styles.pill}>
                        <Text style={styles.pillText}>{pillText}</Text>
                    </View>
                </View>
            )}
            <TouchableOpacity
                style={[styles.settingBlock, extraStyle]}
                onPress={onPress}
                activeOpacity={disabled ? 1 : 0.7}
                disabled={disabled}
            >
                {icon && (
                    <Icons.Ion
                        name={icon}
                        size={18}
                        color={colors.highlight}
                        style={{ marginRight: 20 }}
                    />
                )}
                <View style={styles.settingTextBlock}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    <Text style={styles.settingDesc}>{desc}</Text>
                </View>
                {children}
            </TouchableOpacity>
        </View>
    );
});
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
                    pillsPerRow={4}
                    hideLabel={true}
                />

            </SettingRow>

            <SettingRow
                icon="rocket-outline"
                title="Extra"
                desc="Extra UI options"
                onPress={() => setShowExtra(true)}
            >
                <Icons.Ion
                    name={"arrow-forward-outline"}
                    size={18}
                    color={colors.highlight}
                    style={{ transform: [{ scale: 1.15 }], marginRight: 22 }}
                />

            </SettingRow>

            <BottomSheet
                visible={showExtra}
                setVisible={setShowExtra}
                title="Extra Appearance Options"
                num={3}
                onClear={() => {
                    if (progressMode !== 'linear' || borderMode !== 'subtle' || backgroundPattern !== 'none') {
                        setProgressMode('linear');
                        setBorderMode('subtle');
                        setBackgroundPattern('none');
                        showToast('info', 'Settings Reset', 'Appearance settings have been reset to defaults.');
                    } else {
                        showToast('info', 'No Changes', 'Appearance settings are already at defaults.');
                    }
                }}
            >
                <SettingRow
                    icon="analytics-outline"
                    title="Progress"
                    desc="Choose progress mode"
                    isExtra
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
                    />
                </SettingRow>

                <SettingRow
                    icon="color-palette-outline"
                    title="Border"
                    desc="Choose border mode"
                    isExtra
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

                <SettingRow
                    icon="color-fill-outline"
                    title="Background"
                    desc="Select background pattern"
                    destructive
                    pillText={"Battery Intensive"}
                    pillMargin={[8, 6, 0, 0]}
                    disabled={true} // Not fully developed
                    isExtra
                >
                    <PickerSheet
                        value={backgroundPattern}
                        options={backgroundOptions}
                        onChange={setBackgroundPattern}
                        title="Background"
                        placeholder="Select background pattern"
                        colors={colors}
                        variables={variables}
                        defaultValue="none"
                        note="Not fully developed, so use carefully."
                        disabled={true} // Not fully developed
                    />
                </SettingRow>
            </BottomSheet>
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

    const handleToggleFixedBorder = (v) => {
        setFixedBorder(v);
        addMessage(`Fixed borders ${v ? 'enabled' : 'disabled'}.`);
    };

    const handleToggleImmerse = (v) => {
        setShouldHide(v);
        addMessage(`Immersive mode ${v ? 'enabled' : 'disabled'}.`);
    };

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
                title="Extra"
                desc="Extra Layout Features"
                onPress={() => setShowExtra(true)}
            >
                <Icons.Ion
                    name={"arrow-forward-outline"}
                    size={18}
                    color={colors.highlight}
                    style={{ transform: [{ scale: 1.15 }], marginRight: 22 }}
                />
            </SettingRow>

            <BottomSheet
                visible={showExtra}
                setVisible={setShowExtra}
                title="Extra Layout Options"
                num={4}
                onClear={() => {
                    if (layoutMode !== 'list' || fixedBorder || shouldHide) {
                        setLayoutMode('list');
                        setFixedBorder(false);
                        setShouldHide(false);
                        showToast('info', 'Settings Reset', 'Layout settings have been reset to defaults.');
                    } else {
                        showToast('info', 'No Changes', 'Layout settings are already at defaults.');
                    }
                }}
            >
                <SettingRow icon="grid-outline" title="Layout" desc="Select layout mode" isExtra>
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


                <SettingRow
                    icon="speedometer-outline"
                    title="Default Unit"
                    desc="Card unit setting"
                    disabled={layoutMode !== 'grid'}
                    pillText={`${layoutMode === 'grid' ? '' : 'For Grid'}`}
                    pillMargin={[8, 6, 0, 0]}
                    isExtra
                >
                    <PickerSheet
                        value={defaultUnit}
                        options={unitOptions}
                        onChange={setDefaultUnit}
                        title="Unit"
                        placeholder="Unit"
                        colors={colors}
                        variables={variables}
                        defaultValue="auto"
                        disabled={layoutMode !== 'grid'}
                    />
                </SettingRow>

                <SettingRow
                    icon="crop-outline"
                    title="Border radius"
                    desc="Fixed mode corners"
                    onPress={() => handleToggleFixedBorder(!fixedBorder)}
                    disabled={(navigationMode !== 'fixed' && headerMode !== 'fixed')}
                    pillText={`${navigationMode !== 'fixed' && headerMode !== 'fixed' ? 'For Fixed modes' : ''}`}
                    pillMargin={[10, 6, 0, 0]}
                    isExtra
                >
                    <Switch
                        value={!!fixedBorder}
                        onValueChange={handleToggleFixedBorder}
                        disabled={(navigationMode !== 'fixed' && headerMode !== 'fixed')}
                    />
                </SettingRow>

                <SettingRow
                    icon="expand-outline"
                    title="Immerse"
                    desc="Auto-hide fixed modes"
                    onPress={() => handleToggleImmerse(!shouldHide)}
                    disabled={(navigationMode !== 'fixed' && headerMode !== 'fixed')}
                    pillText={"Experimental"}
                    pillMargin={[10, 6, 0, 0]}
                    destructive
                    isExtra
                >
                    <Switch
                        value={!!shouldHide}
                        onValueChange={handleToggleImmerse}
                        disabled={(navigationMode !== 'fixed' && headerMode !== 'fixed')}
                    />
                </SettingRow>

            </BottomSheet>
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
    const [showExtra, setShowExtra] = useState(false);

    return (
        <AnimatedCard animatedStyle={animatedStyle}>
            <SettingRow icon="eye-off-outline" title="Privacy Mode" desc="Masks sensitive details">
                <PickerSheet
                    value={privacyMode}
                    options={privacyOptions}
                    onChange={setPrivacyModeValue}
                    title="Privacy"
                    placeholder="Select mode"
                    colors={colors}
                    variables={variables}
                />
            </SettingRow>

            {isSensorAvailable && (
                <SettingRow
                    icon="finger-print-outline"
                    title="Fingerprint Unlock"
                    desc="Enable fingerprint authentication"
                    onPress={() => {
                        toggleFingerprint();
                        addMessage(`Fingerprint unlock ${!isFingerprintEnabled ? 'enabled' : 'disabled'}.`);
                    }}
                >
                    <Switch
                        value={!!isFingerprintEnabled}
                        onValueChange={() => {
                            toggleFingerprint();
                            addMessage(`Fingerprint unlock ${!isFingerprintEnabled ? 'enabled' : 'disabled'}.`);
                        }}

                    />
                </SettingRow>
            )}

            <SettingRow
                icon={isPasswordLockEnabled ? 'lock-closed-outline' : 'lock-open-outline'}
                title="Password Lock"
                desc="Enable password authentication"
                onPress={() => {
                    if (!isPasswordLockEnabled) {
                        setMode('set');
                        setPasswordPromptVisible(true);
                    } else {
                        clearPassword();
                        addMessage('Password lock disabled.');
                    }
                }}
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
                />
            </SettingRow>

            <SettingRow
                icon="apps-outline"
                title="Extra"
                desc="Extra security options"
                onPress={() => setShowExtra(true)}
            >
                <Icons.Ion
                    name={"arrow-forward-outline"}
                    size={18}
                    color={colors.highlight}
                    style={{ transform: [{ scale: 1.15 }], marginRight: 22 }}
                />
            </SettingRow>

            <BottomSheet visible={showExtra} setVisible={setShowExtra} title="Extra Security Options" num={2}>
                <SettingRow
                    icon="key-outline"
                    title={isPasswordLockEnabled ? 'Change Password' : 'Set Password'}
                    desc={
                        isPasswordLockEnabled
                            ? 'Change your current password'
                            : 'Set a password for extra security'
                    }
                    onPress={() => {
                        setMode(isPasswordLockEnabled ? 'change' : 'set');
                        setPasswordPromptVisible(true);
                    }}
                    disabled={!isPasswordLockEnabled || loading}
                    pillText={`${isPasswordLockEnabled ? '' : 'Enable Password'}`}
                    pillMargin={[12, -4, 0, 0]}
                    isExtra
                />

                <SettingRow
                    icon="timer-outline"
                    title="Lockout"
                    desc="Set duration for reauthentication"
                    disabled={!shouldUseLockout()}
                    pillText={`${isFingerprintEnabled || isPasswordLockEnabled ? 'Experimental' : 'Enable Lock'}`}
                    pillMargin={[8, 6, 0, 0]}
                    isExtra
                >
                    <PickerSheet
                        value={lockoutMode}
                        options={lockoutOptions}
                        onChange={setLockoutModeValue}
                        title="Lockout"
                        placeholder="Select lockout"
                        colors={colors}
                        variables={variables}
                        pillsPerRow={3}
                        disabled={!shouldUseLockout()}
                    />
                </SettingRow>
            </BottomSheet>


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
    const [populateDisabled, setPopulateDisabled] = useState(!__DEV__);
    const [showExtra, setShowExtra] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmText, setConfirmText] = useState('');
    const { useEncryption, setUseEncryption } = useSecurity();
    const addMessage = useCallback(
        (text, type = 'info') => showToast(type, capitalize(type), text),
        []
    );
    const {
        accentMode,
        themeMode,
        borderMode,
        progressMode,
        backgroundPattern,
        headerMode,
        navigationMode,
        layoutMode,
        defaultUnit,
        fixedBorder,
        privacyMode,
        setAccentMode,
        setThemeMode,
        setBorderMode,
        setProgressMode,
        setBackgroundPattern,
        setHeaderMode,
        setNavigationMode,
        setLayoutMode,
        setDefaultUnit,
        setFixedBorder,
        setPrivacyModeValue,
        variables
    } = useTheme();
    const { shouldHide, setShouldHide } = useNavBar();


    const format = useFormatDirectoryPath();

    /* Directory load & export helpers */
    useEffect(() => {
        (async () => {
            const uri = await AsyncStorage.getItem(DIRECTORY_KEY);
            setDirectoryUri(uri);
        })();
    }, []);

    // In your TimerManagementCard component, replace the existing populateTimers function:

    const populateTimers = useCallback(async () => {
        if (populateDisabled) return;

        try {
            setPopulateDisabled(true);
            addMessage('Adding sample timers...', 'info');

            // Create a TimerManager instance
            const timerManager = new TimerManager();

            // Initialize it with existing timers from your context
            timerManager.timers = timers.map(timer => new Timer(timer));

            // Use the populate function (make sure import path is correct)
            const createdTimers = await populate(timerManager, {
                countdownCount: 3,
                countupCount: 3
            });

            // Update your context with all timers (existing + new ones)
            setTimersAndSave(timerManager.getAllTimers());

            addMessage(`Added ${createdTimers.length} sample timers successfully!`, 'success');

        } catch (error) {
            console.error('Failed to populate timers:', error);
            addMessage('Failed to add sample timers', 'error');
        } finally {
            setTimeout(() => setPopulateDisabled(false), 2000);
        }
    }, [populateDisabled, timers, setTimersAndSave, addMessage]);

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

    /* ---------- EXPORT ---------- */
    const handleExport = useCallback(async () => {
        try {
            let uri = directoryUri;
            if (!uri) {
                const perm = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (!perm.granted) return addMessage('Export cancelled ‑ no folder', 'error');
                uri = perm.directoryUri;
                await AsyncStorage.setItem(DIRECTORY_KEY, uri);
                setDirectoryUri(uri);
                addMessage(`Export folder: ${format(uri)}`);
            }

            const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-'); // dd-mm-yy

            // timers
            const timersPayload = { version: '1.0', exportDate: new Date().toISOString(), timers };
            const timersExt = useEncryption ? 'enc' : 'json';
            const timersMime = useEncryption ? 'application/octet-stream' : 'application/json';
            const timersName = `t-${today}.${timersExt}`;
            const timersContent = useEncryption
                ? await encryptData(timersPayload)
                : JSON.stringify(timersPayload, null, 2);
            const timersUri = await FileSystem.StorageAccessFramework.createFileAsync(
                uri,
                timersName,
                timersMime
            );
            await FileSystem.writeAsStringAsync(timersUri, timersContent, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            // preferences
            const prefsPayload = {
                version: '1.0',
                type: 'preferences',
                exportDate: new Date().toISOString(),
                preferences: {
                    theme: { accentMode, themeMode, borderMode, progressMode, backgroundPattern, privacyMode },
                    layout: { headerMode, navigationMode, layoutMode, defaultUnit, fixedBorder, shouldHide },
                    security: { useEncryption }
                },
            };
            const prefsName = `p-${today}.json`;
            const prefsUri = await FileSystem.StorageAccessFramework.createFileAsync(
                uri,
                prefsName,
                'application/json'
            );
            await FileSystem.writeAsStringAsync(
                prefsUri,
                JSON.stringify(prefsPayload, null, 2),
                { encoding: FileSystem.EncodingType.UTF8 }
            );

            addMessage(`Exported t-${today}.${timersExt} & p-${today}.json`, 'success');
        } catch (e) {
            console.error(e);
            addMessage(`Export failed: ${e.message || 'Unknown'}`, 'error');
        }
    }, [
        directoryUri, timers, useEncryption, format,
        accentMode, themeMode, borderMode, progressMode, backgroundPattern, privacyMode,
        headerMode, navigationMode, layoutMode, defaultUnit, fixedBorder, shouldHide,
    ]);

    /* ---------- IMPORT ---------- */
    const handleImport = useCallback(async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
                multiple: true,
            });
            if (res.canceled || !res.assets?.length) return addMessage('No files picked', 'info');

            let okTimers = false;
            let okPrefs = false;

            for (const file of res.assets) {
                try {
                    const raw = await FileSystem.readAsStringAsync(file.uri, {
                        encoding: FileSystem.EncodingType.UTF8,
                    });

                    let parsed;
                    let isEncrypted = false;

                    try {
                        const maybeEncrypted = JSON.parse(raw);

                        // Check if this matches your encrypted structure
                        if (maybeEncrypted?.iv && maybeEncrypted?.data) {
                            parsed = await decryptData(raw);
                            isEncrypted = true;
                        } else {
                            parsed = maybeEncrypted;
                        }
                    } catch {
                        addMessage(`Invalid JSON or encrypted format in ${file.name}`, 'error');
                        continue;
                    }

                    // Handle preferences
                    if (parsed?.type === 'preferences' && parsed.preferences) {
                        const { theme, layout, security } = parsed.preferences;
                        theme && Object.entries(theme).forEach(([k, v]) => v !== undefined && setters[k]?.(v));
                        layout && Object.entries(layout).forEach(([k, v]) => v !== undefined && setters[k]?.(v));
                        security && Object.entries(security).forEach(([k, v]) => v !== undefined && setters[k]?.(v));
                        addMessage(`Prefs loaded from ${file.name}`, 'success');
                        okPrefs = true;
                        continue;
                    }

                    // Handle timers
                    const list = Array.isArray(parsed.timers)
                        ? parsed.timers
                        : Array.isArray(parsed)
                            ? parsed
                            : null;

                    if (list) {
                        setTimersAndSave(list.map((o) => new Timer(o)));
                        addMessage(`Timers loaded from ${file.name}${isEncrypted ? ' (decrypted)' : ''}`, 'success');
                        okTimers = true;
                        continue;
                    }

                    addMessage(`Unknown or invalid structure in ${file.name}`, 'error');
                } catch (err) {
                    addMessage(`Error reading ${file.name}: ${err.message}`, 'error');
                }
            }

            if (!okTimers && !okPrefs) addMessage('Nothing imported', 'error');
        } catch (e) {
            addMessage(`Import failed: ${e.message || 'Unknown'}`, 'error');
        }
    }, [
        setAccentMode, setThemeMode, setBorderMode, setProgressMode,
        setBackgroundPattern, setPrivacyModeValue,
        setHeaderMode, setNavigationMode, setLayoutMode,
        setDefaultUnit, setFixedBorder, setShouldHide, setTimersAndSave, addMessage, setUseEncryption
    ]);

    /* helper map for dynamic setting in import */
    const setters = {
        accentMode: setAccentMode,
        themeMode: setThemeMode,
        borderMode: setBorderMode,
        progressMode: setProgressMode,
        backgroundPattern: setBackgroundPattern,
        privacyMode: setPrivacyModeValue,
        headerMode: setHeaderMode,
        navigationMode: setNavigationMode,
        layoutMode: setLayoutMode,
        defaultUnit: setDefaultUnit,
        fixedBorder: setFixedBorder,
        shouldHide: setShouldHide,
        useEncryption: setUseEncryption,
    };

    const showConfirm = useCallback((text, action) => {
        setConfirmText(text);
        setConfirmAction(() => action);
        setConfirmVisible(true);
    }, []);

    const clearTimers = useCallback(async () => {
        showConfirm('Are you sure you want to clear all timers?', async () => {
            await clearAllTimers();
            addMessage('All timers have been cleared.', 'success');
        });
    }, [showConfirm, clearAllTimers, addMessage]);

    return (
        <AnimatedCard animatedStyle={animatedStyle}>

            <SettingRow icon="trash" title="Clear All Timers" desc="Remove all timers from your device" onPress={clearTimers} pillText={"Destructive"} pillPosition={"top-right"} destructive pillMargin={[18, -4, 0, 0]} />

            <SettingRow
                icon="swap-horizontal-outline"
                title="Export Data"
                desc="Export timers and preferences"
                onPress={handleExport}
            />

            <SettingRow
                icon="swap-vertical-outline"
                title="Import Data"
                desc="Import timers and preferences"
                onPress={handleImport}
            />

            <SettingRow
                icon="code-working-outline"
                title="Extra"
                desc="Extra timer options"
                onPress={() => setShowExtra(true)}
            >
                <Icons.Ion
                    name={"arrow-forward-outline"}
                    size={18}
                    color={colors.highlight}
                    style={{ transform: [{ scale: 1.15 }], marginRight: 22 }}
                />
            </SettingRow>

            <BottomSheet visible={showExtra} setVisible={setShowExtra} title="Extra Timer Options" num={3}>

                <SettingRow
                    icon={useEncryption ? 'shield-checkmark-outline' : 'shield-outline'}
                    title="Backup Encryption"
                    desc="Encrypt backup files for security"
                    onPress={() => {
                        setUseEncryption(!useEncryption);
                        if (!useEncryption) {
                            addMessage('Backup encryption enabled - backups will be encrypted', 'success');
                        } else {
                            addMessage('Backup encryption disabled - backups will be plain text', 'info');
                        }
                    }}
                    isExtra
                    pillText={"Recommended"}
                    pillMargin={[10, 6, 0, 0]}
                >
                    <Switch
                        value={!!useEncryption}
                        onValueChange={(v) => {
                            setUseEncryption(v);
                            if (v) {
                                addMessage('Backup encryption enabled - backups will be encrypted', 'success');
                            } else {
                                addMessage('Backup encryption disabled - backups will be plain text', 'info');
                            }
                        }}
                    />
                </SettingRow>

                <SettingRow
                    icon="file-tray-outline"
                    title="Change Export Folder"
                    desc={directoryUri ? `Current: ${format(directoryUri)}` : 'No folder selected'}
                    onPress={changeDir}
                    isExtra
                />

                <SettingRow
                    icon="refresh"
                    title="Populate Timers"
                    desc="Add sample timers for quick testing"
                    onPress={populateTimers}
                    disabled={true}
                    pillText={"Dev feature"}
                    pillMargin={[18, 6, 0, 0]}
                    isExtra
                />

            </BottomSheet>

            <ConfirmSheet
                visible={confirmVisible}
                onClose={() => setConfirmVisible(false)}
                onConfirm={confirmAction}
                title="Delete Timers"
                message="Are you sure you want to delete all timers? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                confirmColor="#ef4444"
                icon="trash-outline"
                colors={colors}
                variables={variables}
            />
        </AnimatedCard>
    );
});

/* ------------------------------------------------------------------ */
/*  Card 5 – App Updates                                              */
/* ------------------------------------------------------------------ */
const AppUpdatesCard = memo(({ animatedStyle }) => {
    const [showChangelog, setShowChangelog] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const { colors, variables } = useTheme();
    const [linkIndex, setLinkIndex] = useState(0);
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
                onPress={handleSuggestion}
            />
            <SettingRow
                icon="share-social-outline"
                title="Share App Links"
                desc="Share QR codes for repository, etc."
                onPress={() => setShowQR(true)}
            >
                <PickerSheet
                    value={linkOptions[linkIndex].value}
                    options={linkOptions}
                    onChange={(value) => {
                        const newIndex = linkOptions.findIndex((opt) => opt.value === value);
                        if (newIndex !== -1) {
                            setLinkIndex(newIndex);
                        }
                    }}
                    title="Links"
                    placeholder="Select Link to share"
                    colors={colors}
                    variables={variables}
                />
            </SettingRow>

            <QRShareSheet
                visible={showQR}
                onClose={() => setShowQR(false)}
                link={linkOptions[linkIndex].url}
                label={linkOptions[linkIndex].label}
                addMessage={addMessage}
            />

            <ChangeLogSheet visible={showChangelog} onClose={() => setShowChangelog(false)} forced />

        </AnimatedCard>
    );
});

/* ------------------------------------------------------------------ */
/*  Main Settings Screen                                              */
/* ------------------------------------------------------------------ */
export default memo(function Settings() {
    const { loading: themeLoading } = useTheme();
    const {
        loading: securityLoading,
        isPasswordLockEnabled,
        isFingerprintEnabled,
        privacyMode,
        lockoutMode,
        useEncryption
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
        navigationMode === undefined ||
        useEncryption === undefined
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

                    <SectionHeader>Data & Preferences</SectionHeader>
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