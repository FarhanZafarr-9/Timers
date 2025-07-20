import { View, Text, StyleSheet, TouchableOpacity, Animated, Linking } from 'react-native';
import { Icons } from '../assets/icons';
import { useTimers } from '../utils/TimerContext';
import { useSecurity } from '../utils/SecurityContext';
import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import PasswordPrompt from '../components/PasswordPrompt';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Timer from '../classes/Timer';
import HeaderScreen from '../components/HeaderScreen';
import { useTheme } from '../utils/ThemeContext';
import PickerSheet from '../components/PickerSheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themeOptions, accentOptions, layoutOptions, navOptions, headerOptions, privacyOptions, lockoutOptions, borderOptions, progressOptions, useRenderLogger, unitOptions, backgroundOptions } from '../utils/functions';
import ConfirmSheet from '../components/ConfirmSheet';
import Switch from '../components/Switch';
import ChnageLogSheet from '../components/ChnageLogSheet';
import { checkForUpdateAndReload } from '../utils/functions';
import Toast from 'react-native-toast-message';
import { useNavBar } from '../utils/NavContext';

function Settings() {
    useRenderLogger('Settings')
    const { initializeTimers, clearAllTimers, timers, setTimersAndSave } = useTimers();

    const {
        accentMode,
        setAccentMode,
        colors,
        variables,
        themeMode,
        setThemeMode,
        navigationMode,
        setNavigationMode,
        headerMode,
        setHeaderMode,
        borderMode,
        setBorderMode,
        border,
        layoutMode,
        setLayoutMode,
        progressMode,
        setProgressMode,
        defaultUnit,
        setDefaultUnit,
        fixedBorder,
        setFixedBorder,
        backgroundPattern,
        setBackgroundPattern,
    } = useTheme();

    const {
        isFingerprintEnabled,
        toggleFingerprint,
        isSensorAvailable,
        isPasswordLockEnabled,
        togglePasswordLock,
        savePassword,
        clearPassword,
        password,
        loading,
        PasswordPromptVisible,
        setPasswordPromptVisible,
        privacyMode,
        setPrivacyModeValue,
        lockoutMode,
        setLockoutModeValue,
        shouldUseLockout
    } = useSecurity();

    const { shouldHide, setShouldHide } = useNavBar();

    if (loading || isPasswordLockEnabled === undefined || isFingerprintEnabled === undefined || privacyMode === undefined || lockoutMode === undefined || navigationMode === undefined) {
        return null;
    }

    const [populateDisabled, setPopulateDisabled] = useState(false);
    const [PasswordPromptMode, setPasswordPromptMode] = useState('set');
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState(() => () => { });
    const [confirmText, setConfirmText] = useState('');
    const [showExtra, setShowExtra] = useState(0);
    const DIRECTORY_KEY = 'download_directory_uri';
    const [mounted, setMounted] = useState(false);
    const [directoryUri, setDirectoryUri] = useState(null);
    const [showChangelog, setShowChangelog] = useState(false);

    const showToast = (type, text1, text2 = '') => {
        Toast.show({
            type,
            text1,
            text2,
        });
    };

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const addMessage = useCallback((text, type = 'info') => {
        showToast(type, capitalize(type), text);
    }, []);

    const handleReportBug = useCallback(() => {
        const email = 'farhanzafarr.9@gmail.com';
        const subject = 'Bug Report - ChronoX App';
        const body = 'Please describe the bug you encountered:';
        Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }, []);

    const handleSuggestion = useCallback(() => {
        const email = 'farhanzafarr.9@gmail.com';
        const subject = 'Suggestion - ChronoX App';
        const body = 'Please describe the suggestion you came upon:';
        Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }, []);

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

    // Update the useEffect animation code:
    useEffect(() => {
        const value = setTimeout(() => {
            setMounted(true);

            Animated.stagger(120, [
                // Card 1 Animation (Appearance)
                Animated.parallel([
                    Animated.spring(card1Translate, {
                        toValue: 0,
                        tension: 80,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(card1Opacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
                // Card 2 Animation (Layout Management)
                Animated.parallel([
                    Animated.spring(card2Translate, {
                        toValue: 0,
                        tension: 80,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(card2Opacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
                // Card 3 Animation (Security)
                Animated.parallel([
                    Animated.spring(card3Translate, {
                        toValue: 0,
                        tension: 80,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(card3Opacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
                // Card 4 Animation (Timer Management)
                Animated.parallel([
                    Animated.spring(card4Translate, {
                        toValue: 0,
                        tension: 80,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(card4Opacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
                // Card 5 Animation (App Updates)
                Animated.parallel([
                    Animated.spring(card5Translate, {
                        toValue: 0,
                        tension: 80,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(card5Opacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        }, 50);

        return () => clearTimeout(value);
    }, []);

    useEffect(() => {
        const loadDirectory = async () => {
            const uri = await AsyncStorage.getItem(DIRECTORY_KEY);
            setDirectoryUri(uri);
        };
        loadDirectory();
    }, []);

    const styles = useMemo(() => StyleSheet.create({
        card: {
            backgroundColor: 'transparent',
            marginBottom: 15,
            borderRadius: variables.radius.lg,
            overflow: 'hidden',
            borderWidth: border,
            borderColor: colors.cardBorder,
        },
        settingBlock: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 18,
            paddingBottom: 14,
            paddingHorizontal: 20,
            backgroundColor: colors.settingBlock + 'f5',
            borderBottomWidth: border,
            borderBottomColor: colors.border
        },
        settingTextBlock: {
            flex: 1,
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
        sectionHeader: {
            paddingVertical: 10,
            paddingHorizontal: 15,
        },
        sectionHeaderText: {
            fontSize: 13,
            fontWeight: 'bold',
            color: colors.highlight,
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        pathDisplay: {
            fontSize: 12,
            marginLeft: 12,
        },
    }), [colors, variables, border]);

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

    const populateTimers = useCallback(async () => {
        if (populateDisabled) return;
        setPopulateDisabled(true);
        await initializeTimers();
        addMessage('Sample timers have been added.', 'success');
        setTimeout(() => setPopulateDisabled(false), 2000);
    }, [populateDisabled, initializeTimers, addMessage]);

    const exportToJson = async () => {
        try {
            if (!directoryUri) {
                // If no directory is selected, prompt to choose one first
                addMessage('Please select an export folder first');
                const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (!permission.granted) {
                    addMessage('Export cancelled - no folder selected', 'error');
                    return;
                }
                const uri = permission.directoryUri;
                await AsyncStorage.setItem(DIRECTORY_KEY, uri);
                setDirectoryUri(uri);
                addMessage(`Export folder set to: ${formatDirectoryPath(uri)}`);
            }

            const json = JSON.stringify(timers, null, 2);
            const now = new Date();
            const fileName = `timers-export-${now.toISOString().split('T')[0]}.json`;

            const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                directoryUri,
                fileName,
                'application/json'
            );

            await FileSystem.writeAsStringAsync(fileUri, json, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            addMessage(`Exported to: ${formatDirectoryPath(directoryUri)}`, 'success');
        } catch (err) {
            console.log('[EXPORT ERROR]', err);
            addMessage('Export failed: ' + (err.message || ''), 'error');
        }
    };

    const loadFromJson = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                const content = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.UTF8 });
                const loadedTimers = JSON.parse(content);

                if (Array.isArray(loadedTimers)) {
                    const timers = loadedTimers.map(obj => new Timer(obj));
                    setTimersAndSave(timers);
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
    };

    const formatDirectoryPath = useCallback((uri) => {
        if (!uri) return '';

        try {
            let path = decodeURIComponent(uri);

            // Remove common prefixes like 'primary:' or 'tree/primary:'
            path = path.replace(/^.*?(primary:|tree\/primary:)/i, '');

            // Replace any remaining URL-encoded spaces
            path = path.replace(/%20/g, ' ');

            // Split into parts by /
            let parts = path.split('/').filter(Boolean);

            // If too long, show last 2-3 with '...'
            if (parts.length > 3) {
                parts = ['...', ...parts.slice(-3)];
            }

            // Join with ' > '
            return parts.join(' > ');
        } catch (e) {
            console.warn('Error formatting path:', e);
            return uri;
        }
    }, []);

    const PathDisplay = useCallback(({ path, style }) => {
        if (!path) return null;
        const formatted = formatDirectoryPath(path);
        return <Text style={style}>{formatted}</Text>;
    }, [formatDirectoryPath]);

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
            {mounted && <>

                {/* APPEARANCE SETTINGS */}
                <TouchableOpacity style={styles.sectionHeader} onPress={() => { }} activeOpacity={1}>
                    <Text style={styles.sectionHeaderText}>Appearance</Text>
                </TouchableOpacity>

                <Animated.View style={{
                    transform: [{ translateX: card1Translate }],
                    opacity: card1Opacity
                }}>
                    <View style={styles.card} >
                        {/* Theme Mode Picker */}
                        <TouchableOpacity style={styles.settingBlock} activeOpacity={1}>
                            <Icons.Ion name='color-palette-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Theme</Text>
                                <Text style={styles.settingDesc}>Choose app theme</Text>
                            </View>
                            <PickerSheet
                                value={themeMode}
                                options={themeOptions}
                                onChange={setThemeMode}
                                title={'Theme'}
                                placeholder="Select theme"
                                colors={colors}
                                variables={variables}
                            />
                        </TouchableOpacity>

                        {/* Accent Mode Picker */}
                        <TouchableOpacity style={styles.settingBlock} activeOpacity={1}>
                            <Icons.Ion name='brush-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Accent</Text>
                                <Text style={styles.settingDesc}>Choose app accent</Text>
                            </View>
                            <PickerSheet
                                value={accentMode}
                                options={accentOptions}
                                onChange={setAccentMode}
                                title={'Accent'}
                                placeholder="Select accent"
                                colors={colors}
                                variables={variables}
                                defaultValue={'default'}
                                pillsPerRow={3}
                            />
                        </TouchableOpacity>

                        {/* Theme Mode Picker */}
                        <TouchableOpacity style={styles.settingBlock} activeOpacity={1}>
                            <Icons.Ion name='analytics-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Progress</Text>
                                <Text style={styles.settingDesc}>Choose progress mode</Text>
                            </View>
                            <PickerSheet
                                value={progressMode}
                                options={progressOptions}
                                onChange={setProgressMode}
                                title={'Progress'}
                                placeholder="Select progress"
                                colors={colors}
                                variables={variables}
                                defaultValue={'linear'}
                                note={'Wavy motion completely stabled and working fluidly, enjoy ✨'}
                            />
                        </TouchableOpacity>

                        {/* Border Mode Picker */}
                        <TouchableOpacity style={styles.settingBlock} activeOpacity={1}>
                            <Icons.Ion name='color-palette-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Border</Text>
                                <Text style={styles.settingDesc}>Choose border mode</Text>
                            </View>
                            <PickerSheet
                                value={borderMode}
                                options={borderOptions}
                                onChange={setBorderMode}
                                title={'Border'}
                                placeholder="Select Border mode"
                                colors={colors}
                                variables={variables}
                                defaultValue="subtle"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.settingBlock, { borderBottomWidth: 0 }]} activeOpacity={1}>
                            <Icons.Ion name='color-fill-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Background</Text>
                                <Text style={styles.settingDesc}>Select background pattern </Text>
                            </View>
                            <PickerSheet
                                value={backgroundPattern}
                                options={backgroundOptions}
                                onChange={setBackgroundPattern}
                                title={'Background'}
                                placeholder="Select background pattern"
                                colors={colors}
                                variables={variables}
                                defaultValue="none"
                                note="Still under development, so use carefully."
                            />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* LAYOUT MANAGEMENT SETTINGS */}
                <TouchableOpacity style={styles.sectionHeader} onPress={() => { }} activeOpacity={1}>
                    <Text style={styles.sectionHeaderText}>Layout Management</Text>
                </TouchableOpacity>

                <Animated.View style={{
                    transform: [{ translateX: card2Translate }],
                    opacity: card2Opacity
                }}>
                    <View style={styles.card}>

                        {/* Header Mode Picker */}
                        <TouchableOpacity style={styles.settingBlock} activeOpacity={1}>
                            <Icons.Ion name='ellipsis-horizontal' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Header</Text>
                                <Text style={styles.settingDesc}>Choose header mode</Text>
                            </View>
                            <PickerSheet
                                value={headerMode}
                                options={headerOptions}
                                onChange={setHeaderMode}
                                title={'Header'}
                                placeholder="Select header mode"
                                colors={colors}
                                variables={variables}
                                defaultValue="minimized"
                            />
                        </TouchableOpacity>

                        {/* Layout Mode Picker (Grid/List) */}
                        <TouchableOpacity style={styles.settingBlock} activeOpacity={1}>
                            <Icons.Ion name='grid-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Layout</Text>
                                <Text style={styles.settingDesc}>Select layout mode</Text>
                            </View>
                            <PickerSheet
                                value={layoutMode}
                                options={layoutOptions}
                                onChange={setLayoutMode}
                                title={'Layout'}
                                placeholder="Layout"
                                colors={colors}
                                variables={variables}
                                defaultValue="list"
                                note={"Grid layout minimizes privacy text for easier view"}
                            />
                        </TouchableOpacity>

                        {layoutMode === 'grid' && (
                            <TouchableOpacity
                                style={styles.settingBlock}
                                onPress={() => {
                                    const newUnit = defaultUnit !== 'seconds' ? 'seconds' : 'auto';
                                    addMessage(`Default unit set to ${newUnit}.`, 'info');
                                    setDefaultUnit(newUnit);
                                }}
                            >
                                <Icons.Ion name='speedometer-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                                <View style={styles.settingTextBlock}>
                                    <Text style={styles.settingTitle}>Default Unit</Text>
                                    <Text style={styles.settingDesc}>Set the default unit as seconds</Text>
                                </View>
                                <PickerSheet
                                    value={defaultUnit}
                                    options={unitOptions}
                                    onChange={setDefaultUnit}
                                    title={'Unit'}
                                    placeholder="Unit"
                                    colors={colors}
                                    variables={variables}
                                    defaultValue="auto"
                                    note={"This default unit is only considered in grid mode"}
                                />
                            </TouchableOpacity>
                        )}

                        {/* Navigation Mode Picker */}
                        <TouchableOpacity style={styles.settingBlock} activeOpacity={1}>
                            <Icons.Ion name='navigate-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Navigation</Text>
                                <Text style={styles.settingDesc}>Select navigation mode</Text>
                            </View>
                            <PickerSheet
                                value={navigationMode}
                                options={navOptions}
                                onChange={setNavigationMode}
                                title={'Navigation'}
                                placeholder="Select navigation mode"
                                colors={colors}
                                variables={variables}
                                defaultValue="floating"
                            />
                        </TouchableOpacity>

                        {navigationMode === 'fixed' || headerMode === 'fixed' ? (
                            <>
                                <TouchableOpacity
                                    style={styles.settingBlock}
                                    onPress={() => {
                                        addMessage(`Fixed Rounded borders ${fixedBorder ? 'disabled' : 'enabled'}.`, 'info');
                                        setFixedBorder(!fixedBorder);
                                    }}
                                >
                                    <Icons.Ion name='crop-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                                    <View style={styles.settingTextBlock}>
                                        <Text style={styles.settingTitle}>Border radius</Text>
                                        <Text style={styles.settingDesc}>Rounded coners in fixed modes</Text>
                                    </View>
                                    <Switch
                                        value={!!fixedBorder}
                                        onValueChange={() => {
                                            addMessage(`Fixed Rounded borders ${fixedBorder ? 'disabled' : 'enabled'}.`, 'info');
                                            setFixedBorder(!fixedBorder);
                                        }}
                                        trackColor={{
                                            false: colors.switchTrack,
                                            true: colors.switchTrackActive,
                                        }}
                                        thumbColor={!fixedBorder ? colors.switchThumbActive : colors.switchThumb}
                                        style={{ transform: [{ scaleY: 1 }] }}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.settingBlock}
                                    onPress={() => {
                                        addMessage(`Auto hide fixed modes ${shouldHide ? 'disabled' : 'enabled'}.`, 'info');
                                        setShouldHide(!shouldHide);
                                    }}
                                >
                                    <Icons.Ion name='expand-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                                    <View style={styles.settingTextBlock}>
                                        <Text style={styles.settingTitle}>Immerse</Text>
                                        <Text style={styles.settingDesc}>Hide fixed modes after some time</Text>
                                    </View>
                                    <Switch
                                        value={!!shouldHide}
                                        onValueChange={() => {
                                            addMessage(`Auto hide fixed modes ${shouldHide ? 'disabled' : 'enabled'}.`, 'info');
                                            setShouldHide(!shouldHide);
                                        }}
                                        trackColor={{
                                            false: colors.switchTrack,
                                            true: colors.switchTrackActive,
                                        }}
                                        thumbColor={!shouldHide ? colors.switchThumbActive : colors.switchThumb}
                                        style={{ transform: [{ scaleY: 1 }] }}
                                    />
                                </TouchableOpacity>
                            </>
                        ) : null}


                    </View>

                </Animated.View>

                <TouchableOpacity style={styles.sectionHeader} onPress={() => { }} activeOpacity={1}>
                    <Text style={styles.sectionHeaderText}>Security & Privacy</Text>
                </TouchableOpacity>

                {/* SECURITY SETTINGS */}
                <Animated.View style={{
                    transform: [{ translateX: card3Translate }],
                    opacity: card3Opacity
                }}>
                    <View style={styles.card}>
                        {/* Privacy Mode Picker */}
                        <TouchableOpacity style={[styles.settingBlock]} activeOpacity={1} >
                            <Icons.Ion name="eye-off-outline" size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Privacy Mode</Text>
                                <Text style={styles.settingDesc}>Masks timer names and titles</Text>
                            </View>
                            <PickerSheet
                                value={privacyMode}
                                options={privacyOptions}
                                onChange={setPrivacyModeValue}
                                title={'Privacy'}
                                placeholder="Select mode"
                                colors={colors}
                                variables={variables}
                                note={'Emoji mode has been re enabled, enjoy ✨'}
                            />
                        </TouchableOpacity>

                        {/* Fingerprint Unlock */}
                        {isSensorAvailable ? (
                            <TouchableOpacity
                                style={styles.settingBlock}
                                onPress={() => {
                                    addMessage(`Fingerprint unlock ${isFingerprintEnabled ? 'disabled' : 'enabled'}.`, 'info');
                                    toggleFingerprint();
                                }}
                            >
                                <Icons.Ion name='finger-print-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                                <View style={styles.settingTextBlock}>
                                    <Text style={styles.settingTitle}>Fingerprint Unlock</Text>
                                    <Text style={styles.settingDesc}>Enable fingerprint authentication</Text>
                                </View>
                                <Switch
                                    value={!!isFingerprintEnabled}
                                    onValueChange={() => {
                                        addMessage(`Fingerprint unlock ${isFingerprintEnabled ? 'disabled' : 'enabled'}.`, 'info');
                                        toggleFingerprint();
                                    }}
                                    trackColor={{
                                        false: colors.switchTrack,
                                        true: colors.switchTrackActive,
                                    }}
                                    thumbColor={!isFingerprintEnabled ? colors.switchThumbActive : colors.switchThumb}
                                    style={{ transform: [{ scaleY: 1 }] }}
                                />
                            </TouchableOpacity>
                        ) : null}

                        {/* Password Lock */}
                        <TouchableOpacity
                            style={[
                                styles.settingBlock,
                                isPasswordLockEnabled ? {} : { borderBottomWidth: 0 }
                            ]}

                            onPress={() => {
                                if (loading) return;
                                if (!isPasswordLockEnabled) {
                                    setPasswordPromptMode('set');
                                    setPasswordPromptVisible(true);
                                } else {
                                    togglePasswordLock();
                                }
                            }}
                        >
                            <Icons.Ion name={isPasswordLockEnabled ? 'lock-closed-outline' : 'lock-open-outline'} size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Password Lock</Text>
                                <Text style={styles.settingDesc}>Enable password authentication</Text>
                                <TouchableOpacity onPress={() => {
                                    setPasswordPromptMode(isPasswordLockEnabled ? 'change' : 'set');
                                    setPasswordPromptVisible(true);
                                }}>

                                </TouchableOpacity>
                            </View>
                            <Switch
                                value={!!isPasswordLockEnabled}
                                onValueChange={(val) => {
                                    if (loading) return;
                                    if (val) {
                                        setPasswordPromptMode('set');
                                        setPasswordPromptVisible(true);
                                    } else {
                                        clearPassword();
                                        addMessage('Password lock disabled.', 'info');
                                    }
                                }}
                                trackColor={{
                                    false: colors.switchTrack,
                                    true: colors.switchTrackActive,
                                }}
                                thumbColor={!isPasswordLockEnabled ? colors.switchThumbActive : colors.switchThumb}
                                style={{ transform: [{ scale: 1 }] }}
                            />
                        </TouchableOpacity>
                        {isPasswordLockEnabled && <TouchableOpacity
                            style={styles.settingBlock}
                            onPress={() => {
                                setPasswordPromptMode(isPasswordLockEnabled ? 'change' : 'set');
                                setPasswordPromptVisible(true);
                            }}
                        >
                            <Icons.Ion name="key-outline" size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>
                                    {isPasswordLockEnabled ? 'Change Password' : 'Set Password'}
                                </Text>
                                <Text style={styles.settingDesc}>
                                    {isPasswordLockEnabled
                                        ? 'Change your current password'
                                        : 'Set a password for extra security'}
                                </Text>
                            </View>
                        </TouchableOpacity>}

                        {/* Lockout Option Picker */}
                        {shouldUseLockout() && <TouchableOpacity style={[styles.settingBlock, { borderBottomWidth: 0 }]} activeOpacity={1}>
                            <Icons.Ion name="timer-outline" size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Lockout</Text>
                                <Text style={styles.settingDesc}>Set duration for reauthentication</Text>
                            </View>
                            <PickerSheet
                                value={lockoutMode}
                                options={lockoutOptions}
                                onChange={setLockoutModeValue}
                                title={'Lockout'}
                                placeholder="Select lockout"
                                colors={colors}
                                variables={variables}
                                pillsPerRow={3}
                            />
                        </TouchableOpacity>}
                    </View>
                </Animated.View>

                <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowExtra(showExtra === 3 ? 0 : showExtra + 1)} activeOpacity={1}>
                    <Text style={styles.sectionHeaderText}>Timer Management</Text>
                </TouchableOpacity>

                {/* TIMER MANAGEMENT */}
                <Animated.View style={{
                    transform: [{ translateX: card4Translate }],
                    opacity: card4Opacity
                }}>
                    <View style={styles.card}>

                        {/* Populate Timers */}
                        {showExtra === 3 &&
                            <TouchableOpacity
                                style={styles.settingBlock}
                                onPress={populateTimers}
                                disabled={populateDisabled}
                                activeOpacity={populateDisabled ? 1 : 0.7}
                            >
                                <Icons.Ion name='refresh' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                                <View style={styles.settingTextBlock}>
                                    <Text style={styles.settingTitle}>Populate Timers</Text>
                                    <Text style={styles.settingDesc}>Add sample timers for quick testing</Text>
                                </View>
                            </TouchableOpacity>}

                        {/* Clear All Timers */}
                        <TouchableOpacity style={styles.settingBlock} onPress={clearTimers}>
                            <Icons.Ion name='trash' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Clear All Timers</Text>
                                <Text style={styles.settingDesc}>Remove all timers from your device</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Export to JSON */}
                        <TouchableOpacity style={styles.settingBlock} onPress={exportToJson}>
                            <Icons.Ion name='download' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Export Timers</Text>
                                <Text style={styles.settingDesc}>
                                    {directoryUri ? 'Save to :  ' : 'Save all timers as a JSON file'}
                                    {directoryUri && (
                                        <PathDisplay
                                            path={formatDirectoryPath(directoryUri)}
                                            style={[styles.settingDesc, { color: colors.textDesc, marginLeft: 12 }]}
                                            maxLength={20}
                                        />
                                    )}
                                </Text>

                            </View>
                        </TouchableOpacity>

                        {/* Change Export Directory */}
                        <TouchableOpacity
                            style={styles.settingBlock}
                            onPress={async () => {
                                try {
                                    const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                                    if (permission.granted) {
                                        const uri = permission.directoryUri;
                                        await AsyncStorage.setItem(DIRECTORY_KEY, uri);
                                        setDirectoryUri(uri);
                                        addMessage(`Export folder set to: ${formatDirectoryPath(uri)}`, 'info');
                                    }
                                } catch (err) {
                                    addMessage('Failed to change directory', 'error');
                                }
                            }}
                        >
                            <Icons.Ion name='folder-open-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Change Export Folder</Text>
                                <Text style={styles.settingDesc}>
                                    {directoryUri ? 'Current folder :  ' : 'No folder selected'}
                                    {directoryUri && (
                                        <PathDisplay
                                            path={formatDirectoryPath(directoryUri)}
                                            style={[styles.settingDesc, { color: colors.textDesc }]}
                                            maxLength={25}
                                        />
                                    )}
                                </Text>

                            </View>
                        </TouchableOpacity>

                        {/* Load from JSON */}
                        <TouchableOpacity style={[styles.settingBlock, { borderBottomWidth: 0 }]} onPress={loadFromJson}>
                            <Icons.Ion name='cloud-upload-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Import Timers</Text>
                                <Text style={styles.settingDesc}>Load timers from a JSON file</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </Animated.View>


                <TouchableOpacity style={styles.sectionHeader} activeOpacity={1}>
                    <Text style={styles.sectionHeaderText}>App management</Text>
                </TouchableOpacity>

                <Animated.View style={{
                    transform: [{ translateX: card5Translate }],
                    opacity: card5Opacity
                }}>

                    <View style={styles.card}>
                        {/* CHECK FOR UPDATES */}
                        <TouchableOpacity
                            style={styles.settingBlock}
                            onPress={async () => {
                                const status = await checkForUpdateAndReload();
                                if (status === 'up-to-date') {
                                    addMessage('Already on latest version', 'success');
                                }
                            }}
                        >
                            <Icons.Ion name='cloud-download-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Check for Updates</Text>
                                <Text style={styles.settingDesc}>Fetch latest app updates</Text>
                            </View>
                        </TouchableOpacity>

                        {/* SHOW CHANGELOG */}
                        <TouchableOpacity
                            style={styles.settingBlock}
                            onPress={() => setShowChangelog(true)}
                        >
                            <Icons.Ion name="document-text-outline" size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Show Changelog</Text>
                                <Text style={styles.settingDesc}>View recent changes</Text>
                            </View>
                        </TouchableOpacity>

                        {/* REPORT BUG */}
                        <TouchableOpacity style={styles.settingBlock} onPress={handleReportBug}>
                            <Icons.Ion name="bug-outline" size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Report Bug</Text>
                                <Text style={styles.settingDesc}>Found a problem? Let us know</Text>
                            </View>
                        </TouchableOpacity>

                        {/* SEND SUGGESTION */}
                        <TouchableOpacity style={[styles.settingBlock, { borderBottomWidth: 0 }]} onPress={handleSuggestion}>
                            <Icons.Ion name="sparkles-outline" size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Send Suggestion</Text>
                                <Text style={styles.settingDesc}>Share your ideas or improvements</Text>
                            </View>
                        </TouchableOpacity>

                    </View>
                </Animated.View>
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

                {PasswordPromptVisible && (
                    <PasswordPrompt
                        visible={PasswordPromptVisible}
                        onClose={() => setPasswordPromptVisible(false)}
                        onSave={(newPassword) => {
                            savePassword(newPassword);
                            setPasswordPromptVisible(false);
                            addMessage('Password updated.', 'success');
                        }}
                        currentPassword={password}
                        mode={PasswordPromptMode}
                        colors={colors}
                        variables={variables}
                    />
                )}

                <ChnageLogSheet visible={showChangelog} onClose={() => setShowChangelog(false)} forced />
            </>
            }
        </HeaderScreen >
    );
}

export default memo(Settings);
