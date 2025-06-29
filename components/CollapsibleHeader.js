import React from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { shouldForceCollapsed, MAX_HEADER_HEIGHT, MIN_HEADER_HEIGHT, HEADER_MARGIN_TOP } from '../utils/functions';

export default function CollapsibleHeader({
    icon,
    title,
    scrollY,
    colors,
    pageLength = null,
    borderRadius = 12,
}) {

    const forceCollapsed = shouldForceCollapsed(pageLength);
    const snapThreshold = 45;

    const snappedCollapseAnim = forceCollapsed
        ? new Animated.Value(1)
        : scrollY.interpolate({
            inputRange: [0, snapThreshold, snapThreshold + 1],
            outputRange: [0, 1, 1],
            extrapolate: 'clamp',
        });

    // Animate header height
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

    // Animate icon size
    const iconScale = snappedCollapseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.71428], // 20/28 = 0.7142857142857143
    });

    // Animate title font size
    const titleFontSize = snappedCollapseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [22, 16],
    });

    // Animate title marginLeft (moves right as header collapses)
    const titleMarginLeft = snappedCollapseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [15, 0],
    });

    // Animate background opacity (0 = transparent, 1 = fully visible)
    const bgOpacity = snappedCollapseAnim.interpolate({
        inputRange: [0.8, 1], // Only start appearing near collapsed
        outputRange: [0, 0.9],
        extrapolate: 'clamp',
    });

    // Animate borderWidth: 0 when expanded, 0.75 when collapsed
    const animatedBorderWidth = snappedCollapseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0],
    });

    const bgColor = snappedCollapseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [
            `${colors.background}`, // fully transparent (adjust for dark mode if needed)
            `${colors.settingBlock}`, // mostly opaque
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
    });

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
