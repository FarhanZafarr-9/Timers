import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TextInput, Image, ToastAndroid, Platform, Alert } from 'react-native';
import { useSecurity } from './SecurityContext';
import { useTheme } from '../utils/variables';
import { TouchableOpacity } from 'react-native';
import { Icons } from '../assets/icons';


const showToast = (msg) => {
    if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
        Alert.alert('Error', msg);
    }
};

const AuthComponent = ({ children }) => {

    const { colors } = useTheme();

    const { passwordModalVisible, justSetPassword, setJustSetPassword } = useSecurity();
    const [showPassword, setShowPassword] = useState(false);

    const {
        isFingerprintEnabled,
        authenticate,
        isSensorAvailable,
        loading,
        isPasswordLockEnabled,
        checkPassword,
        password,
    } = useSecurity();
    const [authenticated, setAuthenticated] = useState(false);
    const [input, setInput] = useState('');

    useEffect(() => {
        if (justSetPassword) {
            const timer = setTimeout(() => setJustSetPassword(false), 500);
            return () => clearTimeout(timer);
        }
    }, [justSetPassword, setJustSetPassword]);

    useEffect(() => {
        setInput('');
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
            borderRadius: 20,
            paddingVertical: 10,
            paddingHorizontal: 34,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.highlight + '33',
            borderWidth: 0.75,
            borderColor: colors.highlight + '63',
            marginTop: 12,
        },
        input: {
            backgroundColor: colors.card,
            color: colors.text,
            borderRadius: 20,
            padding: 10,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.border,
            fontSize: 16,
        },
        appIcon: {
            width: 90,
            height: 90,
            borderRadius: 20,
            marginBottom: 12,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 18,
        },
        iconButton: {
            padding: 10,
            borderRadius: 20,
            backgroundColor: colors.highlight + '22',
            marginRight: 10,
            borderWidth: 0.75,
            borderColor: colors.highlight + '63',
        },
    });

    // Handler for fingerprint authentication
    const handleFingerprintAuth = async () => {
        const ok = await authenticate();
        if (ok) {
            setAuthenticated(true);
        } else {
            showToast('Fingerprint authentication failed. Please try again.');
        }
    };

    // Handler for password authentication
    const handlePasswordAuth = () => {
        if (checkPassword(input)) {
            setAuthenticated(true);
            setInput('');
        } else {
            showToast('Incorrect password');
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

    if (!authenticated && (isPasswordLockEnabled || (isFingerprintEnabled && isSensorAvailable))) {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <Image
                        source={require('../assets/logo.png')}
                        style={styles.appIcon}
                    />
                    <Text style={styles.authText}>Authenticate to continue</Text>
                    <View style={styles.row}>
                        {isPasswordLockEnabled ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, backgroundColor: colors.card, borderRadius: 6, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0, backgroundColor: 'transparent', paddingRight: 0 }]}
                                    placeholder="Password"
                                    placeholderTextColor={colors.textDesc}
                                    secureTextEntry={!showPassword}
                                    value={input}
                                    onChangeText={setInput}
                                    onSubmitEditing={handlePasswordAuth}
                                    returnKeyType="done"
                                    onFocus={() => { }}
                                    textContentType="password"
                                    keyboardType="default"
                                    enablesReturnKeyAutomatically={true}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={{ padding: 8 }}>
                                    <Icons.Ion name={showPassword ? 'eye' : 'eye-off'} size={20} color={colors.textDesc} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            isFingerprintEnabled && isSensorAvailable && (
                                <TouchableOpacity
                                    style={[styles.button, { flexDirection: 'row', marginTop: 0 }]}
                                        onPress={handleFingerprintAuth}
                                        activeOpacity={1}
                                >
                                    <Icons.Ion name="finger-print" size={24} color={colors.highlight} style={{ marginRight: 8 }} />
                                    <Text style={{
                                        color: colors.text, fontWeight: 'bold', fontSize: 14,
                                        alignContent: 'center', textAlign: 'center'
                                    }}>Authenticate with Fingerprint</Text>
                                </TouchableOpacity>
                            )
                        )}
                    </View>
                    {isPasswordLockEnabled && (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handlePasswordAuth}
                        >
                            <Text style={{
                                color: colors.text, fontWeight: 'bold', fontSize: 14,
                                alignContent: 'center', textAlign: 'center'
                            }}>Enter</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }

    return children;
};

export default AuthComponent;