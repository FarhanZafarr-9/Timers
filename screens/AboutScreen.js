import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import { Icons } from '../assets/icons';
import ScreenWithHeader from '../components/ScreenWithHeder';

export default function AboutScreen() {
    const { variables, colors } = useTheme();

    // Animations
    const topCardAnim = useRef(new Animated.Value(-50)).current;
    const descCardAnim = useRef(new Animated.Value(-50)).current;
    const creditsCardAnim = useRef(new Animated.Value(-50)).current;
    const buttonsAnim = useRef(new Animated.Value(-50)).current;

    // Opacity animations
    const topOpacityAnim = useRef(new Animated.Value(0)).current;
    const descOpacityAnim = useRef(new Animated.Value(0)).current;
    const creditsOpacityAnim = useRef(new Animated.Value(0)).current;
    const buttonsOpacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.stagger(120, [
            Animated.parallel([
                Animated.spring(topCardAnim, {
                    toValue: 0,
                    tension: 80,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(topOpacityAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.spring(descCardAnim, {
                    toValue: 0,
                    tension: 80,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(descOpacityAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.spring(creditsCardAnim, {
                    toValue: 0,
                    tension: 80,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(creditsOpacityAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.spring(buttonsAnim, {
                    toValue: 0,
                    tension: 80,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonsOpacityAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    const handleOpenLink = (url) => {
        Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
    };

    const handleReportBug = () => {
        const email = 'your-email@example.com';
        const subject = 'Bug Report - Timers App';
        const body = 'Please describe the bug you encountered:';
        Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    const styles = StyleSheet.create({
        content: {
            paddingHorizontal: 20,
            gap: 16,
        },
        card: {
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.md,
            padding: 20,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        appIcon: {
            width: 72,
            height: 72,
            borderRadius: variables.radius.md,
            marginRight: 16,
            resizeMode: 'cover',
            borderWidth: 0.75,
            borderColor: colors.cardBorder,
        },
        appName: {
            fontSize: 22,
            color: colors.textTitle,
            fontWeight: 'bold',
        },
        versionText: {
            marginTop: 14,
            fontSize: 14,
            color: colors.textDesc,
            backgroundColor: colors.card,
            textAlign: 'center',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: variables.radius.xs,
            alignSelf: 'flex-start',
        },
        description: {
            color: colors.text,
            fontSize: 14,
            lineHeight: 22,
        },
        quote: {
            color: colors.textSecondary,
            fontSize: 16,
            fontStyle: 'italic',
            borderLeftColor: colors.highlight,
            borderLeftWidth: 3,
            paddingLeft: 8,
            marginVertical: 24,
        },
        credits: {
            textAlign: 'center',
            color: colors.textSecondary,
            fontSize: 14,
        },
        buttonsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
            gap: 12,
        },
        actionButton: {
            flex: 1,
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.sm,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonText: {
            marginLeft: 8,
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            height: 20
        },
    });

    return (
        <ScreenWithHeader
            headerIcon={<Icons.Ion name="information-circle" color={colors.highlight} />}
            headerTitle="About"
            borderRadius={variables.radius.md}
            paddingMargin={20}
            colors={colors}
            paddingX={0}
        >
            <View style={styles.content}>
                {/* Top Card */}
                <Animated.View style={[
                    styles.card,
                    styles.row,
                    {
                        transform: [{ translateY: topCardAnim }],
                        opacity: topOpacityAnim
                    }
                ]}>
                    <Image source={require('../assets/logo.png')} style={styles.appIcon} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.appName}>Timers</Text>
                        <Text style={styles.versionText}>v1.0</Text>
                    </View>
                </Animated.View>

                {/* Description Card */}
                <Animated.View style={[
                    styles.card,
                    {
                        transform: [{ translateY: descCardAnim }],
                        opacity: descOpacityAnim
                    }
                ]}>
                    <Text style={[styles.description, { textAlign: 'justify' }]}>
                        Designed for remembering important moments. Whether you're timing an event or counting down to a special occasion, Timers has you covered.
                        {'\n\n'}As a wise man once said:
                    </Text>
                    <Text style={styles.quote}>"Create what you wish existed."</Text>
                </Animated.View>

                {/* Credits Card */}
                <Animated.View style={[
                    styles.card,
                    {
                        transform: [{ translateY: creditsCardAnim }],
                        opacity: creditsOpacityAnim
                    }
                ]}>
                    <Text style={styles.credits}>Made with ❤️ by Parzival</Text>
                </Animated.View>

                {/* Action Buttons */}
                <Animated.View style={[
                    {
                        transform: [{ translateY: buttonsAnim }],
                        opacity: buttonsOpacityAnim
                    }
                ]}>
                    <View style={styles.buttonsContainer}>
                        {/* GitHub Repo Button */}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleOpenLink('https://github.com/FarhanZafarr-9/Timers')}
                        >
                            <Icons.Ion name="logo-github" size={18} color={colors.text} />
                            <Text style={styles.buttonText}>Repository</Text>
                        </TouchableOpacity>

                        {/* Creator's GitHub Button */}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleOpenLink('https://github.com/FarhanZafarr-9')}
                        >
                            <Icons.Ion name="person" size={18} color={colors.text} />
                            <Text style={styles.buttonText}>Creator</Text>
                        </TouchableOpacity>

                        {/* Report Bug Button */}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleReportBug}
                        >
                            <Icons.Ion name="bug" size={18} color={colors.text} />
                            <Text style={styles.buttonText}>Report Bug</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </ScreenWithHeader>
    );
}