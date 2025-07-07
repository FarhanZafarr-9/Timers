import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    Easing
} from 'react-native';
import WheelPickerExpo from 'react-native-wheel-picker-expo';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const WheelPicker = ({
    visible,
    onClose,
    onSelect,
    selectedValue,
    minValue,
    maxValue,
    title,
    colors,
    formatValue = (val) => val.toString()
}) => {
    const [currentValue, setCurrentValue] = useState(selectedValue);
    const opacity = useRef(new Animated.Value(0)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const [isVisible, setIsVisible] = useState(visible);
    const [initialized, setInitialized] = useState(false);

    const BOTTOM_SHEET_HEIGHT = 380;
    const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;

    const values = [];
    for (let i = minValue; i <= maxValue; i++) values.push(i);

    const initialIndex = values.indexOf(Number(selectedValue));

    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            setCurrentValue(selectedValue);
            showBottomSheet();
        } else {
            hideBottomSheet();
        }
    }, [visible, selectedValue]);

    const showBottomSheet = () => {
        Animated.parallel([
            Animated.timing(backdropOpacity, {
                toValue: 0.5,
                duration: 200,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0, // Position at the bottom of the screen
                duration: 300,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
        ]).start();
        setInitialized(true);
    };

    const hideBottomSheet = () => {
        Animated.parallel([
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: BOTTOM_SHEET_HEIGHT, // Move down by its own height
                duration: 300,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsVisible(false);
            setInitialized(false);
        });
    };

    const handleConfirm = () => {
        onSelect(currentValue);
        onClose();
    };

    const styles = StyleSheet.create({
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: colors.background + '80',
            justifyContent: 'flex-end',
        },
        bottomSheet: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: BOTTOM_SHEET_HEIGHT,
            paddingBottom: 15,
            backgroundColor: colors.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
        },

        handle: {
            width: 40,
            height: 5,
            backgroundColor: colors.border,
            borderRadius: 3,
            alignSelf: 'center',
            marginTop: 8,
            marginBottom: 16,
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.textTitle,
            textAlign: 'center',
            marginBottom: 16,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
            paddingBottom: 8,
        },
        pickerContainer: {
            height: 180,
            marginBottom: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingTop: 12,
        },
        button: {
            flex: 1,
            padding: 14,
            borderRadius: 12,
            alignItems: 'center',
        },
        cancelButton: {
            backgroundColor: colors.cardLighter,
            borderWidth: 1,
            borderColor: colors.border,
        },
        confirmButton: {
            backgroundColor: colors.highlight,
        },
        buttonText: {
            fontSize: 16,
            fontWeight: 'bold',
        },
        cancelButtonText: {
            color: colors.text,
        },
        confirmButtonText: {
            color: colors.cardLighter,
        },
        highlightedItem: {
            position: 'absolute',
            width: '100%',
            height: 40,
            top: 70,
            borderRadius: 6,
            backgroundColor: colors.highlight + '30',
            borderWidth: 1,
            borderColor: colors.highlight,
            zIndex: 1,
        },
    });

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View
                    style={[styles.overlay, { opacity: backdropOpacity }]}
                />
            </TouchableWithoutFeedback>

            <Animated.View
                style={[styles.bottomSheet, {
                    transform: [{ translateY }],
                    opacity,
                }]}
            >
                <View style={styles.handle} />
                <Text style={styles.title}>{title}</Text>

                <View style={styles.pickerContainer}>
                    <View style={styles.highlightedItem} />
                    {initialized && (
                        <WheelPickerExpo
                            height={180}
                            width={200}
                            initialSelectedIndex={initialIndex >= 0 ? initialIndex : 0}
                            items={values.map(val => ({
                                label: formatValue(val),
                                value: val,
                                style: {
                                    fontSize: 18,
                                    fontWeight: '600',
                                    color: colors.text
                                }
                            }))}
                            onChange={({ item }) => setCurrentValue(item.value)}
                            backgroundColor={colors.card}
                            textColor={colors.text}
                            haptics={true}
                            itemHeight={40}
                        />
                    )}
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.confirmButton]}
                        onPress={handleConfirm}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.buttonText, styles.confirmButtonText]}>Confirm</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
};


const WheelPickerInput = ({
    label,
    value,
    onValueChange,
    minValue,
    maxValue,
    colors,
    formatValue = (val) => val.toString(),
    style,
}) => {
    const [showPicker, setShowPicker] = useState(false);
    const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
    const [focus, setFocus] = useState(false);

    useEffect(() => {
        Animated.spring(anim, {
            toValue: (focus || value) ? 1 : 0,
            damping: 15,
            stiffness: 120,
            useNativeDriver: false,
        }).start();
    }, [focus, value]);

    const labelTop = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [14, 4],
    });
    const labelRight = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [12, 6],
    });

    const labelStyle = {
        position: 'absolute',
        right: focus || value ? labelRight : undefined,
        left: focus || value ? undefined : 12,
        top: labelTop,
        fontSize: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [14, 12],
        }),
        color: colors.textDesc,
        backgroundColor: 'transparent',
        paddingHorizontal: 4,
        zIndex: 1,
        fontWeight: 'bold',
        textAlign: 'right',
        height: 20,
        borderRadius: 4,
        overflow: 'hidden',
    };

    return (
        <View style={{ width: '100%', marginBottom: 12, justifyContent: 'flex-end' }}>
            <Animated.Text style={labelStyle}>{label}</Animated.Text>
            <TouchableOpacity
                style={[
                    {
                        backgroundColor: colors.highlight + '10',
                        padding: 12,
                        paddingTop: 18,
                        borderRadius: 8,
                        borderWidth: .75,
                        borderColor: focus ? colors.highlight : 'transparent',
                        minHeight: 45,
                    },
                    style
                ]}
                onPress={() => {
                    setShowPicker(true);
                    setFocus(true);
                }}
                activeOpacity={0.7}
            >
                <Text style={{
                    color: value ? colors.text : colors.textDesc,
                    fontSize: 16,
                    fontWeight: '600',
                }}>
                    {value ? formatValue(value) : `Select ${label}`}
                </Text>
            </TouchableOpacity>

            <WheelPicker
                visible={showPicker}
                onClose={() => {
                    setShowPicker(false);
                    setFocus(false);
                }}
                onSelect={onValueChange}
                selectedValue={value}
                minValue={minValue}
                maxValue={maxValue}
                title={label}
                colors={colors}
                formatValue={formatValue}
            />
        </View>
    );
};

export { WheelPicker, WheelPickerInput };