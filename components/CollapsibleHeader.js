import React from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { shouldForceCollapsed, MAX_HEADER_HEIGHT, MIN_HEADER_HEIGHT, HEADER_MARGIN_TOP } from '../utils/functions';
import { useTheme } from '../utils/ThemeContext';

export default function CollapsibleHeader({
    icon,
    title,
    scrollY,
    colors,
    pageLength = null,
    borderRadius = 12,
    paddingX = 15
}) {
    const { headerMode, isBorder, variables, border } = useTheme();
    const forceCollapsed = shouldForceCollapsed(pageLength);
    const snapThreshold = 45;

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
            borderRadius: borderRadius,
            borderColor: colors.border,
            marginBottom: headerMode !== 'collapsible' ? 0 : 16,
            marginTop: headerMode === 'fixed' ? 0 : HEADER_MARGIN_TOP,
            overflow: 'hidden',
            alignSelf: 'center',
            backgroundColor: colors.settingBlock,
            flexDirection: 'row',
            alignItems: headerMode === 'fixed' ? 'center' : 'center',
            paddingBottom: headerMode === 'fixed' ? 15 : 0,
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
    });

    if (headerMode === 'minimized') {
        return (
            <View style={[styles.container, { paddingHorizontal: paddingX, paddingBottom: 10 }]}>
                <View
                    style={[
                        styles.header,
                        {
                            height: MIN_HEADER_HEIGHT,
                            width: '100%',
                            paddingHorizontal: 25,
                            borderWidth: border,
                            borderColor: colors.border,
                            top: 0,
                            zIndex: 100,
                            backgroundColor: colors.settingBlock,
                            alignSelf: 'center',
                        },
                    ]}
                >
                    <View style={{ transform: [{ scale: 0.71428 }], justifyContent: 'center', alignItems: 'center' }}>
                        {React.cloneElement(icon, { size: 26, paddingTop: 5 })}
                    </View>
                    <Animated.Text
                        style={[styles.title, { fontSize: 16, marginLeft: 0, color: colors.text }]}
                        numberOfLines={1}
                    >
                        {title}
                    </Animated.Text>
                </View>
            </View>
        );
    }

    else if (headerMode === 'fixed') {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View
                    style={[
                        styles.header,
                        {
                            height: MIN_HEADER_HEIGHT + 15,
                            width: '100%',
                            top: 0,
                            zIndex: 100,
                            backgroundColor: colors.cardLighter,
                            alignSelf: 'center',
                            paddingHorizontal: 25,
                            borderColor: colors.border,
                            borderWidth: border,
                            borderTopWidth: headerMode === 'fixed' ? 0 : border
                        },
                    ]}
                >
                    <View style={{ transform: [{ scale: 0.71428 }], justifyContent: 'center', alignItems: 'center' }}>
                        {React.cloneElement(icon, { size: 24 })}
                    </View>
                    <Animated.Text
                        style={[styles.title, { fontSize: 18, marginLeft: 0, marginBottom: 0, color: colors.text }]}
                        numberOfLines={1}
                    >
                        {title}
                    </Animated.Text>
                </View>
            </View>
        );
    }

    else {
        return (
            <Animated.View
                style={[
                    styles.header,
                    animatedHeaderStyle,
                    {
                        position: 'absolute',
                        borderWidth: animatedBorderWidth,
                        top: 0,
                        zIndex: 100,
                        alignSelf: 'center',
                        backgroundColor: bgColor,
                        paddingHorizontal: 25,
                    },
                ]}
            >
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
            </Animated.View>
        );
    }
}
