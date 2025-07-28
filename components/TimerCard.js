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
    Dimensions
} from 'react-native';


import ViewShot from 'react-native-view-shot';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

import ExportSheet from './ExportSheet';
import { useTheme } from '../utils/ThemeContext';
import { useSecurity } from '../utils/SecurityContext';

import HighlightText from './HighlightText';
import Wave from './Wave';
import ProgressWave from './ProgressWave';
import TimerOverlay from './TimerOverlay';
import TimerContextMenu from './TimerContextMenu';

import {
    getPrivacyText,
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
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [activeChip, setActiveChip] = useState(null);
    const cardRef = useRef();

    const { privacyMode } = useSecurity();
    const { isBorder, headerMode, border, colors, variables, progressMode } = useTheme();

    // Static timer data calculation
    const [staticTimerData, setStaticTimerData] = useState({
        formattedDate: '',
        recurrenceCount: 0
    });

    const calculateStaticTimerData = useCallback(() => {
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
    }, [timer]);

    useEffect(() => {
        setStaticTimerData(calculateStaticTimerData());
    }, [calculateStaticTimerData]);

    // Privacy and text utilities
    const isLongTitle = timer.title && timer.title.length > 12;
    const isLongName = timer.personName && timer.personName.length > 12;

    const getPrivText = (LIM, VAL) => getPrivacyText(LIM, privacyMode, VAL);
    const shortStr = (TXT, LIM = 12) => TXT && TXT.length > LIM ? TXT.slice(0, LIM) + '…' : TXT;

    const titleText = shortStr(timer.title);
    const nameText = shortStr(timer.personName);

    const privacyTitleText = useMemo(
        () => getPrivText(layoutMode === 'grid' ? 7 : 12, timer.title),
        [timer.title, privacyMode, layoutMode]
    );

    const privacyNameText = useMemo(
        () => getPrivText(layoutMode === 'grid' ? 7 : 12, timer.personName),
        [timer.personName, privacyMode, layoutMode]
    );

    // Compact Time Chip Component
    const CompactTimeChip = useMemo(() => memo(() => {
        const [timeParts, setTimeParts] = useState([0, 0, 0, 0, 0, 0]);
        const [status, setStatus] = useState('ongoing');
        const [compactChipIndex, setCompactChipIndex] = useState(5);
        const timerRef = useRef(timer);
        const animationFrameRef = useRef(null);
        const lastUpdateRef = useRef(0);

        timerRef.current = timer;

        const calculateAutoIndex = useCallback((parts) => {
            if (defaultUnit === 'auto') {
                const index = parts.findIndex(part => part > 0);
                return index !== -1 ? index : 5;
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

            if (defaultUnit === 'auto') {
                setCompactChipIndex(prevIndex => {
                    const newIndex = calculateAutoIndex(newTimeParts);
                    return newIndex !== prevIndex ? newIndex : prevIndex;
                });
            }

            animationFrameRef.current = requestAnimationFrame(updateTimeParts);
        }, [calculateAutoIndex]);

        useEffect(() => {
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
    }), [defaultUnit, colors, styles, getChippedTime, timer]);

    // Time Display Component for List Mode
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
    }), [timer.isCountdown, timer]);

    // Progress Bar Component
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

        const progressWidth = layoutMode === 'grid' ? screenWidth * 0.29 : screenWidth * 0.74;

        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: layoutMode === 'grid' ? 12 : 8,
                gap: layoutMode === 'grid' ? 8 : 10,
                width: '100%'
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
                                height: layoutMode === 'grid' ? 20 : 25,
                                width: progressWidth * (progressPct / 100),
                                maxWidth: progressWidth,
                                backgroundColor: colors.highlight + '20',
                                borderRadius: 6,
                                overflow: 'hidden',
                                paddingVertical: layoutMode === 'grid' ? 0 : 2
                            }}
                        >
                            <Wave
                                amplitude={layoutMode === 'grid' ? 4 : 6}
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
                                overflow: 'hidden',
                                paddingVertical: layoutMode === 'grid' ? 0 : 4
                            }}
                        >
                            <ProgressWave
                                progressPct={progressPct}
                                amplitude={layoutMode === 'grid' ? 4 : 6}
                                frequency={layoutMode === 'grid' ? 8 : 10}
                                speed={3000}
                                height={20}
                                width={progressWidth}
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
                        width: layoutMode === 'grid' ? 'auto' : '15%',
                        lineHeight: 20,
                        paddingLeft: layoutMode === 'grid' ? 0 : 10,
                        alignSelf: 'center'
                    }}
                >
                    {progressPct.toFixed(1)}%
                </Text>
            </View>
        );
    }), [colors.highlight, progressMode, screenWidth, timer]);

    // Arrow Icon Component
    const ArrowIcon = useMemo(() => memo(({ colors, showOverlay }) => (
        <Icons.Material
            name={showOverlay ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={18}
            color={colors.text}
            style={{ opacity: 0.5 }}
        />
    )), []);

    // Styles
    const styles = useMemo(() => createStyles(), [colors, variables, isBorder, searchText, privacyMode, selected, selectable, layoutMode, isLongName, isLongTitle, border]);

    function createStyles() {
        return StyleSheet.create({
            timerItem: {
                backgroundColor: colors.settingBlock,
                padding: 12,
                borderRadius: variables.radius.md,
                marginBottom: 10,
                borderWidth: border,
                borderColor: !isBorder ? 0 : (searchText === '' || privacyMode !== 'off') ? colors.border : colors.highlight + '3a',
                minWidth: layoutMode !== 'grid' ? screenWidth * 0.74 : '48%',
                maxWidth: layoutMode === 'grid' ? screenWidth * 0.453 : '100%',
                marginVertical: 6,
                marginRight: layoutMode === 'grid' ? '1.5%' : 0,
                marginLeft: layoutMode === 'grid' ? '0.5%' : 0,
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

    // Event handlers
    const handleCardPress = useCallback(() => {
        if (!selectable) {
            setShowOverlay(true);
        }
        if (onClick) onClick();
    }, [onClick, selectable]);

    const handleLongPress = useCallback(() => {
        if (!selectable && buttons === 'on') {
            setShowContextMenu(true);
        }
    }, [selectable, buttons]);

    const handleEdit = useCallback(() => {
        setShowContextMenu(false);
        setShowOverlay(false);
        onEdit(timer);
    }, [onEdit, timer]);

    const handleDelete = useCallback(() => {
        setShowContextMenu(false);
        setShowOverlay(false);
        onDelete(timer.id);
    }, [onDelete, timer.id]);

    const handleDuplicateAction = useCallback(() => {
        setShowContextMenu(false);
        setShowOverlay(false);
        handleDuplicate(timer);
    }, [handleDuplicate, timer]);

    const handleFavouriteAction = useCallback(() => {
        setShowContextMenu(false);
        handleFavourite(timer.id);
    }, [handleFavourite, timer.id]);

    // Card style with selection states
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

    const staticStyles = {
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
        paddingLeft0: {
            paddingLeft: 0
        },
        marginHorizontal0: {
            marginHorizontal: 0
        }
    };

    return (
        <>
            <ViewShot ref={cardRef} options={{ format: 'png', quality: 1 }}>
                <TouchableOpacity
                    onPress={handleCardPress}
                    onLongPress={handleLongPress}
                    activeOpacity={1}
                >
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
                                            style={{ marginBottom: 8 }}
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
            </ViewShot>

            {/* Timer Overlay Component */}
            <TimerOverlay
                visible={showOverlay}
                onClose={() => setShowOverlay(false)}
                timer={timer}
                staticTimerData={staticTimerData}
                privacyMode={privacyMode}
                colors={colors}
                variables={variables}
                border={border}
                headerMode={headerMode}
                cardRef={cardRef}
                getPrivText={getPrivText}
                activeChip={activeChip}
                setActiveChip={setActiveChip}
                layoutMode={layoutMode}
                isLongName={isLongName}
                isLongTitle={isLongTitle}
            />

            {/* Context Menu Component */}
            <TimerContextMenu
                visible={showContextMenu}
                onClose={() => setShowContextMenu(false)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicateAction}
                onFavourite={handleFavouriteAction}
                onShare={() => { }}
                timer={timer}
            />

            {/*
            <ExportSheet
            visible={}
            onClose={}
            cardRef = {cardRef}
            sheetRef={sheetRef}
            />
            */}

        </>
    );
};

export default memo(TimerCard, (prevProps, nextProps) => {
    if (prevProps.selected !== nextProps.selected) return false;
    if (prevProps.searchText !== nextProps.searchText) return false;
    if (prevProps.layoutMode !== nextProps.layoutMode) return false;
    if (prevProps.defaultUnit !== nextProps.defaultUnit) return false;
    if (prevProps.buttons !== nextProps.buttons) return false;

    const timerProps = ['id', 'title', 'personName', 'date', 'isRecurring', 'recurrenceInterval',
        'isCountdown', 'isFavourite', 'priority', 'nextDate'];

    return timerProps.every(prop => {
        return prevProps.timer[prop] === nextProps.timer[prop];
    });
});