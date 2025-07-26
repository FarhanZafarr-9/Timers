// 🌐 React & React Native
import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    useMemo,
    memo
} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Modal,
    Dimensions,
    TouchableWithoutFeedback
} from 'react-native';

import ViewShot from 'react-native-view-shot';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

import { useTheme } from '../utils/ThemeContext';
import { useSecurity } from '../utils/SecurityContext';

import HighlightText from './HighlightText';
import ExportSheet from './ExportSheet';
import Wave from './Wave';
import ProgressWave from './ProgressWave';

import {
    getPrivacyText,
    getDetailedTimeDisplay,
    getFormattedDate,
    calculateProgress,
    getTimeParts,
    getChippedTime,
    calculateNextOccurrence
} from '../utils/functions';

import { Icons } from '../assets/icons';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const TimerCard = ({
    timer,
    onDelete,
    onEdit,
    handleDuplicate,
    handleFavourite = null,
    onClick,
    selectable,
    selected = false,
    searchText = '',
    buttons,
    defaultUnit,
    layoutMode
}) => {

    const [showOverlay, setShowOverlay] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [activeChip, setActiveChip] = useState(null);
    const slideAnim = useRef(new Animated.Value(screenHeight)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const showOverlayRef = useRef(false); const { privacyMode } = useSecurity();

    useEffect(() => {
        showOverlayRef.current = showOverlay;
    }, [showOverlay]);

    const [staticTimerData, setStaticTimerData] = useState({
        formattedDate: '',
        recurrenceCount: 0
    });

    const { isBorder, headerMode, border, colors, variables, progressMode } = useTheme();
    
    const isLongTitle = timer.title && timer.title.length > 12;
    const isLongName = timer.personName && timer.personName.length > 12;

    const getPrivText = (LIM, VAL) => getPrivacyText(LIM, privacyMode, VAL);
    const shortStr = (TXT, LIM = 12) => TXT && TXT.length > LIM ? TXT.slice(0, LIM) + '…' : TXT;

    const titleText = shortStr(timer.title);
    const nameText = shortStr(timer.personName);

    const privacyTitleText = useMemo(
        () => getPrivText(layoutMode === 'grid' ? 7 : 12, timer.title),
        [timer.title, privacyMode]
    );

    const privacyNameText = useMemo(
        () => getPrivText(layoutMode === 'grid' ? 7 : 12, timer.personName),
        [timer.personName, privacyMode]
    );

    const privacyInterval = useMemo(
        () => getPrivText((privacyMode === 'emoji' || privacyMode === 'mask') ? 5 : 100, timer.isRecurring ? timer.recurrenceInterval : ''),
        [timer.recurrenceInterval, privacyMode]
    );

    const privacyDate = useMemo(
        () => getPrivText((privacyMode === 'emoji' || privacyMode === 'mask') ? 7 : 100, getFormattedDate(timer, dayjs())),
        [timer.date, staticTimerData.formattedDate, privacyMode]
    );

    const privacyPriority = useMemo(
        () => getPrivText((privacyMode === 'emoji' || privacyMode === 'mask') ? 2 : 100, timer.priority.charAt(0).toUpperCase() + timer.priority.slice(1)),
        [timer.priority, privacyMode]
    );

    const privacyRecurringText = useMemo(
        () => getPrivText((privacyMode === 'emoji' || privacyMode === 'mask') ? 4 : 100, timer.isRecurring ? 'Recurring' : 'NonRecurring'),
        [timer.isRecurring, privacyMode]
    );

    const cardRef = useRef();
    const sheetRef = useRef();
    const timerRef = useRef(timer);
    timerRef.current = timer;

    const styles = useMemo(() => createStyles(), [colors, variables, isBorder, searchText, privacyMode, selected, selectable]);

    const staticStyles = useMemo(() => ({
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        midSection: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 8,
        },
        alignItemsFlexStart: {
            alignItems: 'flex-start',
            marginTop: 8
        },
        flexRowGap8: {
            flexDirection: 'row',
            gap: 8,
            justifyContent: 'center',
            alignItems: 'center'
        },
        marginBottom2: {
            marginBottom: 2
        },
        opacity05: {
            opacity: 0.5
        },
        paddingLeft0: {
            paddingLeft: 0
        },
        marginHorizontal0: {
            marginHorizontal: 0
        }
    }), []);

    const calculateStaticTimerData = useCallback(() => {
        const timer = timerRef.current;
        const now = Date.now();
        let targetDate = timer.date;
        let nextDate = timer.nextDate;
        let recurrenceCount = 0;

        if (timer.isRecurring) {
            if (timer.date < now) {
                const result = calculateNextOccurrence(timer, now);
                targetDate = result.nextDate;
                nextDate = result.nextDate;
                recurrenceCount = result.recurrenceCount;
            }
        }

        return {
            formattedDate: getFormattedDate({ ...timer, date: targetDate, nextDate }, dayjs(now)),
            recurrenceCount
        };
    }, []);

    const CompactTimeChip = useMemo(() => memo(() => {
        const [timeParts, setTimeParts] = useState([0, 0, 0, 0, 0, 0]);
        const [status, setStatus] = useState('ongoing');
        const [compactChipIndex, setCompactChipIndex] = useState(5); // Default to seconds
        const timerRef = useRef(timer);
        const animationFrameRef = useRef(null);
        const lastUpdateRef = useRef(0);

        timerRef.current = timer;

        // Calculate the appropriate index based on current timeParts and defaultUnit
        const calculateAutoIndex = useCallback((parts) => {
            if (defaultUnit === 'auto') {
                // Find the largest non-zero unit
                const index = parts.findIndex(part => part > 0);
                return index !== -1 ? index : 5; // Fallback to seconds if all zero
            }
            return defaultUnit === 'years' ? 0 :
                defaultUnit === 'months' ? 1 :
                    defaultUnit === 'days' ? 2 :
                        defaultUnit === 'hours' ? 3 :
                            defaultUnit === 'minutes' ? 4 : 5;
        }, [defaultUnit]);

        const updateTimeParts = useCallback(() => {
            const now = Date.now();
            if (now - lastUpdateRef.current < 200) {
                animationFrameRef.current = requestAnimationFrame(updateTimeParts);
                return;
            }
            lastUpdateRef.current = now;

            const timer = timerRef.current;
            let targetDate = timer.date;
            let nextDate = timer.nextDate;

            if (timer.isRecurring && timer.date < now) {
                const result = calculateNextOccurrence(timer, now);
                targetDate = result.nextDate;
                nextDate = result.nextDate;
            }

            const newTimeParts = getTimeParts({ ...timer, date: targetDate, nextDate }, now);
            const newStatus = timer.isCountdown && !timer.isRecurring && (targetDate - now) <= 0
                ? 'completed'
                : 'ongoing';

            setTimeParts(newTimeParts);
            setStatus(newStatus);

            // For auto mode, update the index when timeParts change
            if (defaultUnit === 'auto') {
                setCompactChipIndex(prevIndex => {
                    const newIndex = calculateAutoIndex(newTimeParts);
                    return newIndex !== prevIndex ? newIndex : prevIndex;
                });
            }

            animationFrameRef.current = requestAnimationFrame(updateTimeParts);
        }, [calculateAutoIndex, defaultUnit]);

        useEffect(() => {
            // Initialize with correct index
            setCompactChipIndex(calculateAutoIndex(timeParts));
            animationFrameRef.current = requestAnimationFrame(updateTimeParts);
            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }, [calculateAutoIndex, updateTimeParts]);

        const timePartsArray = [
            { id: 'years', label: 'Years', index: 0 },
            { id: 'months', label: 'Months', index: 1 },
            { id: 'days', label: 'Days', index: 2 },
            { id: 'hours', label: 'Hours', index: 3 },
            { id: 'minutes', label: 'Minutes', index: 4 },
            { id: 'seconds', label: 'Seconds', index: 5 },
        ];

        const currentChip = timePartsArray[compactChipIndex];
        const currentValue = timeParts[currentChip.index];

        if (status === 'completed') {
            return (
                <View style={styles.chipContainer}>
                    <Text style={styles.chipText}>Completed</Text>
                </View>
            );
        }

        return (
            <TouchableOpacity
                style={[
                    styles.chip,
                    {
                        backgroundColor: colors.highlight + '30',
                        borderColor: colors.highlight,
                    }
                ]}
                onPress={() => {
                    // Cycle through all units in order
                    const nextIndex = (compactChipIndex + 1) % timePartsArray.length;
                    setCompactChipIndex(nextIndex);
                }}
                activeOpacity={0.8}
            >
                <Text style={[styles.chipText, {
                    fontWeight: 'bold',
                    color: colors.highlight
                }]}>
                    {getChippedTime(currentChip.id, timeParts)} {currentChip.label}
                </Text>
            </TouchableOpacity>
        );
    }), [defaultUnit, colors, styles, getChippedTime]);

    useEffect(() => {
        setStaticTimerData(calculateStaticTimerData());
    }, [calculateStaticTimerData, timer]);

    const TimeChipsDisplay = useMemo(() => memo(() => {
        const [timeParts, setTimeParts] = useState([0, 0, 0, 0, 0, 0]);
        const [status, setStatus] = useState('ongoing');
        const timerRef = useRef(timer);
        const animationFrameRef = useRef(null);
        const lastUpdateRef = useRef(0);

        timerRef.current = timer;

        const updateTimeParts = useCallback(() => {
            const now = Date.now();
            if (now - lastUpdateRef.current < 200) {
                animationFrameRef.current = requestAnimationFrame(updateTimeParts);
                return;
            }
            lastUpdateRef.current = now;

            const timer = timerRef.current;
            let targetDate = timer.date;
            let nextDate = timer.nextDate;

            if (timer.isRecurring && timer.date < now) {
                const result = calculateNextOccurrence(timer, now);
                targetDate = result.nextDate;
                nextDate = result.nextDate;
            }

            const newTimeParts = getTimeParts({ ...timer, date: targetDate, nextDate }, now);
            const newStatus = timer.isCountdown && !timer.isRecurring && (targetDate - now) <= 0
                ? 'completed'
                : 'ongoing';

            setTimeParts(newTimeParts);
            setStatus(newStatus);

            animationFrameRef.current = requestAnimationFrame(updateTimeParts);
        }, []);

        useEffect(() => {
            animationFrameRef.current = requestAnimationFrame(updateTimeParts);
            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }, [updateTimeParts]);

        const [years, months, days, hours, minutes, seconds] = timeParts;

        const timePartsArray = [
            { value: years, label: 'y', id: 'years', fullLabel: 'Years' },
            { value: months, label: 'mo', id: 'months', fullLabel: 'Months' },
            { value: days, label: 'd', id: 'days', fullLabel: 'Days' },
            { value: hours, label: 'h', id: 'hours', fullLabel: 'Hours' },
            { value: minutes, label: 'm', id: 'minutes', fullLabel: 'Minutes' },
            { value: seconds, label: 's', id: 'seconds', fullLabel: 'Seconds' },
        ];
        const nonZeroParts = timePartsArray.filter(part => part.value !== 0);

        if (nonZeroParts.length === 0 || status === 'completed') {
            return (
                <View style={styles.chipContainer}>
                    <Text style={styles.chipText}>Completed</Text>
                </View>
            );
        }

        if (activeChip) {
            const chip = timePartsArray.find(part => part.id === activeChip);
            if (!chip) return null;
            return (
                <View style={styles.chipContainer}>
                    <TouchableOpacity
                        style={[
                            styles.chip,
                            { backgroundColor: colors.highlight + '30', borderColor: colors.highlight }
                        ]}
                        onPress={() => setActiveChip(null)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.chipText, { fontWeight: 'bold', color: colors.highlight }]}>
                            {getChippedTime(chip.id, timeParts)} {chip.fullLabel}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.chipContainer}>
                {nonZeroParts.map(part => (
                    <TouchableOpacity
                        key={part.id}
                        style={styles.chip}
                        onPress={() => setActiveChip(part.id)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.chipText}>{part.value}{part.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    }), [activeChip, colors.highlight, styles.chip, styles.chipContainer, styles.chipText, getChippedTime]);

    const TimeDisplay = useMemo(() => memo(() => {
        const [timeParts, setTimeParts] = useState([0, 0, 0, 0, 0, 0]);
        const [status, setStatus] = useState('ongoing');
        const timerRef = useRef(timer);
        const animationFrameRef = useRef(null);
        const lastUpdateRef = useRef(0);

        timerRef.current = timer;

        const updateTimeParts = useCallback(() => {
            const now = Date.now();
            if (now - lastUpdateRef.current < 200) {
                animationFrameRef.current = requestAnimationFrame(updateTimeParts);
                return;
            }
            lastUpdateRef.current = now;

            const timer = timerRef.current;
            let targetDate = timer.date;
            let nextDate = timer.nextDate;

            if (timer.isRecurring && timer.date < now) {
                const result = calculateNextOccurrence(timer, now);
                targetDate = result.nextDate;
                nextDate = result.nextDate;
            }

            const newTimeParts = getTimeParts({ ...timer, date: targetDate, nextDate }, now);
            const newStatus = timer.isCountdown && !timer.isRecurring && (targetDate - now) <= 0
                ? 'completed'
                : 'ongoing';

            setTimeParts(newTimeParts);
            setStatus(newStatus);

            animationFrameRef.current = requestAnimationFrame(updateTimeParts);
        }, []);

        useEffect(() => {
            animationFrameRef.current = requestAnimationFrame(updateTimeParts);
            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }, [updateTimeParts]);

        const [years, months, days, hours, minutes, seconds] = timeParts;

        const timePartsArray = [
            { value: years, label: 'y', id: 'years' },
            { value: months, label: 'mo', id: 'months' },
            { value: days, label: 'd', id: 'days' },
            { value: hours, label: 'h', id: 'hours' },
            { value: minutes, label: 'm', id: 'minutes' },
            { value: seconds, label: 's', id: 'seconds' },
        ];

        const nonZeroParts = timePartsArray.filter(part => part.value !== 0);
        const prefix = status === 'completed' ? 'Completed' : `${timer.isCountdown ? 'Left : ' : 'Elapsed : '}`;

        return (
            <>
                <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{prefix}</Text>
                {prefix === 'Completed' ? null : (
                    nonZeroParts.length > 0
                        ? nonZeroParts.map((part, idx) => (
                            <Text style={{ fontSize: 14 }} key={part.id}>
                                {part.value}{part.label}{idx !== nonZeroParts.length - 1 ? ' ' : ''}
                            </Text>
                        ))
                        : <Text style={{ fontSize: 14 }}>0s</Text>
                )}
            </>
        );
    }), [timer.isCountdown]);

    const ProgressBar = useMemo(() => memo(({ layoutMode }) => {
        const [progressPct, setProgressPct] = useState(0);
        const timerRef = useRef(timer);
        const animationFrameRef = useRef(null);
        const lastUpdateRef = useRef(0);

        timerRef.current = timer;

        const updateProgress = useCallback(() => {
            const now = Date.now();
            if (now - lastUpdateRef.current < 200) {
                animationFrameRef.current = requestAnimationFrame(updateProgress);
                return;
            }
            lastUpdateRef.current = now;

            const timer = timerRef.current;
            let targetDate = timer.date;
            let nextDate = timer.nextDate;

            if (timer.isRecurring && timer.date < now) {
                const result = calculateNextOccurrence(timer, now);
                targetDate = result.nextDate;
                nextDate = result.nextDate;

                if (
                    !timer.notificationScheduledFor ||
                    dayjs(timer.notificationScheduledFor).isBefore(result.nextDate)
                ) {
                    timer.scheduleNotification();
                }
            }

            const newProgressPct = timer.isCountdown ? calculateProgress({ ...timer, date: targetDate, nextDate }, now) : 0;
            setProgressPct(newProgressPct);

            animationFrameRef.current = requestAnimationFrame(updateProgress);
        }, []);

        useEffect(() => {
            if (timer.isCountdown && timer.isRecurring) {
                animationFrameRef.current = requestAnimationFrame(updateProgress);
            }
            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }, [updateProgress, timer.isCountdown, timer.isRecurring]);

        if (!timer.isCountdown || !timer.isRecurring) {
            return null;
        }

        if (layoutMode === 'grid') {
            return (
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 12,
                    gap: 8
                }}>
                    {progressMode === 'linear' ? (
                        <View
                            style={{
                                height: 6,
                                flex: 1,
                                backgroundColor: colors.highlight + '20',
                                borderRadius: 6,
                                overflow: 'hidden'
                            }}
                        >
                            <View
                                style={{
                                    width: `${Math.round(progressPct)}%`,
                                    height: '100%',
                                    backgroundColor: colors.highlight + 'b0',
                                    borderRadius: 8
                                }}
                            />
                        </View>
                    ) : (
                        progressMode === 'halfWave' ? (
                            <View
                                style={{
                                    height: 20,
                                    width: (screenWidth * 0.29) * (progressPct / 100),
                                    maxWidth: screenWidth * 0.29,
                                    backgroundColor: colors.highlight + '20',
                                    borderRadius: 6,
                                    overflow: 'hidden'
                                }}
                            >
                                <Wave
                                    amplitude={4}
                                    frequency={10}
                                    speed={3000}
                                    height={20}
                                    color={colors.highlight}
                                />
                            </View>
                        ) : (
                            <View
                                style={{
                                    backgroundColor: colors.highlight + '20',
                                    borderRadius: 6,
                                    overflow: 'hidden'
                                }}
                            >
                                <ProgressWave
                                    progressPct={progressPct}
                                    amplitude={4}
                                    frequency={8}
                                    speed={3000}
                                    height={20}
                                    width={screenWidth * 0.29}
                                    colorCompleted={colors.highlight}
                                    colorRemaining={colors.highlight + '20'}
                                />
                            </View>
                        )
                    )}

                    <Text
                        style={{
                            color: colors.textDesc,
                            fontSize: 12,
                            fontWeight: '700',
                            opacity: 0.8,
                            minWidth: 40,
                            textAlign: 'right',
                        }}
                    >
                        {progressPct.toFixed(1)}%
                    </Text>
                </View>
            );
        } else {
            return (
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 8,
                    gap: 10,
                    width: '100%',
                    justifyContent: 'space-between'
                }}>
                    {progressMode === 'linear' ? (
                        <View
                            style={{
                                height: 6,
                                width: '85%',
                                backgroundColor: colors.highlight + '20',
                                borderRadius: 6,
                                overflow: 'hidden'
                            }}
                        >
                            <View
                                style={{
                                    width: `${progressPct}%`,
                                    height: '100%',
                                    backgroundColor: colors.highlight + 'b0',
                                    borderRadius: 8
                                }}
                            />
                        </View>
                    ) : (
                        progressMode === 'halfWave' ? (
                            <View
                                style={{
                                    height: 25,
                                    width: (screenWidth * 0.74) * (progressPct / 100),
                                    maxWidth: screenWidth * 0.74,
                                    backgroundColor: colors.highlight + '20',
                                    paddingVertical: 2,
                                    borderRadius: 6,
                                    overflow: 'hidden',
                                }}
                            >
                                <Wave
                                    amplitude={6}
                                    frequency={10}
                                    speed={3000}
                                    height={20}
                                    color={colors.highlight}
                                />
                            </View>
                        ) : (
                            <View style={{
                                backgroundColor: colors.highlight + '20',
                                borderRadius: 6,
                                overflow: 'hidden',
                                paddingVertical: 4,
                            }}>
                                <ProgressWave
                                    progressPct={progressPct}
                                    amplitude={6}
                                    frequency={10}
                                    speed={3000}
                                    height={20}
                                    width={screenWidth * 0.74}
                                    colorCompleted={colors.highlight}
                                    colorRemaining={colors.highlight + '20'}
                                />
                            </View>
                        )
                    )}

                    <Text
                        style={{
                            color: colors.textDesc,
                            fontSize: 12,
                            fontWeight: '700',
                            opacity: 0.8,
                            width: '15%',
                            lineHeight: 20,
                            paddingLeft: 10,
                            alignSelf: 'center'
                        }}
                    >
                        {progressPct.toFixed(1)}%
                    </Text>
                </View>
            );
        }
    }), [colors.highlight, progressMode, screenWidth]);

    const DetailedProgressDisplay = useMemo(() => memo(() => {
        const [progressPct, setProgressPct] = useState(0);
        const [status, setStatus] = useState('ongoing');
        const timerRef = useRef(timer);
        const animationFrameRef = useRef(null);
        const lastUpdateRef = useRef(0);

        timerRef.current = timer;

        const updateProgress = useCallback(() => {
            const now = Date.now();
            if (now - lastUpdateRef.current < 200) {
                animationFrameRef.current = requestAnimationFrame(updateProgress);
                return;
            }
            lastUpdateRef.current = now;

            const timer = timerRef.current;
            let targetDate = timer.date;
            let nextDate = timer.nextDate;

            if (timer.isRecurring && timer.date < now) {
                const result = calculateNextOccurrence(timer, now);
                targetDate = result.nextDate;
                nextDate = result.nextDate;
            }

            const newProgressPct = timer.isCountdown ? calculateProgress({ ...timer, date: targetDate, nextDate }, now) : 0;
            const newStatus = timer.isCountdown && !timer.isRecurring && (targetDate - now) <= 0
                ? 'completed'
                : 'ongoing';

            setProgressPct(newProgressPct);
            setStatus(newStatus);

            animationFrameRef.current = requestAnimationFrame(updateProgress);
        }, []);

        useEffect(() => {
            animationFrameRef.current = requestAnimationFrame(updateProgress);
            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }, [updateProgress]);

        if (!timer.isCountdown || status !== 'ongoing') {
            return null;
        }

        return (
            <Text
                style={{
                    color: colors.textDesc,
                    fontSize: 12,
                    fontWeight: '600',
                    opacity: 0.8,
                    marginLeft: 8,
                    marginBottom: 2
                }}
            >
                {(100 - progressPct).toFixed(4)} %
            </Text>
        );
    }), [colors.textDesc, timer.isCountdown]);

    const ArrowIcon = useMemo(() => memo(({ colors, showOverlay }) => (
        <Icons.Material
            name={showOverlay ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={18}
            color={colors.text}
            style={staticStyles.opacity05}
        />
    )), [staticStyles.opacity05]);

    function createStyles() {
        return StyleSheet.create({
            timerItem: {
                backgroundColor: colors.settingBlock,
                padding: 12,
                borderRadius: variables.radius.md,
                marginBottom: 10,
                borderWidth: border,
                borderColor: !isBorder ? 0 : (searchText === '' || privacyMode !== 'off') ? colors.border : colors.highlight + '3a',
                minWidth: '48%',
                maxWidth: '100%',
                marginVertical: 6,
                marginRight: layoutMode === 'grid' ? '1.5%' : 0,
                marginLeft: layoutMode === 'grid' ? '0.5%' : 0,
            },
            header: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
            },
            timerTitle: {
                color: colors.textDesc,
                fontSize: layoutMode === 'grid' && (privacyMode === 'mask' || privacyMode === 'emoji') ? 10 : (isLongName && isLongTitle) ? 14 : 16,
                fontWeight: 'bold',
                paddingLeft: 6,
                height: 30,
                textAlign: 'center',
                alignSelf: 'center',
            },
            priorityIndicator: {
                flexDirection: 'row',
                alignItems: 'center',
            },
            priorityDot: {
                width: 10,
                height: 10,
                borderRadius: variables.radius.circle,
                borderWidth: border,
            },
            timerQuickInfo: {
                color: colors.text,
                fontSize: 14,
                fontWeight: 'bold',
                letterSpacing: 1,
                backgroundColor: colors.highlight + '08',
                borderWidth: border,
                borderColor: colors.border,
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                height: 40,
                padding: 8,
                paddingHorizontal: 12,
                borderRadius: variables.radius.sm,
            },
            namePill: {
                backgroundColor: colors.highlight + '08',
                paddingVertical: 6,
                paddingHorizontal: 12,
                marginHorizontal: 8,
                borderRadius: variables.radius.sm,
                alignSelf: 'flex-start',
                borderWidth: border,
                borderColor: colors.border,
                color: colors.textDesc,
                fontSize: layoutMode === 'grid' && (privacyMode === 'mask' || privacyMode === 'emoji') ? 6 : (isLongName && isLongTitle) ? 10 : 12,
                fontWeight: 'bold',
            },
            midSection: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 8,
            },
            overlay: {
                flex: 1,
                backgroundColor: (headerMode === 'fixed' ? colors.cardLighter : colors.background) + '90', // for modals
                justifyContent: 'flex-end',
            },
            bottomSheet: {
                backgroundColor: colors.modalBg,
                borderTopLeftRadius: variables.radius.lg,
                borderTopRightRadius: variables.radius.lg,
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 40,
                minHeight: 280,
                maxHeight: screenHeight * 0.9,
                borderWidth: border,
                borderColor: colors.border,
            },
            handle: {
                width: 40,
                height: 4,
                backgroundColor: colors.border,
                borderRadius: 2,
                alignSelf: 'center',
                marginBottom: 20,
            },
            overlayTitle: {
                color: colors.text,
                fontSize: layoutMode === 'grid' && (privacyMode === 'mask' || privacyMode === 'emoji') ? 10 : (isLongName && isLongTitle) ? 12 : 14,
                fontWeight: '500',
                height: 28,
                alignSelf: 'center',
                textAlign: 'center',
                marginBottom: 6
            },
            overlayPersonName: {
                color: colors.textDesc,
                fontSize: layoutMode === 'grid' && (privacyMode === 'mask' || privacyMode === 'emoji') ? 12 : (isLongName && isLongTitle) ? 10 : 12,
                fontWeight: '500',
                height: 26,
                backgroundColor: colors.settingBlock,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: variables.radius.sm,
                borderWidth: border,
                borderColor: colors.border,
            },
            timeSection: {
                backgroundColor: colors.settingBlock,
                padding: 16,
                borderRadius: variables.radius.md,
                marginBottom: 16,
                borderWidth: border,
                borderColor: colors.border,
                position: 'relative',
                overflow: 'hidden',
            },
            timeLabel: {
                color: colors.textDesc,
                fontSize: 12,
                marginBottom: 4,
                height: 20
            },
            timeValue: {
                color: colors.text,
                fontSize: 16,
                height: 55,
                fontWeight: '600',
                paddingVertical: 4
            },
            detailsSection: {
                backgroundColor: colors.highlight + '10',
                padding: 16,
                borderRadius: variables.radius.md,
                marginBottom: 20,
            },
            detailRow: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
            },
            detailLabel: {
                color: colors.textDesc,
                fontSize: 14,
            },
            detailValue: {
                color: colors.text,
                fontSize: 12,
                fontWeight: '500',
                height: 28,
                backgroundColor: colors.settingBlock,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: variables.radius.sm,
                borderWidth: border,
                borderColor: colors.border,
            },
            actionsSection: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 12,
            },
            actionButton: {
                flex: 1,
                paddingVertical: 6,
                borderRadius: variables.radius.sm,
                alignItems: 'center',
                borderWidth: border,
                borderColor: colors.border,
            },
            editButton: {
                backgroundColor: colors.settingBlock,
            },
            deleteButton: {
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: 'rgba(239, 68, 68, 0.5)',
                minHeight: 40,
                marginBottom: 20,
            },
            exportButton: {
                backgroundColor: colors.settingBlock,
            },
            actionButtonText: {
                color: colors.text,
                fontSize: 14,
                fontWeight: '600',
                textAlign: 'center',
            },
            exportButtonText: {
                color: colors.highlight,
                fontSize: 16,
                fontWeight: '600',
                textAlign: 'center',
            },
            statusIndicator: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.settingBlock,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: variables.radius.sm,
                gap: 8,
                borderWidth: border,
                borderColor: colors.border,
            },
            statusText: {
                color: colors.textDesc,
                fontSize: 12,
                fontWeight: '500',
                height: 16,
            },
            chipContainer: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 6,
                marginVertical: 8,
                paddingBottom: 8,
            },
            chip: {
                backgroundColor: colors.highlight + '10',
                paddingVertical: 4,
                paddingHorizontal: 12,
                borderRadius: variables.radius.sm,
                borderWidth: border,
                borderColor: colors.border,
                justifyContent: 'center',
                alignItems: 'center',
            },
            chipText: {
                color: colors.text,
                fontSize: 16,
                fontWeight: '600',
                height: 22,
                textAlign: 'center',
            },
        });
    }

    const handleEdit = useCallback(() => {
        closeOverlay();
        onEdit(timer);
    }, [onEdit, timer]);

    const handleDelete = useCallback(() => {
        closeOverlay();
        onDelete(timer.id);
    }, [onDelete, timer.id]);

    const handleCardPress = useCallback(() => {
        if (!selectable) { openOverlay(); }
        if (onClick) onClick();
    }, [onClick, selectable]);

    const openOverlay = useCallback(() => {
        setShowOverlay(true);
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [slideAnim, fadeAnim]);

    const closeOverlay = useCallback(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 280,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowOverlay(false);
        });
    }, [slideAnim, fadeAnim]);

    const cardStyle = useMemo(() => ({
        ...styles.timerItem,
        ...(selected && {
            borderColor: 'hsla(0, 84.20%, 60.20%, 0.60)',
            backgroundColor: 'hsla(0, 84.20%, 60.20%, 0.10)'
        }),
        ...(selectable && !selected && {
            borderColor: 'hsla(0, 0.00%, 38.00%, 0.60)'
        })
    }), [selected, selectable, styles.timerItem]);

    return (
        <>
            <ViewShot ref={cardRef} options={{ format: 'png', quality: 1 }}>
                <TouchableOpacity onPress={handleCardPress} activeOpacity={1}>
                    {layoutMode === 'grid' ? (
                        <View style={cardStyle}>
                            <View style={staticStyles.header}>
                                <View>
                                    <Text style={[
                                        styles.timerTitle,
                                        staticStyles.paddingLeft0,
                                        (privacyMode === 'invisible' || privacyMode === 'ghost') && {
                                            color: colors.settingBlock + '00',
                                            backgroundColor: colors.highlight + '08',
                                            paddingHorizontal: 12,
                                            paddingVertical: 4,
                                            borderRadius: variables.radius.sm,
                                            borderWidth: border,
                                            borderColor: colors.border,
                                        }
                                    ]}>
                                        {privacyTitleText}
                                    </Text>
                                </View>
                                {timer.personName && (
                                    <Text style={[
                                        styles.namePill,
                                        staticStyles.marginHorizontal0,
                                        privacyMode === 'invisible' && { color: colors.highlight + '00' }
                                    ]}>
                                        {privacyNameText}
                                    </Text>
                                )}
                            </View>

                            <View style={staticStyles.alignItemsFlexStart}>
                                <CompactTimeChip />
                            </View>

                            <ProgressBar layoutMode="grid" />
                        </View>
                    ) : (
                        <View style={cardStyle}>
                            <View style={staticStyles.header}>
                                {privacyMode === 'off' ? (
                                    <View style={staticStyles.flexRowGap8}>
                                        <HighlightText
                                            text={titleText}
                                            textStyle={styles.timerTitle}
                                            search={searchText}
                                            colors={colors}
                                        />
                                        {timer.isFavourite && <Icons.Material
                                            name={"favorite"}
                                            size={14}
                                            color={colors.highlight}
                                            style={{marginBottom: 8}}
                                        />}
                                    </View>
                                ) : (
                                    <Text style={[
                                        styles.timerTitle,
                                        (privacyMode === 'invisible' || privacyMode === 'ghost') && {
                                            color: colors.settingBlock + '00',
                                            backgroundColor: colors.highlight + '08',
                                            paddingHorizontal: 12,
                                            paddingVertical: 4,
                                            borderRadius: variables.radius.sm,
                                            borderWidth: border,
                                            borderColor: colors.border,
                                        }
                                    ]}>
                                        {privacyTitleText}
                                    </Text>
                                )}
                                <View style={styles.priorityIndicator}>
                                    {timer.personName && (
                                        privacyMode === 'off' ? (
                                            <HighlightText
                                                text={nameText}
                                                textStyle={styles.namePill}
                                                search={searchText}
                                                colors={colors}
                                            />
                                        ) : (
                                            <Text style={[
                                                styles.namePill,
                                                privacyMode === 'invisible' && { color: colors.highlight + '00' }
                                            ]}>
                                                {privacyNameText}
                                            </Text>
                                        )
                                    )}
                                </View>
                            </View>

                            <View style={staticStyles.midSection}>
                                <Text style={styles.timerQuickInfo}>
                                    <TimeDisplay />
                                </Text>
                                <ArrowIcon colors={colors} showOverlay={showOverlay} />
                            </View>
                            <ProgressBar layoutMode="list" />
                        </View>
                    )}
                </TouchableOpacity>
            </ViewShot >

            {/* Bottom Sheet Overlay */}
            <Modal
                visible={showOverlay}
                transparent={true}
                animationType="none"
                onRequestClose={closeOverlay}
            >
                <TouchableWithoutFeedback onPress={closeOverlay}>
                    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <Animated.View
                                style={[
                                    styles.bottomSheet,
                                    {
                                        transform: [{ translateY: slideAnim }],
                                    },
                                ]}
                            >
                                <ViewShot ref={sheetRef} options={{ format: 'png', quality: 1 }}>
                                    <View style={styles.handle} />

                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0, justifyContent: 'space-between', paddingHorizontal: 4 }}>
                                        {/* Title and Person */}
                                        <Text style={[
                                            styles.overlayTitle,
                                            (privacyMode === 'invisible' || privacyMode === 'ghost') && {
                                                color: colors.modalBg + '00',
                                                backgroundColor: colors.settingBlock,
                                                paddingHorizontal: 12,
                                                paddingVertical: 0,
                                                borderRadius: variables.radius.sm,
                                                borderWidth: border,
                                                borderColor: colors.border,
                                            }
                                        ]}>
                                            {privacyTitleText}
                                        </Text>

                                        <Text style={[styles.detailValue, { color: privacyMode === 'invisible' ? colors.text + '00' : colors.textDesc, marginBottom: 4 }]}>
                                            {privacyMode === 'off' ? staticTimerData.formattedDate : privacyDate}
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between', paddingHorizontal: 4 }}>
                                        {timer.personName && (
                                            <Text style={[
                                                styles.overlayPersonName,
                                                privacyMode === 'invisible' && { color: colors.modalBg + '00' }
                                            ]}>
                                                For: {privacyNameText}
                                            </Text>
                                        )}

                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>

                                            {timer.isRecurring && timer.recurrenceInterval && (
                                                <View style={styles.statusIndicator}>
                                                    <Text style={[styles.statusText, { color: privacyMode === 'invisible' ? colors.text + '00' : colors.textDesc }]}>{privacyInterval}</Text>
                                                </View>
                                            )}
                                            {timer.isRecurring && (
                                                <View style={styles.statusIndicator}>
                                                    {privacyMode === 'off' && <Icons.Material
                                                        name="autorenew"
                                                        size={12}
                                                        color={colors.textDesc}
                                                    />}
                                                    <Text style={[styles.statusText, , { color: privacyMode === 'invisible' ? colors.text + '00' : colors.textDesc }]}>{privacyRecurringText}</Text>
                                                </View>
                                            )}

                                            {timer.isRecurring && staticTimerData.recurrenceCount > 0 && (
                                                <View style={styles.statusIndicator}>
                                                    <Text style={styles.statusText}>{staticTimerData.recurrenceCount}</Text>
                                                </View>
                                            )}
                                            <View style={styles.statusIndicator}>
                                                {timer.priority && privacyMode === 'off' && (
                                                    <View
                                                        style={[
                                                            styles.priorityDot,
                                                            {
                                                                backgroundColor:
                                                                    timer.priority === 'high'
                                                                        ? 'hsla(0, 84.20%, 60.20%, 0.30)'
                                                                        : timer.priority === 'normal'
                                                                            ? 'hsla(134, 39.02%, 50.20%, 0.30)'
                                                                            : 'hsla(210, 100%, 50.20%, 0.30)',
                                                                borderColor:
                                                                    timer.priority === 'high'
                                                                        ? '#ef4444'
                                                                        : timer.priority === 'normal'
                                                                            ? '#22c55e'
                                                                            : '#3b82f6',
                                                            },
                                                        ]}
                                                    />
                                                )}
                                                <Text style={[styles.statusText, , { color: privacyMode === 'invisible' ? colors.text + '00' : colors.textDesc }]}>
                                                    {privacyPriority}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Time Section */}
                                    <View style={[styles.timeSection, { paddingBottom: 16 }]}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Text style={styles.timeLabel}>
                                                {timer.isCountdown ? 'Time Remaining' : 'Time Elapsed'}
                                            </Text>
                                            <DetailedProgressDisplay />
                                        </View>
                                        <Text style={styles.timeValue}>
                                            <TimeChipsDisplay />
                                        </Text>
                                    </View>
                                </ViewShot>

                                {/* Action Buttons */}
                                {buttons === 'on' &&
                                    <>
                                        <View style={styles.actionsSection}>
                                            <TouchableOpacity
                                                onPress={handleEdit}
                                                style={[styles.actionButton, styles.editButton]}
                                                activeOpacity={0.7}
                                            >
                                                <Icons.Material name="edit" size={20} color={colors.highlight} />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => setShowExportModal(true)}
                                                style={[styles.actionButton, styles.exportButton]}
                                                activeOpacity={0.7}
                                            >
                                                <Icons.Material name="file-upload" size={20} color={colors.highlight} />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={handleDuplicate}
                                                style={[styles.actionButton, styles.exportButton]}
                                                activeOpacity={0.7}
                                            >
                                                <Icons.Material name="control-point-duplicate" size={20} color={colors.highlight} />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => handleFavourite(timer.id)}
                                                style={[styles.actionButton, styles.exportButton]}
                                                activeOpacity={0.7}
                                            >
                                                <Icons.Material
                                                    name={timer.isFavourite ? "favorite" : "favorite-border"}
                                                    size={20}
                                                    color={colors.highlight}
                                                />
                                            </TouchableOpacity>

                                        </View>
                                        <TouchableOpacity
                                            onPress={handleDelete}
                                            style={[styles.actionButton, styles.deleteButton]}
                                            activeOpacity={0.7}
                                        >
                                            <Icons.Material name="delete" size={22} color="#ef4444" />
                                        </TouchableOpacity>
                                    </>
                                }
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </Modal >

            {/* Export Bottom Sheet */}
            < ExportSheet
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
                cardRef={cardRef}
                sheetRef={sheetRef}
                colors={colors}
                variables={variables}
            />
        </>
    );
};

export default memo(TimerCard, (prevProps, nextProps) => {
    // Basic prop comparison
    if (prevProps.selected !== nextProps.selected) return false;
    if (prevProps.searchText !== nextProps.searchText) return false;
    if (prevProps.layoutMode !== nextProps.layoutMode) return false;
    if (prevProps.defaultUnit !== nextProps.defaultUnit) return false;
    if (prevProps.buttons !== nextProps.buttons) return false;

    // Deep comparison for timer object - only check relevant properties
    const timerProps = ['id', 'title', 'personName', 'date', 'isRecurring', 'recurrenceInterval',
        'isCountdown', 'isFavourite', 'priority', 'nextDate'];

    return timerProps.every(prop => {
        return prevProps.timer[prop] === nextProps.timer[prop];
    });
});