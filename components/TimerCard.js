import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Modal, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Icons } from '../assets/icons';
import HighlightMatchText from './HighlightMatchText';
import { jumbleText, maskText } from '../utils/functions';

const { height: screenHeight } = Dimensions.get('window');

const TimerCard = ({
    timer,
    onDelete,
    onEdit,
    onClick,
    colors,
    variables,
    selectable,
    selected = false,
    searchText = '',
    privacyMode = 'off',
}) => {
    const [showOverlay, setShowOverlay] = useState(false);
    const slideAnim = useRef(new Animated.Value(screenHeight)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Self-ticking state
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const titleText = timer.title.length > 15 ? timer.title.slice(0, 15) + '...' : timer.title;
    const nameText = timer.personName.length > 15 ? timer.personName.slice(0, 15) + '...' : timer.personName;

    // Calculate time difference
    function getTimeParts() {
        // For countdown: time left until date (or nextDate if recurring)
        // For countup: time since date
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

    // Create styles
    const createStyles = () => StyleSheet.create({
        timerItem: {
            backgroundColor: colors.cardLighter,
            padding: 12,
            borderRadius: variables.radius.md,
            marginBottom: 10,
            borderWidth: 0.75,
            borderColor: searchText === '' || privacyMode !== 'off' ? 'transparent' : colors.highlight + '3a',
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
        },
        priorityIndicator: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        priorityDot: {
            width: 10,
            height: 10,
            borderRadius: variables.radius.circle,
            borderWidth: 0.75,
        },
        timerQuickInfo: {
            color: colors.text,
            fontSize: 14,
            fontWeight: 'bold',
            letterSpacing: 1,
            backgroundColor: colors.highlight + '10',
            borderWidth: 0,
            borderColor: colors.border,
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            height: 40,
            padding: 8,
            borderRadius: variables.radius.sm,
        },
        namePill: {
            backgroundColor: colors.highlight + '10',
            paddingVertical: 6,
            paddingHorizontal: 12,
            marginHorizontal: 8,
            borderRadius: variables.radius.sm,
            alignSelf: 'flex-start',
            borderWidth: 0,
            borderColor: colors.cardBorder,
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
            maxHeight: screenHeight * 0.8,
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
        },
        overlayPersonName: {
            color: colors.textDesc,
            fontSize: 14,
            marginBottom: 16,
            height: 20
        },
        timeSection: {
            backgroundColor: colors.settingBlock,
            padding: 16,
            borderRadius: variables.radius.md,
            marginBottom: 16,
        },
        timeLabel: {
            color: colors.textDesc,
            fontSize: 12,
            marginBottom: 4,
            height: 20
        },
        timeValue: {
            color: colors.text,
            fontSize: 18,
            height: 55,
            fontWeight: 'bold',
            paddingVertical: 5
        },
        detailsSection: {
            backgroundColor: colors.settingBlock,
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
            fontSize: 14,
            fontWeight: '500',
            height: 20
        },
        actionsSection: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
        },
        actionButton: {
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: variables.radius.sm,
            alignItems: 'center',
        },
        editButton: {
            backgroundColor: colors.highlight + '20',
            borderWidth: 1,
            borderColor: colors.highlight,
        },
        deleteButton: {
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderWidth: 1,
            borderColor: '#ef4444',
        },
        actionButtonText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
        },
        statusIndicator: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.highlight + '10',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: variables.radius.sm,
        },
        statusText: {
            color: colors.text,
            fontSize: 12,
            fontWeight: '500',
            marginLeft: 4,
        },
    });

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
                toValue: screenHeight,
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
        } else if (timer.isCountdown) {
            prefix = 'Left: ';
        } else {
            prefix = 'Elapsed: ';
        }

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
                            {timer.isRecurring && (
                                <View style={{
                                    backgroundColor: colors.highlight + '10',
                                    padding: 6,
                                    borderRadius: 8,
                                    borderWidth: 0.75,
                                    borderColor: colors.border,
                                }}>
                                    <Icons.Material
                                        name="autorenew"
                                        size={14}
                                        color={colors.highlight}
                                    />
                                </View>
                            )}
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
                                        {privacyMode === 'jumble' ? jumbleText(nameText) : maskText(nameText)}
                                    </Text>
                                )
                            )}
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
                        </View>
                    </View>

                    <View style={styles.midSection}>
                        <Text style={styles.timerQuickInfo}>
                            {renderTimeDisplay()}
                        </Text>
                        <Icons.Material
                            name="keyboard-arrow-up"
                            size={18}
                            color={colors.text}
                            style={{ opacity: 0.5 }}
                        />
                    </View>
                </View>
            </TouchableOpacity>

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
                                <View style={styles.handle} />

                                {/* Title and Person */}
                                <Text style={styles.overlayTitle}>
                                    {privacyMode === 'off' ? timer.title :
                                        privacyMode === 'jumble' ? jumbleText(timer.title) : maskText(timer.title)}
                                </Text>

                                {timer.personName && (
                                    <Text style={styles.overlayPersonName}>
                                        For: {privacyMode === 'off' ? timer.personName :
                                            privacyMode === 'jumble' ? jumbleText(timer.personName) : maskText(timer.personName)}
                                    </Text>
                                )}

                                {/* Time Section */}
                                <View style={styles.timeSection}>
                                    <Text style={styles.timeLabel}>
                                        {timer.isCountdown ? 'Time Remaining' : 'Time Elapsed'}
                                    </Text>
                                    <Text style={styles.timeValue}>
                                        {renderDetailedTimeDisplay()}
                                    </Text>
                                </View>

                                {/* Details Section */}
                                <View style={styles.detailsSection}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>
                                            {timer.isCountdown ? 'End Date' : 'Start Date'}
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            {getFormattedDate()}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Priority</Text>
                                        <View style={styles.statusIndicator}>
                                            <View
                                                style={[
                                                    styles.priorityDot,
                                                    {
                                                        backgroundColor:
                                                            timer.priority === 'high'
                                                                ? '#ef4444'
                                                                : timer.priority === 'normal'
                                                                    ? '#22c55e'
                                                                    : '#3b82f6',
                                                        borderColor: 'transparent',
                                                    },
                                                ]}
                                            />
                                            <Text style={styles.statusText}>
                                                {timer.priority.charAt(0).toUpperCase() + timer.priority.slice(1)}
                                            </Text>
                                        </View>
                                    </View>

                                    {timer.isRecurring && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Type</Text>
                                            <View style={styles.statusIndicator}>
                                                <Icons.Material
                                                    name="autorenew"
                                                    size={12}
                                                    color={colors.highlight}
                                                />
                                                <Text style={styles.statusText}>Recurring</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.actionsSection}>
                                    <TouchableOpacity
                                        onPress={handleEdit}
                                        style={[styles.actionButton, styles.editButton]}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.actionButtonText}>Edit Timer</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={handleDelete}
                                        style={[styles.actionButton, styles.deleteButton]}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.actionButtonText}>Delete Timer</Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
};

export default TimerCard;