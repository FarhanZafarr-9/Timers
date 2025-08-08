import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Icons } from '../../assets/icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { Easing, Dimensions, BackHandler } from 'react-native';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Text,
    Animated,
    ScrollView,
} from 'react-native';
import { useNavBar } from '../../contexts/NavContext';

const NavBar = ({ state, navigation }) => {
    const insets = useSafeAreaInsets();
    const { variables, colors, navigationMode, headerMode, border, fixedBorder } = useTheme();
    const { visible } = useNavBar();
    const { width } = Dimensions.get('window');

    const screenWidth = width;
    const tabCount = state.routes.length;

    const showText = screenWidth > 420 || tabCount < 4;
    const iconSize = screenWidth < 420 ? 18 : 20;

    const [sideNavOpen, setSideNavOpen] = useState(false);

    // Animation values
    const sideNavTranslateX = useRef(new Animated.Value(0)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const iconScale = useRef(new Animated.Value(1)).current;

    const navTranslateY = useRef(new Animated.Value(visible ? 0 : 100)).current;

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

    useEffect(() => {
        if (navigationMode !== 'fixed') return;

        Animated.spring(navTranslateY, {
            toValue: visible ? 0 : 100,
            useNativeDriver: true,
            damping: 20,
            stiffness: 100,
        }).start();
    }, [visible, navigationMode]);

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

    const openSideNav = useCallback(() => {
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
    }, [sideNavTranslateX, overlayOpacity]);

    const closeSideNav = useCallback(() => {
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
    }, [sideNavTranslateX, overlayOpacity, width]);

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

    const renderTabBar = useCallback(() => {
        const floating = navigationMode === 'floating';
        const fixed = navigationMode === 'fixed';
        const side = navigationMode === 'side';

        const styles = StyleSheet.create({
            bgContainer: {
                position: 'absolute',
                bottom: floating ? 20 + insets.bottom : fixed ? 0 : undefined,
                left: 0,
                right: 0,
                marginHorizontal: floating ? 30 : 0,
                height: floating ? 50 : fixed ? 60 : 0,
                borderTopLeftRadius: floating ? variables.radius.xl : 0,
                borderTopRightRadius: floating ? variables.radius.xl : 0,
                borderBottomRightRadius: floating ? variables.radius.xl : 0,
                borderBottomLeftRadius: floating ? variables.radius.xl : 0,
                overflow: 'hidden',
                zIndex: 10,
            },
            container: {
                flexDirection: 'row',
                backgroundColor: floating ? colors.settingBlock : colors.cardLighter,
                borderColor: colors.border,
                borderTopWidth: border,
                borderBottomWidth: floating ? border : 0,
                borderRightWidth: border,
                borderLeftWidth: border,
                borderTopLeftRadius: fixedBorder || floating ? variables.radius.xl : 0,
                borderTopRightRadius: fixedBorder || floating ? variables.radius.xl : 0,
                borderBottomRightRadius: floating ? variables.radius.xl : 0,
                borderBottomLeftRadius: floating ? variables.radius.xl : 0,
                alignItems: 'center',
                height: floating ? 50 : fixed ? 60 : 0,
                paddingHorizontal: 10,
                elevation: 10,
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
                right: headerMode !== 'collapsible' ? 40 : 80,
                top: headerMode === 'fixed' ? insets.top : insets.top + 25,
                zIndex: 20,
            },
        });

        if (side) {
            return (
                <TouchableOpacity
                    onPress={openSideNav}
                    style={styles.menuButton}
                    activeOpacity={1}
                >
                    <Icons.Ion
                        name="menu"
                        size={25}
                        color={colors.text}
                    />
                </TouchableOpacity>
            );
        }

        return (
            <Animated.View style={[styles.bgContainer, { transform: [{ translateY: navTranslateY }] }]}>

                <View style={styles.container}>
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
                                        flex: isFocused ? (showText ? 2 : 1.2) : 1,
                                    }
                                ]}

                                activeOpacity={isFocused ? 1 : 0.75}
                            >
                                <Animated.View style={[
                                    styles.tabContent,
                                    isFocused && styles.activeTabContent,
                                    {
                                        backgroundColor: highlightAnimations[index].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['transparent', colors.highlight + 'f2']
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
                                            size={iconSize}
                                            color={isFocused ? colors.background : colors.textDesc + 'a0'}
                                        />
                                    </Animated.View>

                                    {isFocused && showText && (
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
            </Animated.View>
        );
    });

    const renderSideNavigation = useCallback(() => {
        if (navigationMode !== 'side') return null;

        const styles = StyleSheet.create({
            sideNavContainer: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: width * 0.7,
                height: '100%',
                backgroundColor: colors.card,
                borderTopRightRadius: 18,
                borderBottomRightRadius: 18,
                paddingTop: insets.top + 12,
                borderWidth: border,
                borderColor: colors.border,
                paddingHorizontal: 12,
                zIndex: 30,
                shadowColor: '#000',
                shadowOffset: { width: 3, height: 0 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 12,
            },
            sideNavHeader: {
                paddingBottom: 8,
                marginBottom: 8,
            },
            sideNavTitle: {
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                letterSpacing: -0.2,
            },
            sideNavItem: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 10,
                borderRadius: 10,
                marginBottom: 3,
                position: 'relative',
                overflow: 'hidden',
            },
            sideNavItemActive: {
                backgroundColor: colors.highlight,
            },
            sideNavItemInactive: {
                backgroundColor: colors.card,
            },
            sideNavIcon: {
                marginRight: 10,
                width: 18,
                height: 18,
                alignItems: 'center',
                justifyContent: 'center',
            },
            sideNavText: {
                fontSize: 14,
                color: colors.text,
                fontWeight: '500',
                flex: 1,
            },
            sideNavTextActive: {
                color: colors.background,
                fontWeight: '600',
            },
            sideNavBadge: {
                backgroundColor: colors.highlight,
                borderRadius: 10,
                paddingHorizontal: 6,
                paddingVertical: 2,
                minWidth: 20,
                alignItems: 'center',
                justifyContent: 'center',
            },
            sideNavBadgeText: {
                fontSize: 10,
                color: colors.background,
                fontWeight: '600',
            },
            overlay: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 20,
            },
            closeButton: {
                position: 'absolute',
                right: 12,
                top: insets.top + 12,
                zIndex: 40,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.background + '15',
                alignItems: 'center',
                justifyContent: 'center',
            },
            rippleEffect: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 10,
                opacity: 0.1,
            },
        });

        const allRoutes = [...state.routes];

        return (
            <>
                <Animated.View
                    style={[styles.overlay, { opacity: overlayOpacity, display: sideNavOpen ? 'flex' : 'none' }]}
                    pointerEvents={sideNavOpen ? 'auto' : 'none'}
                >
                    <TouchableOpacity style={{ flex: 1 }} onPress={closeSideNav} activeOpacity={1} />
                </Animated.View>

                <Animated.View
                    style={[styles.sideNavContainer, { transform: [{ translateX: sideNavTranslateX }], display: sideNavOpen ? 'flex' : 'none' }]}
                >
                    <TouchableOpacity onPress={closeSideNav} style={styles.closeButton} activeOpacity={0.7}>
                        <Icons.Ion name="close" size={20} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.sideNavHeader} activeOpacity={1}>
                        <Text style={styles.sideNavTitle}>Menu</Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                        {allRoutes.map((route, index) => {
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
                                        isFocused ? styles.sideNavItemActive : styles.sideNavItemInactive
                                    ]}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.rippleEffect, isFocused && { backgroundColor: colors.background }]} />
                                    <View style={styles.sideNavIcon}>
                                        <Icons.Ion
                                            name={iconName}
                                            size={16}
                                            color={isFocused ? colors.background : colors.textDesc}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.sideNavText,
                                        isFocused && styles.sideNavTextActive
                                    ]}>
                                        {route.name}
                                    </Text>
                                    {route.name === 'Search' && (
                                        <View style={styles.sideNavBadge}>
                                            <Text style={styles.sideNavBadgeText}>New</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </Animated.View>
            </>
        );
    });

    return (
        <>
            {renderTabBar()}
            {renderSideNavigation()}
        </>
    );
};

export default React.memo(NavBar);
