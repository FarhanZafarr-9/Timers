import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import BottomSheet from './BottomSheet';

export const ExtraSheet = ({ children, visible, setVisible, title, num, onClear }) => {
    const { colors, border, variables } = useTheme();

    const handleClose = () => {
        setVisible(false);
    };

    const styles = StyleSheet.create({
        content: {
            padding: 20,
            paddingTop: 0
        },
        titleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            borderBottomWidth: border,
            borderBottomColor: colors.border,
            paddingBottom: 15,
        },
        titleText: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            height: 22
        },
        clearButton: {
            paddingVertical: 6,
            paddingHorizontal: 20,
            borderRadius: variables.radius.lg,
            backgroundColor: colors.highlight + '10',
            borderWidth: 0.5,
            borderColor: colors.border,
        },
        clearButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.highlight,
        },
        contentWrapper: {
            gap: 5,
            overflow: 'hidden',
            borderRadius: 20,
        },
    });

    return (
        <BottomSheet
            visible={visible}
            onClose={handleClose}
            snapPoints={[0.33, 0.43, 0.5]}
            initialSnapIndex={num > 3 ? 2 : num === 3 ? 1 : 0}
            backdropOpacity={1}
            enableBackdropDismiss={true}
            enablePanDownToClose={true}
            closeThreshold={80}
        >
            {title && (
                <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>{title}</Text>
                    {onClear && <TouchableOpacity
                        style={styles.clearButton}
                        onPress={onClear}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>}
                </View>
            )}
            <View style={styles.contentWrapper}>
                {children}
            </View>
        </BottomSheet>
    );
};
