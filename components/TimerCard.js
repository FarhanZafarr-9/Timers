import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Modal, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Icons } from '../assets/icons';
import HighlightMatchText from './HighlightMatchText';
import { getPrivacyText } from '../utils/functions';
import ViewShot from 'react-native-view-shot';
import ExportBottomSheet from './ExportBottomSheet';
import { useTheme } from '../utils/ThemeContext';
import { useSecurity } from '../utils/SecurityContext';

const { height: screenHeight } = Dimensions.get('window');

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
    buttons
}) => {
    const [showOverlay, setShowOverlay] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [activeChip, setActiveChip] = useState(null);
    const slideAnim = useRef(new Animated.Value(screenHeight)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const { isBorder, headerMode, border, colors, variables, layoutMode } = useTheme();
    const titleText = timer.title && timer.title.length > 10
        ? timer.title.slice(0, 10) + '…'
        : timer.title;

    const nameText = timer.personName && timer.personName.length > 10
        ? timer.personName.slice(0, 10) + '…'
        : timer
    const { privacyMode } = useSecurity();
    const privacyTitleText = useMemo(() => getPrivacyText(layoutMode === 'grid' ? 3 : 10, privacyMode, timer.title), [timer.title, privacyMode]);
    const privacyNameText = useMemo(() => getPrivacyText(layoutMode === 'grid' ? 3 : 10, privacyMode, timer.personName), [timer.personName, privacyMode]);

    const [timerState, setTimerState] = useState({
        now: Date.now(),
        progressPct: 0,
        timeParts: [0, 0, 0, 0, 0, 0],
        formattedDate: '',
        status: 'ongoing',
        recurrenceCount: 0,
        detailedTime: '0 seconds'
    });

    const cardRef = useRef();
    const sheetRef = useRef();
    const timerRef = useRef(timer);
    timerRef.current = timer;

    const styles = useMemo(() => createStyles(), [colors, variables, isBorder, searchText, privacyMode, selected, selectable]);

    const calculateTimerState = useCallback((now) => {
        const timer = timerRef.current;
        let targetDate = timer.date;
        let nextDate = timer.nextDate;
        let recurrenceCount = 0;

        // Handle recurring timers
        if (timer.isRecurring) {
            if (timer.date < now) {
                // Calculate next occurrence if we've passed the original date
                const result = calculateNextOccurrence(timer, now);
                targetDate = result.nextDate;
                nextDate = result.nextDate;
                recurrenceCount = result.recurrenceCount;
            }
        }

        const timeParts = getTimeParts({ ...timer, date: targetDate, nextDate }, now);
        const progressPct = timer.isCountdown ? calculateProgress({ ...timer, date: targetDate, nextDate }, now) : 0;
        const status = timer.isCountdown && !timer.isRecurring && (targetDate - now) <= 0
            ? 'completed'
            : 'ongoing';

        return {
            now,
            progressPct,
            timeParts,
            formattedDate: getFormattedDate({ ...timer, date: targetDate, nextDate }, now),
            status,
            recurrenceCount,
            detailedTime: getDetailedTimeDisplay({ ...timer, date: targetDate, nextDate }, now)
        };
    }, []);

    const [compactChipIndex, setCompactChipIndex] = useState(null);

    const renderCompactTimeChip = () => {
        const { timeParts, status } = timerState;
        const [years, months, days, hours, minutes, seconds] = timeParts;

        const timePartsArray = [
            { id: 'years', label: 'Years' },
            { id: 'months', label: 'Months' },
            { id: 'days', label: 'Days' },
            { id: 'hours', label: 'Hours' },
            { id: 'minutes', label: 'Minutes' },
            { id: 'seconds', label: 'Seconds' },
        ];

        const nonZeroParts = timePartsArray.filter(part => {
            switch (part.id) {
                case 'years': return years !== 0;
                case 'months': return months !== 0;
                case 'days': return days !== 0;
                case 'hours': return hours !== 0;
                case 'minutes': return minutes !== 0;
                case 'seconds': return seconds !== 0;
                default: return false;
            }
        });

        if (nonZeroParts.length === 0 || status === 'completed') {
            return (
                <View style={styles.chipContainer}>
                    <Text style={styles.chipText}>Completed</Text>
                </View>
            );
        }
        if (compactChipIndex === null) setCompactChipIndex(nonZeroParts.length - 1);
        const currentChip = nonZeroParts[compactChipIndex % nonZeroParts.length];

        return (
            <TouchableOpacity
                style={[
                    styles.chip,
                    { backgroundColor: colors.highlight + '30', borderColor: colors.highlight }
                ]}
                onPress={() => setCompactChipIndex(compactChipIndex + 1)}
                activeOpacity={0.8}
            >
                <Text style={[styles.chipText, { fontWeight: 'bold', color: colors.highlight }]}>
                    {getChippedTime(currentChip.id, timeParts)} {currentChip.label}
                </Text>
            </TouchableOpacity>
        );
    };

    function calculateNextOccurrence(timer, now) {
        if (!timer.isRecurring || !timer.recurrenceInterval) {
            return {
                nextDate: timer.date,
                recurrenceCount: 0
            };
        }

        const [countStr, unitRaw] = timer.recurrenceInterval.split(' ');
        const count = parseInt(countStr, 10) || 1;
        const unit = unitRaw.toLowerCase().endsWith('s')
            ? unitRaw.toLowerCase().slice(0, -1)
            : unitRaw.toLowerCase();

        const addMap = {
            second: (date, n) => date.setSeconds(date.getSeconds() + n),
            minute: (date, n) => date.setMinutes(date.getMinutes() + n),
            hour: (date, n) => date.setHours(date.getHours() + n),
            day: (date, n) => date.setDate(date.getDate() + n),
            week: (date, n) => date.setDate(date.getDate() + n * 7),
            month: (date, n) => date.setMonth(date.getMonth() + n),
            year: (date, n) => date.setFullYear(date.getFullYear() + n),
        };

        let nextDate = new Date(timer.date);
        let recurrenceCount = 0;

        while (nextDate.getTime() < now) {
            addMap[unit]?.(nextDate, count);
            recurrenceCount++;

            // Safety check to prevent infinite loops
            if (recurrenceCount > 10000) break;
        }

        return {
            nextDate: nextDate.getTime(),
            recurrenceCount: recurrenceCount - 1
        };
    }

    useEffect(() => {
        let mounted = true;
        let lastUpdateTime = 0;
        const updateInterval = 100;

        const updateTimer = () => {
            if (!mounted) return;

            const now = Date.now();
            if (now - lastUpdateTime >= updateInterval) {
                lastUpdateTime = now;
                setTimerState(calculateTimerState(now));
            }
            requestAnimationFrame(updateTimer);
        };

        const frameId = requestAnimationFrame(updateTimer);
        return () => {
            mounted = false;
            cancelAnimationFrame(frameId);
        };
    }, [calculateTimerState]);

    // Memoized render functions
    const renderTimeChips = useMemo(() => {
        return () => {
            const { timeParts, status } = timerState;
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
        };
    }, [activeChip, colors.highlight, styles, timerState.timeParts, timerState.status]);

    const renderTimeDisplay = useMemo(() => {
        return () => {
            const { timeParts, status } = timerState;
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
        };
    }, [timerState.timeParts, timerState.status]);

    // Helper functions moved outside to prevent recreation
    const getChippedTime = (unit, timeParts) => {
        const [years, months, days, hours, minutes, seconds] = timeParts;
        const totalMs =
            years * 365 * 24 * 60 * 60 * 1000 +
            months * 30.44 * 24 * 60 * 60 * 1000 +
            days * 24 * 60 * 60 * 1000 +
            hours * 60 * 60 * 1000 +
            minutes * 60 * 1000 +
            seconds * 1000;

        switch (unit) {
            case 'years': return (totalMs / (365 * 24 * 60 * 60 * 1000)).toFixed(2);
            case 'months': return (totalMs / (30.44 * 24 * 60 * 60 * 1000)).toFixed(2);
            case 'days': return (totalMs / (24 * 60 * 60 * 1000)).toFixed(2);
            case 'hours': return (totalMs / (60 * 60 * 1000)).toFixed(2);
            case 'minutes': return (totalMs / (60 * 1000)).toFixed(2);
            case 'seconds': return (totalMs / 1000).toFixed(0);
            default: return '';
        }
    };

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
                borderWidth: border,
            },
            timerQuickInfo: {
                color: colors.text,
                fontSize: 14,
                fontWeight: 'bold',
                letterSpacing: 1,
                backgroundColor: colors.highlight + '10',
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
                backgroundColor: colors.highlight + '10',
                paddingVertical: 6,
                paddingHorizontal: 12,
                marginHorizontal: 8,
                borderRadius: variables.radius.sm,
                alignSelf: 'flex-start',
                borderWidth: border,
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
                backgroundColor: (headerMode === 'fixed' ? colors.settingBlock : colors.background) + '90', // for modals
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
                backgroundColor: colors.highlight + '10',
                paddingVertical: 5,
                paddingHorizontal: 16,
                borderRadius: variables.radius.sm,
                borderWidth: border,
                borderColor: colors.border,
            },
            chipText: {
                color: colors.text,
                fontSize: 16,
                fontWeight: '600',
                height: 20
            },
        });
    }

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

    // Create card style
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
                <TouchableOpacity onPress={handleCardPress} activeOpacity={0.7}>
                    {layoutMode === 'grid' ? (<View style={cardStyle}>
                        <View style={styles.header}>
                            <Text style={[styles.timerTitle, { paddingLeft: 0 }]}>
                                {privacyTitleText}
                            </Text>
                            {timer.personName && (
                                <Text style={[styles.namePill, { marginHorizontal: 0 }]}>
                                    {privacyNameText}
                                </Text>
                            )}
                        </View>

                        <View style={{ alignItems: 'flex-start', marginTop: 8 }}>
                            {renderCompactTimeChip()}
                        </View>

                        {timer.isCountdown && timer.isRecurring && (
                            <View
                                style={{
                                    height: 6,
                                    width: '100%',
                                    backgroundColor: colors.highlight + '20',
                                    borderRadius: 6,
                                    overflow: 'hidden',
                                    marginTop: 12
                                }}
                            >
                                <View
                                    style={{
                                        width: `${timerState.progressPct}%`,
                                        height: '100%',
                                        backgroundColor: colors.highlight + 'b0',
                                        borderRadius: 8
                                    }}
                                />
                            </View>
                        )}
                    </View>) : (<View style={cardStyle}>
                        <View style={styles.header}>
                            {privacyMode === 'off' ? (
                                <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                                    <HighlightMatchText
                                        text={titleText}
                                        textStyle={styles.timerTitle}
                                        search={searchText}
                                        colors={colors}
                                    />
                                    {timer.isFavourite && <Icons.Material
                                        name={"favorite"}
                                        size={10}
                                        color={colors.highlight}
                                        style={{ marginBottom: 2 }}
                                    />}
                                </View>
                            ) : (
                                <Text style={styles.timerTitle}>
                                    {privacyTitleText}
                                </Text>
                            )}
                            <View style={styles.priorityIndicator}>
                                {timer.personName && (
                                    privacyMode === 'off' ? (
                                        <HighlightMatchText
                                            text={nameText}
                                            textStyle={styles.namePill}
                                            search={searchText}
                                            colors={colors}
                                        />
                                    ) : (
                                        <Text style={styles.namePill}>
                                            {privacyNameText}
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
                                name={showOverlay ? "keyboard-arrow-up" : "keyboard-arrow-down"}
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
                                            width: `${timerState.progressPct}%`,
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
                                    {timerState.progressPct.toFixed(2)} %
                                </Text>
                            </View>
                        )}
                    </View>)}
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
                                            {privacyTitleText}
                                        </Text>

                                        <Text style={styles.detailValue}>
                                            {timerState.formattedDate}
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between', paddingHorizontal: 4 }}>
                                        {timer.personName && (
                                            <Text style={styles.overlayPersonName}>
                                                For: {privacyNameText}
                                            </Text>
                                        )}

                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>

                                            {timer.isRecurring && timer.recurrenceInterval && (
                                                <View style={styles.statusIndicator}>
                                                    <Text style={styles.statusText}>{timer.recurrenceInterval}</Text>
                                                </View>
                                            )}
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

                                            {timer.isRecurring && timerState.recurrenceCount > 0 && (
                                                <View style={styles.statusIndicator}>
                                                    <Text style={styles.statusText}>{timerState.recurrenceCount}</Text>
                                                </View>
                                            )}
                                            <View style={styles.statusIndicator}>
                                                {timer.priority && (
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
                                                <Text style={styles.statusText}>
                                                    {timer.priority.charAt(0).toUpperCase() + timer.priority.slice(1)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Time Section */}
                                    <View
                                        style={[
                                            styles.timeSection,
                                            {
                                                paddingBottom: (() => {
                                                    const nonZeroCount = timerState.timeParts.filter(p => p !== 0).length;
                                                    const nonZeroOverTen = timerState.timeParts.filter(p => p >= 10).length;
                                                    return (nonZeroCount > 5 && nonZeroOverTen > 2) ? 35 : 0;
                                                })()
                                            }
                                        ]}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Text style={styles.timeLabel}>
                                                {timer.isCountdown ? 'Time Remaining' : 'Time Elapsed'}
                                            </Text>
                                            {timer.isCountdown && timerState.status === 'ongoing' && (
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
                                                    {(100 - timerState.progressPct).toFixed(4)} %
                                                </Text>
                                            )}
                                        </View>
                                        <Text style={styles.timeValue}>
                                            {renderTimeChips()}
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

function calculateProgress(timer, now) {
    if (!timer.isCountdown) return 0;

    const nowDate = new Date(now);
    const targetDate = new Date(timer.date < now ? timer.nextDate : timer.date);

    if (!timer.isRecurring) {
        const totalDuration = targetDate.getTime() - timer.date;
        const elapsed = nowDate.getTime() - timer.date;
        return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
    }

    const prevDate = new Date(targetDate);
    const [count, unit] = timer.recurrenceInterval.split(' ');
    const normalizedUnit = unit.toLowerCase().endsWith('s')
        ? unit.toLowerCase().slice(0, -1)
        : unit.toLowerCase();

    const subtractMap = {
        second: (date, n) => date.setSeconds(date.getSeconds() - n),
        minute: (date, n) => date.setMinutes(date.getMinutes() - n),
        hour: (date, n) => date.setHours(date.getHours() - n),
        day: (date, n) => date.setDate(date.getDate() - n),
        week: (date, n) => date.setDate(date.getDate() - n * 7),
        month: (date, n) => date.setMonth(date.getMonth() - n),
        year: (date, n) => date.setFullYear(date.getFullYear() - n),
    };

    if (subtractMap[normalizedUnit]) {
        subtractMap[normalizedUnit](prevDate, parseInt(count, 10));
    }

    const totalDuration = targetDate.getTime() - prevDate.getTime();
    const elapsed = nowDate.getTime() - prevDate.getTime();

    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
}

function getTimeParts(timer, now) {
    let targetDate = timer.isCountdown
        ? (timer.isRecurring && timer.date < now ? timer.nextDate : timer.date)
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

function getDetailedTimeDisplay(timer, now) {
    const [years, months, days, hours, minutes, seconds] = getTimeParts(timer, now);

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

function getFormattedDate(timer, now) {
    return new Date(
        timer.isRecurring && timer.date < now
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
}

export default TimerCard;