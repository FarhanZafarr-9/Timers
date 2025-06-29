import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import { Icons } from '../assets/icons';
import ScreenWithHeader from '../components/ScreenWithHeder';

export default function AboutScreen() {
    const { variables, colors } = useTheme();

    // Animations
    const topCardAnim = useRef(new Animated.Value(-500)).current;
    const descCardAnim = useRef(new Animated.Value(500)).current;
    const creditsCardAnim = useRef(new Animated.Value(100)).current;

    useEffect(() => {
        Animated.stagger(150, [
            Animated.timing(topCardAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(descCardAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(creditsCardAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

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
                {/* Top Card - Slide from left */}
                <Animated.View style={[styles.card, styles.row, { transform: [{ translateX: topCardAnim }] }]}>
                    <Image source={require('../assets/logo.png')} style={styles.appIcon} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.appName}>Timers</Text>
                        <Text style={styles.versionText}>v1.0</Text>
                    </View>
                </Animated.View>

                {/* Description Card - Slide from right */}
                <Animated.View style={[styles.card, { transform: [{ translateX: descCardAnim }] }]}>
                    <Text style={[styles.description, { textAlign: 'justify' }]}>
                        Designed for remembering important moments. Whether you're timing an event or counting down to a special occasion, Timers has you covered.
                        {'\n\n'}As a wise man once said:
                    </Text>
                    <Text style={styles.quote}>“Create what you wish existed.”</Text>
                </Animated.View>

                {/* Credits Card - Slide from bottom */}
                <Animated.View style={[styles.card, { transform: [{ translateY: creditsCardAnim }] }]}>
                    <Text style={styles.credits}>Made with ❤️ by Parzival</Text>
                </Animated.View>
            </View>
        </ScreenWithHeader>
    );
}
