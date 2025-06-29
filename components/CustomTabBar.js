import React, { useRef, useEffect } from 'react';
import { Icons } from '../assets/icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../utils/ThemeContext';
import { Easing } from 'react-native';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Text,
    Animated,
} from 'react-native';

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();
    const { variables, colors } = useTheme();

    // Animation values for text, icon, and highlight
    const textOpacity = useRef(new Animated.Value(0)).current;
    const iconScale = useRef(new Animated.Value(1)).current;

    // Create animated values for each tab's highlight
    const highlightAnimations = useRef(
        state.routes.map(() => new Animated.Value(0))
    ).current;

    useEffect(() => {
        // Animate all highlights
        const animations = highlightAnimations.map((animation, index) => {
            return Animated.timing(animation, {
                toValue: state.index === index ? 1 : 0,
                duration: 250,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
                useNativeDriver: false,
            });
        });

        // Animate text and icon for focused tab
        const focusedAnimations = [
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 200,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
                useNativeDriver: true,
            }),
            Animated.timing(iconScale, {
                toValue: 0.9,
                duration: 200,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
                useNativeDriver: true,
            })
        ];

        Animated.parallel([...animations, ...focusedAnimations]).start();
    }, [state.index]);

    const styles = StyleSheet.create({
        bgContainer: {
            position: 'absolute',
            bottom: 20 + insets.bottom,
            left: 0,
            right: 0,
            marginHorizontal: 40,
            height: 45,
            borderRadius: variables.radius.md,
            overflow: 'hidden',
        },
        container: {
            flexDirection: 'row',
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            borderWidth: 0.75,
            borderRadius: variables.radius.md,
            alignItems: 'center',
            height: 45,
            paddingHorizontal: 10,
        },
        tab: {
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            marginHorizontal: 2,
        },
        tabContent: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: variables.radius.circle,
            minHeight: 35,
        },
        activeTabContent: {
            backgroundColor: colors.highlight,
        },
        tabText: {
            color: colors.background,
            fontSize: 12,
            fontWeight: 'bold',
            marginLeft: 6,
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
            <View style={styles.container}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const iconName = getIconName(route.name);
                    const tabCount = state.routes.length;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {

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
                                    flex: isFocused ? 0.5 * tabCount : 1,
                                }
                            ]}
                        >
                            <Animated.View style={[
                                styles.tabContent,
                                isFocused && styles.activeTabContent,
                                {
                                    backgroundColor: highlightAnimations[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['transparent', colors.highlight]
                                    }),
                                    borderColor: highlightAnimations[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['transparent', colors.border]
                                    }),
                                    borderWidth: highlightAnimations[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 1]
                                    })
                                }
                            ]}>
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
                                            }],
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
                            </Animated.View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default CustomTabBar;