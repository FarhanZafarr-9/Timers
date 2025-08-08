import React, { useRef, useEffect, useMemo } from 'react';
import { Animated, View, StyleSheet, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { shouldForceCollapsed, MAX_HEADER_HEIGHT, MIN_HEADER_HEIGHT, HEADER_MARGIN_TOP } from '../../utils/functions';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavBar } from '../../contexts/NavContext';
import {
    renderGrid,
    renderPolkaDots,
    renderDiagonalLines,
    renderCrossHatch,
    renderNoise,
} from '../../utils/functions';

export default function CollapsingHeader({
    icon,
    title,
    scrollY,
    colors,
    pageLength = null,
    borderRadius = 12,
    paddingX = 15
}) {
    const { headerMode, isBorder, variables, border, fixedBorder, backgroundPattern } = useTheme();
    const forceCollapsed = shouldForceCollapsed(pageLength);
    const snapThreshold = 45;
    const { visible, trigger } = useNavBar();
    const navTranslateY = useRef(new Animated.Value(visible ? 0 : -100)).current;

    const backgroundPatternLayer = useMemo(() => {
        const C = colors.highlight + '10';
        const width = Dimensions.get('window').width;
        const height = headerMode === 'fixed' ? MIN_HEADER_HEIGHT + 15 : MAX_HEADER_HEIGHT + HEADER_MARGIN_TOP;

        switch (backgroundPattern) {
            case 'grid': return renderGrid({ width, height }, C);
            case 'polka': return renderPolkaDots({ width, height }, C);
            case 'diagonal': return renderDiagonalLines({ width, height }, C);
            case 'cross': return renderCrossHatch({ width, height }, C);
            case 'noise': return renderNoise({ width, height }, colors.highlight + '50', 'verylow');
            default: return null;
        }
    }, [backgroundPattern, colors.highlight, headerMode]);

    const snappedCollapseAnim = (headerMode !== 'collapsible' || forceCollapsed)
        ? new Animated.Value(1)
        : scrollY.interpolate({
            inputRange: [0, snapThreshold, snapThreshold + 1],
            outputRange: [0, 1, 1],
            extrapolate: 'clamp',
        });

    const animatedHeaderStyle = {
        height: snappedCollapseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [MAX_HEADER_HEIGHT, MIN_HEADER_HEIGHT],
        }),
        width: snappedCollapseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['90%', '75%'],
        }),
    };

    useEffect(() => {
        if (headerMode !== 'fixed') return;

        Animated.spring(navTranslateY, {
            toValue: visible ? 0 : -100,
            useNativeDriver: true,
            damping: 20,
            stiffness: 100,
        }).start();
    }, [visible, headerMode]);

    const iconScale = snappedCollapseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.71428],
    });

    const titleFontSize = snappedCollapseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [22, 16],
    });

    const titleMarginLeft = snappedCollapseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [15, 0],
    });

    const animatedBorderWidth = snappedCollapseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0],
    });

    const bgColor = snappedCollapseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [`${colors.background}`, `${colors.card}`],
    });

    const styles = StyleSheet.create({
        header: {
            borderRadius: headerMode === 'fixed' ? fixedBorder ? variables.radius.xl : 0 : borderRadius,
            borderColor: colors.border,
            marginBottom: headerMode !== 'collapsible' ? 0 : 16,
            marginTop: headerMode === 'fixed' ? 0 : HEADER_MARGIN_TOP,
            overflow: 'hidden',
            alignSelf: 'center',
            backgroundColor: colors.settingBlock,
            flexDirection: 'row',
            alignItems: headerMode === 'fixed' ? 'flex-end' : 'center',
            paddingBottom: headerMode === 'fixed' ? 5 : 0,
            paddingTop: headerMode === 'fixed' ? 25 : 0,
            gap: 12,
        },
        title: {
            fontWeight: 'bold',
            letterSpacing: 1.5,
        },
        container: {
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            zIndex: 100,
            backgroundColor: headerMode === 'fixed' ? 'transparent' : colors.background,
            height: headerMode === 'fixed' ? MIN_HEADER_HEIGHT + 15 : MAX_HEADER_HEIGHT + HEADER_MARGIN_TOP,
            paddingTop: headerMode === 'fixed' ? 0 : 10,
        },
        backgroundPattern: {
            ...StyleSheet.absoluteFillObject,
            pointerEvents: 'none',
        },
    });

    const handleTouch = () => {
        trigger();
    };

    const renderHeaderContent = () => (
        <>
            <Animated.View style={{ transform: [{ scale: iconScale }], justifyContent: 'center', alignItems: 'center' }}>
                {React.cloneElement(icon, { size: 26, paddingTop: 5 })}
            </Animated.View>
            <Animated.Text
                style={[
                    styles.title,
                    {
                        fontSize: titleFontSize,
                        marginLeft: titleMarginLeft,
                        color: colors.text,
                    },
                ]}
                numberOfLines={1}
            >
                {title}
            </Animated.Text>
        </>
    );

    if (headerMode === 'minimized') {
        return (
            <View style={[styles.container, { paddingHorizontal: paddingX, paddingBottom: 10 }]}>
                {backgroundPatternLayer && (
                    <View style={{
                        ...StyleSheet.absoluteFillObject,
                        zIndex: 0,
                        pointerEvents: 'none',
                    }}>
                        {backgroundPatternLayer}
                    </View>
                )}
                <View
                    style={[
                        styles.header,
                        {
                            height: MIN_HEADER_HEIGHT,
                            width: '100%',
                            paddingHorizontal: 25,
                            borderWidth: border,
                            borderColor: colors.border,
                            backgroundColor: colors.settingBlock,
                        },
                    ]}
                >
                    {renderHeaderContent()}
                </View>
            </View>
        );
    }

    if (headerMode === 'fixed') {
        return (
            <TouchableWithoutFeedback onPressIn={handleTouch} onTouchStart={handleTouch}>
                <View style={styles.container}>
                    {backgroundPatternLayer && (
                        <View
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: MIN_HEADER_HEIGHT + 15,
                                zIndex: 0,
                                pointerEvents: 'none',
                            }}
                        >
                            {backgroundPatternLayer}
                        </View>
                    )}

                    <Animated.View
                        style={{
                            transform: [{ translateY: navTranslateY }],
                            zIndex: 1,
                            width: '100%',
                        }}
                    >
                        <View
                            style={[
                                styles.header,
                                {
                                    height: MIN_HEADER_HEIGHT + 15,
                                    width: '100%',
                                    backgroundColor: colors.cardLighter,
                                    paddingHorizontal: 25,
                                    borderColor: colors.border,
                                    borderWidth: border,
                                    borderTopWidth: 0,
                                },
                            ]}
                        >
                            {renderHeaderContent()}
                        </View>
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    return (
        <View style={{ position: 'relative', zIndex: 10, alignItems: 'center' }}>
            <Animated.View
                style={[
                    styles.header,
                    animatedHeaderStyle,
                    {
                        position: 'absolute',
                        borderWidth: animatedBorderWidth,
                        backgroundColor: bgColor,
                        paddingHorizontal: 25,
                    },
                ]}
            >

                {renderHeaderContent()}
            </Animated.View>
        </View>
    );

}
