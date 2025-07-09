import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TextInput, Image, TouchableOpacity, Animated } from 'react-native';
import { useSecurity } from './SecurityContext';
import { useTheme } from '../utils/ThemeContext';
import { Icons } from '../assets/icons';
import { showToast } from './functions';
import { AppState } from 'react-native';
import PasswordBottomSheet from '../components/PasswordModal'; // Import the password modal

const AuthComponent = ({ children }) => {
    const { variables, colors, isBorder } = useTheme();

    const {
        passwordModalVisible,
        justSetPassword,
        setJustSetPassword,
        isFingerprintEnabled,
        authenticate,
        isSensorAvailable,
        loading,
        isPasswordLockEnabled,
        checkPassword,
        password,
        isAppLocked,
        unlockApp,
        getTimeUntilLockout,
        shouldUseLockout,
        lockoutMode,
        lastActiveTime,
        updateLastActiveTime,
        savePassword // Add this for password reset functionality
    } = useSecurity();

    const [authenticated, setAuthenticated] = useState(false);
    const [input, setInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false); // State for reset modal
    const [wasAccessedFromRecents, setWasAccessedFromRecents] = useState(false); // Track if accessed from recents

    // Animation values
    const topSlide = useRef(new Animated.Value(-120)).current;
    const bottomSlide = useRef(new Animated.Value(120)).current;

    const [appState, setAppState] = useState(AppState.currentState);

    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (
                appState.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // Check if this is a recent access (app was backgrounded recently)
                const timeUntilLockout = getTimeUntilLockout();
                setWasAccessedFromRecents(timeUntilLockout > 0);

                // If the app is NOT locked and NOT in lockout, update last active time
                if (!isAppLocked && (!shouldUseLockout || !shouldUseLockout())) {
                    updateLastActiveTime && updateLastActiveTime();
                }
            }
            setAppState(nextAppState);
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [appState, isAppLocked, shouldUseLockout, updateLastActiveTime, getTimeUntilLockout]);

    // Animate in on mount
    useEffect(() => {
        Animated.parallel([
            Animated.spring(topSlide, {
                toValue: 0,
                useNativeDriver: true,
                friction: 7,
            }),
            Animated.spring(bottomSlide, {
                toValue: 0,
                useNativeDriver: true,
                friction: 7,
            }),
        ]).start();
    }, []);

    // Update time remaining every second when locked
    useEffect(() => {
        let interval;
        if (isAppLocked && shouldUseLockout()) {
            interval = setInterval(() => {
                const remaining = getTimeUntilLockout();
                setTimeRemaining(remaining);
                if (remaining <= 0) {
                    clearInterval(interval);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isAppLocked, shouldUseLockout]);

    useEffect(() => {
        if (justSetPassword) {
            const timer = setTimeout(() => setJustSetPassword(false), 500);
            return () => clearTimeout(timer);
        }
    }, [justSetPassword, setJustSetPassword]);

    useEffect(() => {
        setInput('');
        setShowPasswordInput(false); // Reset password input visibility when auth requirements change
    }, [isPasswordLockEnabled, isFingerprintEnabled, isSensorAvailable, password]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        content: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
            backgroundColor: colors.background,
        },
        authText: {
            fontSize: 18,
            color: colors.text,
            textAlign: 'center',
            fontWeight: '400',
            letterSpacing: 0.5,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginVertical: 28,
        },
        button: {
            borderRadius: variables.radius.sm,
            paddingVertical: 10,
            paddingHorizontal: 34,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.highlight,
            borderWidth: isBorder ? 0.75 : 0,
            borderColor: colors.border,
            marginTop: 12,
        },
        input: {
            backgroundColor: colors.card,
            color: colors.text,
            padding: 10,
            marginBottom: 12,
            borderWidth: isBorder ? 0 : .75,
            borderColor: colors.border,
            fontSize: 16,
        },
        appIcon: {
            width: 90,
            height: 90,
            borderRadius: 20,
            marginBottom: 12,
            alignSelf: 'center',
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 18,
        },
        iconButton: {
            padding: 10,
            borderRadius: variables.radius.sm,
            backgroundColor: colors.highlight,
            marginRight: 10,
            borderWidth: isBorder ? 0.75 : 0,
            borderColor: colors.highlight + '63',
        },
        lockoutMessage: {
            fontSize: 14,
            color: colors.textDesc,
            marginTop: 10,
            textAlign: 'center',
            height: 20,
        },
        timeRemaining: {
            fontSize: 16,
            color: colors.text,
            fontWeight: 'bold',
            marginTop: 5,
        },
        resetLink: {
            alignSelf: 'center',
            marginTop: 12,
            paddingVertical: 8,
            paddingHorizontal: 16,
        },
        resetText: {
            fontSize: 14,
            color: colors.highlight,
            fontWeight: '500',
            textAlign: 'center',
            textDecorationLine: 'underline',
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: 12,
        },
        halfButton: {
            flex: 0.48,
            borderRadius: variables.radius.sm,
            paddingVertical: 10,
            paddingHorizontal: 20,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: isBorder ? 0.75 : 0,
        },
        primaryButton: {
            backgroundColor: colors.highlight,
            borderColor: colors.border,
        },
        secondaryButton: {
            backgroundColor: colors.card,
            borderColor: colors.border,
        },
    });

    // Format time remaining for display
    const formatTime = (ms) => {
        if (!ms) return '00:00';
        const seconds = Math.floor(ms / 1000) % 60;
        const minutes = Math.floor(ms / (1000 * 60));
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Handler for fingerprint authentication
    const handleFingerprintAuth = async () => {
        const ok = await authenticate();
        if (ok) {
            await unlockApp();
            setAuthenticated(true);
        } else {
            showToast('Fingerprint authentication failed. Please try again.');
        }
    };

    // Handler for password authentication
    const handlePasswordAuth = () => {
        if (checkPassword(input)) {
            unlockApp();
            setAuthenticated(true);
            setInput('');
            setShowPasswordInput(false);
        } else {
            showToast('Incorrect password');
        }
    };

    // Handler for bypassing lockout when accessed from recents
    const handleBypassLockout = () => {
        unlockApp();
        setAuthenticated(true);
        setWasAccessedFromRecents(false);
    };

    // Handler for opening reset modal
    const handleForgotPassword = () => {
        setShowResetModal(true);
    };

    // Handler for saving new password from reset
    const handleResetPasswordSave = async (newPassword, resetCode) => {
        try {
            await savePassword(newPassword);
            setShowResetModal(false);
            showToast('Password reset successfully!');
            // After successful reset, unlock the app
            await unlockApp();
            setAuthenticated(true);
        } catch (error) {
            showToast('Failed to reset password. Please try again.');
        }
    };

    if (passwordModalVisible || justSetPassword) {
        return children;
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <ActivityIndicator
                        size="large"
                        color={colors.highlight}
                        style={{ marginBottom: 18 }}
                    />
                    <Text style={styles.authText}>Authenticating...</Text>
                </View>
            </View>
        );
    }

    // Lockout screen with animation
    if (isAppLocked && shouldUseLockout() && !showPasswordInput) {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <Animated.View style={{ transform: [{ translateY: topSlide }] }}>
                        <Image
                            source={require('../assets/logo.png')}
                            style={styles.appIcon}
                        />
                        <Text style={styles.authText}>App Locked</Text>
                        <Text style={styles.lockoutMessage}>
                            {lockoutMode === '0' ?
                                'The app is locked immediately after backgrounding.' : timeRemaining ?
                                    'The app will be locked automatically in:' : 'The app is locked due to inactivity.'}
                        </Text>
                        {lockoutMode !== '0' && timeRemaining && (
                            <Text style={styles.timeRemaining}>
                                {formatTime(timeRemaining)}
                            </Text>
                        )}
                    </Animated.View>
                    <Animated.View style={{ transform: [{ translateY: bottomSlide }] }}>
                        {/* Show different buttons based on whether accessed from recents and time remaining */}
                        {wasAccessedFromRecents && timeRemaining > 0 ? (
                            <TouchableOpacity
                                style={[styles.button, { marginTop: 20 }]}
                                onPress={handleBypassLockout}
                            >
                                <Text style={{ color: colors.card, fontWeight: 'bold', height: 20 }}>
                                    Enter
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            (isPasswordLockEnabled || (isFingerprintEnabled && isSensorAvailable)) && (
                                <TouchableOpacity
                                    style={[styles.button, { marginTop: 20 }]}
                                    onPress={() => {
                                        if (isFingerprintEnabled && isSensorAvailable) {
                                            handleFingerprintAuth();
                                        } else if (isPasswordLockEnabled) {
                                            setShowPasswordInput(true);
                                        }
                                    }}
                                >
                                    <Text style={{ color: colors.card, fontWeight: 'bold', height: 20 }}>
                                        {isFingerprintEnabled && isSensorAvailable ?
                                            'Unlock with Fingerprint' :
                                            'Enter Password'}
                                    </Text>
                                </TouchableOpacity>
                            )
                        )}
                    </Animated.View>
                </View>
            </View>
        );
    }

    if ((!authenticated && (isPasswordLockEnabled || (isFingerprintEnabled && isSensorAvailable))) || showPasswordInput) {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <Animated.View style={{ transform: [{ translateY: topSlide }] }}>
                        <Image
                            source={require('../assets/logo.png')}
                            style={styles.appIcon}
                        />
                        <Text style={styles.authText}>Authenticate to continue</Text>
                    </Animated.View>
                    <Animated.View style={{ transform: [{ translateY: bottomSlide }] }}>
                        <View style={styles.row}>
                            {isPasswordLockEnabled ? (
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: colors.card,
                                    borderRadius: variables.radius.sm,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    marginBottom: 12,
                                    paddingHorizontal: 12,
                                    width: '100%'
                                }}>
                                    <TextInput
                                        style={[styles.input, {
                                            flex: 1,
                                            marginBottom: 0,
                                            borderWidth: 0,
                                            backgroundColor: 'transparent',
                                            paddingRight: 0
                                        }]}
                                        placeholder="Password"
                                        placeholderTextColor={colors.textDesc}
                                        secureTextEntry={!showPassword}
                                        value={input}
                                        onChangeText={setInput}
                                        onSubmitEditing={handlePasswordAuth}
                                        returnKeyType="done"
                                        textContentType="password"
                                        autoComplete="password"
                                        keyboardType="default"
                                        enablesReturnKeyAutomatically={true}
                                        autoFocus={true}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(v => !v)}
                                        style={{ padding: 8 }}
                                    >
                                        <Icons.Ion
                                            name={showPassword ? 'eye' : 'eye-off'}
                                            size={20}
                                            color={colors.textDesc}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                isFingerprintEnabled && isSensorAvailable && (
                                    <TouchableOpacity
                                        style={[styles.button, { flexDirection: 'row', marginTop: 0 }]}
                                        onPress={handleFingerprintAuth}
                                        activeOpacity={1}
                                    >
                                        <Icons.Ion
                                            name="finger-print"
                                            size={24}
                                            color={colors.background}
                                            style={{ marginRight: 8 }}
                                        />
                                        <Text style={{
                                            color: colors.background,
                                            fontWeight: 'bold',
                                            fontSize: 14,
                                            alignContent: 'center',
                                            textAlign: 'center',
                                            height: 20,
                                        }}>
                                            Authenticate with Fingerprint
                                        </Text>
                                    </TouchableOpacity>
                                )
                            )}
                        </View>

                        {/* Show password auth button and reset link for password mode */}
                        {isPasswordLockEnabled && (
                            <>
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={[styles.halfButton, styles.primaryButton]}
                                        onPress={handlePasswordAuth}
                                    >
                                        <Text style={{
                                            color: colors.card,
                                            fontWeight: 'bold',
                                            fontSize: 14,
                                            textAlign: 'center'
                                        }}>
                                            Enter
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.halfButton, styles.secondaryButton]}
                                        onPress={handleForgotPassword}
                                    >
                                        <Text style={{
                                            color: colors.text,
                                            fontWeight: '500',
                                            fontSize: 14,
                                            textAlign: 'center'
                                        }}>
                                            Reset
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </Animated.View>
                </View>

                {/* Password Reset Modal */}
                <PasswordBottomSheet
                    visible={showResetModal}
                    onClose={() => setShowResetModal(false)}
                    onSave={handleResetPasswordSave}
                    currentPassword={password}
                    mode="reset"
                    variables={variables}
                />
            </View>
        );
    }

    return children;
}

export default AuthComponent;