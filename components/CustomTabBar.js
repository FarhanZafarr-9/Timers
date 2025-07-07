import React, { useRef, useEffect, useState } from 'react';
import { Icons } from '../assets/icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../utils/ThemeContext';
import { Easing, Dimensions, BackHandler } from 'react-native';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Text,
    Animated,
    ScrollView,
    Platform
} from 'react-native';

const CustomNavigation = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();
    const { variables, colors, navigationMode } = useTheme();
    const { width } = Dimensions.get('window');

    // State for side navigation
    const [sideNavOpen, setSideNavOpen] = useState(false);

    // Animation values
    const sideNavTranslateX = useRef(new Animated.Value(0)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const iconScale = useRef(new Animated.Value(1)).current;
    const highlightAnimations = useRef(
        state.routes.map(() => new Animated.Value(0))
    ).current;

    // Handle back button on Android for side nav
    useEffect(() => {
        if (navigationMode !== 'side') return;

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (sideNavOpen) {
                    closeSideNav();
                    return true;
                }
                return false;
            }
        );

        return () => backHandler.remove();
    }, [sideNavOpen, navigationMode]);

    // Animation effects
    useEffect(() => {
        if (navigationMode === 'side') {
            // Don't animate highlights when side nav is open
            if (sideNavOpen) return;
        }

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
    }, [state.index, sideNavOpen, navigationMode]);

    const openSideNav = () => {
        setSideNavOpen(true);
        Animated.parallel([
            Animated.timing(sideNavTranslateX, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(overlayOpacity, {
                toValue: 0.5,
                duration: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            })
        ]).start();
    };

    const closeSideNav = () => {
        Animated.parallel([
            Animated.timing(sideNavTranslateX, {
                toValue: -width,
                duration: 250,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: 250,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            })
        ]).start(() => setSideNavOpen(false));
    };

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

    const renderTabBar = () => {
        const floating = navigationMode === 'floating';
        const fixed = navigationMode === 'fixed';
        const side = navigationMode === 'side';

        const styles = StyleSheet.create({
            bgContainer: {
                position: 'absolute',
                bottom: floating ? 20 + insets.bottom : fixed ? 0 : undefined,
                left: 0,
                right: 0,
                marginHorizontal: floating ? 40 : 0,
                height: floating ? 45 : fixed ? 60 : 0,
                borderRadius: floating ? variables.radius.md : 0,
                overflow: 'hidden',
                zIndex: 10,
            },
            container: {
                flexDirection: 'row',
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderTopWidth: 0.75,
                borderBottomWidth: floating ? 0.75 : 0,
                borderRightWidth: floating ? 0.75 : 0,
                borderLeftWidth: floating ? 0.75 : 0,
                borderRadius: floating ? variables.radius.md : 0,
                alignItems: 'center',
                height: floating ? 45 : fixed ? 60 : 0,
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
            menuButton: {
                position: 'absolute',
                right: 15,
                top: insets.top + 20,
                zIndex: 20,
            },
        });

        if (side) {
            return (
                <TouchableOpacity
                    onPress={openSideNav}
                    style={styles.menuButton}
                >
                    <Icons.Ion
                        name="menu"
                        size={28}
                        color={colors.text}
                    />
                </TouchableOpacity>
            );
        }

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

    const renderSideNavigation = () => {
        if (navigationMode !== 'side') return null;

        const styles = StyleSheet.create({
            sideNavContainer: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: width * 0.65,
                height: '100%',
                backgroundColor: colors.card,
                borderRightWidth: 1,
                borderRightColor: colors.cardBorder,
                paddingTop: insets.top + 20,
                paddingHorizontal: 15,
                zIndex: 30,
                shadowColor: '#000',
                shadowOffset: { width: 2, height: 0 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
                elevation: 10,
            },
            sideNavHeader: {
                paddingBottom: 20,
                borderBottomWidth: 1,
                borderBottomColor: colors.cardBorder,
                marginBottom: 15,
            },
            sideNavTitle: {
                fontSize: 24,
                fontWeight: 'bold',
                color: colors.text,
            },
            sideNavItem: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 8,
                borderRadius: variables.radius.sm,
                marginBottom: 5,
            },
            sideNavItemActive: {
                backgroundColor: colors.highlight,
            },
            sideNavIcon: {
                marginRight: 15,
            },
            sideNavText: {
                fontSize: 16,
                color: colors.text,
                fontWeight: '500',
            },
            sideNavTextActive: {
                color: colors.background,
            },
            overlay: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: colors.highlight + '20',
                zIndex: 20,
            },
            closeButton: {
                position: 'absolute',
                right: 15,
                top: insets.top + 20,
                zIndex: 40,
            },
        });

        return (
            <>
                <Animated.View
                    style={[styles.overlay, {
                        opacity: overlayOpacity,
                        display: sideNavOpen ? 'flex' : 'none',
                    }]}
                    pointerEvents={sideNavOpen ? 'auto' : 'none'}
                >
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={closeSideNav}
                        activeOpacity={1}
                    />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.sideNavContainer,
                        {
                            transform: [{ translateX: sideNavTranslateX }],
                            display: sideNavOpen ? 'flex' : 'none',
                        }
                    ]}
                >
                    <TouchableOpacity
                        onPress={closeSideNav}
                        style={styles.closeButton}
                    >
                        <Icons.Ion
                            name="close"
                            size={28}
                            color={colors.text}
                        />
                    </TouchableOpacity>

                    <View style={styles.sideNavHeader}>
                        <Text style={styles.sideNavTitle}>Menu</Text>
                    </View>

                    <ScrollView>
                        {state.routes.map((route, index) => {
                            const isFocused = state.index === index;
                            const iconName = getIconName(route.name);

                            const onPress = () => {
                                const event = navigation.emit({
                                    type: 'tabPress',
                                    target: route.key,
                                    canPreventDefault: true,
                                });

                                if (!isFocused && !event.defaultPrevented) {
                                    navigation.navigate(route.name);
                                    closeSideNav();
                                }
                            };

                            return (
                                <TouchableOpacity
                                    key={route.name}
                                    accessibilityRole="button"
                                    onPress={onPress}
                                    style={[
                                        styles.sideNavItem,
                                        isFocused && styles.sideNavItemActive
                                    ]}
                                >
                                    <View style={styles.sideNavIcon}>
                                        <Icons.Ion
                                            name={iconName}
                                            size={22}
                                            color={isFocused ? colors.background : colors.textDesc}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.sideNavText,
                                        isFocused && styles.sideNavTextActive
                                    ]}>
                                        {route.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </Animated.View>
            </>
        );
    };

    return (
        <>
            {renderTabBar()}
            {renderSideNavigation()}
        </>
    );
};

export default CustomNavigation;