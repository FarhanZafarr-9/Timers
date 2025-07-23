import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Keyboard, TouchableWithoutFeedback, View, Text, ActivityIndicator, StyleSheet, TextInput, Image, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useSecurity } from './SecurityContext';
import { useTheme } from '../utils/ThemeContext';
import { Icons } from '../assets/icons';
import Toast from 'react-native-toast-message';
import { AppState } from 'react-native';
import PasswordPrompt from '../components/PasswordPrompt';
import logo from '../assets/text.png'
import { quotes } from './functions';

const { width, height } = Dimensions.get('window');

const AuthContext = ({ children }) => {
    const { variables, colors, border, themeMode } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const {
        PasswordPromptVisible,
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
        updateLastActiveTime,
        savePassword
    } = useSecurity();

    const [authenticated, setAuthenticated] = useState(false);
    const [input, setInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [wasAccessedFromRecents, setWasAccessedFromRecents] = useState(false);
    const [appState, setAppState] = useState(AppState.currentState);

    const showToast = (type, text1, text2 = '') => {
        Toast.show({ type, text1, text2 });
    };

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const addMessage = useCallback((text, type = 'info') => {
        showToast(type, capitalize(type), text);
    }, []);


    const [hasMounted, setHasMounted] = useState(false);

    const topCardAnimY = useRef(new Animated.Value(-200)).current;
    const topCardOpacity = useRef(new Animated.Value(0)).current;
    const middleCardAnimY = useRef(new Animated.Value(height)).current;
    const bottomCardAnimY = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (!hasMounted) return;

        let targetY, targetOpacity;

        if (isFocused) {
            targetY = -100;
            targetOpacity = 0;
        } else {
            targetY = 0;
            targetOpacity = 1;
        }

        Animated.parallel([
            Animated.timing(topCardAnimY, {
                toValue: targetY,
                duration: 300,
                useNativeDriver: true
            }),
            Animated.timing(topCardOpacity, {
                toValue: targetOpacity,
                duration: 300,
                useNativeDriver: true
            })
        ]).start();
    }, [isFocused, hasMounted]);

    useEffect(() => {
        if (!hasMounted) return;

        let targetY;

        if (isFocused) {
            targetY = -(height * 0.25);
        } else {
            targetY = 0;
        }

        Animated.timing(middleCardAnimY, {
            toValue: targetY,
            duration: 300,
            useNativeDriver: true
        }).start();
    }, [isFocused, hasMounted, height]);

    useEffect(() => {
        if (!hasMounted) return;

        let targetValue;

        if (isFocused) {
            targetValue = 0;
        } else if (showPasswordInput) {
            targetValue = height * 0.35;
        } else {
            targetValue = height * 0.42;
        }

        Animated.timing(bottomCardAnimY, {
            toValue: targetValue,
            duration: 300,
            useNativeDriver: true
        }).start();
    }, [showPasswordInput, isFocused, height, hasMounted]);

    const handleFocus = () => {
        if (!hasMounted) return;
        setIsFocused(true);
    };

    const handleBlur = () => {
        if (!hasMounted) return;
        setIsFocused(false);
    };

    useEffect(() => {
        if (wasAccessedFromRecents && hasMounted) {
            setIsFocused(false);
            setShowPasswordInput(false);
        }
    }, [wasAccessedFromRecents, hasMounted]);

    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (appState.match(/inactive|background/) && nextAppState === 'active') {
                const timeUntilLockout = getTimeUntilLockout();
                setWasAccessedFromRecents(timeUntilLockout > 0);

                // Reset UI state when coming back from background
                setIsFocused(false);
                setShowPasswordInput(false);

                if (!isAppLocked && (!shouldUseLockout || !shouldUseLockout())) {
                    updateLastActiveTime && updateLastActiveTime();
                }
            }
            setAppState(nextAppState);
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [appState, isAppLocked, shouldUseLockout, updateLastActiveTime, getTimeUntilLockout]);

    useEffect(() => {
        let interval;
        if (isAppLocked && shouldUseLockout()) {
            interval = setInterval(() => {
                const remaining = getTimeUntilLockout();
                setTimeRemaining(remaining);
                if (remaining <= 0) clearInterval(interval);
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
        setShowPasswordInput(false);
    }, [isPasswordLockEnabled, isFingerprintEnabled, isSensorAvailable, password]);

    const formatTime = (ms) => {
        if (!ms) return '00:00';
        const seconds = Math.floor(ms / 1000) % 60;
        const minutes = Math.floor(ms / (1000 * 60));
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleFingerprintAuth = async () => {
        const ok = await authenticate();
        if (ok) {
            await unlockApp();
            setAuthenticated(true);
        } else {
            addMeesage('Fingerprint authentication failed. Please try again.');
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        topCard: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.modalBg,
            borderRadius: 24,
            padding: 20,
            alignItems: 'center',
            justifyContent: 'center',
            borderColor: colors.border,
            borderWidth: border,
            borderTopWidth: 0,
        },
        appIcon: {
            width: 175, height: 175,
            alignSelf: 'center',
        },
        topTextContainer: {
            flex: 1,
        },
        titleText: {
            fontSize: 24,
            color: colors.text,
            fontWeight: '600',
            textAlign: 'center',
        },
        subtitleText: {
            fontSize: 16,
            color: colors.textDesc,
            fontWeight: '400',
            lineHeight: 24,
            textAlign: 'left',
        },
        backgroundContent: {
            flex: 1,
            alignItems: 'center',
            paddingTop: height * 0.15,
            paddingHorizontal: 32,
        },
        timeContainer: {
            backgroundColor: colors.card,
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 24,
            marginTop: 24,
            alignItems: 'center',
        },
        timeRemaining: {
            fontSize: 32,
            color: colors.highlight,
            fontWeight: '700',
            fontFamily: 'monospace',
        },
        timeLabel: {
            fontSize: 14,
            color: colors.textDesc,
            marginTop: 4,
        },
        bottomCard: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.modalBg,
            borderColor: colors.border,
            borderWidth: border,
            borderBottomWidth: 0,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 32,
            paddingBottom: 40,
            minHeight: height * 0.55,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.highlight + '08',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 16,
            height: 52,
            marginBottom: 16,
        },
        input: {
            flex: 1,
            fontSize: 16,
            color: colors.text,
            paddingVertical: 0,
        },
        eyeButton: {
            padding: 8,
        },
        primaryButton: {
            backgroundColor: colors.highlight,
            borderRadius: variables.radius.md,
            paddingVertical: 12,
            paddingHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        secondaryButton: {
            backgroundColor: colors.background,
            borderRadius: variables.radius.md,
            paddingVertical: 12,
            paddingHorizontal: 24,
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonText: {
            fontSize: 16,
            fontWeight: '600',
            height: 20,
        },
        primaryButtonText: {
            color: colors.background,
            height: 22,
            marginLeft: 10,
            marginTop: 2
        },
        secondaryButtonText: {
            color: colors.text,
        },
        buttonRow: {
            flexDirection: 'row',
            gap: 12,
        },
        halfButton: {
            flex: 1,
            borderRadius: variables.radius.md,
            alignItems: 'center',
            justifyContent: 'center',
            borderColor: colors.border,
            borderWidth: border,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
        },
        loadingText: {
            fontSize: 16,
            color: colors.text,
            marginTop: 16,
        },
        fingerprintIcon: {
            marginRight: 8,
        },
        topHeader: {
            alignItems: 'center',
            paddingTop: height * 0.1,
            paddingHorizontal: 32,
        },
        middleContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: height * 0.5,
        },
        middleCard: {
            width: width * 0.8,
            aspectRatio: 1,
            borderRadius: variables.radius.lg,
            backgroundColor: colors.card,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',

            position: 'relative',
        },
        gridLine: {
            position: 'absolute',
            backgroundColor: colors.highlight + '10'
        },
        cardOverlay: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '20%',
            backgroundColor: colors.card + 'E6',
            borderBottomLeftRadius: variables.radius.lg,
            borderBottomRightRadius: variables.radius.lg,
        },
        textContainer: {
            position: 'absolute',
            bottom: 24,
            left: 24,
            right: 24,
            zIndex: 1,
        },
        middleTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        middleDesc: {
            fontSize: 13,
            color: colors.textDesc,
            textAlign: 'left',
            lineHeight: 16,
        },
    });

    const handlePasswordAuth = () => {
        if (checkPassword(input)) {
            setIsFocused(false);
            unlockApp();
            setAuthenticated(true);
            setInput('');
            setShowPasswordInput(false);

        } else {
            addMessage('Incorrect password', 'error');
        }
    };

    const handleBypassLockout = () => {
        unlockApp();
        setAuthenticated(true);
        setWasAccessedFromRecents(false);
    };

    const handleForgotPassword = () => setShowResetModal(true);

    const handleResetPasswordSave = async (newPassword) => {
        try {
            await savePassword(newPassword);
            setShowResetModal(false);
            addMessage('Password reset successfully!', 'success');
            await unlockApp();
            setAuthenticated(true);
        } catch {
            addMessage('Failed to reset password. Please try again.', 'error');
        }
    };

    // Add this helper to determine what buttons to show
    const getAuthButtons = () => {
        // Case 1: App is locked with timeout
        if (isAppLocked && shouldUseLockout() && !showPasswordInput) {
            if (wasAccessedFromRecents && timeRemaining > 0) {
                return (
                    <TouchableOpacity style={styles.primaryButton} onPress={handleBypassLockout} activeOpacity={0.8}>
                        <Text style={[styles.buttonText, styles.primaryButtonText]}>Enter App</Text>
                    </TouchableOpacity>
                );
            } else {
                return (
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => {
                            if (isFingerprintEnabled && isSensorAvailable) handleFingerprintAuth();
                            else setShowPasswordInput(true);
                        }}
                        activeOpacity={0.8}
                    >
                        <Icons.Ion
                            name={isFingerprintEnabled && isSensorAvailable ? 'finger-print' : 'lock-closed'}
                            size={20}
                            color={colors.background}
                        />
                        <Text style={[styles.buttonText, styles.primaryButtonText]}>
                            {isFingerprintEnabled && isSensorAvailable ? 'Unlock with Fingerprint' : 'Enter Password'}
                        </Text>
                    </TouchableOpacity>
                );
            }
        }

        // Case 2: Password input is shown
        if (showPasswordInput) {
            return (
                <>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor={colors.textDesc}
                            secureTextEntry={!showPassword}
                            value={input}
                            onChangeText={setInput}
                            onSubmitEditing={handlePasswordAuth}
                            returnKeyType="done"
                            textContentType="password"
                            autoComplete="password"
                            keyboardType="default"
                            enablesReturnKeyAutomatically
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={{ padding: 8 }} activeOpacity={0.7}>
                            <Icons.Ion name={showPassword ? 'eye' : 'eye-off'} size={20} color={colors.textDesc} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.halfButton, styles.secondaryButton]} onPress={handleForgotPassword} activeOpacity={0.8}>
                            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.halfButton, styles.primaryButton]} onPress={handlePasswordAuth} activeOpacity={0.8}>
                            <Text style={[styles.buttonText, styles.primaryButtonText]}>Unlock</Text>
                        </TouchableOpacity>
                    </View>
                </>
            );
        }

        // Case 3: Only fingerprint enabled
        if (isFingerprintEnabled && isSensorAvailable && !isPasswordLockEnabled) {
            return (
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleFingerprintAuth}
                    activeOpacity={0.8}
                >
                    <Icons.Ion name="finger-print" size={20} color={colors.background} />
                    <Text style={[styles.buttonText, styles.primaryButtonText]}>Unlock with Fingerprint</Text>
                </TouchableOpacity>
            );
        }

        // Case 4: Only password enabled
        if (isPasswordLockEnabled && !isFingerprintEnabled) {
            return (
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => setShowPasswordInput(true)}
                    activeOpacity={0.8}
                >
                    <Icons.Ion name="lock-closed" size={20} color={colors.background} />
                    <Text style={[styles.buttonText, styles.primaryButtonText]}>Enter Password</Text>
                </TouchableOpacity>
            );
        }

        // Case 5: Both password and fingerprint enabled (but not locked)
        if (isPasswordLockEnabled && isFingerprintEnabled && isSensorAvailable) {
            return (
                <>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleFingerprintAuth}
                        activeOpacity={0.8}
                    >
                        <Icons.Ion name="finger-print" size={20} color={colors.background} />
                        <Text style={[styles.buttonText, styles.primaryButtonText]}>Unlock with Fingerprint</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.secondaryButton, { marginTop: 12 }]}
                        onPress={() => setShowPasswordInput(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Enter Password Instead</Text>
                    </TouchableOpacity>
                </>
            );
        }

        // Case 6: Neither enabled - show continue button
        return (
            <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                    unlockApp();
                    setAuthenticated(true);
                }}
                activeOpacity={0.8}
            >
                <Text style={[styles.buttonText, styles.primaryButtonText]}>Continue</Text>
            </TouchableOpacity>
        );
    };



    if (PasswordPromptVisible || justSetPassword) return children;
    if (authenticated && !isAppLocked) {
        return children;
    }
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.highlight} />
                <Text style={styles.loadingText}>Authenticating...</Text>
            </View>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setIsFocused(false); }}>
            <View style={styles.container}>
                {/* CHANGE 11: Updated top card - removed logo and desc */}
                <Animated.View style={[styles.topCard, {
                    transform: [{ translateY: topCardAnimY }],
                    opacity: topCardOpacity,
                    paddingTop: 40,
                    paddingBottom: 20
                }]}>
                    <Text style={styles.titleText}>Welcome Back</Text>
                </Animated.View>

                <Animated.View style={{
                    transform: [{ translateY: middleCardAnimY }]
                }}>
                    {/* CHANGE 12: Updated middle card with new content structure */}
                    <View style={styles.middleContainer}>
                        <View style={styles.middleCard}>
                            {/* Draw vertical lines */}
                            {[...Array(15)].map((_, i) => (
                                <View key={`v-${i}`} style={[styles.gridLine, {
                                    left: `${(i + 1) * 6.66}%`,
                                    height: '100%',
                                    width: 1
                                }]} />
                            ))}
                            {/* Draw horizontal lines */}
                            {[...Array(15)].map((_, i) => (
                                <View key={`h-${i}`} style={[styles.gridLine, {
                                    top: `${(i + 1) * 6.66}%`,
                                    width: '100%',
                                    height: 1
                                }]} />
                            ))}

                            <View style={{ backgroundColor: themeMode === 'dark' ? colors.background : colors.highlight, borderRadius: variables.radius.xl, }}>
                                <Image source={logo} style={styles.appIcon} />
                            </View>

                            <View style={styles.cardOverlay} />
                            <View style={styles.textContainer}>
                                <Text style={styles.middleTitle}>{(!isFingerprintEnabled && !isPasswordLockEnabled) ? 'Wisdom' : 'Security'}</Text>
                                <Text style={styles.middleDesc}>{(!isFingerprintEnabled && !isPasswordLockEnabled) ? quotes[Math.floor(Math.random() * quotes.length)]
                                    : 'Authenticate to continue securely'}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Bottom card */}
                <Animated.View style={[
                    styles.bottomCard,
                    { transform: [{ translateY: bottomCardAnimY }] }
                ]}>
                    {isAppLocked && shouldUseLockout() && lockoutMode !== '0' && timeRemaining && !showPasswordInput && (
                        <View style={styles.timeContainer}>
                            <Text style={styles.timeRemaining}>{formatTime(timeRemaining)}</Text>
                            <Text style={styles.timeLabel}>Time Remaining</Text>
                        </View>
                    )}

                    {getAuthButtons()}
                </Animated.View>


                <PasswordPrompt visible={showResetModal} onClose={() => setShowResetModal(false)} onSave={handleResetPasswordSave} currentPassword={password} mode="reset" variables={variables} />
            </View>
        </TouchableWithoutFeedback>
    );
};

export default AuthContext;