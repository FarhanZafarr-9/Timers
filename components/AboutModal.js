import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView, Animated } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import { Icons } from '../assets/icons';

export default function AboutModal({ visible, onClose }) {
    const { colors, variables, border } = useTheme();

    // Create animated values for each card (start with 1 to make them visible initially)
    const profileCardAnim = useRef(new Animated.Value(1)).current;
    const aboutCardAnim = useRef(new Animated.Value(1)).current;
    const featuresCardAnim = useRef(new Animated.Value(1)).current;
    const connectCardAnim = useRef(new Animated.Value(1)).current;

    // Reset and start animations when modal becomes visible
    useEffect(() => {
        if (visible) {
            // Reset all animations to invisible state
            profileCardAnim.setValue(0);
            aboutCardAnim.setValue(0);
            featuresCardAnim.setValue(0);
            connectCardAnim.setValue(0);

            // Start staggered animations after a small delay
            setTimeout(() => {
                const animationDuration = 400;
                const staggerDelay = 150;

                Animated.stagger(staggerDelay, [
                    Animated.timing(profileCardAnim, {
                        toValue: 1,
                        duration: animationDuration,
                        useNativeDriver: true,
                    }),
                    Animated.timing(aboutCardAnim, {
                        toValue: 1,
                        duration: animationDuration,
                        useNativeDriver: true,
                    }),
                    Animated.timing(featuresCardAnim, {
                        toValue: 1,
                        duration: animationDuration,
                        useNativeDriver: true,
                    }),
                    Animated.timing(connectCardAnim, {
                        toValue: 1,
                        duration: animationDuration,
                        useNativeDriver: true,
                    }),
                ]).start();
            }, 100);
        }
    }, [visible, profileCardAnim, aboutCardAnim, featuresCardAnim, connectCardAnim]);

    const handleOpenLink = (url) => {
        Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
    };

    // Create animated style for each card
    const createAnimatedStyle = (animValue) => ({
        opacity: animValue,
        transform: [
            {
                translateX: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                }),
            },
        ],
    });

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            padding: 20,
        },
        closeButton: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
        },
        closeText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
            marginLeft: 8,
        },
        card: {
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.md,
            padding: 20,
            marginBottom: 20,
            borderWidth: border,
            borderColor: colors.border,
        },
        name: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.highlight,
            textAlign: 'center',
            marginBottom: 6,
        },
        subtitle: {
            fontSize: 13,
            color: colors.textDesc,
            textAlign: 'center',
            height: 20
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.highlight,
            marginBottom: 8,
            textAlign: 'center',
            height: 25
        },
        description: {
            fontSize: 14,
            color: colors.text,
            textAlign: 'center',
            marginBottom: 10,
            lineHeight: 22,
        },
        bulletPoint: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginVertical: 4,
            marginLeft: 16,
        },
        bulletDot: {
            width: 6,
            height: 6,
            backgroundColor: colors.highlight,
            borderRadius: 3,
            marginRight: 10,
            marginTop: 7,
        },
        bulletText: {
            fontSize: 14,
            color: colors.text,
            flex: 1,
            height: 20
        },
        link: {
            color: colors.highlight,
            textAlign: 'center',
            marginTop: 4,
            height: 20
        }
    });

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Icons.Ion name="arrow-back" size={20} color={colors.text} />
                    <Text style={styles.closeText}>Back</Text>
                </TouchableOpacity>

                <Animated.View style={[styles.card, createAnimatedStyle(profileCardAnim)]}>
                    <Text style={styles.name}>Farhan Zafar</Text>
                    <Text style={styles.subtitle}>Crafted with passion ✨ and curiosity ❤️</Text>
                </Animated.View>

                <Animated.View style={[styles.card, createAnimatedStyle(aboutCardAnim)]}>
                    <Text style={styles.sectionTitle}>About This App</Text>
                    <Text style={styles.description}>
                        ChronoX is your personal time companion — whether you're looking forward to a special date, or reflecting on moments that have passed.
                        {'\n\n'}
                        Designed for high customization and a stunning visual experience, ChronoX makes tracking time more meaningful and beautifully immersive.
                    </Text>
                </Animated.View>

                <Animated.View style={[styles.card, createAnimatedStyle(featuresCardAnim)]}>
                    <Text style={styles.sectionTitle}>Features & Highlights</Text>

                    <View style={styles.bulletPoint}>
                        <View style={styles.bulletDot} />
                        <Text style={styles.bulletText}>Track upcoming events and past milestones</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <View style={styles.bulletDot} />
                        <Text style={styles.bulletText}>Vivid UI themes with deep customization</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <View style={styles.bulletDot} />
                        <Text style={styles.bulletText}>Smooth animations for a delightful experience</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <View style={styles.bulletDot} />
                        <Text style={styles.bulletText}>Optimized performance for a fluid feel</Text>
                    </View>
                </Animated.View>

                <Animated.View style={[styles.card, createAnimatedStyle(connectCardAnim)]}>
                    <Text style={styles.sectionTitle}>Connect</Text>
                    <TouchableOpacity onPress={() => handleOpenLink('https://github.com/FarhanZafarr-9')}>
                        <Text style={styles.link}>GitHub: github.com/FarhanZafarr-9</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleOpenLink('mailto:farhanzafarr.9@gmail.com')}>
                        <Text style={styles.link}>Email: farhanzafarr.9@gmail.com</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Text style={[styles.description, { marginTop: 20, fontSize: 12 }]}>
                    © 2025 Farhan Zafar. Crafted with care and code.
                </Text>
            </ScrollView>
        </Modal>
    );
}