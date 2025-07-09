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
    Platform,
    Image
} from 'react-native';
import BottomProfileSheet from './BottomProfileSheet';
import { useData } from '../utils/DataContext';

const CustomNavigation = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();
    const { variables, colors, navigationMode, headerMode } = useTheme();
    const { userData } = useData();
    const { width } = Dimensions.get('window');

    // State for side navigation
    const [sideNavOpen, setSideNavOpen] = useState(false);

    // State for profile sheet visibility
    const [isProfileSheetVisible, setIsProfileSheetVisible] = useState(false);

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
                right: headerMode === 'fixed' ? 40 : 80,
                top: insets.top + 20,
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
                width: width * 0.7,
                height: '100%',
                backgroundColor: colors.card,
                borderTopRightRadius: 16,
                borderBottomRightRadius: 16,
                paddingTop: insets.top + 16,
                paddingHorizontal: 16,
                zIndex: 30,
                shadowColor: '#000',
                shadowOffset: { width: 3, height: 0 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 12,
            },
            sideNavHeader: {
                paddingBottom: 16,
                marginBottom: 12,
                position: 'relative',
            },
            sideNavTitle: {
                fontSize: 22,
                fontWeight: '700',
                color: colors.text,
                letterSpacing: -0.3,
            },
            sideNavSubtitle: {
                fontSize: 13,
                color: colors.textDesc,
                marginTop: 2,
                opacity: 0.7,
                height: 20
            },
            sideNavItem: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 12,
                marginBottom: 4,
                marginHorizontal: 4,
                position: 'relative',
                overflow: 'hidden',
            },
            sideNavItemActive: {
                backgroundColor: colors.highlight,
                transform: [{ scale: 1.02 }],
            },
            sideNavItemInactive: {
                backgroundColor: colors.card,
            },
            sideNavIcon: {
                marginRight: 12,
                width: 18,
                height: 18,
                alignItems: 'center',
                justifyContent: 'center',
            },
            sideNavText: {
                fontSize: 15,
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
                right: 16,
                top: insets.top + 16,
                zIndex: 40,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.background + '15',
                alignItems: 'center',
                justifyContent: 'center',
            },
            divider: {
                height: 1,
                backgroundColor: colors.cardBorder,
                marginVertical: 12,
                marginHorizontal: 4,
                opacity: 0.3,
            },
            sectionTitle: {
                fontSize: 11,
                fontWeight: '600',
                color: colors.textDesc,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 8,
                marginTop: 4,
                paddingHorizontal: 12,
            },
            rippleEffect: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 12,
                opacity: 0.1,
            },
            footerSection: {
                marginTop: 'auto',
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: colors.cardBorder,
            },
            userProfile: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 12,
                backgroundColor: colors.background,
                marginHorizontal: 4,
                marginBottom: 16,
            },
            userAvatar: {
                width: 40,
                height: 40,
                borderRadius: 6,
                backgroundColor: userData.profilePic ? 'transparent' : colors.highlight,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
            },
            userInfo: {
                flex: 1,
            },
            userName: {
                fontSize: 14,
                fontWeight: '500',
                color: colors.text,
            },
            userStatus: {
                fontSize: 11,
                color: colors.textDesc,
                opacity: 0.7,
            },
            avatar: {
                width: '100%',
                height: '100%',
                borderRadius: 8,
            },
        });

        // Main navigation routes
        const mainRoutes = state.routes.filter(route =>
            ['Home', 'Search', 'Favorites', 'Profile'].includes(route.name)
        );

        // Secondary routes
        const secondaryRoutes = state.routes.filter(route =>
            !['Home', 'Search', 'Favorites', 'Profile'].includes(route.name)
        );

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
                    style={[styles.sideNavContainer,
                    {
                        transform: [{ translateX: sideNavTranslateX }],
                        display: sideNavOpen ? 'flex' : 'none',
                    }
                    ]}
                >
                    <TouchableOpacity
                        onPress={closeSideNav}
                        style={styles.closeButton}
                        activeOpacity={0.7}
                    >
                        <Icons.Ion
                            name="close"
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>

                    <View style={styles.sideNavHeader}>
                        <Text style={styles.sideNavTitle}>Menu</Text>
                        <Text style={styles.sideNavSubtitle}>Navigate your app</Text>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={{ flex: 1 }}
                    >
                        <Text style={styles.sectionTitle}>Main</Text>
                        {mainRoutes.map((route, index) => {
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

                        {secondaryRoutes.length > 0 && (
                            <>
                                <View style={styles.divider} />
                                <Text style={styles.sectionTitle}>More</Text>
                                {secondaryRoutes.map((route, index) => {
                                    const isFocused = state.routes.indexOf(route) === state.index;
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
                                                    size={18}
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
                            </>
                        )}
                    </ScrollView>

                    <View style={styles.footerSection}>
                        <TouchableOpacity style={styles.userProfile} activeOpacity={1}>
                            <View style={styles.userAvatar}>
                                {!userData.profilePic && <Icons.Ion
                                    name="person"
                                    size={16}
                                    color={colors.background}
                                />}
                                {userData.profilePic && (
                                    <Image source={{ uri: userData.profilePic }} style={styles.avatar} />
                                )}
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{userData.name}</Text>
                                <Text style={styles.userStatus}>{userData.profession}</Text>
                            </View>
                            <Icons.Ion
                                name="settings-outline"
                                size={18}
                                color={colors.textDesc}
                                onPress={() => { setIsProfileSheetVisible(true) }}
                            />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </>
        );
    };

    return (
        <>
            {renderTabBar()}
            {renderSideNavigation()}
            <BottomProfileSheet visible={isProfileSheetVisible} onClose={() => setIsProfileSheetVisible(false)} colors={colors} variables={variables} />
        </>
    );
};

export default CustomNavigation;