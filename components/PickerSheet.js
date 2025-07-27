import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
    Modal,
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    ScrollView
} from 'react-native';
import { Icons } from '../assets/icons';
import { useTheme } from '../utils/ThemeContext';
import { useRenderLogger } from '../utils/functions';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const PickerSheet = ({
    value,
    options,
    onChange,
    placeholder = '...',
    style = {},
    textStyle = {},
    iconColor = '#888',
    colors,
    variables,
    title,
    maxHeight = screenHeight * 0.6,
    pillsPerRow = 2,
    defaultValue = null,
    note
}) => {
    //useRenderLogger(`PickerSheet, ${title}`);
    const [visible, setVisible] = useState(false);
    const [translateY] = useState(new Animated.Value(screenHeight));
    const [opacity] = useState(new Animated.Value(0));
    const { isBorder, headerMode, border } = useTheme();

    const showBottomSheet = () => {
        setVisible(true);
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
            setVisible(false);
        });
    };

    const styles = StyleSheet.create({
        trigger: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: variables.radius.sm,
            paddingVertical: 6,
            paddingHorizontal: 8,
            backgroundColor: colors.highlight + '12',
            borderWidth: border,
            borderColor: colors.border,
            minWidth: 60,
            justifyContent: 'space-between',
        },
        triggerText: {
            fontSize: 16,
            color: colors.text,
        },
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
            maxHeight,
            minHeight: 200,
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
            marginBottom: 8,
        },
        header: {
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderBottomWidth: border,
            borderBottomColor: colors.border,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '500',
            color: colors.text,
        },
        closeButton: {
            padding: 4,
        },
        pillsContainer: {
            padding: 20,
            marginBottom: 0,

            marginVertical: 20
        },
        pillsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        pill: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 8,
            borderWidth: border,
            borderColor: colors.border,
            backgroundColor: colors.cardLighter,
            minHeight: 36,
        },
        selectedPill: {
            backgroundColor: colors.primary || colors.highlight,
            borderColor: colors.primary || colors.highlight,
        },
        pillText: {
            fontSize: 14,
            color: colors.text,
            fontWeight: '500',
            textAlign: 'center',
            flex: 1,
            height: 20,
        },
        selectedPillText: {
            color: colors.background,
            fontWeight: '500',
        },
        pillIcon: {
            marginRight: 6,
        },
        emptyState: {
            padding: 40,
            alignItems: 'center',
            justifyContent: 'center',
        },
        emptyText: {
            fontSize: 16,
            color: colors.text + '80',
            textAlign: 'center',
        },
        actionButtons: {
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 8,
            borderTopWidth: border,
            borderTopColor: colors.border,
            gap: '4%',
        },
        actionButton: {
            width: '48%',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        clearButton: {
            backgroundColor: colors.card,
            borderWidth: border,
            borderColor: colors.border,
        },
        clearButtonText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '500',
        },
        doneButton: {
            backgroundColor: colors.primary || colors.highlight,
        },
        doneButtonText: {
            color: colors.background,
            fontSize: 16,
            fontWeight: '600',
        },
        descContainer: {
            marginTop: 20,
            marginHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: colors.card,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: variables.radius.sm,
            borderWidth: border,
            borderColor: colors.border,
        },
        desc: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.textDesc,
            marginHorizontal: 20,
            lineHeight: 20,
            flexWrap: 'wrap'
        },
    });

    const selectedOption = options.find(opt => opt.value === value);
    const selectedLabel = selectedOption?.label || placeholder;
    const selectedIcon = selectedOption?.icon;
 
    const handlePillPress = useCallback((optionValue) => {
        onChange(optionValue);
    }, [onChange]);

    const handleClear = () => {
        onChange(defaultValue);
    };

    // Memoize the animation values for better performance
    const animationValues = useMemo(() =>
        options.reduce((acc, option) => {
            acc[option.value] = new Animated.Value(1);
            return acc;
        }, {}), [options]);

    // Optimized pill press handler with animation
    const handlePillPressWithAnimation = useCallback((optionValue) => {
        handlePillPress(optionValue);
        const scaleValue = animationValues[optionValue];
        if (scaleValue) {
            scaleValue.setValue(1.08);
            Animated.spring(scaleValue, { toValue: 1, friction: 4, tension: 150, useNativeDriver: true }).start();
        }
    }, [animationValues, handlePillPress]);

    const renderPill = useCallback((option) => {
        const isSelected = value === option.value;
        const scaleValue = animationValues[option.value];

        // Calculate proper pill width based on pillsPerRow
        const pillWidth = pillsPerRow === 1 ? '100%' : `${(100 - (pillsPerRow - 1) * 3) / pillsPerRow}%`;

        return (
            <Animated.View
                key={option.value}
                style={[
                    {
                        transform: [{ scale: scaleValue || 1 }],
                        flex: pillsPerRow === 1 ? 1 : 0,
                        width: pillWidth,
                        marginBottom: 25,
                    }
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.pill,
                        isSelected && styles.selectedPill,
                        {
                            width: '100%',
                            flex: 1,
                        }
                    ]}
                    onPress={() => handlePillPressWithAnimation(option.value)}
                    activeOpacity={0.8}
                >
                    {option.icon && (
                        <View style={styles.pillIcon}>
                            {React.cloneElement(option.icon, {
                                color: isSelected ? colors.background : option.icon.props.color || colors.text,
                                size: option.icon.props.size || 16,
                            })}
                        </View>
                    )}
                    <Text
                        style={[
                            styles.pillText,
                            isSelected && styles.selectedPillText,
                        ]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {option.label}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        );
    }, [value, colors, styles, animationValues, handlePillPressWithAnimation, pillsPerRow]);

    return (
        <>
            <TouchableOpacity
                style={[styles.trigger, style]}
                onPress={showBottomSheet}
                activeOpacity={0.7}
            >
                {selectedIcon ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {React.cloneElement(selectedIcon, { color: selectedIcon.props.color ? selectedIcon.props.color : colors.text })}
                    </View>
                ) : (
                    <Text style={[styles.triggerText, textStyle]}>{selectedLabel}</Text>
                )}
                <Icons.Ion name="chevron-down" size={14} color={iconColor} style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <Modal
                visible={visible}
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
                        style={[
                            styles.bottomSheet,
                            {
                                transform: [{ translateY }],
                            }
                        ]}
                    >
                        <View style={styles.handle} />

                        {title && (
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>{title}</Text>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={hideBottomSheet}
                                    activeOpacity={0.7}
                                >
                                    <Icons.Ion name="close" size={20} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                        )}

                        {selectedOption && selectedOption.description && <View style={styles.descContainer}>
                            <Text style={styles.desc}>
                                Info :  {selectedOption.description}
                            </Text>
                        </View>}

                        <ScrollView
                            style={styles.pillsContainer}
                            showsVerticalScrollIndicator={true}
                            bounces={true}
                        >
                            {options.length > 0 ? (
                                <View style={styles.pillsGrid}>
                                    {options.map(renderPill)}
                                </View>
                            ) : (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>No options available</Text>
                                </View>
                            )}
                        </ScrollView>

                        {note && <View style={[styles.descContainer, { marginTop: 0, marginBottom: 20 }]}>
                            <Text style={styles.desc}>
                                Note :  {note}
                            </Text>
                        </View>}

                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.clearButton]}
                                onPress={handleClear}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.clearButtonText}>Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.doneButton]}
                                onPress={hideBottomSheet}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.doneButtonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </Animated.View>
            </Modal>
        </>
    );
};

export default memo(PickerSheet, (prevProps, nextProps) => {
    return (
        prevProps.value === nextProps.value &&
        prevProps.visible === nextProps.visible &&
        prevProps.colors === nextProps.colors &&
        prevProps.variables === nextProps.variables
    );
});