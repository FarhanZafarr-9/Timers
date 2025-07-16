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
import { MaterialIcons } from '@expo/vector-icons';
import BottomSheetPicker from './BottomSheetPicker';
import { useTheme } from '../utils/ThemeContext';

const { height: screenHeight } = Dimensions.get('window');

const HeaderControlsBottomSheet = ({
    visible,
    onClose,
    onAdd,
    onBatchToggle,
    isSelectable,
    sortValue,
    onSortChange,
    sortOptions,
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

    const handleAdd = () => {
        onAdd();
        hideBottomSheet();
    };

    const handleBatchToggle = () => {
        onBatchToggle();
        hideBottomSheet();
    };

    const handleSortChange = (val) => {
        onSortChange(val);
        hideBottomSheet();
    };

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: (headerMode === 'fixed' ? colors.settingBlock : colors.background) + '90',
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
            shadowOffset: { width: 0, height: -2 },
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
            gap: 16,
        },
        button: {
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: border,
            borderColor: colors.border,
            flexDirection: 'row',
            gap: 8,
        },
        addButton: {
            width: '38%',
            backgroundColor: colors.highlight,
        },
        deleteButton: {
            width: '58%',
            backgroundColor: colors.highlight + '10',
            borderColor: isSelectable ? colors.highlight : colors.border,
        },
        addText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.background,
        },
        deleteText: {
            fontSize: 14,
            fontWeight: '600',
            color: isSelectable ? colors.highlight : colors.text,
        },
        priorityRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: border,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: colors.highlight + '05',
        },
        priorityLabel: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
            maxWidth: 70,
        },
        actionButtons: {
            flexDirection: 'row',
            paddingHorizontal: 0,
            paddingTop: 16,
            paddingBottom: 8,
            borderTopWidth: border,
            borderTopColor: colors.border,
            gap: '4%',
        },
    });

    return (
        <Modal
            visible={isReallyVisible}
            transparent
            animationType="none"
            onRequestClose={hideBottomSheet}
            statusBarTranslucent
        >
            <Animated.View style={[styles.overlay, { opacity }]}>
                <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={hideBottomSheet}
                    activeOpacity={1}
                />
                <Animated.View
                    style={[styles.bottomSheet, { transform: [{ translateY }] }]}
                >
                    <View style={styles.handle} />

                    <View style={styles.content}>
                        {/* Priority Picker Row */}
                        <View style={styles.priorityRow}>
                            <Text style={styles.priorityLabel}>Priority</Text>
                            <BottomSheetPicker
                                value={sortValue}
                                options={sortOptions}
                                onChange={handleSortChange}
                                placeholder="Sort by"
                                colors={colors}
                                variables={variables}
                                defaultValue={"priority"}
                            />
                        </View>

                        <View style={styles.actionButtons}>
                            {/* Batch Delete Toggle */}
                            <TouchableOpacity
                                style={[styles.button, styles.deleteButton]}
                                onPress={handleBatchToggle}
                                activeOpacity={0.8}
                            >
                                <MaterialIcons
                                    name="delete"
                                    size={16}
                                    color={isSelectable ? colors.highlight : colors.text}
                                />
                                <Text style={styles.deleteText}>
                                    {isSelectable ? 'Disable' : 'Enable'} Batch Delete
                                </Text>
                            </TouchableOpacity>

                            {/* Add Button */}
                            <TouchableOpacity
                                style={[styles.button, styles.addButton]}
                                onPress={handleAdd}
                                activeOpacity={0.8}
                            >
                                <MaterialIcons name="add" size={16} color={colors.background} />
                                <Text style={styles.addText}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

export default HeaderControlsBottomSheet;