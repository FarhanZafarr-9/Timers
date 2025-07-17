import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Dimensions, Animated, ScrollView } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import ScreenWithHeader from '../components/ScreenWithHeader';
import { Icons } from '../assets/icons';
import BottomSheetPicker from '../components/BottomSheetPicker';
import WaveProgress from '../components/WaveProgress';
import { pomodoroOptions, quotes } from '../utils/functions';
import Toast from 'react-native-toast-message';
import { scheduleNotification, cancelScheduledNotification } from '../utils/Notificationhelper';
import ModernSwitch from '../components/ModernSwitch';

const { width: screenWidth } = Dimensions.get('window');

export default function PomodoroScreen() {
    const { colors, variables, border } = useTheme();

    const [duration, setDuration] = useState(1500000);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [notify, setNotify] = useState(false);
    const [notificationId, setNotificationId] = useState(null);

    const [progress, setProgress] = useState(0);
    const startTimeRef = useRef(null);
    const elapsedRef = useRef(0);
    const intervalRef = useRef(null);

    // Animation refs
    const containerOpacity = useRef(new Animated.Value(0)).current;
    const containerTranslate = useRef(new Animated.Value(30)).current;
    const timerScale = useRef(new Animated.Value(0.9)).current;
    const controlsOpacity = useRef(new Animated.Value(0)).current;
    const controlsTranslate = useRef(new Animated.Value(20)).current;

    // Quote animation states
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const quoteTextOpacity = useRef(new Animated.Value(0)).current;
    const quoteScale = useRef(new Animated.Value(0.95)).current;
    const quoteContainerOpacity = useRef(new Animated.Value(0)).current;

    // Status animation
    const statusOpacity = useRef(new Animated.Value(0)).current;
    const statusScale = useRef(new Animated.Value(0.8)).current;

    const showToast = (type, text1, text2 = '') => {
        Toast.show({ type, text1, text2 });
    };

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const addMessage = useCallback((text, type = 'info') => {
        showToast(type, capitalize(type), text);
    }, []);

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
                    Animated.spring(timerScale, {
                        toValue: 1,
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

    // Status animation effect
    useEffect(() => {
        const animateStatus = () => {
            Animated.parallel([
                Animated.timing(statusOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(statusScale, {
                    toValue: 1,
                    tension: 120,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        };

        if (isRunning || isPaused) {
            animateStatus();
        } else {
            Animated.parallel([
                Animated.timing(statusOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(statusScale, {
                    toValue: 0.8,
                    tension: 120,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isRunning, isPaused]);

    // Quote animation effect
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
                }, 50);
            });
        };

        if (quoteIndex === 0 && displayedText === '') {
            animateQuote();
        }

        // Set up interval for quote changes
        const interval = setInterval(() => {
            setQuoteIndex(prev => (prev + 1) % quotes.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [quoteIndex]);

    // Trigger animation when quote index changes
    useEffect(() => {
        if (quoteIndex > 0 || displayedText !== '') {
            const currentQuote = quotes[quoteIndex];

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

                let index = 0;
                const typeInterval = setInterval(() => {
                    if (index < currentQuote.length) {
                        setDisplayedText(currentQuote.substring(0, index + 1));
                        index++;
                    } else {
                        clearInterval(typeInterval);
                        setIsTyping(false);
                    }
                }, 50);
            });
        }
    }, [quoteIndex]);

    const startTimer = async () => {
        if (notify) {
            const seconds = Math.floor(duration / 1000);
            const id = await scheduleNotification(seconds, '⏰ Pomodoro Complete', 'Your timer has ended!');
            if (id) setNotificationId(id);
        }

        startTimeRef.current = Date.now() - elapsedRef.current;
        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const prog = Math.min(elapsed / duration, 1);
            setProgress(prog);
            if (prog >= 1) {
                clearInterval(intervalRef.current);
                setIsRunning(false);
                setIsPaused(false);
                elapsedRef.current = 0;
                setNotificationId(null);
                addMessage('Pomodoro completed!', 'success');
            }
        }, 100);
        setIsRunning(true);
        setIsPaused(false);
    };

    const pauseTimer = () => {
        if (!isRunning) {
            addMessage('Start the timer first!', 'info');
            return;
        }
        clearInterval(intervalRef.current);
        // Store the current elapsed time when pausing
        elapsedRef.current = Date.now() - startTimeRef.current;
        setIsPaused(true);
        setIsRunning(false);
    };

    const resetTimer = async () => {
        clearInterval(intervalRef.current);
        setIsRunning(false);
        setIsPaused(false);
        setProgress(0);
        elapsedRef.current = 0;
        if (notificationId) {
            await cancelScheduledNotification(notificationId);
            setNotificationId(null);
        }
        addMessage('Timer reset.', 'info');
    };

    const remainingMs = Math.max(duration - (progress * duration), 0);
    const formattedTime = new Date(remainingMs).toISOString().substring(11, 19);

    // Get current session info
    // Get current session info with expanded options
    const getCurrentSession = () => {
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);

        // Quick sessions (under 5 minutes)
        if (duration === 15000) return 'Flash Focus';
        if (duration === 30000) return 'Quick Breather';
        if (duration === 60000) return 'Minute Sprint';

        // Short sessions (5-15 minutes)
        if (minutes === 5) return 'Micro Break';
        if (minutes === 10) return 'Light Focus';
        if (minutes === 15) return 'Mini Sprint';

        // Standard Pomodoro sessions
        if (minutes === 25) return 'Classic Pomodoro';
        if (minutes === 30) return 'Deep Dive';

        // Extended sessions
        if (minutes === 60) return 'Hour of Power';
        if (minutes === 120) return 'Marathon Session';

        // Custom sessions fallback
        if (seconds > 0) {
            return `Custom: ${minutes}m ${seconds}s`;
        }
        return `Custom: ${minutes}m`;
    };

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

    const getStatusColor = () => {
        if (isRunning) return colors.text;
        if (isPaused) return colors.highlight + 'b0';
        return colors.textDesc;
    };

    const getStatusText = () => {
        if (isRunning) return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icons.Ion name="play" size={12} color={colors.text} />
                <Text style={[styles.statusText, { color: getStatusColor(), marginLeft: 6 }]}>
                    Running
                </Text>
            </View>
        );
        if (isPaused) return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icons.Ion name="pause" size={12} color={colors.text} />
                <Text style={[styles.statusText, { color: getStatusColor(), marginLeft: 6 }]}>
                    Paused
                </Text>
            </View>
        );
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icons.Ion name="timer-outline" size={12} color={colors.text} />
                <Text style={[styles.statusText, { color: getStatusColor(), marginLeft: 6 }]}>
                    Ready
                </Text>
            </View>
        );
    };

    const styles = StyleSheet.create({
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
        },
        statusContainer: {
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.sm,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderWidth: border,
            borderColor: colors.border,
        },
        statusText: {
            fontSize: 12,
            fontWeight: '500',
            color: colors.text
        },
        timerContainer: {
            alignItems: 'center',
            marginBottom: 30,
        },
        timerText: {
            fontSize: 48,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 8,
        },
        subLabel: {
            fontSize: 16,
            color: colors.textDesc,
            marginBottom: 20,
            height: 25
        },
        waveContainer: {
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.md,
            padding: 20,
            marginBottom: 20,
            borderWidth: border,
            borderColor: colors.border,
            width: '100%',
            alignItems: 'center',
        },
        waveBox: {
            width: '100%',
            height: 24,
            borderRadius: variables.radius.sm,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.highlight + '10',
        },
        progressInfo: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: 12,
        },
        progressLabel: {
            fontSize: 12,
            color: colors.textDesc,
            fontWeight: '500',
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
        cursor: {
            fontSize: 16,
            color: colors.highlight,
            fontWeight: '700',
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
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: variables.radius.md,
            alignItems: 'center',
            justifyContent: 'center',
        },
        primaryBtn: {
            backgroundColor: colors.highlight,
        },
        dangerBtn: {
            backgroundColor: colors.settingBlock,
        },
        successBtn: {
            backgroundColor: colors.success,
        },
        secondaryBtn: {
            backgroundColor: colors.accent + '80',
            borderWidth: border,
            borderColor: colors.border,
        },
        btnText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
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
    });

    return (
        <ScreenWithHeader
            headerIcon={<Icons.Ion name="hourglass-outline" size={18} color={colors.highlight} />}
            headerTitle="Pomodoro"
            borderRadius={variables.radius.md}
            paddingMargin={15}
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
                        {/* Session Header */}
                        <View style={styles.sessionHeader}>
                            <Text style={styles.sessionTitle}>{getCurrentSession()}</Text>
                            <Animated.View
                                style={[
                                    styles.statusContainer,
                                    {
                                        opacity: statusOpacity,
                                        transform: [{ scale: statusScale }]
                                    }
                                ]}
                            >
                                {getStatusText()}
                            </Animated.View>
                        </View>

                        {/* Timer Display */}
                        <Animated.View
                            style={[
                                styles.timerContainer,
                                { transform: [{ scale: timerScale }] }
                            ]}
                        >
                            <Text style={styles.timerText}>{formattedTime}</Text>
                            <Text style={styles.subLabel}>Time Remaining</Text>
                        </Animated.View>

                        {/* Wave Progress */}
                        <View style={styles.waveContainer}>
                            <View style={styles.waveBox}>
                                <WaveProgress
                                    progressPct={(progress * 100).toFixed(2)}
                                    amplitude={5}
                                    frequency={15}
                                    speed={3000}
                                    height={24}
                                    width={screenWidth * 0.8}
                                    colorCompleted={colors.highlight}
                                    colorRemaining={colors.highlight + '20'}
                                />
                            </View>
                            <View style={styles.progressInfo}>
                                <Text style={styles.progressLabel}>
                                    Progress: {(progress * 100).toFixed(2)}%
                                </Text>
                                <Text style={styles.progressLabel}>
                                    Elapsed: {new Date((progress * duration)).toISOString().substring(11, 19)}
                                </Text>
                            </View>
                        </View>

                        {/* Motivational Quote */}
                        <Animated.View
                            style={[
                                styles.quoteCard,
                                { opacity: quoteContainerOpacity }
                            ]}
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

                        {/* Controls */}
                        <Animated.View
                            style={[
                                styles.controlsContainer,
                                {
                                    opacity: controlsOpacity,
                                    transform: [{ translateY: controlsTranslate }]
                                }
                            ]}
                        >
                            <View style={styles.controlsGrid}>
                                {/* Duration Picker */}
                                <View style={styles.pickerContainer}>
                                    <Text style={styles.settingsText}>Choose the interval</Text>
                                    <BottomSheetPicker
                                        value={String(duration)}
                                        options={pomodoroOptions}
                                        onChange={(val) => {
                                            if (isRunning || isPaused) return addMessage('Stop the timer to change duration', 'error');
                                            setDuration(Number(val));
                                        }}
                                        title={'Pomodoro Duration'}
                                        colors={colors}
                                        variables={variables}
                                        note={'Choose your focus duration'}
                                        defaultValue={'1500000'}
                                        disabled={isRunning || isPaused}
                                        pillsPerRow={3}
                                    />
                                </View>



                                {/* Notification Toggle */}
                                <View style={styles.settingsRow}>
                                    <View style={styles.settingsLabel}>
                                        <Text style={styles.settingsText}>Notify when the timer ends</Text>
                                    </View>
                                    <ModernSwitch
                                        value={notify}
                                        onValueChange={(val) => {
                                            if (isRunning) return addMessage('Stop the timer to change notification mode.', 'error');
                                            setNotify(val);
                                        }}
                                        thumbColor={!notify ? colors.switchThumbActive : colors.switchThumb}
                                        trackColor={{
                                            true: colors.switchTrackActive,
                                            false: colors.switchTrack
                                        }}
                                    />
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.controlRow}>
                                    <TouchableOpacity
                                        style={[
                                            styles.controlBtn,
                                            isRunning ? styles.dangerBtn : styles.primaryBtn
                                        ]}
                                        onPress={isRunning ? resetTimer : startTimer}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.btnText}>
                                            {isRunning ? 'Reset' : 'Start'}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.controlBtn,
                                            isPaused ? styles.successBtn :
                                                (isRunning ? styles.secondaryBtn : styles.secondaryBtn)
                                        ]}
                                        onPress={isPaused ? startTimer : pauseTimer}
                                        disabled={!isRunning && !isPaused}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[
                                            styles.btnText,
                                            !isPaused && !isRunning ? styles.btnTextSecondary : {}
                                        ]}>
                                            {isPaused ? 'Resume' : 'Pause'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
                    </View>
                </ScrollView>
            </Animated.View>
        </ScreenWithHeader>
    );
}