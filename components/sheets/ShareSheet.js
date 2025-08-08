import { useState, useEffect, useRef } from 'react';
import {
    Modal,
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    Linking,
    Share
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useTheme } from '../../contexts/ThemeContext';
import Switch from '../ui/Switch';

const { height: screenHeight } = Dimensions.get('window');

const QRShareSheet = ({
    visible,
    onClose,
    link,
    label = 'Share',
    addMessage,
}) => {
    const [translateY] = useState(new Animated.Value(screenHeight));
    const [opacity] = useState(new Animated.Value(0));
    const [isReallyVisible, setIsReallyVisible] = useState(false);
    const [useLinkMode, setUseLinkMode] = useState(false);
    const qrRef = useRef();
    const { colors, border, variables, headerMode } = useTheme();

    useEffect(() => {
        if (visible) {
            setIsReallyVisible(true);
            showSheet();
        } else {
            hideSheet();
        }
    }, [visible]);

    const showSheet = () => {
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

    const hideSheet = () => {
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
        ]).start(() => {
            setIsReallyVisible(false);
            onClose();
        });
    };

    const copyLink = async () => {
        try {
            await Clipboard.setStringAsync(link);
            addMessage('Link copied to clipboard');
        } catch (error) {
            console.error('Failed to copy link:', error);
            addMessage('Failed to copy link');
        }
    };

    const shareLink = async () => {
        try {
            // Try using React Native's built-in Share first
            const result = await Share.share({
                message: link,
                url: link,
            });

            if (result.action === Share.dismissedAction) {
                // User dismissed the share dialog
                return;
            }
        } catch (error) {
            console.error('Built-in share failed, trying expo-sharing:', error);
            try {
                // Fallback to expo-sharing
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(link, {
                        mimeType: 'text/plain',
                        dialogTitle: `Share ${label} Link`,
                    });
                } else {
                    addMessage('Sharing not available on this device');
                }
            } catch (secondError) {
                console.error('Expo sharing also failed:', secondError);
                addMessage('Failed to share link');
            }
        }
    };

    const copyQRToClipboard = async () => {
        try {
            const uri = await captureRef(qrRef, {
                format: 'png',
                quality: 1,
                result: 'base64'
            });

            // Set image to clipboard using base64 string
            await Clipboard.setImageAsync(uri);
            addMessage('QR code copied to clipboard');
        } catch (error) {
            console.error('Failed to copy QR code:', error);

            // Fallback: try copying the link instead
            try {
                await Clipboard.setStringAsync(link);
                addMessage('QR code copy failed, link copied instead');
            } catch (fallbackError) {
                addMessage('Failed to copy QR code');
            }
        }
    };

    const shareQRImage = async () => {
        try {
            const uri = await captureRef(qrRef, {
                format: 'png',
                quality: 1,
                result: 'tmpfile'
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'image/png',
                    dialogTitle: `Share ${label} QR Code`,
                });
            } else {
                addMessage('Sharing not available on this device');
            }
        } catch (error) {
            console.error('Failed to share QR code:', error);
            addMessage('Failed to share QR code');
        }
    };

    const handleCopy = () => {
        if (useLinkMode) copyLink();
        else copyQRToClipboard();
    };

    const handleShare = () => {
        if (useLinkMode) shareLink();
        else shareQRImage();
    };

    const handleLinkModeToggle = (v) => {
        setUseLinkMode(v);
        addMessage(`Link mode ${v ? 'enabled' : 'disabled'}`);
    };

    const handleOpenLink = (url) => {
        Linking.openURL(url).catch(err => {
            console.error("Failed to open URL:", err);
            addMessage('Failed to open link');
        });
    };

    const styles = StyleSheet.create({
        blurOverlay: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: (headerMode === 'fixed' ? colors.cardLighter : colors.background) + '90', // for modals
        },
        sheet: {
            backgroundColor: colors.modalBg,
            borderTopLeftRadius: variables.radius.lg || 20,
            borderTopRightRadius: variables.radius.lg || 20,
            paddingBottom: 20,
            borderWidth: border,
            borderColor: colors.border,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
        },
        handle: {
            width: 40,
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginVertical: 12,
        },
        content: {
            paddingHorizontal: 20,
            alignItems: 'center',
            width: '100%',
        },
        header: {
            width: '100%',
            paddingBottom: 16,
            marginBottom: 16,
            borderBottomWidth: border,
            borderBottomColor: colors.border,
        },
        headerText: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            textAlign: 'center',
            height: 25
        },
        linkContainer: {
            width: '100%',
            minHeight: 80,
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 20,
            backgroundColor: colors.highlight + '08',
            borderRadius: 10,
        },
        linkText: {
            fontSize: 16,
            textAlign: 'center',
            color: colors.highlight,
            fontStyle: 'italic',
            paddingHorizontal: 16,
            height: 25
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: 20,
            gap: 10,
        },
        actionBtn: {
            flex: 1,
            backgroundColor: colors.highlight + '10',
            borderRadius: 10,
            paddingVertical: 12,
            alignItems: 'center',
            borderWidth: border,
            borderColor: colors.border,
        },
        actionText: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
        },
        toggleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: 10,
        },
        toggleLabel: {
            fontSize: 14,
            color: colors.text,
        },
        qrContainer: {
            width: '100%',
            height: 300,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fefefe',
            borderRadius: 10,
        },
    });

    return (
        <Modal
            visible={isReallyVisible}
            transparent
            animationType="none"
            onRequestClose={hideSheet}
            statusBarTranslucent
        >
            <Animated.View style={[styles.blurOverlay, { opacity }]}>
                <TouchableOpacity style={{ flex: 1 }} onPress={hideSheet} activeOpacity={1} />
                <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
                    <View style={styles.handle} />
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.headerText}>Sharing {label} Link</Text>
                        </View>

                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>Use Link Instead of QR</Text>
                            <Switch
                                value={useLinkMode}
                                onValueChange={handleLinkModeToggle}

                            />
                        </View>

                        {useLinkMode ? (
                            <View style={styles.linkContainer}>
                                <TouchableOpacity onPress={() => handleOpenLink(link)} >
                                    <Text style={styles.linkText}>{link}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View ref={qrRef} collapsable={false} style={styles.qrContainer}>
                                <QRCode value={link} size={200} color='#000000' />
                            </View>
                        )}

                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
                                <Text style={styles.actionText}>Copy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: colors.highlight }]}
                                onPress={handleShare}
                            >
                                <Text style={[styles.actionText, { color: colors.background }]}>Share</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </Animated.View>

        </Modal>
    );
};

export default QRShareSheet;