import { View, Text, StyleSheet, Switch, TouchableOpacity, Modal, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import { Icons } from '../assets/icons';
import { useTimers } from '../utils/TimerContext';
import { useSecurity } from '../utils/SecurityContext';
import { useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import PasswordModal from '../components/PasswordModal';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Timer from '../classes/Timer';
import ScreenWithHeader from '../components/ScreenWithHeder';
import { useTheme } from '../utils/variables';
import { Picker } from '@react-native-picker/picker';
import CustomPicker from '../components/CustomPicker';

export default function SettingsScreen() {
    const { initializeTimers, clearAllTimers, timers, setTimersAndSave } = useTimers();
    const [message, setMessage] = useState(null);

    const {
        theme,
        colors,
        themeMode,
        setThemeMode,
    } = useTheme();

    // In SettingsScreen.js

    const themeOptions = [
        {
            label: 'System Default',
            value: 'system',
            icon: <Icons.Ion name="phone-portrait-outline" size={16} color={colors.text} />,
        },
        {
            label: 'Light',
            value: 'light',
            icon: <Icons.Ion name="sunny-outline" size={16} color={colors.text} />,
        },
        {
            label: 'Dark',
            value: 'dark',
            icon: <Icons.Ion name="moon-outline" size={16} color={colors.text} />,
        },
    ];

    const privacyOptions = [
        {
            label: 'Off',
            value: 'off',
            icon: <Icons.Ion name="eye-outline" size={16} color={colors.text} />,
        },
        {
            label: 'Mask',
            value: 'mask',
            icon: <Icons.Ion name="lock-closed-outline" size={16} color={colors.text} />,
        },
        {
            label: 'Jumble',
            value: 'jumble',
            icon: <Icons.Ion name="shuffle-outline" size={16} color={colors.text} />,
        },
    ];

    const {
        isFingerprintEnabled,
        toggleFingerprint,
        isSensorAvailable,
        isPasswordLockEnabled,
        savePassword,
        clearPassword,
        password,
        loading,
        passwordModalVisible,
        setPasswordModalVisible,
        privacyMode,
        setPrivacyMode,
    } = useSecurity();

    if (loading || isPasswordLockEnabled === undefined || isFingerprintEnabled === undefined) {
        return null;
    }


    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const [populateDisabled, setPopulateDisabled] = useState(false);
    const [passwordModalMode, setPasswordModalMode] = useState('set');
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState(() => () => { });
    const [confirmText, setConfirmText] = useState('');
    const [showExtra, setShowExtra] = useState(false);

    /*
    borderWidth: 0.75,
    borderColor: colors.cardBorder,
    */

    const styles = StyleSheet.create({
        card: {
            backgroundColor: 'transparent',
            marginBottom: 15,
            borderRadius: 20,
            overflow: 'hidden',
            borderWidth: 0.75,
            borderColor: colors.cardBorder,
        },
        settingBlock: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 18,
            paddingBottom: 14,
            paddingHorizontal: 20,
            backgroundColor: colors.settingBlock,
        },
        settingTextBlock: {
            flex: 1,
        },
        settingTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 2,
            height: 25,
        },
        settingDesc: {
            fontSize: 13,
            color: colors.textDesc,
            opacity: 0.85,
            height: 20,
        },
        snackbarContainer: {
            position: 'absolute',
            bottom: 20,
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
            borderRadius: 16,
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
            borderRadius: 20,
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
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 18,
            width: '100%',
            gap: 12,
        },
        modalBtn: {
            borderRadius: 16,
            paddingVertical: 8,
            paddingHorizontal: 18,
            borderWidth: 0.75,
            borderColor: colors.border,
            width: '45%',
            alignItems: 'center',
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
        sliderContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 10,
        },
        sliderValue: {
            width: 40,
            textAlign: 'center',
            color: colors.text,
            fontSize: 14,
            fontWeight: '600',
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
            const fileUri = FileSystem.cacheDirectory + 'timers-export.json';
            await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/json',
                dialogTitle: 'Export Timers as JSON',
            });
            setMessage('Timers exported as JSON.');
        } catch (e) {
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
            borderRadius={20}
            style={styles}
            paddingMargin={10}
        >
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

            <View style={styles.card} >
                {/* Theme Mode Picker */}
                <View style={styles.settingBlock}>
                    <Icons.Ion name='color-palette-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                    <View style={styles.settingTextBlock}>
                        <Text style={styles.settingTitle}>Theme</Text>
                        <Text style={styles.settingDesc}>Choose app theme</Text>
                    </View>
                    <CustomPicker
                        value={themeMode}
                        options={themeOptions}
                        onChange={setThemeMode}
                        placeholder="Select theme"
                        colors={colors}
                    />
                </View>
            </View>

            <TouchableOpacity style={styles.sectionHeader} onPress={() => { }} activeOpacity={1}>
                <Text style={styles.sectionHeaderText}>Security</Text>
            </TouchableOpacity>

            {/* SECURITY SETTINGS */}
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
                    style={[styles.settingBlock, isSensorAvailable ? {} : { borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }]}
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
                <View style={styles.settingBlock}>
                    <Icons.Ion name="eye-off-outline" size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                    <View style={styles.settingTextBlock}>
                        <Text style={styles.settingTitle}>Privacy Mode</Text>
                        <Text style={styles.settingDesc}>Hides timer names and titles</Text>
                    </View>
                    <CustomPicker
                        value={privacyMode}
                        options={privacyOptions}
                        onChange={setPrivacyMode}
                        placeholder="Select privacy mode"
                        colors={colors}
                    />
                </View>
            </View>

            <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowExtra(!showExtra)} activeOpacity={1}>
                <Text style={styles.sectionHeaderText}>Timer Management</Text>
            </TouchableOpacity>

            {/* TIMER MANAGEMENT */}
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
                <TouchableOpacity style={styles.settingBlock} onPress={loadFromJson}>
                    <Icons.Ion name='cloud-upload-outline' size={14} color={colors.highlight} style={{ marginRight: 15 }} />
                    <View style={styles.settingTextBlock}>
                        <Text style={styles.settingTitle}>Import Timers</Text>
                        <Text style={styles.settingDesc}>Load timers from a JSON file</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Custom Confirmation Modal - Only render when visible */}
            {confirmVisible && (
                <Modal
                    visible={confirmVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setConfirmVisible(false)}
                    statusBarTranslucent={false}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalText}>{confirmText}</Text>
                            <View style={styles.modalActions}>
                                <Pressable
                                    style={[
                                        styles.modalBtn,
                                        { backgroundColor: colors.highlight + '33', borderColor: colors.highlight + '63' }
                                    ]}
                                    onPress={() => setConfirmVisible(false)}
                                >
                                    <Text style={[
                                        styles.modalBtnText,
                                        { color: colors.modalBtnText }
                                    ]}>Cancel</Text>
                                </Pressable>
                                <Pressable
                                    style={[
                                        styles.modalBtn,
                                        { backgroundColor: '#ef444433', borderColor: '#ef4444' }
                                    ]}
                                    onPress={() => {
                                        setConfirmVisible(false);
                                        confirmAction();
                                    }}
                                >
                                    <Text style={[
                                        styles.modalBtnText,
                                        { color: colors.modalBtnOkText }
                                    ]}>OK</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {/* Password Modal - Only render when visible */}
            {passwordModalVisible && (
                <PasswordModal
                    visible={passwordModalVisible}
                    onClose={() => setPasswordModalVisible(false)}
                    onSave={(newPassword) => {
                        savePassword(newPassword);
                        setPasswordModalVisible(false);
                        setMessage('Password updated.');
                    }}
                    currentPassword={password}
                    mode={passwordModalMode}
                />
            )}
        </ScreenWithHeader>
    );
}