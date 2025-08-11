import { useState, useEffect, useRef, useMemo } from 'react';
import {
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    Dimensions,
    Linking,
    Share
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useTheme } from '../../contexts/ThemeContext';
import BottomSheet from './BottomSheet';
import Switch from '../ui/Switch';

const QRShareSheet = ({
    visible,
    onClose,
    link,
    label = 'Share',
    addMessage,
}) => {
    const [useLinkMode, setUseLinkMode] = useState(false);
    const qrRef = useRef();
    const { colors, border, variables } = useTheme();

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
            const result = await Share.share({
                message: link,
                url: link,
            });

            if (result.action === Share.dismissedAction) {
                return;
            }
        } catch (error) {
            console.error('Built-in share failed, trying expo-sharing:', error);
            try {
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

            await Clipboard.setImageAsync(uri);
            addMessage('QR code copied to clipboard');
        } catch (error) {
            console.error('Failed to copy QR code:', error);

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
        content: {
            paddingHorizontal: 20,
            paddingBottom: 20,
            flex: 1,
        },
        header: {
            paddingBottom: 15,
            marginBottom: 5,
            paddingHorizontal: 5
        },
        headerText: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            height: 22
        },
        toggleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            backgroundColor: colors.settingBlock,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: variables.radius.sm,
            borderWidth: border,
            borderColor: colors.border,
        },
        toggleLabel: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.text,
        },
        linkContainer: {
            minHeight: 250,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
            backgroundColor: colors.highlight + '08',
            borderRadius: variables.radius.md,
            padding: 16,
            borderWidth: border,
            borderColor: colors.border,
        },
        linkText: {
            fontSize: 15,
            textAlign: 'center',
            color: colors.highlight,
            fontWeight: '500',
            lineHeight: 22,
        },
        qrContainer: {
            height: 250,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fefefe',
            borderRadius: variables.radius.md,
            marginBottom: 20,
            borderWidth: border,
            borderColor: colors.border,
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: 10,
            gap: 12,
        },
        actionBtn: {
            flex: 1,
            backgroundColor: colors.highlight + '08',
            borderRadius: variables.radius.md,
            paddingVertical: 12,
            alignItems: 'center',
            borderWidth: border,
            borderColor: colors.border,
        },
        shareBtn: {
            backgroundColor: colors.highlight,
            borderColor: colors.highlight,
        },
        actionText: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        shareText: {
            color: colors.background,
        },
    });

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            snapPoints={[0.55]}
            initialSnapIndex={0}
            backdropOpacity={1}
            enableBackdropDismiss={true}
            enablePanDownToClose={true}
        >

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
                    <TouchableOpacity onPress={() => handleOpenLink(link)} activeOpacity={0.8}>
                        <Text style={styles.linkText}>{link}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View ref={qrRef} collapsable={false} style={styles.qrContainer}>
                    <QRCode value={link} size={180} color='#000000' />
                </View>
            )}

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={handleCopy}
                    activeOpacity={0.8}
                >
                    <Text style={styles.actionText}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.shareBtn]}
                    onPress={handleShare}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.actionText, styles.shareText]}>Share</Text>
                </TouchableOpacity>
            </View>

        </BottomSheet>
    );
};

export default QRShareSheet;