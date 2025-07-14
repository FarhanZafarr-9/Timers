import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import { useSecurity } from '../utils/SecurityContext';

const { height: screenHeight } = Dimensions.get('window');

const getStrength = (password) => {
    if (!password) return { label: '', color: 'gray' };
    if (password.length < 6) return { label: 'Too short', color: '#ef4444' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: 'Weak', color: '#f59e42' };
    if (score === 2) return { label: 'Medium', color: '#fbbf24' };
    if (score >= 3) return { label: 'Strong', color: '#22c55e' };
    return { label: '', color: 'gray' };
};

const generateResetCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export default function PasswordBottomSheet({
    visible,
    onClose,
    onSave,
    currentPassword,
    mode = 'set',
    variables,
}) {
    const { colors, isBorder, headerMode, border } = useTheme();
    const { getResetCode, setResetCodeValue } = useSecurity();

    const [translateY] = useState(new Animated.Value(screenHeight));
    const [opacity] = useState(new Animated.Value(0));

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [enteredResetCode, setEnteredResetCode] = useState('');
    const [error, setError] = useState('');
    const [resetMode, setResetMode] = useState(mode === 'reset');
    const [showResetCode, setShowResetCode] = useState(false);

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const strength = getStrength(newPassword);

    useEffect(() => {
        if (visible) {
            setResetMode(mode === 'reset');
            showBottomSheet();
        } else {
            hideBottomSheet();
        }
    }, [visible, mode]);

    useEffect(() => {
        if (!visible) {
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setEnteredResetCode('');
            setError('');
            setShowResetCode(false);
            setResetMode(mode === 'reset');
        }
    }, [visible, mode]);

    const showBottomSheet = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const hideBottomSheet = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: screenHeight,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: (headerMode === 'fixed' ? colors.settingBlock : colors.background) + '90', // for modals
            justifyContent: 'flex-end',
        },
        bottomSheet: {
            backgroundColor: colors.cardLighter,
            borderTopLeftRadius: variables.radius.lg || 20,
            borderTopRightRadius: variables.radius.lg || 20,
            paddingBottom: 15,
            maxHeight: screenHeight * 0.85,
            borderWidth: border,
            borderColor: colors.border,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: -2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
        },
        handle: {
            width: 40,
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginTop: 12,
            marginBottom: 8,
        },
        header: {
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: border,
            borderBottomColor: colors.border,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        title: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.modalText,
            height: 30
        },
        closeButton: {
            padding: 4,
        },
        content: {
            paddingHorizontal: 20,
            paddingVertical: 20,
        },
        inputGroup: {
            marginBottom: 20,

        },
        inputLabel: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.text,
            marginBottom: 8,
            paddingLeft: 4,
        },
        inputRow: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: border,
            borderRadius: variables.radius.sm,
            borderColor: colors.border,
            backgroundColor: colors.settingBlock,
            paddingHorizontal: 12,
            minHeight: 48,
        },
        input: {
            flex: 1,
            fontSize: 15,
            color: colors.text,
            paddingVertical: 12,
            paddingHorizontal: 4,

        },
        eyeBtn: {
            padding: 8,
            marginLeft: 4,
        },
        strengthContainer: {
            marginTop: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        strengthText: {
            fontSize: 13,
            fontWeight: '500',
        },
        strengthBar: {
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
            flex: 1,
            marginLeft: 12,
            overflow: 'hidden',
        },
        strengthFill: {
            height: '100%',
            borderRadius: 2,
        },
        error: {
            color: '#ef4444',
            fontSize: 13,
            marginBottom: 16,
            textAlign: 'center',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: border,
            borderColor: '#ef4444',
            padding: 12,
            borderRadius: variables.radius.sm,
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
            height: 20
        },
        resetCodeContainer: {
            backgroundColor: colors.settingBlock,
            borderWidth: border,
            borderColor: colors.border,
            borderRadius: variables.radius.sm,
            padding: 16,
            marginBottom: 16,
        },
        resetCodeTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
        },
        resetCodeText: {
            fontSize: 24,
            fontWeight: '700',
            color: colors.highlight,
            textAlign: 'center',
            letterSpacing: 4,
            marginBottom: 12,
            fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        },
        resetCodeWarning: {
            fontSize: 13,
            color: '#f59e42',
            textAlign: 'center',
            fontWeight: '500',
            lineHeight: 18,
        },
        resetCodeInstruction: {
            fontSize: 13,
            color: colors.textDesc,
            textAlign: 'center',
            marginTop: 8,
            lineHeight: 18,
        },
        actionButtons: {
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 8,
            borderTopWidth: border,
            borderTopColor: colors.border,
            gap: 12,
        },
        actionButton: {
            width: '100%',
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: border,
        },
        saveButton: {
            backgroundColor: colors.highlight,
            borderColor: colors.highlight,
        },
        cancelButton: {
            backgroundColor: colors.card,
            borderColor: colors.border,
        },
        saveButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.background,
        },
        cancelButtonText: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
        },
        resetModeInfo: {
            backgroundColor: colors.settingBlock,
            borderWidth: border,
            borderColor: colors.border,
            borderRadius: variables.radius.sm,
            padding: 16,
            marginBottom: 16,
        },
        resetModeTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
        },
        resetModeText: {
            fontSize: 14,
            color: colors.textDesc,
            lineHeight: 20,
        },
    });

    const handleSave = () => {
        setError('');

        if (resetMode) {
            const storedResetCode = getResetCode();
            if (!storedResetCode) {
                setError('No reset code found. Please contact support.');
                return;
            }
            if (enteredResetCode !== storedResetCode) {
                setError('Invalid reset code. Please check and try again.');
                return;
            }
        }

        // For password change mode (not reset), verify current password
        if (mode === 'change' && currentPassword && !resetMode && oldPassword !== currentPassword) {
            setError('Incorrect current password.');
            return;
        }

        // Validate new password fields
        if (!newPassword || !confirmPassword) {
            setError('Please fill all fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (strength.label === 'Too short' || strength.label === 'Weak') {
            setError('Password is too weak. Please use a stronger password.');
            return;
        }

        // Generate a new reset code whenever password is changed
        const newResetCode = generateResetCode();
        setResetCodeValue(newResetCode);
        setResetCode(newResetCode);
        setShowResetCode(true);
    };

    const handleResetCodeAcknowledged = () => {
        setShowResetCode(false);
        onSave(newPassword, resetCode);
        handleClose();
    };

    const handleClose = () => {
        setError('');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setResetCode('');
        setEnteredResetCode('');
        setResetMode(mode === 'reset');
        setShowResetCode(false);
        onClose();
    };

    const handleReset = () => {
        setError('');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setEnteredResetCode('');
        setResetMode(true);
    };

    const getStrengthWidth = () => {
        const score = strength.label;
        if (score === 'Too short' || score === 'Weak') return '25%';
        if (score === 'Medium') return '60%';
        if (score === 'Strong') return '100%';
        return '0%';
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Animated.View style={[styles.overlay, { opacity }]}>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={handleClose}
                        activeOpacity={1}
                    />
                    <Animated.View
                        style={[
                            styles.bottomSheet,
                            {
                                transform: [{ translateY }],
                            }
                        ]}
                    >
                        <View style={styles.handle} />

                        <View style={styles.header}>
                            <Text style={styles.title}>
                                {showResetCode ? 'New Reset Code Generated' :
                                    resetMode ? 'Reset Password' :
                                        (currentPassword ? 'Change Password' : 'Set Password')}
                            </Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={handleClose}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close" size={20} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                            {showResetCode ? (
                                <View style={styles.resetCodeContainer}>
                                    <Text style={styles.resetCodeTitle}>Your New Reset Code</Text>
                                    <Text style={styles.resetCodeText}>{resetCode}</Text>
                                    <Text style={styles.resetCodeWarning}>
                                        ⚠️ IMPORTANT: Save this NEW reset code immediately!
                                    </Text>
                                    <Text style={styles.resetCodeInstruction}>
                                        This new 6-digit code replaces any previous reset codes. It's your only way to reset your password if you forget it.
                                        Write it down and store it in a safe place. This code will only be shown once.
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    {resetMode && (
                                        <>
                                            <View style={styles.resetModeInfo}>
                                                <Text style={styles.resetModeTitle}>Password Reset</Text>
                                                <Text style={styles.resetModeText}>
                                                    Enter your 6-digit reset code to create a new password. If you don't have your reset code, you'll need to contact support.
                                                </Text>
                                            </View>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.inputLabel}>Reset Code</Text>
                                                <View style={styles.inputRow}>
                                                    <TextInput
                                                        style={styles.input}
                                                        placeholder="Enter your 6-digit reset code"
                                                        placeholderTextColor={colors.textDesc}
                                                        value={enteredResetCode}
                                                        onChangeText={setEnteredResetCode}
                                                        keyboardType="numeric"
                                                        maxLength={6}
                                                    />
                                                </View>
                                            </View>
                                        </>
                                    )}

                                    {mode === 'change' && currentPassword && !resetMode && (
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>Current Password</Text>
                                            <View style={styles.inputRow}>
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter current password"
                                                    placeholderTextColor={colors.textDesc}
                                                    secureTextEntry={!showOld}
                                                    value={oldPassword}
                                                    onChangeText={setOldPassword}
                                                />
                                                <TouchableOpacity onPress={() => setShowOld(v => !v)} style={styles.eyeBtn}>
                                                    <Ionicons name={showOld ? 'eye' : 'eye-off'} size={16} color={colors.textDesc} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>New Password</Text>
                                        <View style={styles.inputRow}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter new password"
                                                placeholderTextColor={colors.textDesc}
                                                secureTextEntry={!showNew}
                                                value={newPassword}
                                                onChangeText={setNewPassword}
                                                textContentType="password"
                                                autoComplete="password"
                                            />
                                            <TouchableOpacity onPress={() => setShowNew(v => !v)} style={styles.eyeBtn}>
                                                <Ionicons name={showNew ? 'eye' : 'eye-off'} size={16} color={colors.textDesc} />
                                            </TouchableOpacity>
                                        </View>

                                        {newPassword.length > 0 && (
                                            <View style={styles.strengthContainer}>
                                                <Text style={[styles.strengthText, { color: strength.color }]}>
                                                    {strength.label}
                                                </Text>
                                                <View style={styles.strengthBar}>
                                                    <View
                                                        style={[
                                                            styles.strengthFill,
                                                            {
                                                                backgroundColor: strength.color,
                                                                width: getStrengthWidth()
                                                            }
                                                        ]}
                                                    />
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Confirm Password</Text>
                                        <View style={styles.inputRow}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Confirm new password"
                                                placeholderTextColor={colors.textDesc}
                                                secureTextEntry={!showConfirm}
                                                value={confirmPassword}
                                                onChangeText={setConfirmPassword}
                                                textContentType="password"
                                                autoComplete="password"
                                            />
                                            <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={styles.eyeBtn}>
                                                <Ionicons name={showConfirm ? 'eye' : 'eye-off'} size={16} color={colors.textDesc} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {mode === 'change' && currentPassword && !resetMode && (
                                        <TouchableOpacity style={styles.resetLink} onPress={handleReset}>
                                            <Text style={styles.resetText}>Forgot current password?</Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}

                            {error ? <Text style={styles.error}>{error}</Text> : null}
                        </ScrollView>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.saveButton]}
                                onPress={showResetCode ? handleResetCodeAcknowledged : handleSave}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.saveButtonText}>
                                    {showResetCode ? 'I Have Saved The Code' : 'Save Password'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={handleClose}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}