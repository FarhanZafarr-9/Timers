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
}) {
    const { headerMode } = useTheme();
    const forceCollapsed = shouldForceCollapsed(pageLength);
    const snapThreshold = 45;

    const snappedCollapseAnim = (headerMode === 'fixed' || forceCollapsed)
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
        outputRange: [
            `${colors.background}`,
            `${colors.settingBlock}`,
        ],
    });

    const styles = StyleSheet.create({
        header: {
            borderColor: colors.cardBorder,
            borderRadius: borderRadius,
            marginBottom: 16,
            marginTop: HEADER_MARGIN_TOP,
            paddingHorizontal: 20,
            marginHorizontal: 20,
            overflow: 'hidden',
            alignSelf: 'center',
            backgroundColor: colors.settingBlock,
        },
        row: {
            flexDirection: 'row',
            gap: 12,
            alignItems: 'center',
            flex: 1,
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
            backgroundColor: colors.background,
            height: MAX_HEADER_HEIGHT + HEADER_MARGIN_TOP,
        },
    });

    if (headerMode === 'fixed') {
        return (
            <View style={styles.container}>
                <View
                    style={[
                        styles.header,
                        {
                            height: MIN_HEADER_HEIGHT,
                            width: '75%',
                            borderWidth: 0,
                            top: 0,
                            zIndex: 100,
                            backgroundColor: colors.settingBlock,
                            alignSelf: 'center',
                        },
                    ]}
                >
                    <View style={styles.row}>
                        <View style={{ transform: [{ scale: 0.71428 }], justifyContent: 'center', alignItems: 'center' }}>
                            {React.cloneElement(icon, { size: 26, paddingTop: 5 })}
                        </View>
                        <View>
                            <Animated.Text
                                style={[
                                    styles.title,
                                    {
                                        fontSize: 16,
                                        marginLeft: 0,
                                        color: colors.text,
                                    },
                                ]}
                                numberOfLines={1}
                            >
                                {title}
                            </Animated.Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

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
                },
            ]}
        >
            <View style={styles.row}>
                <Animated.View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                        {React.cloneElement(icon, { size: 26, paddingTop: 5 })}
                    </Animated.View>
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
            </View>
        </Animated.View>
    );
}
