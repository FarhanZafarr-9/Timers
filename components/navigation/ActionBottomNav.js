import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

const { height: screenHeight } = Dimensions.get('window');

const ActionBottomNav = ({
    visible,
    onClose,
    onAdd,
    onBatchToggle,
    isSelectable,
    sortValue,
    onSortChange,
    sortOptions = [],

}) => {
    const insets = useSafeAreaInsets();
    const { border, fixedBorder, colors,
        variables, } = useTheme();

    const translateY = useRef(new Animated.Value(screenHeight)).current;

    const [priorityIndex, setPriorityIndex] = useState(() => {
        const index = sortOptions.findIndex(option => option.value === sortValue);
        return index >= 0 ? index : 0;
    });

    useEffect(() => {
        const index = sortOptions.findIndex(option => option.value === sortValue);
        if (index >= 0) {
            setPriorityIndex(index);
        }
    }, [sortValue, sortOptions]);

    useEffect(() => {
        Animated.spring(translateY, {
            toValue: visible ? -80 : screenHeight,
            useNativeDriver: true,
            damping: 30,
            stiffness: 200,
        }).start();
    }, [visible]);

    const handleCyclePriority = () => {
        if (sortOptions.length === 0) return;

        const next = (priorityIndex + 1) % sortOptions.length;
        setPriorityIndex(next);
        const selectedOption = sortOptions[next];
        onSortChange?.(selectedOption.value);
    };

    const handleAdd = () => {
        onAdd?.();
    };

    const handleBatchToggle = () => {
        onBatchToggle?.();
    };

    const getCurrentSortOption = () => {
        if (sortOptions.length === 0) return { label: 'Priority', value: 'priority' };
        return sortOptions[priorityIndex] || sortOptions[0];
    };

    const currentOption = getCurrentSortOption();

    const styles = StyleSheet.create({
        animatedWrapper: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            elevation: 10,
        },
        bgContainer: {
            marginHorizontal: 30,
            marginBottom: 20 + insets.bottom,
            borderRadius: variables.radius.xl,
            overflow: 'hidden',
        },
        container: {
            backgroundColor: colors.settingBlock,
            borderColor: colors.border,
            borderWidth: border,
            borderRadius: variables.radius.xl,
            paddingHorizontal: 16,
            paddingVertical: 16,
        },
        content: {
            justifyContent: 'space-between',
        },
        priorityRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.highlight,
            borderRadius: variables.radius.circle,
            paddingHorizontal: 16,
            paddingVertical: 8,
            minHeight: 35,
        },
        priorityLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            gap: 8,
        },
        priorityLabel: {
            color: colors.background,
            fontSize: 12,
            fontWeight: 'bold',
        },
        priorityValue: {
            color: colors.background,
            fontSize: 12,
            fontWeight: 'bold',
            marginLeft: 4,
        },
        actionButtons: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginTop: 8,
        },
        actionBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: variables.radius.circle,
            minHeight: 35,
            gap: 6,
            flex: 1,
        },
        batchBtn: {
            backgroundColor: colors.highlight + `${isSelectable ? 'ee' : '10'}`,
            borderWidth: isSelectable ? 0 : 1,
            borderColor: colors.border,
        },
        addBtn: {
            backgroundColor: colors.highlight,
            flex: 0.6,
        },
        batchText: {
            fontSize: 12,
            fontWeight: 'bold',
            color: isSelectable ? colors.background : colors.textDesc,
        },
        addText: {
            fontSize: 12,
            fontWeight: 'bold',
            color: colors.background,
        },
    });

    return (
        <Animated.View style={[styles.animatedWrapper, { transform: [{ translateY }] }]}>
            <View style={styles.bgContainer}>
                <View style={styles.container}>
                    <View style={styles.content}>
                        <TouchableOpacity
                            style={styles.priorityRow}
                            onPress={handleCyclePriority}
                            activeOpacity={0.75}
                        >
                            <View style={styles.priorityLeft}>
                                {React.cloneElement(currentOption.icon || <MaterialIcons name="flag" size={16} />, {
                                    color: colors.background,
                                    size: 16,
                                })}
                                <Text style={styles.priorityLabel}>Sort:</Text>
                                <Text style={styles.priorityValue}>{currentOption.label}</Text>
                            </View>
                            <MaterialIcons
                                name="swap-vert"
                                size={16}
                                color={colors.background}
                            />
                        </TouchableOpacity>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.batchBtn]}
                                onPress={handleBatchToggle}
                                activeOpacity={0.75}
                            >
                                <MaterialIcons
                                    name="delete"
                                    size={16}
                                    color={isSelectable ? colors.background : colors.textDesc}
                                />
                                <Text style={styles.batchText}>
                                    {isSelectable ? 'Disable' : 'Enable'} Batch
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionBtn, styles.addBtn]}
                                onPress={handleAdd}
                                activeOpacity={0.75}
                            >
                                <MaterialIcons name="add" size={16} color={colors.background} />
                                <Text style={styles.addText}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};

export default ActionBottomNav;
