import { View, Text, StyleSheet, Switch, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Icons } from '../assets/icons';
import { useTimers } from '../utils/TimerContext';
import { useSecurity } from '../utils/SecurityContext';
import { useState, useRef, useEffect, useCallback } from 'react';
import PasswordBottomSheet from '../components/PasswordModal';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Timer from '../classes/Timer';
import ScreenWithHeader from '../components/ScreenWithHeder';
import Snackbar from '../components/SnackBar';
import { useTheme } from '../utils/ThemeContext';
import BottomSheetPicker from '../components/BottomSheetPicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themeOptions, navOptions, headerOptions, privacyOptions, lockoutOptions, borderOptions } from '../utils/functions';
import ConfirmationBottomSheet from '../components/ConfirmationBottomSheet';



export default function SettingsScreen() {
    const { initializeTimers, clearAllTimers, timers, setTimersAndSave } = useTimers();

    const {
        theme,
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
        isBorder
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
        passwordModalVisible,
        setPasswordModalVisible,
        privacyMode,
        setPrivacyModeValue,
        lockoutMode,
        setLockoutModeValue,
        shouldUseLockout
    } = useSecurity();

    if (loading || isPasswordLockEnabled === undefined || isFingerprintEnabled === undefined || privacyMode === undefined || lockoutMode === undefined || navigationMode === undefined) {
        return null;
    }

    const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const [populateDisabled, setPopulateDisabled] = useState(false);
    const [passwordModalMode, setPasswordModalMode] = useState('set');
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState(() => () => { });
    const [confirmText, setConfirmText] = useState('');
    const [showExtra, setShowExtra] = useState(0);
    const DIRECTORY_KEY = 'download_directory_uri';
    const [mounted, setMounted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [directoryUri, setDirectoryUri] = useState(null);

    const addMessage = useCallback((text) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setMessages(prev => [...prev, { id, text }]);
    }, []);

    const removeMessage = useCallback((messageId) => {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }, []);

    const topTranslate = useRef(new Animated.Value(-50)).current;
    const midTranslate = useRef(new Animated.Value(-50)).current;
    const bottomTranslate = useRef(new Animated.Value(-50)).current;

    const topOpacity = useRef(new Animated.Value(0)).current;
    const midOpacity = useRef(new Animated.Value(0)).current;
    const bottomOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const value = setTimeout(() => {
            setMounted(true);

            Animated.stagger(120, [
                Animated.parallel([
                    Animated.spring(topTranslate, {
                        toValue: 0,
                        tension: 80,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(topOpacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.spring(midTranslate, {
                        toValue: 0,
                        tension: 80,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(midOpacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.spring(bottomTranslate, {
                        toValue: 0,
                        tension: 80,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(bottomOpacity, {
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

    const styles = StyleSheet.create({
        card: {
            backgroundColor: 'transparent',
            marginBottom: 15,
            borderRadius: variables.radius.lg,
            overflow: 'hidden',
            borderWidth: isBorder ? 0.75 : 0,
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
            borderBottomWidth: .75,
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
    });

    const showConfirm = (text, action) => {
        setConfirmText(text);
        setConfirmAction(() => action);
        setConfirmVisible(true);
    };

    const clearTimers = async () => {
        showConfirm('Are you sure you want to clear all timers?', async () => {
            await clearAllTimers();
            addMessage('All timers have been cleared.');
        });
    };

    const populateTimers = async () => {
        if (populateDisabled) return;
        setPopulateDisabled(true);
        await initializeTimers();
        addMessage('Sample timers have been added.');
        setTimeout(() => setPopulateDisabled(false), 2000);
    };

    const exportToJson = async () => {
        try {
            if (!directoryUri) {
                // If no directory is selected, prompt to choose one first
                addMessage('Please select an export folder first');
                const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (!permission.granted) {
                    addMessage('Export cancelled - no folder selected');
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

            addMessage(`Exported to: ${formatDirectoryPath(directoryUri)}`);
        } catch (err) {
            console.log('[EXPORT ERROR]', err);
            addMessage('Export failed: ' + (err.message || ''));
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
                    addMessage('Timers loaded from JSON.');
                } else {
                    addMessage('Invalid JSON format.');
                }
            } else {
                addMessage('No file selected.');
            }
        } catch (e) {
            addMessage('Failed to load timers.');
        }
    };

    const formatDirectoryPath = (uri) => {
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
    };

    const PathDisplay = ({ path, style }) => {
        if (!path) return null;
        const formatted = formatDirectoryPath(path);
        return <Text style={style}>{formatted}</Text>;
    };

    return (
        <ScreenWithHeader
            headerIcon={<Icons.Ion name="settings" color={colors.highlight} />}
            headerTitle="Settings"
            borderRadius={variables.radius.lg}
            paddingMargin={10}
            colors={colors}
            contentContainerStyle={{ paddingBottom: 95, overflow: 'visible' }}
            useFlatList={false}
            paddingX={20}
        >
            {mounted && <>
                {messages.map((msg, idx) => (
                    <Snackbar
                        key={msg.id}
                        text={msg.text}
                        onClose={() => removeMessage(msg.id)}
                        style={{ bottom: 300 + (messages.length - 1 - idx) * 48 }}
                    />
                ))}

                {/* APPEARANCE SETTINGS */}
                <TouchableOpacity style={styles.sectionHeader} onPress={() => { }} activeOpacity={1}>
                    <Text style={styles.sectionHeaderText}>Appearance</Text>
                </TouchableOpacity>

                <Animated.View style={{
                    transform: [{ translateX: topTranslate }],
                    opacity: topOpacity  // ADD THIS
                }}>
                    <View style={styles.card} >
                        {/* Theme Mode Picker */}
                        <TouchableOpacity style={styles.settingBlock} activeOpacity={1}>
                            <Icons.Ion name='color-palette-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Theme</Text>
                                <Text style={styles.settingDesc}>Choose app theme</Text>
                            </View>
                            <BottomSheetPicker
                                value={themeMode}
                                options={themeOptions}
                                onChange={setThemeMode}
                                placeholder="Select theme"
                                colors={colors}
                                variables={variables}
                            />
                        </TouchableOpacity>

                        {/* Floating Navigation Switch */}
                        <TouchableOpacity style={styles.settingBlock} activeOpacity={1}>
                            <Icons.Ion name='navigate-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Navigation</Text>
                                <Text style={styles.settingDesc}>Select navigation mode</Text>
                            </View>
                            <BottomSheetPicker
                                value={navigationMode}
                                options={navOptions}
                                onChange={setNavigationMode}
                                placeholder="Select navigation mode"
                                colors={colors}
                                variables={variables}
                                defaultValue="floating"
                            />
                        </TouchableOpacity>

                        {/* Header Mode Switch */}
                        <TouchableOpacity style={styles.settingBlock} activeOpacity={1}>
                            <Icons.Ion name='ellipsis-horizontal' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Header</Text>
                                <Text style={styles.settingDesc}>Choose header mode</Text>
                            </View>
                            <BottomSheetPicker
                                value={headerMode}
                                options={headerOptions}
                                onChange={setHeaderMode}
                                placeholder="Select header mode"
                                colors={colors}
                                variables={variables}
                                defaultValue="minimized"
                            />
                        </TouchableOpacity>

                        {/* Border Mode Picker */}
                        <TouchableOpacity style={[styles.settingBlock, { borderBottomWidth: 0 }]} activeOpacity={1}>
                            <Icons.Ion name='color-palette-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Border</Text>
                                <Text style={styles.settingDesc}>Choose border mode</Text>
                            </View>
                            <BottomSheetPicker
                                value={borderMode}
                                options={borderOptions}
                                onChange={setBorderMode}
                                placeholder="Select Border mode"
                                colors={colors}
                                variables={variables}
                                defaultValue="subtle"
                            />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <TouchableOpacity style={styles.sectionHeader} onPress={() => { }} activeOpacity={1}>
                    <Text style={styles.sectionHeaderText}>Security & Privacy</Text>
                </TouchableOpacity>

                {/* SECURITY SETTINGS */}
                <Animated.View style={{
                    transform: [{ translateX: midTranslate }],
                    opacity: midOpacity
                }}>
                    <View style={styles.card}>
                        {/* Fingerprint Unlock */}
                        {isSensorAvailable ? (
                            <TouchableOpacity
                                style={styles.settingBlock}
                                onPress={() => {
                                    addMessage(`Fingerprint unlock ${isFingerprintEnabled ? 'disabled' : 'enabled'}.`);
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
                                        addMessage(`Fingerprint unlock ${isFingerprintEnabled ? 'disabled' : 'enabled'}.`);
                                        toggleFingerprint();
                                    }}
                                    trackColor={{
                                        false: colors.switchTrack,
                                        true: colors.switchTrackActive,
                                    }}
                                    thumbColor={isFingerprintEnabled ? colors.switchThumbActive : colors.switchThumb}
                                    style={{ transform: [{ scale: 0.9 }] }}
                                />
                            </TouchableOpacity>
                        ) : null}

                        {/* Password Lock */}
                        <TouchableOpacity
                            style={styles.settingBlock}
                            onPress={() => {
                                if (loading) return;
                                if (!isPasswordLockEnabled) {
                                    setPasswordModalMode('set');
                                    setPasswordModalVisible(true);
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
                                    setPasswordModalMode(isPasswordLockEnabled ? 'change' : 'set');
                                    setPasswordModalVisible(true);
                                }}>

                                </TouchableOpacity>
                            </View>
                            <Switch
                                value={!!isPasswordLockEnabled}
                                onValueChange={(val) => {
                                    if (loading) return;
                                    if (val) {
                                        setPasswordModalMode('set');
                                        setPasswordModalVisible(true);
                                    } else {
                                        clearPassword();
                                        addMessage('Password lock disabled.');
                                    }
                                }}
                                trackColor={{
                                    false: colors.switchTrack,
                                    true: colors.switchTrackActive,
                                }}
                                thumbColor={isPasswordLockEnabled ? colors.switchThumbActive : colors.switchThumb}
                                style={{ transform: [{ scale: 0.9 }] }}
                            />
                        </TouchableOpacity>
                        {isPasswordLockEnabled && <TouchableOpacity
                            style={styles.settingBlock}
                            onPress={() => {
                                setPasswordModalMode(isPasswordLockEnabled ? 'change' : 'set');
                                setPasswordModalVisible(true);
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

                        {/* Privacy Mode Picker */}
                        <TouchableOpacity style={[styles.settingBlock, (isFingerprintEnabled || isPasswordLockEnabled) ? {} : { borderBottomWidth: 0 }]} activeOpacity={1} >
                            <Icons.Ion name="eye-off-outline" size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Privacy Mode</Text>
                                <Text style={styles.settingDesc}>Masks timer names and titles</Text>
                            </View>
                            <BottomSheetPicker
                                value={privacyMode}
                                options={privacyOptions}
                                onChange={setPrivacyModeValue}
                                placeholder="Select mode"
                                colors={colors}
                                variables={variables}
                            />
                        </TouchableOpacity>

                        {/* Lockout Option Picker */}
                        {shouldUseLockout() && <TouchableOpacity style={[styles.settingBlock, { borderBottomWidth: 0 }]} activeOpacity={1}>
                            <Icons.Ion name="timer-outline" size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                            <View style={styles.settingTextBlock}>
                                <Text style={styles.settingTitle}>Lockout</Text>
                                <Text style={styles.settingDesc}>Set duration for reauthentication</Text>
                            </View>
                            <BottomSheetPicker
                                value={lockoutMode}
                                options={lockoutOptions}
                                onChange={setLockoutModeValue}
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
                    transform: [{ translateY: bottomTranslate }],
                    opacity: bottomOpacity,
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
                                        addMessage(`Export folder set to: ${formatDirectoryPath(uri)}`);
                                    }
                                } catch (err) {
                                    addMessage('Failed to change directory');
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

                <ConfirmationBottomSheet
                    visible={confirmVisible}
                    onClose={() => setConfirmVisible(false)}
                    onConfirm={confirmAction}
                    title="Delete Item"
                    message="Are you sure you want to delete this item? This action cannot be undone."
                    confirmText="Delete"
                    cancelText="Cancel"
                    confirmColor="#ef4444"
                    icon="trash-outline"
                    colors={colors}
                    variables={variables}
                />

                {passwordModalVisible && (
                    <PasswordBottomSheet
                        visible={passwordModalVisible}
                        onClose={() => setPasswordModalVisible(false)}
                        onSave={(newPassword) => {
                            savePassword(newPassword);
                            setPasswordModalVisible(false);
                            addMessage('Password updated.');
                        }}
                        currentPassword={password}
                        mode={passwordModalMode}
                        colors={colors}
                        variables={variables}
                    />
                )}
            </>}
        </ScreenWithHeader>
    );
}