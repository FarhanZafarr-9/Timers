import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useTimers } from '../utils/TimerContext';
import { useTheme } from '../utils/ThemeContext';
import { Icons } from '../assets/icons';
import AddTimerModal from '../components/AddTimerModal';
import ScreenWithHeader from '../components/ScreenWithHeder';
import TimerCard from '../components/TimerCard';
import { useSecurity } from '../utils/SecurityContext';
import { quotes } from '../utils/functions';
import { getPrivacyText } from '../utils/functions';

export default function HomeScreen({ navigation }) {
    const { timers, addTimer } = useTimers();
    const [quickAddVisible, setQuickAddVisible] = useState(false);
    const { variables, colors, isBorder, border } = useTheme();
    const { privacyMode } = useSecurity();

    const quickActionsOpacity = useRef(new Animated.Value(0)).current;
    const [mounted, setMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const totalOpacity = useRef(new Animated.Value(0)).current;
    const rightOpacity = useRef(new Animated.Value(0)).current;
    const favOpacity = useRef(new Animated.Value(0)).current;
    const quoteOpacity = useRef(new Animated.Value(0)).current;

    const totalTranslate = useRef(new Animated.Value(-50)).current;
    const rightTranslate = useRef(new Animated.Value(-50)).current;
    const favTranslate = useRef(new Animated.Value(-50)).current;
    const quoteTranslate = useRef(new Animated.Value(-50)).current;
    const quickActionsTranslate = useRef(new Animated.Value(-50)).current;

    // Enhanced quote animation states
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const quoteTextOpacity = useRef(new Animated.Value(0)).current;
    const quoteScale = useRef(new Animated.Value(0.95)).current;
    const privacyText = useMemo(() => getPrivacyText(privacyMode, 'Favourite'), [privacyMode]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const value = setTimeout(() => {
            setMounted(true);

            Animated.stagger(120, [
                Animated.parallel([
                    Animated.spring(totalTranslate, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
                    Animated.timing(totalOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                ]),
                Animated.parallel([
                    Animated.spring(rightTranslate, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
                    Animated.timing(rightOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                ]),
                Animated.parallel([
                    Animated.spring(favTranslate, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
                    Animated.timing(favOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                ]),
                Animated.parallel([
                    Animated.spring(quoteTranslate, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
                    Animated.timing(quoteOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                ]),
                Animated.parallel([
                    Animated.spring(quickActionsTranslate, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
                    Animated.timing(quickActionsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                ]),
            ]).start();
        }, 50);

        return () => clearTimeout(value);
    }, []);

    // Enhanced quote animation effect
    useEffect(() => {
        const animateQuote = () => {
            const currentQuote = quotes[quoteIndex];

            // Fade out current text
            Animated.parallel([
                Animated.timing(quoteTextOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(quoteScale, {
                    toValue: 0.95,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start(() => {

                setDisplayedText('');
                setIsTyping(true);

                Animated.parallel([
                    Animated.timing(quoteTextOpacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.spring(quoteScale, {
                        toValue: 1,
                        tension: 100,
                        friction: 8,
                        useNativeDriver: true,
                    })
                ]).start();

                // Typewriter effect
                let index = 0;
                const typeInterval = setInterval(() => {
                    if (index < currentQuote.length) {
                        setDisplayedText(currentQuote.substring(0, index + 1));
                        index++;
                    } else {
                        clearInterval(typeInterval);
                        setIsTyping(false);
                    }
                }, 60);
            });
        };

        if (quoteIndex === 0 && displayedText === '') {
            animateQuote();
        }

        // Set up interval for quote changes
        const interval = setInterval(() => {
            setQuoteIndex(prev => (prev + 1) % quotes.length);
        }, 6000); // Increased duration to accommodate animation

        return () => clearInterval(interval);
    }, [quoteIndex]);

    // Trigger animation when quote index changes (except for initial load)
    useEffect(() => {
        if (quoteIndex > 0 || displayedText !== '') {
            const currentQuote = quotes[quoteIndex];

            // Fade out current text
            Animated.parallel([
                Animated.timing(quoteTextOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(quoteScale, {
                    toValue: 0.95,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start(() => {
                // Reset text and start typing
                setDisplayedText('');
                setIsTyping(true);

                // Fade in and scale up
                Animated.parallel([
                    Animated.timing(quoteTextOpacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.spring(quoteScale, {
                        toValue: 1,
                        tension: 100,
                        friction: 8,
                        useNativeDriver: true,
                    })
                ]).start();

                // Typewriter effect
                let index = 0;
                const typeInterval = setInterval(() => {
                    if (index < currentQuote.length) {
                        setDisplayedText(currentQuote.substring(0, index + 1));
                        index++;
                    } else {
                        clearInterval(typeInterval);
                        setIsTyping(false);
                    }
                }, 30); // Adjust typing speed here
            });
        }
    }, [quoteIndex]);

    const { totalTimers, countdownTimers, countupTimers } = useMemo(() => {
        const total = timers?.length || 0;
        const countdown = timers?.filter(t => t.isCountdown).length || 0;
        const countup = timers?.filter(t => !t.isCountdown).length || 0;
        return { totalTimers: total, countdownTimers: countdown, countupTimers: countup };
    }, [timers]);

    const favTimers = useMemo(() => timers?.filter(t => t.isFavourite === true) || [], [timers]);

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
            padding: 12,
            marginBottom: 12,
            borderColor: colors.border,
            borderWidth: border,
            justifyContent: 'center',
            alignItems: 'center',
        },
        quoteTextContainer: {
            minHeight: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
        quoteText: {
            fontSize: 14,
            fontStyle: 'italic',
            textAlign: 'center',
            color: colors.textDesc,
            lineHeight: 20,
            fontWeight: '600'
        },
        cursor: {
            opacity: 1,
            color: colors.highlight,
        },
        dashboardCard: {
            marginTop: 10,
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.lg,
            padding: 20,
            borderWidth: border,
            borderColor: colors.border,
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
            marginBottom: 12
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
        labelContainer: {
            width: '100%',
            marginBottom: 12,
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
        }

    });

    // Blinking cursor component
    const BlinkingCursor = () => {
        const cursorOpacity = useRef(new Animated.Value(1)).current;

        useEffect(() => {
            const blinkAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(cursorOpacity, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(cursorOpacity, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            );

            if (isTyping) {
                blinkAnimation.start();
            } else {
                blinkAnimation.stop();
                cursorOpacity.setValue(0);
            }

            return () => blinkAnimation.stop();
        }, [isTyping]);

        return (
            <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
                |
            </Animated.Text>
        );
    };

    return (
        <ScreenWithHeader
            headerIcon={<Icons.Ion name="time" color={colors.highlight} />}
            headerTitle="Timers"
            borderRadius={variables.radius.md}
            paddingMargin={15}
            paddingX={15}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                {mounted && (
                    <>
                        <View style={styles.grid} pointerEvents="box-none">
                            <Animated.View
                                style={[
                                    styles.gridItem, styles.leftColumn, styles.totalTimers,
                                    { transform: [{ translateY: totalTranslate }], opacity: totalOpacity }
                                ]}
                                pointerEvents="box-none"
                            >
                                <Text style={styles.gridTitle}>Total Timers</Text>
                                <Text style={styles.gridValue}>{totalTimers}</Text>
                            </Animated.View>

                            <Animated.View
                                style={[
                                    styles.rightColumn,
                                    { transform: [{ translateY: rightTranslate }], opacity: rightOpacity }
                                ]}
                                pointerEvents="box-none"
                            >
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
                            </Animated.View>
                        </View>


                        <Animated.View
                            style={{ opacity: favOpacity, transform: [{ translateY: favTranslate }] }}
                            pointerEvents="box-none"
                        >
                            {favTimers.length > 0 ? (<>
                                <View style={styles.labelContainer}>
                                    <Text style={styles.labelText}>{privacyText}</Text>
                                </View>

                                {favTimers.map((timer) => (
                                    <TimerCard
                                        key={timer.id}
                                        timer={timer}
                                        onDelete={() => { }}
                                        onEdit={() => { }}
                                        handleDuplicate={() => { }}
                                        isExpanded={false}
                                        onClick={() => { }}
                                        selectable={false}
                                        selected={false}
                                        isCountdown={timer.isCountdown}
                                        searchText=""
                                        butons="off"
                                    />
                                ))}
                            </>) : (<>
                                <TouchableOpacity
                                    style={styles.quickActionButton}
                                    onPress={() => setQuickAddVisible(true)}
                                    activeOpacity={0.75}
                                >
                                    <Icons.Material name="add" size={18} color={colors.background} />
                                    <Text style={styles.quickActionText}>How about adding a new timer quicly</Text>
                                </TouchableOpacity>
                            </>)
                            }
                        </Animated.View>


                        <Animated.View
                            style={[
                                styles.quoteCard,
                                {
                                    opacity: quoteOpacity,
                                    transform: [{ translateY: quoteTranslate }]
                                }
                            ]}
                            pointerEvents="box-none"
                        >
                            <Animated.View
                                style={[
                                    styles.quoteTextContainer,
                                    {
                                        opacity: quoteTextOpacity,
                                        transform: [{ scale: quoteScale }]
                                    }
                                ]}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.quoteText}>
                                        {displayedText}
                                    </Text>
                                    <BlinkingCursor />
                                </View>
                            </Animated.View>
                        </Animated.View>

                        <Animated.View
                            style={[
                                { opacity: quickActionsOpacity, transform: [{ translateY: quickActionsTranslate }] }
                            ]}
                            pointerEvents="box-none"
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

                        <AddTimerModal
                            visible={quickAddVisible}
                            onClose={() => setQuickAddVisible(false)}
                            onAdd={(newTimer) => {
                                addTimer(newTimer);
                                setQuickAddVisible(false);
                            }}
                            colors={colors}
                            variables={variables}
                        />
                    </>
                )}
            </ScrollView>
        </ScreenWithHeader>
    );
}