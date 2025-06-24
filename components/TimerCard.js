// ...existing imports...
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Icons } from '../assets/icons';
import HighlightMatchText from './HighlightMatchText';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';


// ...existing TimerCard props...
const TimerCard = ({
    timer,
    elapsedTime = '',
    remainingTime = '',
    onDelete,
    onEdit,
    isExpanded = false,
    onClick,
    colors,
    selectable,
    selected = false,
    searchText = '',
    privacyMode = 'off',
}) => {
    const [showActions, setShowActions] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);
    const [hasMeasured, setHasMeasured] = useState(false);

    // Animation values
    const animatedHeight = useRef(new Animated.Value(0)).current;
    const iconRotation = useRef(new Animated.Value(0)).current;
    const buttonsOpacity = useRef(new Animated.Value(0)).current;
    const buttonsScale = useRef(new Animated.Value(0.8)).current;
    const animatedBorderBottomWidth = useRef(new Animated.Value(isExpanded ? 2 : 0)).current;
    const animatedPaddingBottom = useRef(new Animated.Value(isExpanded ? 16 : 0)).current;
    const animatedMarginBottom = useRef(new Animated.Value(isExpanded ? 12 : 0)).current;
    const actionsHeight = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!isExpanded && showActions) {
            setShowActions(false);
        }
    }, [isExpanded]);

    // Smooth expand/collapse animation
    useEffect(() => {
        if (hasMeasured) {
            Animated.timing(animatedHeight, {
                toValue: isExpanded ? contentHeight : 0,
                duration: 250,
                useNativeDriver: false,
            }).start();

            Animated.timing(iconRotation, {
                toValue: isExpanded ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }).start();

            Animated.timing(animatedBorderBottomWidth, {
                toValue: isExpanded ? 2 : 0,
                duration: 250,
                useNativeDriver: false,
            }).start();

            Animated.timing(animatedPaddingBottom, {
                toValue: isExpanded ? 16 : 0,
                duration: 250,
                useNativeDriver: false,
            }).start();

            Animated.timing(animatedMarginBottom, {
                toValue: isExpanded ? 12 : 0,
                duration: 250,
                useNativeDriver: false,
            }).start();
        }
    }, [isExpanded, contentHeight, hasMeasured]);

    useEffect(() => {
        if (showActions) {
            Animated.parallel([
                Animated.timing(buttonsOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonsScale, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(actionsHeight, {
                    toValue: 28,
                    duration: 200,
                    useNativeDriver: false,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(buttonsOpacity, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonsScale, {
                    toValue: 0.8,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(actionsHeight, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: false,
                }),
            ]).start();
        }
    }, [showActions
    ]);

    const styles = StyleSheet.create({
        timerItem: {
            backgroundColor: colors.cardLighter,
            padding: 12,
            borderRadius: 20,
            marginBottom: 10,
            borderWidth: 0.75,
            borderColor: searchText === '' || privacyMode !== 'off' ? colors.cardBorder : colors.highlight + '3a',
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
            borderRadius: 15,
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
            borderRadius: 13,
            borderWidth: 0.75,
        },
        timerQuickInfo: {
            color: colors.text,
            fontSize: 14,
            fontWeight: 'bold',
            letterSpacing: 1,
            backgroundColor: colors.highlight + '10',
            borderWidth: 0.75,
            borderColor: colors.border,
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            height: 40,
            padding: 8,
            borderRadius: 14,
        },
        expandableSection: {
            overflow: 'hidden',
        },
        expandableContent: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
        },
        timerDetails: {
            color: colors.textDesc,
            fontSize: 12,
            marginBottom: 8,
            marginLeft: 4,
        },
        recurringIndicator: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        recurringText: {
            color: colors.textDesc,
            fontSize: 12,
            marginLeft: 4,
        },
        namePill: {
            backgroundColor: colors.settingBlock + '77',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 16,
            alignSelf: 'flex-start',
            borderWidth: 0.75,
            borderColor: colors.cardBorder,
        },
        nameText: {
            color: colors.text,
            fontSize: 12,
            fontWeight: 'bold',
        },
        actions: {
            flexDirection: 'row',
            marginTop: 8,
        },
        editButton: {
            backgroundColor: colors.highlight + '33',
            borderWidth: 0.75,
            borderColor: colors.highlight,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 15,
            alignSelf: 'flex-end',
        },
        deleteButton: {
            backgroundColor: 'rgba(239, 68, 68, 0.18)',
            borderWidth: 0.75,
            borderColor: '#ef4444',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 15,
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
            top: -1000,
            left: 0,
            right: 0,
            opacity: 0,
            zIndex: -1,
        }
    });

    // Memoized expandable content to prevent blinking
    const ExpandableContent = useMemo(() => (
        <View style={styles.contentContainer}>
            {/* End/Start Time */}
            <Text style={styles.timerDetails}>
                {timer.isCountdown ? 'End:  ' : 'Start:  '}
                {new Date(timer.isRecurring && timer.nextDate ? timer.nextDate : timer.date).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })}
            </Text>

            {/* Name Pill and Pencil Icon in one row */}

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                {timer.personName ? (
                    <View style={styles.namePill}>
                        <HighlightMatchText
                            text={timer.personName && timer.personName.length > 15
                                ? timer.personName.slice(0, 15) + '...'
                                : timer.personName}
                            textStyle={styles.nameText}
                            privacyMode={privacyMode}
                            search={searchText}
                            colors={colors}
                        />
                    </View>
                ) : <View />}
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                    {/* Action buttons to the left of the pencil icon */}
                    <Animated.View
                        style={{
                            height: actionsHeight,
                            overflow: 'hidden',
                            marginRight: 8,
                            justifyContent: 'center',
                        }}
                        pointerEvents={showActions ? 'auto' : 'none'}
                    >
                        <Animated.View
                            style={{
                                flexDirection: 'row',
                                opacity: buttonsOpacity,
                                transform: [{ scale: buttonsScale }],
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => { setShowActions(false); onEdit(timer); }}
                                style={[styles.editButton, { marginRight: 10 }]}
                            >
                                <Text style={styles.buttonText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => { setShowActions(false); onDelete(timer.id); }}
                                style={styles.deleteButton}
                            >
                                <Text style={styles.buttonText}>Delete</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>
                    {/* Pencil icon to the right */}
                    <TouchableOpacity
                        onPress={() => setShowActions(!showActions)}
                        style={styles.iconButton}
                        activeOpacity={0.7}
                    >
                        <Icons.Material name="edit" size={18} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

        </View>
    ), [
        timer,
        showActions,
        buttonsOpacity,
        buttonsScale,
        onEdit,
        onDelete,
    ]);

    // Helper for time parts
    const getTimeParts = (timeString) => {
        // Expects format: "Xy Xmo Xd Xh Xm Xs"
        const parts = { y: 0, mo: 0, d: 0, h: 0, m: 0, s: 0 };
        const regex = /(\d+)\s*y|(\d+)\s*mo|(\d+)\s*d|(\d+)\s*h|(\d+)\s*m(?!o)|(\d+)\s*s/g;
        let match;
        while ((match = regex.exec(timeString)) !== null) {
            if (match[1]) parts.y = parseInt(match[1]);
            if (match[2]) parts.mo = parseInt(match[2]);
            if (match[3]) parts.d = parseInt(match[3]);
            if (match[4]) parts.h = parseInt(match[4]);
            if (match[5]) parts.m = parseInt(match[5]);
            if (match[6]) parts.s = parseInt(match[6]);
        }
        return [parts.y, parts.mo, parts.d, parts.h, parts.m, parts.s];
    };

    const handleContentLayout = (event) => {
        if (!hasMeasured) {
            const { height } = event.nativeEvent.layout;
            setContentHeight(height);
            setHasMeasured(true);
            animatedHeight.setValue(isExpanded ? height : 0);
            iconRotation.setValue(isExpanded ? 1 : 0);
            animatedBorderBottomWidth.setValue(isExpanded ? 2 : 0);
            animatedPaddingBottom.setValue(isExpanded ? 16 : 0);
            animatedMarginBottom.setValue(isExpanded ? 12 : 0);
            buttonsOpacity.setValue(0);
            buttonsScale.setValue(0.8);
        }
    };

    return (
        <View style={{
            ...styles.timerItem,
            ...(selected && { borderColor: 'hsla(0, 84.20%, 60.20%, 0.60)', backgroundColor: 'hsla(0, 84.20%, 60.20%, 0.10)' }),
            ...(selectable && !selected && { borderColor: 'hsla(0, 0.00%, 38.00%, 0.60)' })
        }}>
            {/* Header - Only this is touchable for expand/collapse */}
            <TouchableOpacity onPress={onClick} activeOpacity={0.9}>
                <View style={styles.header}>
                    <HighlightMatchText
                        text={timer.title.length > 15 ? timer.title.slice(0, 15) + '...' : timer.title}
                        textStyle={styles.timerTitle}
                        privacyMode={privacyMode}
                        search={searchText}
                        colors={colors}
                    />
                    <View style={styles.priorityIndicator}>
                        {timer.isRecurring && (
                            <Icons.Material
                                name="autorenew"
                                size={14}
                                color={colors.highlight}
                                style={{ marginHorizontal: 6 }}
                            />
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

                {/* Quick Info */}
                <Animated.View style={[
                    styles.midSection,
                    {
                        borderBottomWidth: animatedBorderBottomWidth,
                        paddingBottom: animatedPaddingBottom,
                        borderColor: colors.cardBorder,
                        marginBottom: animatedMarginBottom,
                    }
                ]}>
                    <Text style={styles.timerQuickInfo}>
                        {(() => {
                            const timeStr = timer.isCountdown
                                ? (remainingTime || '0y 0mo 0d 0h 0m 0s')
                                : (elapsedTime || '0y 0mo 0d 0h 0m 0s');
                            const [years, months, days, hours, minutes, seconds] = getTimeParts(timeStr);

                            const timeParts = [
                                { value: years, label: 'y', id: 'years' },
                                { value: months, label: 'mo', id: 'months' },
                                { value: days, label: 'd', id: 'days' },
                                { value: hours, label: 'h', id: 'hours' },
                                { value: minutes, label: 'm', id: 'minutes' },
                                { value: seconds, label: 's', id: 'seconds' },
                            ];

                            const nonZeroParts = timeParts.filter(part => part.value !== 0);

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
                        })()}
                    </Text>
                    <Animated.View style={{
                        transform: [{
                            rotate: iconRotation.interpolate({
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

            {/* Measurement container - hidden off-screen */}
            {!hasMeasured && (
                <View style={styles.measurementContainer} onLayout={handleContentLayout} pointerEvents="none">
                    {ExpandableContent}
                </View>
            )}

            {/* Animated Expandable Section */}
            {hasMeasured && (
                <Animated.View
                    style={[
                        styles.expandableSection,
                        {
                            height: animatedHeight,
                        },
                    ]}
                >
                    {ExpandableContent}
                </Animated.View>
            )}
        </View>
    );
};

export default React.memo(TimerCard);