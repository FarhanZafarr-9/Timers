import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import { Icons } from '../assets/icons';
import ScreenWithHeader from '../components/ScreenWithHeder';
import BottomSheetChangelog from '../components/BottomSheetChnageLog';
import { appVersion } from '../utils/functions';
import { showToast, appBuild } from '../utils/functions';
import { scheduleNotification, clearAllScheduledNotifications } from '../utils/Notificationhelper';
import AboutMeModal from '../components/AboutMeModal';

export default function AboutScreen() {
    const { variables, colors, isBorder, border } = useTheme();
    const [showChangelog, setShowChangelog] = useState(false);
    const [selectedTestTime, setSelectedTestTime] = useState(null);
    const [expanded, setExpanded] = useState(0);
    // Animations
    const topCardAnim = useRef(new Animated.Value(-50)).current;
    const descCardAnim = useRef(new Animated.Value(-50)).current;
    const creditsCardAnim = useRef(new Animated.Value(-50)).current;
    const buttonsAnim = useRef(new Animated.Value(-50)).current;
    const [showAboutMe, setShowAboutMe] = useState(false);

    const topOpacityAnim = useRef(new Animated.Value(0)).current;
    const descOpacityAnim = useRef(new Animated.Value(0)).current;
    const creditsOpacityAnim = useRef(new Animated.Value(0)).current;
    const buttonsOpacityAnim = useRef(new Animated.Value(0)).current;

    // Test notification time options
    const testTimeOptions = [
        { value: 5, label: '5 seconds', icon: <Icons.Ion name="time-outline" size={16} /> },
        { value: 10, label: '10 seconds', icon: <Icons.Ion name="time-outline" size={16} /> },
        { value: 15, label: '15 seconds', icon: <Icons.Ion name="time-outline" size={16} /> },
        { value: 30, label: '30 seconds', icon: <Icons.Ion name="time-outline" size={16} /> },
        { value: 45, label: '45 seconds', icon: <Icons.Ion name="time-outline" size={16} /> },
        { value: 60, label: '1 minute', icon: <Icons.Ion name="timer-outline" size={16} /> },
        { value: 120, label: '2 minutes', icon: <Icons.Ion name="timer-outline" size={16} /> },
        { value: 300, label: '5 minutes', icon: <Icons.Ion name="timer-outline" size={16} /> },
        { value: 600, label: '10 minutes', icon: <Icons.Ion name="timer-outline" size={16} /> },
    ];

    useEffect(() => {
        Animated.stagger(120, [
            Animated.parallel([
                Animated.spring(topCardAnim, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
                Animated.timing(topOpacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.spring(descCardAnim, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
                Animated.timing(descOpacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.spring(creditsCardAnim, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
                Animated.timing(creditsOpacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.spring(buttonsAnim, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
                Animated.timing(buttonsOpacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    const handleOpenLink = (url) => {
        Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
    };

    const handleReportBug = () => {
        const email = 'farhanzafarr.9@gmail.com';
        const subject = 'Bug Report - ChronoX App';
        const body = 'Please describe the bug you encountered:';
        Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    const handleSuggestion = () => {
        const email = 'farhanzafarr.9@gmail.com';
        const subject = 'Suggestion - ChronoX App';
        const body = 'Please describe the suggestion you came upon:';
        Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    const styles = StyleSheet.create({
        content: { gap: 16 },
        card: {
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.md,
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderWidth: border,
            borderColor: colors.border,
        },
        row: { flexDirection: 'row', alignItems: 'center' },
        appIcon: {
            width: 72, height: 72, borderRadius: variables.radius.md, marginRight: 16, resizeMode: 'cover',
            borderWidth: border, borderColor: colors.cardBorder,
        },
        appName: { fontSize: 22, color: colors.textTitle, fontWeight: 'bold' },
        versionText: {
            marginTop: 14, fontSize: 12, color: colors.textDesc, backgroundColor: colors.card,
            textAlign: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: variables.radius.lg,
            alignSelf: 'flex-start', borderWidth: border, borderColor: colors.border
        },
        description: { color: colors.text, fontSize: 14, lineHeight: 22 },
        quote: {
            color: colors.textSecondary, fontSize: 16, fontStyle: 'italic',
            borderLeftColor: colors.highlight, borderLeftWidth: 3, paddingLeft: 8, marginVertical: 24,
        },
        credits: { textAlign: 'center', color: colors.textSecondary, fontSize: 14, height: 20 },
        buttonsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 12,
        },
        actionButton: {
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.md,
            paddingVertical: 12,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: border,
            borderColor: colors.border,
            minWidth: 120,
            flexBasis: '48%',
        },
        buttonText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            lineHeight: 20,
        },
        fullWidthButton: {
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.md,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: border,
            borderColor: colors.border,
            marginTop: 12,
            width: '100%',
        },
    });

    return (
        <ScreenWithHeader
            headerIcon={<Icons.Ion name="information-circle" color={colors.highlight} />}
            headerTitle="About"
            borderRadius={variables.radius.md}
            paddingMargin={15}
            colors={colors}
            paddingX={15}
        >
            {showAboutMe && (
                <AboutMeModal onClose={() => setShowAboutMe(false)} />
            )}
            <View style={styles.content}>
                <Animated.View style={[styles.card, styles.row, { transform: [{ translateY: topCardAnim }], opacity: topOpacityAnim }]}>
                    <Image source={require('../assets/logo.png')} style={styles.appIcon} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.appName}>ChronoX</Text>
                        <TouchableOpacity onPress={() => setExpanded(expanded === 5 ? 0 : expanded + 1)}>
                            <Text style={styles.versionText}>v{appVersion} - {appBuild}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <Animated.View style={[styles.card, { transform: [{ translateY: descCardAnim }], opacity: descOpacityAnim }]}>
                    <Text style={[styles.description, { textAlign: 'justify' }]}>
                        Some moments are worth remembering, others worth anticipating. Whether you're marking memories or counting down to what's next, ChronoX keeps time with what matters most.
                        {'\n\n'}
                        A thought that sparked this journey:
                    </Text>
                    <Text style={styles.quote}>
                        "Create what you wish existed."
                    </Text>
                </Animated.View>

                <Animated.View style={[styles.card, { transform: [{ translateY: creditsCardAnim }], opacity: creditsOpacityAnim }]}>
                    <Text style={styles.credits}>Made with ❤️ by Parzival</Text>
                </Animated.View>

                <Animated.View style={{ transform: [{ translateY: buttonsAnim }], opacity: buttonsOpacityAnim }}>

                    <View style={styles.buttonsContainer}>

                        <TouchableOpacity style={styles.actionButton} onPress={() => setShowChangelog(true)}>
                            <Icons.Ion name="document-text-outline" size={18} color={colors.text} style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>Changelog</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenLink('https://github.com/FarhanZafarr-9/Timers')}>
                            <Icons.Ion name="logo-github" size={18} color={colors.text} style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>Repository</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenLink('https://github.com/FarhanZafarr-9')}>
                            <Icons.Ion name="person" size={18} color={colors.text} style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>Creator</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleReportBug}>
                            <Icons.Ion name="bug" size={18} color={colors.text} style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>Report Bug</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleSuggestion}>
                            <Icons.Ion name="star" size={18} color={colors.text} style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>Suggestion</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => setShowAboutMe(true)}>
                            <Icons.Ion name="person-circle-outline" size={18} color={colors.text} style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>About Me</Text>
                        </TouchableOpacity>

                    </View>

                </Animated.View>


                <BottomSheetChangelog visible={showChangelog} onClose={() => setShowChangelog(false)} forced />
            </View>
        </ScreenWithHeader>
    );
}