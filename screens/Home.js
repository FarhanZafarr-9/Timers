import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useTimers } from '../utils/TimerContext';
import { useTheme } from '../utils/ThemeContext';
import { Icons } from '../assets/icons';
import AddTimer from '../components/AddTimer';
import HeaderScreen from '../components/HeaderScreen';
import TimerCard from '../components/TimerCard';
import { useSecurity } from '../utils/SecurityContext';
import { getPrivacyText } from '../utils/functions';
import FadeQuote from '../components/FadeQuote';

export default function Home({ navigation }) {
    const { timers, addTimer } = useTimers();
    const [quickAddVisible, setQuickAddVisible] = useState(false);
    const { colors, variables, border } = useTheme();
    const { privacyMode } = useSecurity();

    // Animation refs
    const containerOpacity = useRef(new Animated.Value(0)).current;
    const containerTranslate = useRef(new Animated.Value(30)).current;
    const quoteContainerOpacity = useRef(new Animated.Value(0)).current;
    const quoteTextOpacity = useRef(new Animated.Value(0)).current;
    const quoteScale = useRef(new Animated.Value(0.95)).current;
    const controlsOpacity = useRef(new Animated.Value(0)).current;
    const controlsTranslate = useRef(new Animated.Value(20)).current;

    // Memoized values
    const { totalTimers, countdownTimers, countupTimers } = useMemo(() => {
        const total = timers?.length || 0;
        const countdown = timers?.filter(t => t.isCountdown).length || 0;
        const countup = timers?.filter(t => !t.isCountdown).length || 0;
        return { totalTimers: total, countdownTimers: countdown, countupTimers: countup };
    }, [timers]);

    const favTimers = useMemo(() => timers?.filter(t => t.isFavourite === true) || [], [timers]);
    const privacyText = useMemo(() => getPrivacyText(10, privacyMode, 'Favourite'), [privacyMode]);

    // Styles
    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
        },
        scrollContent: {
            flexGrow: 1,
        },
        mainContent: {
            flex: 1,
            paddingVertical: 20,
        },
        grid: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        leftColumn: {
            flex: 1,
            marginRight: 10,
        },
        gridTitle: {
            color: colors.textDesc,
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 8,
            textTransform: 'uppercase',
        },
        gridValue: {
            color: colors.text,
            fontSize: 32,
            fontWeight: '700',
        },
        rightColumn: {
            flex: 1,
            justifyContent: 'space-between',
        },
        gridItem: {
            borderRadius: variables.radius.md,
            padding: 15,
            backgroundColor: colors.settingBlock,
            borderColor: colors.border,
            borderWidth: border,
        },
        totalTimers: {
            minHeight: 160,
            justifyContent: 'center',
            alignItems: 'center',
        },
        countdownTimers: {
            marginBottom: 10,
        },
        quoteCard: {
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.md,
            padding: 10,
            marginBottom: 10,
            borderWidth: border,
            borderColor: colors.border,
            width: '100%',
            alignItems: 'center'
        },
        quoteText: {
            fontSize: 14,
            fontStyle: 'italic',
            textAlign: 'center',
            color: colors.textDesc,
            lineHeight: 24,
            fontWeight: '500',
        },
        labelContainer: {
            width: '100%',
            marginBottom: 6,
            height: 40,
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.md,
            borderColor: colors.border,
            borderWidth: border,
            justifyContent: 'center',
            alignItems: 'center',
        },
        labelText: {
            color: colors.text,
            fontWeight: '600',
        },
        quickActionsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
            gap: 16
        },
        quickActionButton: {
            backgroundColor: colors.highlight,
            borderRadius: variables.radius.md,
            padding: 12,
            flex: 1,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 12,
            maxHeight: 60,
        },
        quickActionButtonSecondary: {
            backgroundColor: colors.highlight + '10',
            borderWidth: border,
            borderColor: colors.border,
        },
        quickActionText: {
            color: colors.background,
            fontSize: 14,
            fontWeight: '700',
            marginLeft: 6,
            height: 20
        },
        quickActionTextSecondary: {
            color: colors.text,
        },
    }), [colors, variables, border]);

    // Initial animations
    useEffect(() => {
        const animateInitial = () => {
            Animated.stagger(150, [
                Animated.parallel([
                    Animated.timing(containerOpacity, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.spring(containerTranslate, {
                        toValue: 0,
                        tension: 100,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(quoteContainerOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.parallel([
                    Animated.timing(controlsOpacity, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.spring(controlsTranslate, {
                        toValue: 0,
                        tension: 80,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        };

        const timer = setTimeout(animateInitial, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <HeaderScreen
            headerIcon={<Icons.Ion name="time" color={colors.highlight} />}
            headerTitle="Timers"
            borderRadius={variables.radius.md}
            paddingMargin={0}
            paddingX={15}
        >
            <Animated.View
                style={[
                    styles.container,
                    {
                        opacity: containerOpacity,
                        transform: [{ translateY: containerTranslate }]
                    }
                ]}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.mainContent}>
                        {/* Stats Grid */}
                        <View style={styles.grid}>
                            <View style={[styles.gridItem, styles.leftColumn, styles.totalTimers]}>
                                <Text style={styles.gridTitle}>Total Timers</Text>
                                <Text style={styles.gridValue}>{totalTimers}</Text>
                            </View>

                            <View style={styles.rightColumn}>
                                <TouchableOpacity
                                    style={[styles.gridItem, styles.countdownTimers]}
                                    onPress={() => navigation.navigate('CountDowns')}
                                    activeOpacity={0.75}
                                >
                                    <Text style={styles.gridTitle}>Countdowns</Text>
                                    <Text style={styles.gridValue}>{countdownTimers}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.gridItem}
                                    onPress={() => navigation.navigate('CountUps')}
                                    activeOpacity={0.75}
                                >
                                    <Text style={styles.gridTitle}>Countups</Text>
                                    <Text style={styles.gridValue}>{countupTimers}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Favorite Timers */}
                        {favTimers.length > 0 ? (
                            <>
                                <View style={styles.labelContainer}>
                                    <Text style={styles.labelText}>{privacyText}</Text>
                                </View>
                                {favTimers.map((timer) => (
                                    <TimerCard
                                        key={timer.id}
                                        timer={timer}
                                        onDelete={() => { }}
                                        onEdit={() => { }}
                                        isExpanded={false}
                                        selectable={false}
                                        isCountdown={timer.isCountdown}
                                        defaultUnit={'minutes'}
                                        layoutMode={'list'}
                                    />
                                ))}
                            </>
                        ) : (
                            <TouchableOpacity
                                style={styles.quickActionButton}
                                onPress={() => setQuickAddVisible(true)}
                                activeOpacity={0.75}
                            >
                                <Icons.Material name="add" size={18} color={colors.background} />
                                <Text style={styles.quickActionText}>Add a new timer quickly</Text>
                            </TouchableOpacity>
                        )}

                        {/* Motivational Quote */}
                        <FadeQuote
                            quoteContainerOpacity={quoteContainerOpacity}
                            quoteTextOpacity={quoteTextOpacity}
                            quoteScale={quoteScale}
                            colors={colors}
                            styles={styles}
                        />

                        {/* Quick Actions */}
                        <Animated.View
                            style={[
                                { opacity: controlsOpacity, transform: [{ translateY: controlsTranslate }] }
                            ]}
                        >
                            <View style={styles.quickActionsRow}>
                                <TouchableOpacity
                                    style={[styles.quickActionButton, styles.quickActionButtonSecondary]}
                                    onPress={() => navigation.navigate('Settings')}
                                    activeOpacity={0.75}
                                >
                                    <Icons.Material name="settings" size={18} color={colors.text} />
                                    <Text style={[styles.quickActionText, styles.quickActionTextSecondary]}>
                                        Settings
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.quickActionButton}
                                    onPress={() => setQuickAddVisible(true)}
                                    activeOpacity={0.75}
                                >
                                    <Icons.Material name="add" size={18} color={colors.background} />
                                    <Text style={styles.quickActionText}>Add Timer</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>

                        <AddTimer
                            visible={quickAddVisible}
                            onClose={() => setQuickAddVisible(false)}
                            onAdd={addTimer}
                            colors={colors}
                            variables={variables}
                        />
                    </View>
                </ScrollView>
            </Animated.View>
        </HeaderScreen>
    );
}