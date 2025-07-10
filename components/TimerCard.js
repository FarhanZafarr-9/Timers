import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Modal, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Icons } from '../assets/icons';
import HighlightMatchText from './HighlightMatchText';
import { jumbleText, maskText } from '../utils/functions';
import ViewShot from 'react-native-view-shot';
import ExportBottomSheet from './ExportBottomSheet';
import { useTheme } from '../utils/ThemeContext';
import { BlurView } from 'expo-blur';


const { height: screenHeight } = Dimensions.get('window');

const TimerCard = ({
    timer,
    onDelete,
    onEdit,
    handleDuplicate,
    onClick,
    colors,
    variables,
    selectable,
    selected = false,
    searchText = '',
    privacyMode = 'off',
}) => {
    const [showOverlay, setShowOverlay] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [activeChip, setActiveChip] = useState(null);
    const slideAnim = useRef(new Animated.Value(screenHeight)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const { isBorder } = useTheme();


    // Self-ticking state
    const [now, setNow] = useState(Date.now());
    const [progressPct, setProgressPct] = useState(0);

    const cardRef = useRef();
    const sheetRef = useRef();

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 100);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setProgressPct(calculateProgress());

        // --- Recurring timer auto-advance ---
        if (
            timer.isCountdown &&
            timer.isRecurring &&
            typeof timer.recurrenceInterval === 'string'
        ) {
            let targetDate = timer.date;
            if (targetDate < now) {
                // Calculate the next occurrence
                let next = new Date(timer.date);
                let count = 1, unit = '';
                if (typeof timer.recurrenceInterval === 'string' && timer.recurrenceInterval.split(' ').length > 1) {
                    [count, unit] = timer.recurrenceInterval.split(' ');
                    count = parseInt(count, 10) || 1;
                    // Normalize unit: remove trailing 's' if present
                    unit = unit.toLowerCase().endsWith('s') ? unit.toLowerCase().slice(0, -1) : unit.toLowerCase();
                }
                const addMap = {
                    second: (date, n) => date.setSeconds(date.getSeconds() + n),
                    minute: (date, n) => date.setMinutes(date.getMinutes() + n),
                    hour: (date, n) => date.setHours(date.getHours() + n),
                    day: (date, n) => date.setDate(date.getDate() + n),
                    week: (date, n) => date.setDate(date.getDate() + n * 7),
                    month: (date, n) => date.setMonth(date.getMonth() + n),
                    year: (date, n) => date.setFullYear(date.getFullYear() + n),
                };
                if (addMap[unit]) {
                    do {
                        addMap[unit](next, count);
                    } while (next.getTime() < now);
                }
                // Update timer.nextDate
                timer.nextDate = next.getTime();
            }
        }
    }, [now]);

    function calculateProgress() {
        if (!timer.isCountdown) return 0;

        const nowDate = new Date(now);
        const targetDate = new Date(timer.date < Date.now() ? timer.nextDate : timer.date);

        // Calculate the previous occurrence of this recurring timer
        let prevOccurrence = new Date(targetDate);

        // Normalize recurrence unit (remove trailing 's' if present)
        let recurringType = '';
        let recurrenceCount = 1;
        if (
            timer.recurrenceInterval &&
            typeof timer.recurrenceInterval === 'string' &&
            timer.recurrenceInterval.split(' ').length > 1
        ) {
            const [count, unitRaw] = timer.recurrenceInterval.split(' ');
            recurrenceCount = parseInt(count, 10) || 1;
            recurringType = unitRaw.toLowerCase().endsWith('s')
                ? unitRaw.toLowerCase().slice(0, -1)
                : unitRaw.toLowerCase();
        }

        // Use a mapping object for subtraction
        const subtractMap = {
            second: (date, n) => date.setSeconds(date.getSeconds() - n),
            minute: (date, n) => date.setMinutes(date.getMinutes() - n),
            hour: (date, n) => date.setHours(date.getHours() - n),
            day: (date, n) => date.setDate(date.getDate() - n),
            week: (date, n) => date.setDate(date.getDate() - n * 7),
            month: (date, n) => {
                date.setMonth(date.getMonth() - n);
                // Handle month-end dates
                if (date.getDate() !== targetDate.getDate()) {
                    date.setDate(0); // Go to last day of previous month
                }
            },
            year: (date, n) => {
                date.setFullYear(date.getFullYear() - n);
                // Handle leap year edge case for Feb 29
                if (date.getMonth() === 1 && date.getDate() === 29) {
                    if (!isLeapYear(date.getFullYear())) {
                        date.setDate(28);
                    }
                }
            },
        };

        if (subtractMap[recurringType]) {
            subtractMap[recurringType](prevOccurrence, recurrenceCount);
        }

        const totalDuration = targetDate.getTime() - prevOccurrence.getTime();
        const elapsed = nowDate.getTime() - prevOccurrence.getTime();

        const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
        return progress;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    const titleText = timer.title.length > 15 ? timer.title.slice(0, 15) + '...' : timer.title;
    const nameText = timer.personName.length > 15 ? timer.personName.slice(0, 15) + '...' : timer.personName;

    // Create styles
    const createStyles = () => StyleSheet.create({
        timerItem: {
            backgroundColor: colors.cardLighter,
            padding: 12,
            borderRadius: variables.radius.md,
            marginBottom: 10,
            borderWidth: 0.75,
            borderColor: searchText === '' || privacyMode !== 'off' ? colors.border : colors.highlight + '3a',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        timerTitle: {
            color: colors.textDesc,
            fontSize: 16,
            fontWeight: 'bold',
            paddingLeft: 6,
            height: 25
        },
        priorityIndicator: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        priorityDot: {
            width: 10,
            height: 10,
            borderRadius: variables.radius.circle,
            borderWidth: isBorder ? 0.75 : 0,
        },
        timerQuickInfo: {
            color: colors.text,
            fontSize: 14,
            fontWeight: 'bold',
            letterSpacing: 1,
            backgroundColor: colors.highlight + '10',
            borderWidth: isBorder ? 0.75 : 0,
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
            backgroundColor: colors.highlight + '10',
            paddingVertical: 6,
            paddingHorizontal: 12,
            marginHorizontal: 8,
            borderRadius: variables.radius.sm,
            alignSelf: 'flex-start',
            borderWidth: isBorder ? 0.75 : 0,
            borderColor: colors.border,
            color: colors.text,
            fontSize: 12,
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
            backgroundColor: colors.background + '80',
            justifyContent: 'flex-end',
        },
        bottomSheet: {
            backgroundColor: colors.card,
            borderTopLeftRadius: variables.radius.lg,
            borderTopRightRadius: variables.radius.lg,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 40,
            minHeight: 280,
            maxHeight: screenHeight * 0.9,
            borderWidth: isBorder ? 0.75 : 0,
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
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 8,
            height: 28,
        },
        overlayPersonName: {
            color: colors.textDesc,
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 16,
            height: 20
        },
        timeSection: {
            backgroundColor: colors.highlight + '10',
            padding: 16,
            borderRadius: variables.radius.md,
            marginBottom: 16,
            borderWidth: isBorder ? 0.75 : 0,
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
            paddingVertical: 5
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
            height: 30,
            backgroundColor: colors.highlight + '10',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: variables.radius.sm,
            borderWidth: isBorder ? 0.75 : 0,
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
            borderWidth: isBorder ? 0.75 : 0,
            borderColor: colors.border,
        },
        editButton: {
            backgroundColor: colors.highlight + '15',
        },
        deleteButton: {
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderColor: 'rgba(239, 68, 68, 0.5)',
            minHeight: 40,
            marginBottom: 20,
        },
        exportButton: {
            backgroundColor: colors.highlight + '15',
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
            backgroundColor: colors.highlight + '10',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: variables.radius.sm,
            gap: 8,
            borderWidth: isBorder ? 0.75 : 0,
            borderColor: colors.border,
        },
        statusText: {
            color: colors.text,
            fontSize: 12,
            fontWeight: '500',
            height: 15,
        },
        chipContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 4,
            marginVertical: 8,
            paddingBottom: 8,
        },
        chip: {
            backgroundColor: colors.highlight + '15',
            paddingVertical: 6,
            paddingHorizontal: 16,
            borderRadius: variables.radius.sm,
            borderWidth: isBorder ? 0.75 : 0,
            borderColor: colors.border,
        },
        chipText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
            height: 20
        },
    });

    // Calculate time difference
    function getTimeParts() {
        let targetDate = timer.isCountdown
            ? (timer.isRecurring && timer.date < Date.now() ? timer.nextDate : timer.date)
            : timer.date;
        let diff = timer.isCountdown
            ? Math.max(0, targetDate - now)
            : Math.max(0, now - targetDate);

        const y = Math.floor(diff / (365 * 24 * 60 * 60 * 1000));
        diff -= y * 365 * 24 * 60 * 60 * 1000;
        const mo = Math.floor(diff / (30.44 * 24 * 60 * 60 * 1000));
        diff -= mo * 30.44 * 24 * 60 * 60 * 1000;
        const d = Math.floor(diff / (24 * 60 * 60 * 1000));
        diff -= d * 24 * 60 * 60 * 1000;
        const h = Math.floor(diff / (60 * 60 * 1000));
        diff -= h * 60 * 60 * 1000;
        const m = Math.floor(diff / (60 * 1000));
        diff -= m * 60 * 1000;
        const s = Math.floor(diff / 1000);

        return [y, mo, d, h, m, s];
    }

    function getChippedTime(unit) {
        const [years, months, days, hours, minutes, seconds] = getTimeParts();
        const totalMs =
            years * 365 * 24 * 60 * 60 * 1000 +
            months * 30.44 * 24 * 60 * 60 * 1000 +
            days * 24 * 60 * 60 * 1000 +
            hours * 60 * 60 * 1000 +
            minutes * 60 * 1000 +
            seconds * 1000;

        switch (unit) {
            case 'years':
                return (totalMs / (365 * 24 * 60 * 60 * 1000)).toFixed(2);
            case 'months':
                return (totalMs / (30.44 * 24 * 60 * 60 * 1000)).toFixed(2);
            case 'days':
                return (totalMs / (24 * 60 * 60 * 1000)).toFixed(2);
            case 'hours':
                return (totalMs / (60 * 60 * 1000)).toFixed(2);
            case 'minutes':
                return (totalMs / (60 * 1000)).toFixed(2);
            case 'seconds':
                return (totalMs / 1000).toFixed(0);
            default:
                return '';
        }
    }

    function renderTimeChips() {
        const [years, months, days, hours, minutes, seconds] = getTimeParts();

        const timePartsArray = [
            { value: years, label: 'y', id: 'years', fullLabel: 'Years' },
            { value: months, label: 'mo', id: 'months', fullLabel: 'Months' },
            { value: days, label: 'd', id: 'days', fullLabel: 'Days' },
            { value: hours, label: 'h', id: 'hours', fullLabel: 'Hours' },
            { value: minutes, label: 'm', id: 'minutes', fullLabel: 'Minutes' },
            { value: seconds, label: 's', id: 'seconds', fullLabel: 'Seconds' },
        ];
        const nonZeroParts = timePartsArray.filter(part => part.value !== 0);

        // If an active chip is set, show only that chip with the full time in that unit
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
                            {getChippedTime(chip.id)} {chip.fullLabel}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // Otherwise, show all non-zero chips
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
    }

    // Format date
    function getFormattedDate() {
        return new Date(
            timer.isRecurring && timer.date < Date.now()
                ? timer.nextDate
                : timer.date
        ).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Optimized callbacks
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
    }, [onClick]);

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
    }, []);

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
    }, []);

    useEffect(() => {
        if (!showOverlay) {
            slideAnim.setValue(screenHeight);
            fadeAnim.setValue(0);
        }
    }, [showOverlay]);

    // Render time display for card (short, 3 parts max)
    function renderTimeDisplay() {
        const [years, months, days, hours, minutes, seconds] = getTimeParts();

        const timePartsArray = [
            { value: years, label: 'y', id: 'years' },
            { value: months, label: 'mo', id: 'months' },
            { value: days, label: 'd', id: 'days' },
            { value: hours, label: 'h', id: 'hours' },
            { value: minutes, label: 'm', id: 'minutes' },
            { value: seconds, label: 's', id: 'seconds' },
        ];

        const nonZeroParts = timePartsArray.filter(part => part.value !== 0);

        let prefix = '';
        if (timer.isCountdown && !timer.isRecurring && (timer.date - now) <= 0) {
            prefix = 'Completed';
        } else {
            prefix = '';
        }


        /*
        if (timer.isCountdown) {
            prefix = 'Left: ';
        } else {
            prefix = 'Elapsed: ';
        }
        */


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
    }

    // Render detailed time display for overlay (all parts, full words)
    function renderDetailedTimeDisplay() {
        const [years, months, days, hours, minutes, seconds] = getTimeParts();

        const timePartsArray = [
            { value: years, label: 'year', plural: 'years' },
            { value: months, label: 'month', plural: 'months' },
            { value: days, label: 'day', plural: 'days' },
            { value: hours, label: 'hour', plural: 'hours' },
            { value: minutes, label: 'minute', plural: 'minutes' },
            { value: seconds, label: 'second', plural: 'seconds' },
        ];

        const nonZeroParts = timePartsArray.filter(part => part.value !== 0);

        if (timer.isCountdown && !timer.isRecurring && (timer.date - now) <= 0) {
            return 'Timer Completed';
        }

        if (nonZeroParts.length === 0) {
            return '0 seconds';
        }

        return nonZeroParts.map((part, idx) => {
            const label = part.value === 1 ? part.label : part.plural;
            const separator = idx === nonZeroParts.length - 1 ? '' :
                idx === nonZeroParts.length - 2 ? ' and ' : ', ';
            return `${part.value} ${label}${separator}`;
        }).join('');
    }

    function getRecurrenceCounts() {
        if (!timer.isRecurring || !timer.recurrenceInterval || !timer.nextDate) return 0;
        if (timer.date >= Date.now()) return 0;

        let count = 1, unit = '';
        if (typeof timer.recurrenceInterval === 'string' && timer.recurrenceInterval.split(' ').length > 1) {
            [count, unit] = timer.recurrenceInterval.split(' ');
            count = parseInt(count, 10) || 1;
            // Normalize unit: remove trailing 's' if present
            unit = unit.toLowerCase().endsWith('s') ? unit.toLowerCase().slice(0, -1) : unit.toLowerCase();
        }

        const addMap = {
            second: (date, n) => date.setSeconds(date.getSeconds() + n),
            minute: (date, n) => date.setMinutes(date.getMinutes() + n),
            hour: (date, n) => date.setHours(date.getHours() + n),
            day: (date, n) => date.setDate(date.getDate() + n),
            week: (date, n) => date.setDate(date.getDate() + n * 7),
            month: (date, n) => date.setMonth(date.getMonth() + n),
            year: (date, n) => date.setFullYear(date.getFullYear() + n),
        };

        let recurrenceCount = 0;
        let current = new Date(timer.date);

        // Keep adding interval until we reach or pass nextDate
        while (current.getTime() < timer.nextDate) {
            addMap[unit]?.(current, count);
            recurrenceCount++;
            // Prevent infinite loop if something is wrong
            if (recurrenceCount > 10000) break;
        }

        return recurrenceCount - 1; // Subtract 1 to exclude the current occurrence
    }

    const styles = createStyles();

    // Create card style
    const cardStyle = {
        ...styles.timerItem,
        ...(selected && {
            borderColor: 'hsla(0, 84.20%, 60.20%, 0.60)',
            backgroundColor: 'hsla(0, 84.20%, 60.20%, 0.10)'
        }),
        ...(selectable && !selected && {
            borderColor: 'hsla(0, 0.00%, 38.00%, 0.60)'
        })
    };

    return (
        <>
            <ViewShot ref={cardRef} options={{ format: 'png', quality: 1 }}>
                <TouchableOpacity onPress={handleCardPress} activeOpacity={0.7}>
                    <View style={cardStyle}>
                        <View style={styles.header}>
                            {privacyMode === 'off' ? (
                                <HighlightMatchText
                                    text={titleText}
                                    textStyle={styles.timerTitle}
                                    search={searchText}
                                    colors={colors}
                                />
                            ) : (
                                <Text style={styles.timerTitle}>
                                    {privacyMode === 'jumble' ? jumbleText(titleText) : maskText(titleText)}
                                </Text>
                            )}
                            <View style={styles.priorityIndicator}>
                                {timer.personName && (
                                    privacyMode === 'off' ? (
                                        <HighlightMatchText
                                            text={nameText}
                                            textStyle={styles.namePill} search={searchText}
                                            colors={colors}
                                        />
                                    ) : (
                                        <Text style={styles.namePill}>
                                            {privacyMode === 'jumble' ? jumbleText(nameText) : maskText(nameText)}
                                        </Text>
                                    )
                                )}

                            </View>
                        </View>

                        <View style={styles.midSection}>
                            <Text style={styles.timerQuickInfo}>
                                {renderTimeDisplay()}
                            </Text>
                            <Icons.Material
                                name="keyboard-arrow-down"
                                size={18}
                                color={colors.text}
                                style={{ opacity: 0.5 }}
                            />
                        </View>
                        {timer.isCountdown && timer.isRecurring && (
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: 8,
                                    gap: 10,
                                    width: '100%',
                                    justifyContent: 'flex-start'
                                }}
                            >
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
                                <Text
                                    style={{
                                        color: colors.textDesc,
                                        fontSize: 12,
                                        fontWeight: '500',
                                        opacity: 0.8,
                                        marginLeft: 8,
                                        width: '15%',
                                        marginBottom: 2
                                    }}
                                >
                                    {progressPct.toFixed(2)} %
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </ViewShot>

            {/* Bottom Sheet Overlay */}
            <Modal
                visible={showOverlay}
                transparent={true}
                animationType="none"
                onRequestClose={closeOverlay}
            >
                <TouchableWithoutFeedback onPress={closeOverlay}>
                    <BlurView intensity={120}
                        tint="dark"
                        style={{ flex: 1 }}
                    >
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
                                            <Text style={styles.overlayTitle}>
                                                {privacyMode === 'off' ? timer.title :
                                                    privacyMode === 'jumble' ? jumbleText(timer.title) : maskText(timer.title)}
                                            </Text>

                                            <Text style={styles.detailValue}>
                                                {getFormattedDate()}

                                            </Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between', paddingHorizontal: 4 }}>
                                            {timer.personName && (
                                                <Text style={styles.overlayPersonName}>
                                                    For: {privacyMode === 'off' ? timer.personName :
                                                        privacyMode === 'jumble' ? jumbleText(timer.personName) : maskText(timer.personName)}
                                                </Text>
                                            )}

                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>

                                                {timer.isRecurring && (
                                                    <View style={styles.statusIndicator}>
                                                        <Icons.Material
                                                            name="autorenew"
                                                            size={12}
                                                            color={colors.highlight}
                                                        />
                                                        <Text style={styles.statusText}>Recurring</Text>
                                                    </View>
                                                )}
                                                {timer.isRecurring && getRecurrenceCounts() > 0 && (
                                                    <View style={styles.statusIndicator}>

                                                        <Text style={styles.statusText}>{getRecurrenceCounts()}</Text>
                                                    </View>
                                                )}
                                                <View style={styles.statusIndicator}>

                                                    {timer.priority && <View
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
                                                    />}
                                                    <Text style={styles.statusText}>
                                                        {timer.priority.charAt(0).toUpperCase() + timer.priority.slice(1)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Time Section {renderDetailedTimeDisplay()} */}
                                        <View
                                            style={[
                                                styles.timeSection,
                                                (() => {
                                                    const parts = getTimeParts(timer);
                                                    const nonZeroCount = parts.filter(p => p !== 0).length;
                                                    const nonZeroOverTen = parts.filter(p => p >= 10).length;
                                                    return { paddingBottom: (nonZeroCount > 5 && nonZeroOverTen > 2) ? 35 : 0 };
                                                })()
                                            ]}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

                                                <Text style={styles.timeLabel}>
                                                    {timer.isCountdown ? 'Time Remaining' : 'Time Elapsed'}
                                                </Text>
                                                {timer.isCountdown && <Text
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
                                                </Text>}
                                            </View>
                                            <Text style={styles.timeValue}>

                                                {renderTimeChips()}
                                            </Text>
                                        </View>

                                    </ViewShot>

                                    {/* Action Buttons */}
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
                                    </View>
                                    <TouchableOpacity
                                        onPress={handleDelete}
                                        style={[styles.actionButton, styles.deleteButton]}
                                        activeOpacity={0.7}
                                    >
                                        <Icons.Material name="delete" size={22} color="#ef4444" />
                                    </TouchableOpacity>
                                </Animated.View>
                            </TouchableWithoutFeedback>
                        </Animated.View>
                    </BlurView>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Export Bottom Sheet */}
            <ExportBottomSheet
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

export default TimerCard;