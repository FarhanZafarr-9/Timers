// 🌐 React & React-Native
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
    Modal,
    Animated,
    TouchableWithoutFeedback,
    StyleSheet,
    Dimensions,
    TouchableOpacity
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { Icons } from '../assets/icons';

import {
    getTimeParts,
    getChippedTime,
    calculateNextOccurrence,
    calculateProgress
} from '../utils/functions';

const { height: screenHeight } = Dimensions.get('window');

const TimerOverlay = ({
    visible,
    onClose,
    timer,
    staticTimerData,
    privacyMode,
    colors,
    variables,
    border,
    headerMode,
    sheetRef,
    getPrivText,
    activeChip,
    setActiveChip,
    layoutMode,
    isLongName,
    isLongTitle
}) => {

    /* ---------- styles created inside component ---------- */
    const s = StyleSheet.create({
        overlay: { flex: 1, justifyContent: 'flex-end' },
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
            borderColor: colors.border
        },
        handle: {
            width: 40,
            height: 4,
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: 20,
            backgroundColor: colors.border
        },
        // Consolidated chip styles
        chipContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 6,
            marginVertical: 8,
            minHeight: 32, // Fixed height to prevent layout shifts
        },
        chip: {
            paddingVertical: 4,
            paddingHorizontal: 12,
            borderRadius: variables.radius.sm,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: border,
        },
        chipInactive: {
            backgroundColor: colors.highlight + '10',
            borderColor: colors.border,
        },
        chipActive: {
            backgroundColor: colors.highlight + '30',
            borderColor: colors.highlight,
        },
        chipText: {
            fontSize: 14,
            fontWeight: '600',
            height: 20,
            textAlign: 'center',
        },
        chipTextInactive: {
            color: colors.text,
        },
        chipTextActive: {
            color: colors.highlight,
            fontWeight: 'bold',
        },
    });

    /* ---------- refs / anims ---------- */
    const slideAnim = useRef(new Animated.Value(screenHeight)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    /* ---------- stable privacy strings (prevent jumbling) ---------- */
    const privacyTitleText = useMemo(
        () => getPrivText(layoutMode === 'grid' ? 7 : 12, timer.title),
        [timer.title, privacyMode, layoutMode] // Removed getPrivText dependency
    );
    const privacyNameText = useMemo(
        () => getPrivText(layoutMode === 'grid' ? 7 : 12, timer.personName),
        [timer.personName, privacyMode, layoutMode] // Removed getPrivText dependency
    );
    const privacyDate = useMemo(
        () => getPrivText(
            privacyMode === 'emoji' || privacyMode === 'mask' ? 7 : 100,
            staticTimerData.formattedDate
        ),
        [staticTimerData.formattedDate, privacyMode] // Removed getPrivText dependency
    );

    const privacyCount = useMemo(
        () => getPrivText(
            100,
            staticTimerData.recurrenceCount > 0 ? staticTimerData.recurrenceCount : ''
        ),
        [staticTimerData.recurrenceCount, privacyMode] // Removed getPrivText dependency
    );

    const privacyInterval = useMemo(
        () => getPrivText(
            privacyMode === 'emoji' || privacyMode === 'mask' ? 5 : 100,
            timer.isRecurring ? timer.recurrenceInterval : ''
        ),
        [timer.recurrenceInterval, privacyMode, timer.isRecurring] // Removed getPrivText dependency
    );

    const privacyPriority = useMemo(
        () => getPrivText(
            privacyMode === 'emoji' || privacyMode === 'mask' ? 2 : 100,
            timer.priority.charAt(0).toUpperCase() + timer.priority.slice(1)
        ),
        [timer.priority, privacyMode] // Removed getPrivText dependency
    );
    const privacyRecurringText = useMemo(
        () => getPrivText(
            privacyMode === 'emoji' || privacyMode === 'mask' ? 4 : 100,
            timer.isRecurring ? 'Recurring' : 'NonRecurring'
        ),
        [timer.isRecurring, privacyMode] // Removed getPrivText dependency
    );

    /* ---------- stable text styles (prevent re-renders) ---------- */
    const titleTextStyle = useMemo(() => [
        {
            color: privacyMode === 'invisible' || privacyMode === 'ghost'
                ? colors.text + '00'
                : colors.text,
            fontSize: layoutMode === 'grid' && (privacyMode === 'mask' || privacyMode === 'emoji')
                ? 10
                : isLongName && isLongTitle
                    ? 12
                    : 14,
            fontWeight: '500',
            height: 28,
            alignSelf: 'center',
            textAlign: 'center'
        },
        (privacyMode === 'invisible' || privacyMode === 'ghost') && {
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.sm,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderWidth: border,
            borderColor: colors.border
        }
    ], [colors, privacyMode, layoutMode, isLongName, isLongTitle, variables.radius.sm, border]);

    const dateTextStyle = useMemo(() => ({
        color: privacyMode === 'invisible' ? colors.text + '00' : colors.textDesc,
        fontSize: 12,
        fontWeight: '500',
        height: 30,
        alignSelf: 'center',
        backgroundColor: colors.settingBlock,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: variables.radius.sm,
        borderWidth: border,
        borderColor: colors.border
    }), [colors, privacyMode, variables.radius.sm, border]);

    const personNameStyle = useMemo(() => ({
        color: privacyMode === 'invisible' ? colors.modalBg + '00' : colors.textDesc,
        fontSize: layoutMode === 'grid' && (privacyMode === 'mask' || privacyMode === 'emoji') ? 12
            : (isLongName && isLongTitle) ? 10 : 12,
        fontWeight: '500',
        height: 26,
        backgroundColor: colors.settingBlock,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: variables.radius.sm,
        borderWidth: border,
        borderColor: colors.border
    }), [colors, privacyMode, layoutMode, isLongName, isLongTitle, variables.radius.sm, border]);

    /* ---------- isolated time chips component (prevents text re-renders) ---------- */
    const TimeChipsDisplay = memo(() => {
        const [timeParts, setTimeParts] = useState([0, 0, 0, 0, 0, 0]);
        const [status, setStatus] = useState('ongoing');
        const timerRef = useRef(timer);
        const frame = useRef(null);
        const last = useRef(0);

        // Update timer ref when timer changes
        useEffect(() => {
            timerRef.current = timer;
        }, [timer]);

        const tick = useCallback(() => {
            const now = Date.now();
            if (now - last.current < 200) {
                frame.current = requestAnimationFrame(tick);
                return;
            }
            last.current = now;

            const t = timerRef.current;
            let target = t.date;
            let next = t.nextDate;
            if (t.isRecurring && t.date < now) {
                const res = calculateNextOccurrence(t, now);
                target = res.nextDate;
                next = res.nextDate;
            }

            const parts = getTimeParts({ ...t, date: target, next }, now);
            const st =
                t.isCountdown && !t.isRecurring && target - now <= 0
                    ? 'completed'
                    : 'ongoing';

            setTimeParts(parts);
            setStatus(st);
            frame.current = requestAnimationFrame(tick);
        }, []);

        useEffect(() => {
            frame.current = requestAnimationFrame(tick);
            return () => {
                if (frame.current) {
                    cancelAnimationFrame(frame.current);
                }
            };
        }, [tick]);

        // Memoize time parts array to prevent unnecessary re-renders
        const timePartsArray = useMemo(() => {
            const [y, m, d, h, min, sec] = timeParts;
            return [
                { v: y, l: 'y', id: 'years', full: 'Years' },
                { v: m, l: 'mo', id: 'months', full: 'Months' },
                { v: d, l: 'd', id: 'days', full: 'Days' },
                { v: h, l: 'h', id: 'hours', full: 'Hours' },
                { v: min, l: 'm', id: 'minutes', full: 'Minutes' },
                { v: sec, l: 's', id: 'seconds', full: 'Seconds' }
            ].filter(p => p.v !== 0);
        }, [timeParts]);

        // Early return for completed status
        if (timePartsArray.length === 0 || status === 'completed') {
            return (
                <View style={s.chipContainer}>
                    <View style={[s.chip, s.chipActive]}>
                        <Text style={[s.chipText, s.chipTextActive]}>
                            Completed
                        </Text>
                    </View>
                </View>
            );
        }

        // Render active chip view (single chip expanded)
        if (activeChip) {
            const activeChipData = timePartsArray.find(p => p.id === activeChip);
            if (!activeChipData) {
                // If active chip is not found in current time parts, reset it
                setActiveChip(null);
                return null;
            }

            return (
                <View style={s.chipContainer}>
                    <TouchableOpacity
                        style={[s.chip, s.chipActive]}
                        onPress={() => setActiveChip(null)}
                        activeOpacity={0.8}
                    >
                        <Text style={[s.chipText, s.chipTextActive]}>
                            {getChippedTime(activeChip, timeParts)} {activeChipData.full}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // Render all chips view (multiple chips)
        return (
            <View style={s.chipContainer}>
                {timePartsArray.map(p => (
                    <TouchableOpacity
                        key={p.id}
                        style={[s.chip, s.chipInactive]}
                        onPress={() => setActiveChip(p.id)}
                        activeOpacity={0.8}
                    >
                        <Text style={[s.chipText, s.chipTextInactive]}>
                            {p.v}{p.l}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    });

    /* ---------- isolated progress display (prevents text re-renders) ---------- */
    const DetailedProgressDisplay = memo(() => {
        const [pct, setPct] = useState(0);
        const [st, setSt] = useState('ongoing');
        const timerRef = useRef(timer);
        const frame = useRef(null);
        const last = useRef(0);

        // Update timer ref when timer changes
        useEffect(() => {
            timerRef.current = timer;
        }, [timer]);

        const tick = useCallback(() => {
            const now = Date.now();
            if (now - last.current < 200) {
                frame.current = requestAnimationFrame(tick);
                return;
            }
            last.current = now;

            const t = timerRef.current;
            let target = t.date;
            let next = t.nextDate;
            if (t.isRecurring && t.date < now) {
                const res = calculateNextOccurrence(t, now);
                target = res.nextDate;
                next = res.nextDate;
            }

            const progress = t.isCountdown
                ? calculateProgress({ ...t, date: target, next }, now)
                : 0;
            const status =
                t.isCountdown && !t.isRecurring && target - now <= 0
                    ? 'completed'
                    : 'ongoing';

            setPct(progress);
            setSt(status);
            frame.current = requestAnimationFrame(tick);
        }, []);

        useEffect(() => {
            frame.current = requestAnimationFrame(tick);
            return () => {
                if (frame.current) {
                    cancelAnimationFrame(frame.current);
                }
            };
        }, [tick]);

        if (!timer.isCountdown || st !== 'ongoing') return null;

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
                {(100 - pct).toFixed(4)} %
            </Text>
        );
    });

    /* ---------- slide animation ---------- */
    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: screenHeight,
                    duration: 250,
                    useNativeDriver: true
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true
                })
            ]).start();
        }
    }, [visible, slideAnim, fadeAnim]);

    /* ---------- render ---------- */
    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View
                    style={[
                        s.overlay,
                        {
                            backgroundColor:
                                (headerMode === 'fixed' ? colors.cardLighter : colors.background) + '90',
                            opacity: fadeAnim
                        }
                    ]}
                >
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[s.bottomSheet, { transform: [{ translateY: slideAnim }] }]}
                        >
                            <ViewShot ref={sheetRef} options={{ format: 'png', quality: 1 }}>
                                <View style={s.handle} />

                                {/* Title & Date */}
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingHorizontal: 4,
                                        marginBottom: 6,
                                    }}
                                >
                                    <Text style={titleTextStyle}>
                                        {privacyTitleText}
                                    </Text>
                                    <Text style={dateTextStyle}>
                                        {privacyMode === 'off' ? staticTimerData.formattedDate : privacyDate}
                                    </Text>
                                </View>

                                {/* Person & Status Badges */}
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: 16,
                                        paddingHorizontal: 4
                                    }}
                                >
                                    {timer.personName && (
                                        <Text style={personNameStyle}>
                                            For: {privacyNameText}
                                        </Text>
                                    )}

                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        {timer.isRecurring && timer.recurrenceInterval && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.settingBlock, paddingHorizontal: 8, paddingVertical: 4, borderRadius: variables.radius.sm, borderWidth: border, borderColor: colors.border }}>
                                                <Text style={{ color: privacyMode === 'invisible' ? colors.text + '00' : colors.textDesc, fontSize: 12, fontWeight: '500' }}>
                                                    {privacyInterval}
                                                </Text>
                                            </View>
                                        )}
                                        {timer.isRecurring && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.settingBlock, paddingHorizontal: 8, paddingVertical: 4, borderRadius: variables.radius.sm, borderWidth: border, borderColor: colors.border, gap: 4 }}>
                                                {privacyMode === 'off' && <Icons.Material name="autorenew" size={12} color={colors.textDesc} />}
                                                <Text style={{ color: privacyMode === 'invisible' ? colors.text + '00' : colors.textDesc, fontSize: 12, fontWeight: '500' }}>
                                                    {privacyRecurringText}
                                                </Text>
                                            </View>
                                        )}
                                        {timer.isRecurring && staticTimerData.recurrenceCount > 0 && (
                                            <View style={{ backgroundColor: colors.settingBlock, paddingHorizontal: 8, paddingVertical: 4, borderRadius: variables.radius.sm, borderWidth: border, borderColor: colors.border }}>
                                                <Text style={{ fontSize: 11, fontWeight: '600', color: privacyMode === 'invisible' || privacyMode === 'ghost' ? colors.text + '00' : colors.textDesc }}>
                                                    {privacyCount}
                                                </Text>
                                            </View>
                                        )}
                                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.settingBlock, paddingHorizontal: 8, paddingVertical: 4, borderRadius: variables.radius.sm, borderWidth: border, borderColor: colors.border, gap: 4 }}>
                                            {timer.priority && privacyMode === 'off' && (
                                                <View
                                                    style={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: 5,
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
                                                        borderWidth: border
                                                    }}
                                                />
                                            )}
                                            <Text style={{ color: privacyMode === 'invisible' ? colors.text + '00' : colors.textDesc, fontSize: 12, fontWeight: '500' }}>
                                                {privacyPriority}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Time Section */}
                                <View
                                    style={{
                                        backgroundColor: colors.settingBlock,
                                        padding: 16,
                                        borderRadius: variables.radius.md,
                                        marginBottom: 16,
                                        borderWidth: border,
                                        borderColor: colors.border
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={{ color: colors.textDesc, fontSize: 12, marginBottom: 4, height: 20 }}>
                                            {timer.isCountdown ? 'Time Remaining' : 'Time Elapsed'}
                                        </Text>
                                        <DetailedProgressDisplay />
                                    </View>
                                    <View style={{ color: colors.text, fontSize: 16, minHeight: 40, fontWeight: '600', paddingVertical: 4 }}>
                                        <TimeChipsDisplay />
                                    </View>
                                </View>
                            </ViewShot>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default memo(TimerOverlay);