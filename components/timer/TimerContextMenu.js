import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icons } from '../../assets/icons';
import { useTheme } from '../../contexts/ThemeContext';
import BottomSheet from '../sheets/BottomSheet';

const TimerContextMenu = ({
    visible,
    onClose,
    onEdit,
    onDelete,
    onDuplicate,
    onFavourite,
    onShare,
    timer,
}) => {
    const { border, colors, variables } = useTheme();

    const handleAction = useCallback(
        (action) => {
            onClose();
            action();
        },
        [onClose]
    );

    const actions = [
        {
            label: 'Edit',
            icon: <Icons.Material name="edit" size={20} color={colors.highlight} />,
            onPress: onEdit,
            color: colors.text,
        },
        {
            label: 'Duplicate',
            icon: (
                <Icons.Material
                    name="control-point-duplicate"
                    size={20}
                    color={colors.highlight}
                />
            ),
            onPress: onDuplicate,
            color: colors.text,
        },
        {
            label: 'Share',
            icon: <Icons.Material name="share" size={20} color={colors.highlight} />,
            onPress: onShare,
            color: colors.text,
        },
        {
            label: timer.isFavourite ? 'Un-Favourite' : 'Favourite',
            icon: (
                <Icons.Material
                    name={timer.isFavourite ? 'favorite' : 'favorite-border'}
                    size={20}
                    color={colors.highlight}
                />
            ),
            onPress: onFavourite,
            color: colors.text,
        },
        {
            label: 'Delete',
            icon: <Icons.Material name="delete" size={20} color="#ef4444" />,
            onPress: onDelete,
            color: '#ef4444',
        },
    ];

    const styles = StyleSheet.create({
        container: {
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 26,
        },
        actions: {
            gap: 10,
        },
        btn: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: variables.radius.md,
            borderWidth: !border ? 0 : 0.75,
            justifyContent: 'space-between',
            backgroundColor: colors.settingBlock,
        },
        btnText: {
            fontSize: 16,
            fontWeight: '600',
        },
    });

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            snapPoints={[Math.min(0.38, actions.length * 0.10 + 0.2)]}
            initialSnapIndex={0}
            backdropOpacity={1}
            enableBackdropDismiss
            enablePanDownToClose
            closeThreshold={80}
        >

            <View style={styles.actions}>
                {actions.map((action, idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={[styles.btn, { borderColor: colors.border }]}
                        onPress={() => handleAction(action.onPress)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.btnText, { color: action.color }]}>
                            {action.label}
                        </Text>
                        {action.icon}
                    </TouchableOpacity>
                ))}
            </View>
        </BottomSheet>
    );
};

export default memo(TimerContextMenu);
