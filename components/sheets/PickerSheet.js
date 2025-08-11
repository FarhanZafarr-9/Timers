import React, { useState, useCallback, useMemo, memo } from 'react';
import {
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    ScrollView
} from 'react-native';
import { Icons } from '../../assets/icons';
import { useTheme } from '../../contexts/ThemeContext';
import BottomSheet from './BottomSheet';

const { height: screenHeight } = Dimensions.get('window');

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
    hideLabel,
    note,
    disabled,
}) => {

    const [visible, setVisible] = useState(false);
    const { border } = useTheme();

    const showBottomSheet = () => setVisible(true);
    const hideBottomSheet = () => setVisible(false);

    const calculateSnapPoints = useMemo(() => {
        if (options.length === 0) return [0.3];
        const rows = Math.ceil(options.length / pillsPerRow);
        const pillHeight = 36 + 25;
        const headerHeight = title ? 60 : 0;
        const actionButtonsHeight = 60;
        const handleHeight = 20;
        const descHeight = (note || hideLabel) ? 60 : 0;
        const selectedDescHeight = (options.find(opt => opt.value === value)?.description) ? 60 : 0;
        const padding = 40;

        const totalContentHeight =
            headerHeight +
            rows * pillHeight +
            actionButtonsHeight +
            handleHeight +
            descHeight +
            selectedDescHeight +
            padding;

        const minSnapPoint = Math.max(0.3, Math.min(0.5, totalContentHeight / screenHeight));
        const maxSnapPoint = Math.max(0.6, Math.min(0.9, (totalContentHeight + 100) / screenHeight));

        return [minSnapPoint, maxSnapPoint];
    }, [options.length, pillsPerRow, title, note, hideLabel, value]);

    const styles = StyleSheet.create({
        trigger: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: variables.radius.lg,
            paddingVertical: 6,
            paddingHorizontal: 8,
            backgroundColor: colors.highlight + '10',
            borderWidth: border,
            borderColor: colors.border,
            minWidth: 60,
            justifyContent: 'space-between',
        },
        triggerText: {
            fontSize: 16,
            color: colors.text,
        },
        content: {
            paddingHorizontal: 20,
            paddingBottom: 20,
            flex: 1,
        },
        header: {
            paddingBottom: 15,
            borderBottomWidth: 1.5,
            borderBottomColor: colors.border,
            marginBottom: 15,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
        },
        clearButton: {
            paddingVertical: 6,
            paddingHorizontal: 18,
            backgroundColor: colors.highlight + '08',
            borderWidth: 0.57,
            borderColor: colors.border,
            borderRadius: variables.radius.lg,
        },
        clearButtonText: {
            color: colors.text,
            fontSize: 14,
            fontWeight: '500',
        },
        pillsContainer: {
            flex: 1,
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
        // New modern description styles
        descContainer: {
            marginBottom: 15,
            paddingVertical: 14,
            paddingHorizontal: 16,
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.sm,
            borderWidth: border,
            borderColor: colors.border,
            position: 'relative',
            minHeight: 48,
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            elevation: 2,
        },
        descPill: {
            position: 'absolute',
            top: -12,
            left: 12,
            backgroundColor: colors.highlight,
            paddingHorizontal: 10,
            paddingVertical: 3,
            borderRadius: 999,
            borderWidth: border,
            borderColor: colors.border,
        },
        descPillText: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.background,
        },
        descText: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.textDesc,
            textAlignVertical: 'center',
            height: 18
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

    const animationValues = useMemo(
        () =>
            options.reduce((acc, option) => {
                acc[option.value] = new Animated.Value(1);
                return acc;
            }, {}),
        [options]
    );

    const handlePillPressWithAnimation = useCallback(
        (optionValue) => {
            handlePillPress(optionValue);
            const scaleValue = animationValues[optionValue];
            if (scaleValue) {
                scaleValue.setValue(1.08);
                Animated.spring(scaleValue, {
                    toValue: 1,
                    friction: 4,
                    tension: 150,
                    useNativeDriver: true,
                }).start();
            }
        },
        [animationValues, handlePillPress]
    );

    const renderPill = useCallback(
        (option) => {
            const isSelected = value === option.value;
            const scaleValue = animationValues[option.value];
            const pillWidth =
                pillsPerRow === 1 ? '100%' : `${(100 - (pillsPerRow - 1) * 3) / pillsPerRow}%`;

            return (
                <Animated.View
                    key={option.value}
                    style={{
                        transform: [{ scale: scaleValue || 1 }],
                        flex: pillsPerRow === 1 ? 1 : 0,
                        width: pillWidth,
                        marginBottom: 25,
                    }}
                >
                    <TouchableOpacity
                        style={[styles.pill, isSelected && styles.selectedPill]}
                        onPress={() => handlePillPressWithAnimation(option.value)}
                        activeOpacity={0.8}
                    >
                        {option.icon && (
                            <View style={styles.pillIcon}>
                                {React.cloneElement(option.icon, {
                                    color: isSelected
                                        ? colors.background
                                        : option.icon.props.color || colors.text,
                                    size: option.icon.props.size || 16,
                                })}
                            </View>
                        )}
                        {!hideLabel && (
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
                        )}
                    </TouchableOpacity>
                </Animated.View>
            );
        },
        [value, colors, styles, animationValues, handlePillPressWithAnimation, pillsPerRow]
    );

    return (
        <>
            <TouchableOpacity
                style={[styles.trigger, style]}
                onPress={() => !disabled && showBottomSheet()}
                activeOpacity={disabled ? 1 : 0.7}
            >
                {selectedIcon ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {React.cloneElement(selectedIcon, {
                            color: selectedIcon.props.color
                                ? selectedIcon.props.color
                                : colors.text,
                        })}
                    </View>
                ) : (
                    <Text style={[styles.triggerText, textStyle]}>{selectedLabel}</Text>
                )}
                <Icons.Ion name="chevron-down" size={14} color={iconColor} style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <BottomSheet
                visible={visible}
                onClose={hideBottomSheet}
                snapPoints={calculateSnapPoints}
                initialSnapIndex={0}
                backdropOpacity={1}
                enableBackdropDismiss={true}
                enablePanDownToClose={true}
            >

                {title && (
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{title}</Text>
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={handleClear}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.clearButtonText}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {selectedOption && selectedOption.description && !(note || hideLabel) && (
                    <View style={styles.descContainer}>
                        <View style={styles.descPill}>
                            <Text style={styles.descPillText}>Info</Text>
                        </View>
                        <Text style={styles.descText}>{selectedOption.description}</Text>
                    </View>
                )}

                {(note || hideLabel) && (
                    <View style={styles.descContainer}>
                        <View style={styles.descPill}>
                            <Text style={styles.descPillText}>
                                {note ? 'Note' : 'Selected option'}
                            </Text>
                        </View>
                        <Text style={styles.descText}>
                            {note ? note : selectedLabel}
                        </Text>
                    </View>
                )}

                <ScrollView
                    style={styles.pillsContainer}
                    showsVerticalScrollIndicator={true}
                    bounces={true}
                    contentContainerStyle={{ paddingBottom: 20 }}
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
            </BottomSheet>
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
