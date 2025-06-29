import { useState } from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity, StyleSheet } from 'react-native';
// If you use Expo, you can use @expo/vector-icons
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';

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

export default function PasswordModal({
    visible,
    onClose,
    onSave,
    currentPassword,
    mode = 'set',
    variables,
}) {

    const { colors } = useTheme();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [resetMode, setResetMode] = useState(false);

    // Password visibility toggles
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const strength = getStrength(newPassword);

    const styles = StyleSheet.create({
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            backgroundColor: colors.background + 'da',
            justifyContent: 'center',
            alignItems: 'center',
        },
        card: {
            width: 320,
            borderRadius: 20,
            padding: 22,
            gap: 10,
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 16,
            textAlign: 'center',
        },
        inputRow: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 0.75,
            borderRadius: variables.radius.sm,
            borderColor: colors.border,
            backgroundColor: colors.settingBlock,
            paddingHorizontal: 8,
        },
        input: {
            padding: 10,
            fontSize: 15,
            borderWidth: 0,
            flex: 1,
        },
        eyeBtn: {
            marginLeft: 0,
            padding: 4,
        },
        strengthRow: {
            marginBottom: 8,
            alignItems: 'flex-end',
        },
        error: {
            color: '#ef4444',
            fontSize: 13,
            marginBottom: 8,
            textAlign: 'center',
            backgroundColor: 'rgba(239, 68, 68, 0.18)',
            borderWidth: 0.5,
            borderColor: '#ef4444',
            padding: 10,
            borderRadius: variables.radius.sm,
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 15,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingTop: 20,
        },
        btn: {
            borderRadius: variables.radius.sm,
            paddingVertical: 8,
            paddingHorizontal: 18,
            marginHorizontal: 4,
        },
        btnText: {
            fontSize: 15,
            fontWeight: 'bold',
        },
    });

    const handleSave = () => {
        setError('');
        if (mode === 'change' && currentPassword && !resetMode && oldPassword !== currentPassword) {
            setError('Incorrect current password.');
            return;
        }
        if (!newPassword || !confirmPassword) {
            setError('Please fill all fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (strength.label === 'Too short' || strength.label === 'Weak') {
            setError('Password is too weak.');
            return;
        }
        onSave(newPassword);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setResetMode(false);
    };

    const handleClose = () => {
        setError('');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setResetMode(false);
        onClose();
    };

    const handleReset = () => {
        setError('');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setResetMode(true);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: colors.cardLighter }]}>
                    <Text style={[styles.title, { color: colors.modalText }]}>
                        {resetMode ? 'Reset Password' : (currentPassword ? 'Change Password' : 'Set Password')}
                    </Text>
                    {mode === 'change' && currentPassword && !resetMode && (
                        <View style={styles.inputRow}>

                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                placeholder="Current Password"
                                placeholderTextColor={colors.textDesc}
                                secureTextEntry={!showOld}
                                value={oldPassword}
                                onChangeText={setOldPassword}
                            />
                            <TouchableOpacity onPress={() => setShowOld(v => !v)} style={styles.eyeBtn}>
                                <Ionicons name={showOld ? 'eye' : 'eye-off'} size={16} color={colors.textDesc} />
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={styles.inputRow}>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="New Password"
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

                    {newPassword.length > 0 && <View style={styles.strengthRow}>
                        <Text style={{ color: strength.color, fontWeight: 'bold', fontSize: 13 }}>
                            {strength.label}
                        </Text>
                    </View>}

                    <View style={styles.inputRow}>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Confirm Password"
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

                    {error ? <Text style={styles.error}>{error}</Text> : null}
                    <View style={styles.actions}>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.highlight + '10' }]} onPress={handleClose}>
                            <Text style={[styles.btnText, { color: colors.text + 'f0' }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.highlight, width: '60%', justifyContent: 'center', alignItems: 'center' }]} onPress={handleSave}>
                            <Text style={[styles.btnText, { color: colors.background }]}>Save</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
}
