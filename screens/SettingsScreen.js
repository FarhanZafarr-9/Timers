import { View, Text, StyleSheet, Switch, TouchableOpacity, Modal, Pressable, Animated, TouchableWithoutFeedback } from 'react-native';
import { Icons } from '../assets/icons';
import { useTimers } from '../utils/TimerContext';
import { useSecurity } from '../utils/SecurityContext';
import React, { useState, useRef, useEffect } from 'react';
import PasswordBottomSheet from '../components/PasswordModal';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Timer from '../classes/Timer';
import ScreenWithHeader from '../components/ScreenWithHeder';
import { useTheme } from '../utils/ThemeContext';
import BottomSheetPicker from '../components/BottomSheetPicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themeOptions, navOptions, headerOptions, privacyOptions, lockoutOptions } from '../utils/functions';
import ConfirmationBottomSheet from '../components/ConfirmationBottomSheet';

export default function SettingsScreen() {
    const { initializeTimers, clearAllTimers, timers, setTimersAndSave } = useTimers();
    const [message, setMessage] = useState(null);

    const {
        theme,
        colors,
        variables,
        themeMode,
        setThemeMode,
        navigationMode,
        setNavigationMode,
        headerMode,
        setHeaderMode
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


    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const [populateDisabled, setPopulateDisabled] = useState(false);
    const [passwordModalMode, setPasswordModalMode] = useState('set');
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState(() => () => { });
    const [confirmText, setConfirmText] = useState('');
    const [showExtra, setShowExtra] = useState(false);
    const DIRECTORY_KEY = 'download_directory_uri';
    const [mounted, setMounted] = useState(false);

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

    const getOrRequestDirectory = async () => {
        let uri = await AsyncStorage.getItem(DIRECTORY_KEY);
        if (uri) return uri;

        const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permission.granted) throw new Error('Permission not granted');

        uri = permission.directoryUri;
        await AsyncStorage.setItem(DIRECTORY_KEY, uri);
        return uri;
    };

    const styles = StyleSheet.create({
        card: {
            backgroundColor: 'transparent',
            marginBottom: 15,
            borderRadius: variables.radius.lg,
            overflow: 'hidden',
            borderWidth: 0,
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
        snackbarContainer: {
            position: 'absolute',
            bottom: '15%',
            left: 0,
            right: 0,
            width: '100%',
            alignItems: 'center',
            zIndex: 10,
            pointerEvents: 'box-none',
        },
        snackbar: {
            width: '60%',
            backgroundColor: colors.snackbarBg,
            borderRadius: variables.radius.sm,
            paddingHorizontal: 16,
            paddingVertical: 10,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            elevation: 6,
        },
        snackbarText: {
            color: colors.snackbarText,
            fontSize: 14,
            fontWeight: '600',
            fontStyle: 'italic',
            height: 20,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.75)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalCard: {
            width: 300,
            borderRadius: variables.radius.md,
            borderWidth: 0.75,
            borderColor: colors.border,
            padding: 24,
            alignItems: 'center',
            elevation: 8,
            backgroundColor: colors.modalBg,
        },
        modalText: {
            fontSize: 16,
            color: colors.modalText,
            marginBottom: 18,
            textAlign: 'center',
            lineHeight: 22,
            fontWeight: '500',
            letterSpacing: 0.5,
        },
        modalActions: {
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 18,
            width: '100%',
            gap: 12,
        },
        modalBtn: {
            borderRadius: variables.radius.sm,
            paddingVertical: 8,
            paddingHorizontal: 18,
            borderWidth: 0.75,
            borderColor: colors.border,
            alignItems: 'center',
            width: '100%',
        },
        modalBtnText: {
            fontSize: 14,
            fontWeight: 'bold',
        },
        sectionHeader: {
            paddingVertical: 12,
            paddingHorizontal: 15,
        },
        sectionHeaderText: {
            fontSize: 13,
            fontWeight: 'bold',
            color: colors.highlight,
            textTransform: 'uppercase',
            letterSpacing: 1,
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
            setMessage('All timers have been cleared.');
        });
    };

    const populateTimers = async () => {
        if (populateDisabled) return;
        setPopulateDisabled(true);
        await initializeTimers();
        setMessage('Sample timers have been added.');
        setTimeout(() => setPopulateDisabled(false), 2000);
    };

    const exportToJson = async () => {
        try {
            const json = JSON.stringify(timers, null, 2);
            const directoryUri = await getOrRequestDirectory();

            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            const fileName = `export-(${day}/${month}/${year})`;
            const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                directoryUri,
                fileName,
                'application/json'
            );

            await FileSystem.writeAsStringAsync(fileUri, json, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            setMessage('Timers exported successfully');
        } catch (err) {
            console.log('[EXPORT ERROR]', err);
            setMessage('Export failed.');
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
                    setMessage('Timers loaded from JSON.');
                } else {
                    setMessage('Invalid JSON format.');
                }
            } else {
                setMessage('No file selected.');
            }
        } catch (e) {
            setMessage('Failed to load timers.');
        }
    };

    useEffect(() => {
        if (message) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                friction: 5,
            }).start();

            const timer = setTimeout(() => {
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 200,
                    useNativeDriver: true,
                }).start(() => setMessage(null));
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <ScreenWithHeader
            headerIcon={<Icons.Ion name="settings" color={colors.highlight} />}
            headerTitle="Settings"
            borderRadius={variables.radius.md}
            paddingMargin={10}
            colors={colors}
            contentContainerStyle={{ paddingBottom: 95 }}
            useFlatList={false}
        >
            {mounted && <>
                {message && (
                    <View style={styles.snackbarContainer} pointerEvents="box-none">
                        <Animated.View
                            style={[
                                styles.snackbar,
                                { transform: [{ scale: scaleAnim }] }
                            ]}
                            pointerEvents="none"
                        >
                            <Text style={styles.snackbarText}>{message}</Text>
                        </Animated.View>
                    </View>
                )}

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
                        <TouchableOpacity style={[styles.settingBlock, { borderBottomWidth: 0 }]} activeOpacity={1}>
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
                                defaultValue="floating"
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
                                    setMessage(`Fingerprint unlock ${isFingerprintEnabled ? 'disabled' : 'enabled'}.`);
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
                                        setMessage(`Fingerprint unlock ${isFingerprintEnabled ? 'disabled' : 'enabled'}.`);
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
                                        setMessage('Password lock disabled.');
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

                <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowExtra(!showExtra)} activeOpacity={1}>
                    <Text style={styles.sectionHeaderText}>Timer Management</Text>
                </TouchableOpacity>

                {/* TIMER MANAGEMENT */}
                <Animated.View style={{
                    transform: [{ translateY: bottomTranslate }],
                    opacity: bottomOpacity,
                }}>
                    <View style={styles.card}>

                        {/* Populate Timers */}
                        {showExtra &&
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
                                <Text style={styles.settingDesc}>Save all timers as a JSON file</Text>
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

                // Replace your existing modal code with:
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

                {/* Password Modal - Only render when visible */}
                {passwordModalVisible && (
                    <PasswordBottomSheet
                        visible={passwordModalVisible}
                        onClose={() => setPasswordModalVisible(false)}
                        onSave={(newPassword) => {
                            savePassword(newPassword);
                            setPasswordModalVisible(false);
                            setMessage('Password updated.');
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