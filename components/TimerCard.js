// Optimized TimerCard.js
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Icons } from '../assets/icons';
import HighlightMatchText from './HighlightMatchText';
import { jumbleText, maskText } from '../utils/functions';

const TimerCard = React.memo(({
    timer,
    elapsedTime = '',
    remainingTime = '',
    onDelete,
    onEdit,
    isExpanded = false,
    onClick,
    colors,
    variables,
    selectable,
    selected = false,
    searchText = '',
    privacyMode = 'off',
}) => {
    const [showActions, setShowActions] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);
    const [hasMeasured, setHasMeasured] = useState(false);

    const titleText = timer.title.length > 15 ? timer.title.slice(0, 15) + '...' : timer.title;
    const nameText = timer.personName.length > 15 ? timer.personName.slice(0, 15) + '...' : timer.personName;

    const jumbledTitle = useMemo(
        () => jumbleText(titleText),
        [titleText] // Only re-jumble if the title changes
    );

    const jumbledName = useMemo(
        () => jumbleText(nameText),
        [nameText] // Only re-jumble if the name changes
    );

    const maskedName = useMemo(
        () => maskText(nameText),
        [nameText] // Only re-mask if the name changes
    );

    const maskedTitle = useMemo(
        () => maskText(titleText),
        [titleText] // Only re-mask if the title changes
    );



    // Use single animated value for performance
    const animatedValues = useRef({
        height: new Animated.Value(0),
        iconRotation: new Animated.Value(0),
        buttonsOpacity: new Animated.Value(0),
        buttonsScale: new Animated.Value(0.8),
        borderBottomWidth: new Animated.Value(isExpanded ? 2 : 0),
        paddingBottom: new Animated.Value(isExpanded ? 16 : 0),
        marginBottom: new Animated.Value(isExpanded ? 12 : 0),
        actionsHeight: new Animated.Value(0),
    }).current;

    // Memoize time parsing to avoid recalculation
    const timeParts = useMemo(() => {
        const timeStr = timer.isCountdown
            ? (remainingTime || '0y 0mo 0d 0h 0m 0s')
            : (elapsedTime || '0y 0mo 0d 0h 0m 0s');

        const parts = { y: 0, mo: 0, d: 0, h: 0, m: 0, s: 0 };
        const regex = /(\d+)\s*y|(\d+)\s*mo|(\d+)\s*d|(\d+)\s*h|(\d+)\s*m(?!o)|(\d+)\s*s/g;
        let match;
        while ((match = regex.exec(timeStr)) !== null) {
            if (match[1]) parts.y = parseInt(match[1]);
            if (match[2]) parts.mo = parseInt(match[2]);
            if (match[3]) parts.d = parseInt(match[3]);
            if (match[4]) parts.h = parseInt(match[4]);
            if (match[5]) parts.m = parseInt(match[5]);
            if (match[6]) parts.s = parseInt(match[6]);
        }

        return [parts.y, parts.mo, parts.d, parts.h, parts.m, parts.s];
    }, [timer.isCountdown, remainingTime, elapsedTime]);

    // Memoize formatted date to avoid recalculation
    const formattedDate = useMemo(() => {
        return new Date(timer.isRecurring && timer.nextDate ? timer.nextDate : timer.date).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }, [timer.date, timer.nextDate, timer.isRecurring]);

    // Memoize styles to prevent recreation
    const styles = useMemo(() => StyleSheet.create({
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
        iconButton: {
            backgroundColor: colors.card + '77',
            padding: 6,
            borderRadius: variables.radius.circle,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 0.75,
            borderColor: colors.cardBorder,
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
        expandableSection: {
            overflow: 'hidden',
        },
        timerDetails: {
            color: colors.textDesc,
            fontSize: 12,
            marginBottom: 8,
            marginLeft: 4,
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
        nameText: {
            color: colors.text,
            fontSize: 12,
            fontWeight: 'bold',
        },
        editButton: {
            backgroundColor: colors.highlight + '33',
            borderWidth: 0.75,
            borderColor: colors.highlight,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: variables.radius.sm,
            alignSelf: 'flex-end',
        },
        deleteButton: {
            backgroundColor: 'rgba(239, 68, 68, 0.18)',
            borderWidth: 0.75,
            borderColor: '#ef4444',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: variables.radius.sm,
        },
        buttonText: {
            color: colors.text,
            fontSize: 12,
            textAlign: 'center',
        },
        midSection: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 8,
        },
        contentContainer: {
            paddingTop: 4,
        },
        measurementContainer: {
            position: 'absolute',
            top: -10,
            left: 0,
            right: 0,
            opacity: 0,
            zIndex: -1,
        }
    }), [colors, searchText, privacyMode]);

    // Optimized callbacks
    const handleEdit = useCallback(() => {
        setShowActions(false);
        onEdit(timer);
    }, [onEdit, timer]);

    const handleDelete = useCallback(() => {
        setShowActions(false);
        onDelete(timer.id);
    }, [onDelete, timer.id]);

    const toggleActions = useCallback(() => {
        setShowActions(prev => !prev);
    }, []);

    // Reset actions when collapsed
    useEffect(() => {
        if (!isExpanded && showActions) {
            setShowActions(false);
        }
    }, [isExpanded]);

    // Optimized expand/collapse animation using parallel animations
    useEffect(() => {
        if (hasMeasured) {
            const animations = [
                Animated.timing(animatedValues.height, {
                    toValue: isExpanded ? contentHeight : 0,
                    duration: 200, // Reduced duration for snappier feel
                    useNativeDriver: false,
                }),
                Animated.timing(animatedValues.iconRotation, {
                    toValue: isExpanded ? 1 : 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValues.borderBottomWidth, {
                    toValue: isExpanded ? 2 : 0,
                    duration: 200,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedValues.paddingBottom, {
                    toValue: isExpanded ? 16 : 0,
                    duration: 200,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedValues.marginBottom, {
                    toValue: isExpanded ? 12 : 0,
                    duration: 200,
                    useNativeDriver: false,
                }),
            ];

            Animated.parallel(animations).start();
        }
    }, [isExpanded, contentHeight, hasMeasured]);

    // Optimized actions animation
    useEffect(() => {
        const animations = showActions ? [
            Animated.timing(animatedValues.buttonsOpacity, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(animatedValues.buttonsScale, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(animatedValues.actionsHeight, {
                toValue: 28,
                duration: 150,
                useNativeDriver: false,
            }),
        ] : [
            Animated.timing(animatedValues.buttonsOpacity, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(animatedValues.buttonsScale, {
                toValue: 0.8,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(animatedValues.actionsHeight, {
                toValue: 0,
                duration: 100,
                useNativeDriver: false,
            }),
        ];

        Animated.parallel(animations).start();
    }, [showActions]);

    // Memoized expandable content
    const ExpandableContent = useMemo(() => (
        <View style={styles.contentContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.timerDetails}>
                    {timer.isCountdown ? 'End:  ' : 'Start:  '}
                    {formattedDate}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                    <Animated.View
                        style={{
                            height: animatedValues.actionsHeight,
                            overflow: 'hidden',
                            marginRight: 8,
                            justifyContent: 'center',
                        }}
                        pointerEvents={showActions ? 'auto' : 'none'}
                    >
                        <Animated.View
                            style={{
                                flexDirection: 'row',
                                opacity: animatedValues.buttonsOpacity,
                                transform: [{ scale: animatedValues.buttonsScale }],
                            }}
                        >
                            <TouchableOpacity
                                onPress={handleEdit}
                                style={[styles.editButton, { marginRight: 10 }]}
                            >
                                <Text style={styles.buttonText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleDelete}
                                style={styles.deleteButton}
                            >
                                <Text style={styles.buttonText}>Delete</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>

                    <TouchableOpacity
                        onPress={toggleActions}
                        style={styles.iconButton}
                        activeOpacity={0.7}
                    >
                        <Icons.Material name="edit" size={18} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    ), [timer, formattedDate, showActions, handleEdit, handleDelete, toggleActions, styles]);

    // Memoized time display
    const timeDisplay = useMemo(() => {
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

        let prefix = '';
        if (timer.isCountdown && !timer.isRecurring && remainingTime === '0s') {
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
    }, [timeParts, timer.isCountdown, timer.isRecurring, remainingTime]);

    const handleContentLayout = useCallback((event) => {
        if (!hasMeasured) {
            const { height } = event.nativeEvent.layout;
            setContentHeight(height);
            setHasMeasured(true);

            // Set initial values without animation
            animatedValues.height.setValue(isExpanded ? height : 0);
            animatedValues.iconRotation.setValue(isExpanded ? 1 : 0);
            animatedValues.borderBottomWidth.setValue(isExpanded ? 2 : 0);
            animatedValues.paddingBottom.setValue(isExpanded ? 16 : 0);
            animatedValues.marginBottom.setValue(isExpanded ? 12 : 0);
            animatedValues.buttonsOpacity.setValue(0);
            animatedValues.buttonsScale.setValue(0.8);
        }
    }, [hasMeasured, isExpanded]);

    // Memoized card style
    const cardStyle = useMemo(() => ({
        ...styles.timerItem,
        ...(selected && {
            borderColor: 'hsla(0, 84.20%, 60.20%, 0.60)',
            backgroundColor: 'hsla(0, 84.20%, 60.20%, 0.10)'
        }),
        ...(selectable && !selected && {
            borderColor: 'hsla(0, 0.00%, 38.00%, 0.60)'
        })
    }), [styles.timerItem, selected, selectable]);



    return (
        <View style={cardStyle}>
            <TouchableOpacity onPress={onClick} activeOpacity={0.9}>
                <View style={styles.header}>
                    {privacyMode === 'off' ? (
                        <HighlightMatchText
                            text={titleText}
                            textStyle={styles.timerTitle}
                            search={searchText}
                            colors={colors}
                        />
                    ) :
                        <Text style={styles.timerTitle}>{privacyMode === 'jumble' ? jumbledTitle : maskedTitle}</Text>
                    }
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

                            ) :
                                <Text style={styles.namePill}>{privacyMode === 'jumble' ? jumbledName : maskedName}</Text>
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

                <Animated.View style={[
                    styles.midSection,
                    {
                        borderBottomWidth: animatedValues.borderBottomWidth,
                        paddingBottom: animatedValues.paddingBottom,
                        borderColor: colors.cardBorder,
                        marginBottom: animatedValues.marginBottom,
                    }
                ]}>
                    <Text style={styles.timerQuickInfo}>
                        {timeDisplay}
                    </Text>
                    <Animated.View style={{
                        transform: [{
                            rotate: animatedValues.iconRotation.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '-90deg']
                            })
                        }]
                    }}>
                        <Icons.Material
                            name="expand-more"
                            size={18}
                            color={colors.text}
                            style={{ position: 'relative', opacity: 0.5 }}
                        />
                    </Animated.View>
                </Animated.View>
            </TouchableOpacity>

            {!hasMeasured && (
                <View style={styles.measurementContainer} onLayout={handleContentLayout} pointerEvents="none">
                    {ExpandableContent}
                </View>
            )}

            {hasMeasured && (
                <Animated.View
                    style={[
                        styles.expandableSection,
                        {
                            height: animatedValues.height,
                        },
                    ]}
                >
                    {ExpandableContent}
                </Animated.View>
            )}
        </View>
    );
});

export default TimerCard;