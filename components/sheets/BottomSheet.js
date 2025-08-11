import React, { useEffect, useState, useRef } from 'react';
import {
    Modal,
    StyleSheet,
    View,
    Pressable,
    Dimensions,
    PanResponder,
    Animated,
    TouchableOpacity,
    Easing,
    InteractionManager
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BottomSheet({
    visible,
    onClose,
    children,
    snapPoints = [0.5, 1],
    initialSnapIndex = 0,
    backdropOpacity = 1,
    enableBackdropDismiss = true,
    enablePanDownToClose = true,
    closeThreshold = 100,
    closeVelocity = 1500,
    allowSnapping = true,
    fullFlex
}) {
    const snapFractions = Array.isArray(snapPoints) && snapPoints.length ? snapPoints : [0.5, 1];
    const snapTranslateYs = snapFractions
        .map(p => SCREEN_HEIGHT * (1 - p))
        .sort((a, b) => b - a);

    const initialTranslateY = snapTranslateYs[Math.min(Math.max(initialSnapIndex, 0), snapTranslateYs.length - 1)] ?? snapTranslateYs[0];

    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const sheetOpacity = useRef(new Animated.Value(0)).current;
    const { colors, headerMode } = useTheme();

    const [mounted, setMounted] = useState(false);
    const [readyToAnimate, setReadyToAnimate] = useState(false);
    const isClosing = useRef(false);
    const gestureStartY = useRef(0);
    const currentSnapIndex = useRef(initialSnapIndex);

    const animateTo = (toValue, duration = 250) => {
        Animated.timing(translateY, {
            toValue,
            duration,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true
        }).start();
    };

    const animateOverlay = (toValue, duration = 180) => {
        Animated.timing(overlayOpacity, {
            toValue,
            duration,
            easing: Easing.linear,
            useNativeDriver: true
        }).start();
    };

    const animateOutAndClose = (callParent = true) => {
        if (isClosing.current) return;
        isClosing.current = true;

        animateOverlay(0, 150);
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT,
                duration: 220,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true
            }),
            Animated.timing(sheetOpacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true
            })
        ]).start(() => {
            isClosing.current = false;
            setMounted(false);
            setReadyToAnimate(false);
            if (callParent) onClose?.();
        });
    };

    const animateIn = () => {
        translateY.setValue(SCREEN_HEIGHT);
        overlayOpacity.setValue(0);
        sheetOpacity.setValue(0);
        setMounted(true);

        // 🔹 Wait until RN finishes first render before animating
        InteractionManager.runAfterInteractions(() => {
            setReadyToAnimate(true);
            animateOverlay(1, 180);
            Animated.parallel([
                animateTo(initialTranslateY, 300),
                Animated.timing(sheetOpacity, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true
                })
            ]).start();
        });
    };

    useEffect(() => {
        if (visible) {
            animateIn();
        } else if (mounted) {
            animateOutAndClose(false);
        }
    }, [visible]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                const isVertical = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
                return isVertical && Math.abs(gestureState.dy) > 10;
            },
            onPanResponderGrant: () => {
                gestureStartY.current = translateY.__getValue();
            },
            onPanResponderMove: (evt, gestureState) => {
                let newTranslateY = gestureStartY.current + gestureState.dy;

                if (!allowSnapping && newTranslateY < snapTranslateYs[currentSnapIndex.current]) {
                    newTranslateY = snapTranslateYs[currentSnapIndex.current];
                }
                if (!enablePanDownToClose && newTranslateY < gestureStartY.current) {
                    newTranslateY = gestureStartY.current;
                }
                translateY.setValue(Math.max(0, Math.min(SCREEN_HEIGHT, newTranslateY)));
            },
            onPanResponderRelease: (evt, gestureState) => {
                const releasePos = translateY.__getValue();
                const velocity = gestureState.vy;

                const lastSnapPoint = snapTranslateYs[snapTranslateYs.length - 1];
                const shouldCloseByDistance = enablePanDownToClose && (releasePos > lastSnapPoint + closeThreshold);
                const shouldCloseByVelocity = enablePanDownToClose && velocity > (closeVelocity / 1000) && gestureState.dy > 40;

                if (shouldCloseByDistance || shouldCloseByVelocity) {
                    animateOutAndClose(true);
                    return;
                }

                if (!allowSnapping) {
                    animateTo(snapTranslateYs[currentSnapIndex.current]);
                    return;
                }

                let targetSnapPoint = snapTranslateYs[0];
                let minDistance = Math.abs(releasePos - targetSnapPoint);

                for (let i = 1; i < snapTranslateYs.length; i++) {
                    const distance = Math.abs(releasePos - snapTranslateYs[i]);
                    if (distance < minDistance) {
                        minDistance = distance;
                        targetSnapPoint = snapTranslateYs[i];
                        currentSnapIndex.current = i;
                    }
                }

                animateTo(targetSnapPoint);
            },
        })
    ).current;

    if (!mounted) return null;

    const onBackdropPress = () => {
        if (!enableBackdropDismiss) return;
        animateOutAndClose(true);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'transparent',
        },
        sheet: {
            width: '100%',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: 'hidden',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            minHeight: SCREEN_HEIGHT * 0.15,
            borderColor: colors.border,
            borderWidth: 0.75,
            paddingHorizontal: 20,
            paddingBottom: 20,
        },
        handleWrap: {
            alignItems: 'center',
            paddingTop: 10,
            paddingBottom: 25,
            marginBottom: 10
        },
        handle: {
            width: 50,
            height: 6,
            borderRadius: 6,
            backgroundColor: colors.highlight + '20'
        },
        content: {
            flex: 1,
        }
    });

    return (
        <Modal transparent visible={mounted} animationType="none" onRequestClose={onBackdropPress}>
            <View style={styles.container}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onBackdropPress}>
                    <Animated.View
                        style={[
                            StyleSheet.absoluteFill,
                            {
                                backgroundColor: (headerMode === 'fixed' ? colors.cardLighter : colors.background) + '88',
                                opacity: Animated.multiply(overlayOpacity, backdropOpacity)
                            }
                        ]}
                    />
                </Pressable>

                <Animated.View
                    style={[
                        styles.sheet,
                        {
                            transform: [{ translateY }],
                            height: SCREEN_HEIGHT,
                            backgroundColor: colors.modalBg,
                            opacity: readyToAnimate ? sheetOpacity : 0
                        }
                    ]}
                    {...panResponder.panHandlers}
                >
                    <TouchableOpacity style={styles.handleWrap} {...panResponder.panHandlers} activeOpacity={1}>
                        <View style={styles.handle} />
                    </TouchableOpacity>
                    <View style={styles.content}>
                        <TouchableOpacity activeOpacity={1} style={{ flex: fullFlex ? 1 : 0.5 }}>
                            {children}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}
