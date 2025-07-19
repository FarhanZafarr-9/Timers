import React, { useState, useEffect } from 'react';
import {
    Modal,
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions
} from 'react-native';
import { Icons } from '../assets/icons';
import { useTheme } from '../utils/ThemeContext';

const { height: screenHeight } = Dimensions.get('window');

const ConfirmSheet = ({
    visible,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    confirmColor = "#ef4444",
    icon,
    colors,
    variables,
}) => {
    const [translateY] = useState(new Animated.Value(screenHeight));
    const [opacity] = useState(new Animated.Value(0));
    const [isReallyVisible, setIsReallyVisible] = useState(false);
    const { isBorder, headerMode, border } = useTheme();

    useEffect(() => {
        if (visible) {
            setIsReallyVisible(true);
            showBottomSheet();
        } else {
            hideBottomSheet();
        }
    }, [visible]);

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
        ]).start(() => {
            setIsReallyVisible(false);
            onClose();
        });
    };

    const handleConfirm = () => {
        onConfirm();
        hideBottomSheet();
    };

    const handleCancel = () => {
        hideBottomSheet();
    };

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: (headerMode === 'fixed' ? colors.cardLighter : colors.background) + '90', // for modals
            justifyContent: 'flex-end',
        },
        bottomSheet: {
            backgroundColor: colors.settingBlock,
            borderTopLeftRadius: variables.radius.lg || 20,
            borderTopRightRadius: variables.radius.lg || 20,
            paddingBottom: 15,
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
            marginBottom: 20,
        },
        content: {
            paddingHorizontal: 20,
            paddingBottom: 20,
        },
        iconContainer: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: confirmColor + '15',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            marginBottom: 20,
        },
        title: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            textAlign: 'center',
            marginBottom: 8,
        },
        message: {
            fontSize: 16,
            color: colors.text + 'cc',
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 32,
        },
        buttonContainer: {
            gap: 12,
        },
        button: {
            width: '100%',
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: border,
            borderColor: colors.border,
        },
        cancelButton: {
            backgroundColor: colors.card,
            borderColor: colors.border,
        },
        confirmButton: {
            backgroundColor: confirmColor + '15',
            borderColor: confirmColor,
        },
        cancelButtonText: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
        },
        confirmButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: confirmColor,
        },
    });

    return (
        <Modal
            visible={isReallyVisible}
            transparent
            animationType="none"
            onRequestClose={handleCancel}
            statusBarTranslucent
        >
            <Animated.View style={[styles.overlay, { opacity }]}>
                <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={handleCancel}
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

                    <View style={styles.content}>
                        {icon && (
                            <View style={styles.iconContainer}>
                                {typeof icon === 'string' ? (
                                    <Icons.Ion
                                        name={icon}
                                        size={28}
                                        color={confirmColor}
                                    />
                                ) : (
                                    React.cloneElement(icon, {
                                        color: confirmColor,
                                        size: 28
                                    })
                                )}
                            </View>
                        )}

                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton]}
                                onPress={handleConfirm}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.confirmButtonText}>{confirmText}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={handleCancel}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelButtonText}>{cancelText}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

export default ConfirmSheet;