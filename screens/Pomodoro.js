// Pomodoro.js
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, ScrollView } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import HeaderScreen from '../components/HeaderScreen';
import { Icons } from '../assets/icons';
import PickerSheet from '../components/PickerSheet';
import ProgressWave from '../components/ProgressWave';
import { pomodoroOptions } from '../utils/functions';
import Toast from 'react-native-toast-message';
import { scheduleNotification, cancelScheduledNotification } from '../utils/Notify';
import Switch from '../components/Switch';
import FadeQuote from '../components/FadeQuote';
import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';
dayjs.extend(durationPlugin);

const { width: screenWidth } = Dimensions.get('window');

// Static animation values outside component - initialize once
let staticAnimations = null;

const getStaticAnimations = () => {
    if (!staticAnimations) {
        staticAnimations = {
            containerOpacity: new Animated.Value(0),
            containerTranslate: new Animated.Value(30),
            timerScale: new Animated.Value(0.9),
            controlsOpacity: new Animated.Value(0),
            controlsTranslate: new Animated.Value(20),
            quoteContainerOpacity: new Animated.Value(0),
            quoteTextOpacity: new Animated.Value(0),
            quoteScale: new Animated.Value(0.9),
        };
    }
    return staticAnimations;
};

// Move StatusDisplay styles outside since they don't depend on theme
const statusDisplayStyles = StyleSheet.create({
    statusContainer: {
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    }
});

const StatusDisplay = React.memo(({ isRunning, isPaused, colors, border }) => {
    const statusContent = useMemo(() => {
        if (isRunning) return {
            icon: "play",
            text: "Running",
            color: colors.text
        };
        if (isPaused) return {
            icon: "pause",
            text: "Paused",
            color: colors.highlight + 'b0'
        };
        return {
            icon: "timer-outline",
            text: "Ready",
            color: colors.textDesc
        };
    }, [isRunning, isPaused, colors]);

    return (
        <View style={[
            statusDisplayStyles.statusContainer,
            {
                backgroundColor: colors.settingBlock,
                borderColor: colors.border,
                borderWidth: border
            }
        ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icons.Ion name={statusContent.icon} size={12} color={statusContent.color} />
                <Text style={[
                    statusDisplayStyles.statusText,
                    { color: statusContent.color, marginLeft: 6 }
                ]}>
                    {statusContent.text}
                </Text>
            </View>
        </View>
    );
});

// TimerDisplay styles
const timerDisplayStyles = StyleSheet.create({
    timerContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    timerText: {
        fontSize: 48,
        fontWeight: '700',
        marginBottom: 8,
    },
    subLabel: {
        fontSize: 16,
        marginBottom: 20,
        height: 25
    }
});

const TimerDisplay = React.memo(({ formattedTime, colors }) => (
    <View style={timerDisplayStyles.timerContainer}>
        <Text style={[timerDisplayStyles.timerText, { color: colors.text }]}>{formattedTime}</Text>
        <Text style={[timerDisplayStyles.subLabel, { color: colors.textDesc }]}>Time Remaining</Text>
    </View>
));

// ProgressDisplay styles
const progressDisplayStyles = StyleSheet.create({
    waveContainer: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    waveBox: {
        width: '100%',
        height: 24,
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 12,
    },
    progressLabel: {
        fontSize: 12,
        fontWeight: '500',
    }
});

const ProgressDisplay = React.memo(({ progress, duration, colors, border }) => {
    const progressData = useMemo(() => ({
        percentage: (progress * 100).toFixed(2),
        elapsed: dayjs.duration(progress * duration).format('HH:mm:ss')
    }), [progress, duration]);

    return (
        <View style={[
            progressDisplayStyles.waveContainer,
            {
                backgroundColor: colors.settingBlock + '60',
                borderColor: colors.border,
                borderWidth: border
            }
        ]}>
            <View style={[
                progressDisplayStyles.waveBox,
                { backgroundColor: colors.highlight + '10' }
            ]}>
                <ProgressWave
                    progressPct={progressData.percentage}
                    amplitude={5}
                    frequency={15}
                    speed={3000}
                    height={24}
                    width={screenWidth * 0.8}
                    colorCompleted={colors.highlight}
                    colorRemaining={colors.highlight + '20'}
                />
            </View>
            <View style={progressDisplayStyles.progressInfo}>
                <Text style={[progressDisplayStyles.progressLabel, { color: colors.textDesc }]}>
                    Progress: {progressData.percentage}%
                </Text>
                <Text style={[progressDisplayStyles.progressLabel, { color: colors.textDesc }]}>
                    Elapsed: {progressData.elapsed}
                </Text>
            </View>
        </View>
    );
});

const TimerUpdater = React.memo(({ isRunning, isPaused, duration, colors, border, onTimerComplete }) => {
    const animations = getStaticAnimations();
    const [remainingMs, setRemainingMs] = useState(duration);
    const [progress, setProgress] = useState(0);
    const [formattedTime, setFormattedTime] = useState('00:00:00');

    const startTimeRef = useRef(null);
    const elapsedRef = useRef(0);
    const animationFrameRef = useRef(null);
    const lastUpdateRef = useRef(0);
    const isRunningRef = useRef(isRunning);
    const isPausedRef = useRef(isPaused);
    const durationRef = useRef(duration);

    // Update refs when props change
    useEffect(() => {
        isRunningRef.current = isRunning;
        isPausedRef.current = isPaused;
        durationRef.current = duration;
    }, [isRunning, isPaused, duration]);

    // Reset timer when duration changes
    useEffect(() => {
        if (!isRunning && !isPaused) {
            setRemainingMs(duration);
            setProgress(0);
            setFormattedTime(dayjs.duration(duration).format('HH:mm:ss'));
            elapsedRef.current = 0;
        }
    }, [duration, isRunning, isPaused]);

    // Timer loop that runs internally
    const timerLoop = useCallback(() => {
        if (!isRunningRef.current) return;

        const now = Date.now();
        // Throttle updates to ~10fps
        if (now - lastUpdateRef.current < 100) {
            animationFrameRef.current = requestAnimationFrame(timerLoop);
            return;
        }
        lastUpdateRef.current = now;

        const elapsed = now - startTimeRef.current;
        const newRemaining = Math.max(durationRef.current - elapsed, 0);
        const newProgress = Math.max(1 - (newRemaining / durationRef.current), 0);

        setRemainingMs(newRemaining);
        setProgress(newProgress);
        const formatted = dayjs.duration(newRemaining).format('HH:mm:ss');
        setFormattedTime(formatted);

        if (newRemaining > 0) {
            animationFrameRef.current = requestAnimationFrame(timerLoop);
        } else {
            // Timer complete - notify parent
            onTimerComplete?.();
        }
    }, [onTimerComplete]);

    // Start/pause timer management
    useEffect(() => {
        if (isRunning && !isPaused) {
            startTimeRef.current = Date.now() - elapsedRef.current;
            lastUpdateRef.current = Date.now();
            animationFrameRef.current = requestAnimationFrame(timerLoop);
        } else if (isPaused) {
            cancelAnimationFrame(animationFrameRef.current);
            elapsedRef.current = Date.now() - startTimeRef.current;
        } else {
            // Reset
            cancelAnimationFrame(animationFrameRef.current);
            elapsedRef.current = 0;
            setRemainingMs(duration);
            setProgress(0);
            setFormattedTime(dayjs.duration(duration).format('HH:mm:ss'));
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isRunning, isPaused, duration, timerLoop]);

    return (
        <>
            <Animated.View style={{ transform: [{ scale: animations.timerScale }] }}>
                <TimerDisplay formattedTime={formattedTime} colors={colors} />
            </Animated.View>
            <ProgressDisplay
                progress={progress}
                duration={duration}
                colors={colors}
                border={border}
            />
        </>
    );
});

export default function Pomodoro() {
    const { colors, variables, border } = useTheme();

    // Get animation values
    const animations = getStaticAnimations();

    const [duration, setDuration] = useState(300000);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [notify, setNotify] = useState(false);
    const [notificationId, setNotificationId] = useState(null);

    // Memoized values
    const sessionInfo = useMemo(() => {

        const presetLabels = {
            15000: 'Flash Focus',
            30000: 'Quick Breather',
            60000: 'Minute Sprint',
            300000: 'Micro Break',
            600000: 'Light Focus',
            900000: 'Mini Sprint',
            1500000: 'Classic Pomodoro',
            1800000: 'Deep Dive',
            3600000: 'Hour of Power',
            7200000: 'Marathon Session',
        };

        const label = presetLabels[duration] || `Custom: ${dayjs.duration(duration).format('m[m] s[s]')}`;
        return label;
    }, [duration]);

    // Styles that depend on theme
    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
        },
        scrollContent: {
            flexGrow: 1,
        },
        mainContent: {
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingVertical: 50,
        },
        sessionHeader: {
            alignItems: 'center',
            marginBottom: 20,
        },
        sessionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 14,
            height: 26
        },
        quoteCard: {
            backgroundColor: colors.settingBlock + '40',
            borderRadius: variables.radius.circle,
            padding: 10,
            marginBottom: 20,
            borderWidth: border,
            borderColor: colors.border,
            width: '100%',
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
            lineHeight: 24,
            fontWeight: '500',
        },
        controlsContainer: {
            width: '100%',
        },
        controlsGrid: {
            gap: 12,
        },
        controlRow: {
            flexDirection: 'row',
            gap: 12,
        },
        controlBtn: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: variables.radius.md,
            alignItems: 'center',
            justifyContent: 'center',
        },
        primaryBtn: {
            backgroundColor: colors.highlight,
        },
        dangerBtn: {
            backgroundColor: colors.highlight,
        },
        successBtn: {
            backgroundColor: colors.highlight,
        },
        secondaryBtn: {
            backgroundColor: colors.highlight + '10',
            borderWidth: border,
            borderColor: colors.border,
        },
        btnText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.background,
        },
        btnTextSecondary: {
            color: colors.text,
        },
        settingsRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 16,
            marginBottom: 16
        },
        settingsLabel: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        settingsText: {
            fontSize: 14,
            color: colors.textDesc,
            fontWeight: '500',
            marginLeft: 8,
        },
        pickerContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
    }), [colors, variables, border]);

    const showToast = useCallback((type, text1, text2 = '') => {
        Toast.show({ type, text1, text2 });
    }, []);

    const addMessage = useCallback((text, type = 'info') => {
        showToast(type, type.charAt(0).toUpperCase() + type.slice(1), text);
    }, [showToast]);

    const handleTimerComplete = useCallback(() => {
        setIsRunning(false);
        setIsPaused(false);
        setNotificationId(null);
        addMessage('Pomodoro completed!', 'success');
    }, [addMessage]);

    const startTimer = useCallback(async () => {
        if (notify) {
            const seconds = Math.floor(duration / 1000);
            const id = await scheduleNotification(seconds, '⏰ Pomodoro Complete', 'Your timer has ended!');
            if (id) setNotificationId(id);
        }

        setIsRunning(true);
        setIsPaused(false);
    }, [notify, duration]);

    const pauseTimer = useCallback(() => {
        if (!isRunning) {
            addMessage('Start the timer first!', 'info');
            return;
        }
        setIsPaused(true);
        setIsRunning(false);
    }, [isRunning, addMessage]);

    const resetTimer = useCallback(async () => {
        setIsRunning(false);
        setIsPaused(false);
        if (notificationId) {
            await cancelScheduledNotification(notificationId);
            setNotificationId(null);
        }
        addMessage('Timer reset.', 'info');
    }, [notificationId, addMessage]);

    const handleDurationChange = useCallback((val) => {
        if (isRunning || isPaused) return addMessage('Stop the timer to change duration', 'error');
        const newDuration = Number(val);
        setDuration(newDuration);
    }, [isRunning, isPaused, addMessage]);

    const handleNotifyChange = useCallback((val) => {
        if (isRunning) return addMessage('Stop the timer to change notification mode.', 'error');
        setNotify(val);
    }, [isRunning, addMessage]);

    const handleStartReset = useCallback(() => {
        if (isRunning) {
            resetTimer();
        } else {
            startTimer();
        }
    }, [isRunning, resetTimer, startTimer]);

    const handlePauseResume = useCallback(() => {
        if (isPaused) {
            startTimer();
        } else {
            pauseTimer();
        }
    }, [isPaused, startTimer, pauseTimer]);

    // Initial animations
    useEffect(() => {
        const animateInitial = () => {
            Animated.stagger(150, [
                Animated.parallel([
                    Animated.timing(animations.containerOpacity, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.spring(animations.containerTranslate, {
                        toValue: 0,
                        tension: 100,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.spring(animations.timerScale, {
                        toValue: 1,
                        tension: 100,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(animations.quoteContainerOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.parallel([
                    Animated.timing(animations.controlsOpacity, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.spring(animations.controlsTranslate, {
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
    }, [animations]);

    return (
        <HeaderScreen
            headerIcon={<Icons.Ion name="ellipse" size={18} color={colors.highlight} />}
            headerTitle="Pomodoro"
            borderRadius={variables.radius.md}
            paddingMargin={15}
            paddingX={15}
        >
            <Animated.View
                style={[
                    styles.container,
                    {
                        opacity: animations.containerOpacity,
                        transform: [{ translateY: animations.containerTranslate }]
                    }
                ]}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.mainContent}>
                        {/* Session Header */}
                        <View style={styles.sessionHeader}>
                            <Text style={styles.sessionTitle}>{sessionInfo}</Text>
                            <StatusDisplay
                                isRunning={isRunning}
                                isPaused={isPaused}
                                colors={colors}
                                border={border}
                            />
                        </View>

                        {/* Timer and Progress Display */}
                        <TimerUpdater
                            isRunning={isRunning}
                            isPaused={isPaused}
                            duration={duration}
                            colors={colors}
                            border={border}
                            onTimerComplete={handleTimerComplete}
                        />

                        {/* Motivational Quote */}
                        <FadeQuote
                            quoteContainerOpacity={animations.quoteContainerOpacity}
                            quoteTextOpacity={animations.quoteTextOpacity}
                            quoteScale={animations.quoteScale}
                            colors={colors}
                            styles={styles}
                        />

                        {/* Controls */}
                        <Animated.View
                            style={[
                                styles.controlsContainer,
                                {
                                    opacity: animations.controlsOpacity,
                                    transform: [{ translateY: animations.controlsTranslate }]
                                }
                            ]}
                        >
                            <View style={styles.controlsGrid}>
                                {/* Duration Picker */}
                                <View style={styles.pickerContainer}>
                                    <Text style={styles.settingsText}>Choose the interval</Text>
                                    <PickerSheet
                                        value={String(duration)}
                                        options={pomodoroOptions}
                                        onChange={handleDurationChange}
                                        title={'Pomodoro Duration'}
                                        colors={colors}
                                        variables={variables}
                                        note={'Choose your focus duration'}
                                        defaultValue={'1500000'}
                                        disabled={isRunning || isPaused}
                                        pillsPerRow={3}
                                    />
                                </View>

                                {/*
                                <View style={styles.settingsRow}>
                                    <View style={styles.settingsLabel}>
                                        <Text style={styles.settingsText}>Notify when the timer ends</Text>
                                    </View>
                                    <Switch
                                        value={notify}
                                        onValueChange={handleNotifyChange}
                                        thumbColor={!notify ? colors.switchThumbActive : colors.switchThumb}
                                        trackColor={{
                                            true: colors.switchTrackActive,
                                            false: colors.switchTrack
                                        }}
                                    />
                                </View>
                                */}

                                {/* Action Buttons */}
                                <View style={styles.controlRow}>


                                    <TouchableOpacity
                                        style={[
                                            styles.controlBtn,
                                            styles.secondaryBtn
                                        ]}
                                        onPress={handlePauseResume}
                                        disabled={!isRunning && !isPaused}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[
                                            styles.btnText,
                                            styles.btnTextSecondary
                                        ]}>
                                            {isPaused ? 'Resume' : 'Pause'}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.controlBtn,
                                            isRunning ? styles.dangerBtn : styles.primaryBtn
                                        ]}
                                        onPress={handleStartReset}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.btnText}>
                                            {isRunning ? 'Reset' : 'Start'}
                                        </Text>
                                    </TouchableOpacity>

                                </View>
                            </View>
                        </Animated.View>
                    </View>
                </ScrollView>
            </Animated.View>
        </HeaderScreen>
    );
}