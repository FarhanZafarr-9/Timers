import React from 'react';
import {
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { Icons } from '../../assets/icons';
import { useTheme } from '../../contexts/ThemeContext';
import BottomSheet from './BottomSheet'; // Import the new Animated BottomSheet

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
}) => {
    const { border } = useTheme();

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const styles = StyleSheet.create({
        content: {
            paddingHorizontal: 20,
            paddingBottom: 30,
            paddingTop: 10,
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
            backgroundColor: colors.highlight + '08',
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

    // Custom BottomSheet with theme-aware styling
    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            snapPoints={[0.4]}
            initialSnapIndex={0}
            backdropOpacity={1}
            enableBackdropDismiss={true}
            enablePanDownToClose={true}
            closeThreshold={80}
        >

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
                    style={[styles.button, styles.cancelButton]}
                    onPress={onClose}
                    activeOpacity={0.7}
                >
                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={handleConfirm}
                    activeOpacity={0.7}
                >
                    <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </TouchableOpacity>

            </View>
        </BottomSheet>
    );
};

export default ConfirmSheet;