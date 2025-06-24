import React, { useRef, useEffect, useState } from 'react';
import { Icons } from '../assets/icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../utils/variables';
import { Easing } from 'react-native';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Text,
    Animated,
    Dimensions
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    // Animation values
    const highlightPosition = useRef(new Animated.Value(0)).current;
    const highlightWidth = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const iconScale = useRef(new Animated.Value(1)).current;

    // Tab measurements
    const [tabLayouts, setTabLayouts] = useState({});
    const [containerWidth, setContainerWidth] = useState(0);

    const tabCount = state.routes.length;
    const baseTabWidth = containerWidth / tabCount;

    useEffect(() => {
        const focusedIndex = state.index;
        const focusedLayout = tabLayouts[focusedIndex];

        if (focusedLayout && containerWidth > 0) {
            const targetPosition = focusedLayout.x;
            const targetWidth = focusedLayout.width;

            Animated.parallel([
                Animated.timing(highlightPosition, {
                    toValue: targetPosition,
                    duration: 300,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                    useNativeDriver: false,
                }),
                Animated.timing(highlightWidth, {
                    toValue: targetWidth,
                    duration: 300,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                    useNativeDriver: false,
                }),
                Animated.timing(textOpacity, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(iconScale, {
                    toValue: 0.9,
                    duration: 150,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [state.index, tabLayouts, containerWidth]);

    const handleTabLayout = (index, event) => {
        const { x, width } = event.nativeEvent.layout;
        setTabLayouts(prev => ({
            ...prev,
            [index]: { x, width }
        }));
    };

    const handleContainerLayout = (event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
    };

    const styles = StyleSheet.create({
        bgContainer: {
            position: 'absolute',
            bottom: 20 + insets.bottom,
            left: 0,
            right: 0,
            marginHorizontal: 40,
            height: 45,
            borderRadius: 20,
            overflow: 'hidden',
        },
        container: {
            flexDirection: 'row',
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            borderWidth: 0.5,
            borderRadius: 20,
            alignItems: 'center',
            height: 45,
            position: 'relative',
            paddingHorizontal: 10,
        },
        highlightBackground: {
            position: 'absolute',
            height: 35,
            backgroundColor: colors.highlight,
            borderRadius: 18,
            top: 5,
            borderColor: colors.border,
            borderWidth: 1,
        },
        tab: {
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            zIndex: 2,
        },
        tabContent: {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 12,
            paddingVertical: 6,
        },
        tabText: {
            color: colors.background,
            fontSize: 12,
            fontWeight: 'bold',
            marginHorizontal: 4,
        },
    });

    const getIconName = (routeName) => {
        switch (routeName) {
            case 'Home':
                return 'home';
            case 'Settings':
                return 'settings';
            case 'CountUps':
                return 'arrow-up';
            case 'CountDowns':
                return 'arrow-down';
            case 'About':
                return 'information-circle';
            default:
                return 'ellipse';
        }
    };

    return (
        <View style={styles.bgContainer}>
            <View
                style={styles.container}
                onLayout={handleContainerLayout}
            >
                {/* Animated Highlight Background */}
                <Animated.View
                    style={[
                        styles.highlightBackground,
                        {
                            left: highlightPosition,
                            width: highlightWidth,
                        },
                    ]}
                />

                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;
                    const iconName = getIconName(route.name);

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            // Reset text opacity for smooth transition
                            textOpacity.setValue(0);
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={route.name}
                            accessibilityRole="button"
                            onPress={onPress}
                            style={[
                                styles.tab,
                                {
                                    flex: isFocused ? 1.5 : 1,
                                }
                            ]}
                            onLayout={(event) => handleTabLayout(index, event)}
                        >
                            <View style={styles.tabContent}>
                                <Animated.View
                                    style={{
                                        transform: [{ scale: isFocused ? iconScale : 1 }]
                                    }}
                                >
                                    <Icons.Ion
                                        name={iconName}
                                        size={isFocused ? 22 : 18}
                                        color={isFocused ? colors.background : colors.textDesc}
                                    />
                                </Animated.View>

                                {isFocused && (
                                    <Animated.View
                                        style={{
                                            opacity: textOpacity,
                                            transform: [{
                                                translateX: textOpacity.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [-10, 0],
                                                })
                                            }]
                                        }}
                                    >
                                        <Text
                                            style={styles.tabText}
                                            numberOfLines={1}
                                        >
                                            {route.name.slice(0, 9)}
                                        </Text>
                                    </Animated.View>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default CustomTabBar;