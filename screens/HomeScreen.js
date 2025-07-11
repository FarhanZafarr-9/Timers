import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTimers } from '../utils/TimerContext';
import { useTheme } from '../utils/ThemeContext';
import { Icons } from '../assets/icons';
import AddTimerModal from '../components/AddTimerModal';
import ScreenWithHeader from '../components/ScreenWithHeder';

export default function HomeScreen({ navigation }) {
    const { timers, addTimer } = useTimers();
    const [quickAddVisible, setQuickAddVisible] = useState(false);
    const { variables, colors, isBorder } = useTheme();

    const quickActionsOpacity = useRef(new Animated.Value(0)).current;
    const [mounted, setMounted] = useState(false);

    const totalOpacity = useRef(new Animated.Value(0)).current;
    const rightOpacity = useRef(new Animated.Value(0)).current;

    const totalTranslate = useRef(new Animated.Value(-50)).current;
    const rightTranslate = useRef(new Animated.Value(-50)).current;
    const quickActionsTranslate = useRef(new Animated.Value(-50)).current;

    useEffect(() => {
        const value = setTimeout(() => {
            setMounted(true);

            Animated.stagger(120, [
                Animated.parallel([
                    Animated.spring(totalTranslate, {
                        toValue: 0,
                        tension: 80,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(totalOpacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.spring(rightTranslate, {
                        toValue: 0,
                        tension: 80,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rightOpacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.spring(quickActionsTranslate, {
                        toValue: 0,
                        tension: 80,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(quickActionsOpacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        }, 50);

        return () => clearTimeout(value);
    }, []);

    const { totalTimers, countdownTimers, countupTimers } = useMemo(() => {
        const total = timers?.length || 0;
        const countdown = timers?.filter(timer => timer.isCountdown).length || 0;
        const countup = timers?.filter(timer => !timer.isCountdown).length || 0;
        return { totalTimers: total, countdownTimers: countdown, countupTimers: countup };
    }, [timers]);

    const styles = StyleSheet.create({
        grid: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 16,
        },
        leftColumn: {
            flex: 1,
            marginRight: 10,
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
            borderWidth: isBorder ? 0.75 : 0,
        },
        totalTimers: {
            minHeight: 160,
            justifyContent: 'center',
            alignItems: 'center',
        },
        countdownTimers: {
            marginBottom: 10,
        },
        gridTitle: {
            color: colors.textDesc,
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 8,
            textTransform: 'uppercase',
        },
        gridValue: {
            color: colors.textTitle,
            fontSize: 32,
            fontWeight: '700',
        },
        quickActionsCard: {
            marginTop: 10,
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.md,
            padding: 14,
            borderWidth: isBorder ? 0.75 : 0,
            borderColor: colors.border,
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            borderRadius: variables.radius.lg,
            backgroundColor: colors.card,
            justifyContent: 'center',
            marginBottom: 10,
            borderWidth: isBorder ? 0.5 : 0,
            borderColor: colors.border,
        },
        actionText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
        },
        quickActionsTitle: {
            color: colors.textDesc,
            fontSize: 14,
            fontWeight: 'bold',
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            paddingLeft: 8,
        },
        quickActionsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        quickActionItem: {
            width: '48%',
        },
        fullAction: {
            width: '100%',
        },
    });

    return (
        <ScreenWithHeader
            headerIcon={<Icons.Ion name="timer" color={colors.highlight} />}
            headerTitle="Timers"
            borderRadius={variables.radius.md}
            paddingMargin={15}
        >
            {mounted && (
                <>
                    {/* Grid Row */}
                    <View style={styles.grid}>
                        <Animated.View
                            style={[
                                styles.gridItem,
                                styles.leftColumn,
                                styles.totalTimers,
                                {
                                    transform: [{ translateY: totalTranslate }],
                                    opacity: totalOpacity
                                }
                            ]}
                        >
                            <Text style={styles.gridTitle}>Total Timers</Text>
                            <Text style={styles.gridValue}>{totalTimers}</Text>
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.rightColumn,
                                {
                                    transform: [{ translateY: rightTranslate }],
                                    opacity: rightOpacity
                                }
                            ]}
                        >
                            <View style={[styles.gridItem, styles.countdownTimers]}>
                                <Text style={styles.gridTitle}>Countdowns</Text>
                                <Text style={styles.gridValue}>{countdownTimers}</Text>
                            </View>
                            <View style={[styles.gridItem]}>
                                <Text style={styles.gridTitle}>Countups</Text>
                                <Text style={styles.gridValue}>{countupTimers}</Text>
                            </View>
                        </Animated.View>
                    </View>

                    {/* Quick Actions Card */}
                    <Animated.View
                        style={[
                            styles.quickActionsCard,
                            {
                                opacity: quickActionsOpacity,
                                transform: [{ translateY: quickActionsTranslate }]
                            }
                        ]}
                    >
                        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                        <View style={styles.quickActionsGrid}>
                            <View style={styles.quickActionItem}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => navigation.navigate('CountDowns')}
                                >
                                    <Icons.Material name="timer" size={15} color={colors.highlight} style={{ marginRight: 6 }} />
                                    <Text style={styles.actionText}>Countdowns</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.quickActionItem}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => navigation.navigate('CountUps')}
                                >
                                    <Icons.Material name="timer" size={15} color={colors.highlight} style={{ marginRight: 6 }} />
                                    <Text style={styles.actionText}>Countups</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.quickActionItem}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => navigation.navigate('Settings')}
                                >
                                    <Icons.Material name="settings" size={15} color={colors.highlight} style={{ marginRight: 6 }} />
                                    <Text style={styles.actionText}>Settings</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.quickActionItem}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => navigation.navigate('About', { addNew: true })}
                                >
                                    <Icons.Ion name="information-circle" size={15} color={colors.highlight} style={{ marginRight: 6 }} />
                                    <Text style={styles.actionText}>About</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.quickActionItem, styles.fullAction]}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => setQuickAddVisible(true)}
                                >
                                    <Icons.Material name="add-circle" size={15} color={colors.highlight} style={{ marginRight: 6 }} />
                                    <Text style={styles.actionText}>Quick Add Timer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <AddTimerModal
                            visible={quickAddVisible}
                            onClose={() => setQuickAddVisible(false)}
                            onAdd={(timer) => {
                                const now = new Date();
                                const timerDate = new Date(timer.date);
                                timer.isCountdown = timerDate > now;
                                addTimer(timer);
                                setQuickAddVisible(false);
                            }}
                            mode={null}
                        />
                    </Animated.View>
                </>
            )}
        </ScreenWithHeader>
    );
}
