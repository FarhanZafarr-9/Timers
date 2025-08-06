import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    Dimensions,
    Animated,
    Modal
} from 'react-native';
import LabelInput from './LabelInput';
import { useTheme } from '../utils/ThemeContext';
import { WheelPickerInput } from './PickerInput';
import PickerSheet from './PickerSheet';
import { priorityOptions, recurrenceOptions } from '../utils/functions';
import Switch from './Switch';
import DatePicker, { getToday } from 'react-native-modern-datepicker';

const DateTimeModal = React.memo(({
    visible,
    onClose,
    mode,
    type,
    value,
    onChange,
    useModernPicker,
    colors,
    styles,
    minDate,
    maxDate,
    formatDisplay,
    title
}) => {
    const translateY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const [isVisible, setIsVisible] = useState(visible);

    const closeHandler = useCallback(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: Dimensions.get('window').height,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsVisible(false);
            onClose();
        });
    }, [translateY, opacity, onClose]);

    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            closeHandler();
        }
    }, [visible, translateY, opacity, closeHandler]);

    if (!isVisible) return null;

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="none"
            onRequestClose={closeHandler}
        >
            <Animated.View style={[styles.overlay, { opacity }]}>
                <TouchableWithoutFeedback onPress={closeHandler}>
                    <View style={{ flex: 1 }} />
                </TouchableWithoutFeedback>

                <Animated.View style={[
                    styles.dateTimeModal,
                    { transform: [{ translateY }] }
                ]}>
                    <View style={styles.handle} />
                    <Text style={[styles.modalTitle, { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 16 }]}>{title}</Text>

                    {useModernPicker ? (
                        <DatePicker
                            mode={type === 'date' ? 'calendar' : 'time'}
                            isGregorian={true}
                            minimumDate={minDate}
                            maximumDate={maxDate}
                            current={type === 'date' ? getToday() : '00:00'}
                            selected={value}
                            onDateChange={type === 'date' ? onChange : undefined}
                            onTimeChange={type === 'time' ? onChange : undefined}
                            onSelectedChange={onChange}
                            onMonthYearChange={type === 'date' ? onChange : undefined}
                            onValueChange={onChange}
                            minuteInterval={1}
                            options={{
                                backgroundColor: colors.cardLighter,
                                textHeaderColor: colors.highlight + 'f0',
                                textDefaultColor: colors.text,
                                selectedTextColor: colors.card,
                                mainColor: colors.highlight,
                                textSecondaryColor: colors.text,
                                borderColor: colors.border,
                            }}
                            style={{ borderRadius: 12, borderWidth: 1, borderColor: colors.border, flex: 1 }}
                        />
                    ) : (
                        <View style={{ flex: 1 }}>
                            {formatDisplay()}
                        </View>
                    )}

                    <TouchableOpacity onPress={closeHandler} style={styles.confirmButton}>
                        <Text style={styles.confirmButtonText}>Confirm {type === 'date' ? 'Date' : 'Time'}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
});

const AddTimer = ({ visible, onClose, onAdd, initialData, mode, isDuplicate }) => {
    const { height: SCREEN_HEIGHT } = Dimensions.get('window');
    const { variables, colors, isBorder, headerMode, border } = useTheme();

    // State
    const [useModernPicker, setUseModernPicker] = useState(false);
    const [error, setError] = useState('');
    const [focus, setFocus] = useState({
        personName: false,
        title: false,
        recurrence: false,
    });

    // Refs for animations
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const [isVisible, setIsVisible] = useState(visible);

    // Modal visibility states
    const [dateModalVisible, setDateModalVisible] = useState(false);
    const [timeModalVisible, setTimeModalVisible] = useState(false);

    // Timer data state
    const [timerData, setTimerData] = useState(() => {
        const now = new Date();
        return {
            title: '',
            personName: '',
            priority: 'normal',
            date: now,
            isRecurring: false,
            recurrenceInterval: '',
            isCountdown: mode === 'countdown',
        };
    });

    // Modern picker formats
    const [modernDate, setModernDate] = useState('');
    const [modernTime, setModernTime] = useState('');

    // Input states for traditional picker
    const [dateInputs, setDateInputs] = useState({
        year: '',
        month: '',
        day: '',
        hour: '',
        minute: '',
        second: '',
    });

    // Calculate bottom sheet height
    const BOTTOM_SHEET_HEIGHT = useMemo(() =>
        Math.min(SCREEN_HEIGHT * 0.7, mode === 'countdown' ? 670 : 560),
        [SCREEN_HEIGHT, mode]
    );

    // Format date for modern picker (YYYY/MM/DD)
    const formatDateForModernPicker = useCallback((date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }, []);

    // Format time for modern picker (HH:MM)
    const formatTimeForModernPicker = useCallback((date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }, []);

    // Update all date/time inputs when date changes
    const updateDateTimeInputs = useCallback((date) => {
        setDateInputs({
            year: String(date.getFullYear()),
            month: String(date.getMonth() + 1).padStart(2, '0'),
            day: String(date.getDate()).padStart(2, '0'),
            hour: String(date.getHours()).padStart(2, '0'),
            minute: String(date.getMinutes()).padStart(2, '0'),
            second: String(date.getSeconds()).padStart(2, '0'),
        });

        setModernDate(formatDateForModernPicker(date));
        setModernTime(formatTimeForModernPicker(date));
    }, [formatDateForModernPicker, formatTimeForModernPicker]);

    // Reset form helper
    const resetForm = useCallback(() => {
        const now = new Date();
        setTimerData({
            title: '',
            personName: '',
            priority: 'normal',
            date: now,
            isRecurring: false,
            recurrenceInterval: '',
            isCountdown: mode === 'countdown',
        });
        updateDateTimeInputs(now);
        setError('');
        setFocus({
            personName: false,
            title: false,
            recurrence: false,
        });
    }, [mode, updateDateTimeInputs]);

    // Initialize form with initial data
    useEffect(() => {
        if (initialData) {
            try {
                const initialDate = new Date(initialData.date);
                if (isNaN(initialDate)) throw new Error('Invalid date');

                setTimerData({
                    ...initialData,
                    date: initialDate,
                    recurrenceInterval: initialData.recurrenceInterval || '',
                });
                updateDateTimeInputs(initialDate);
            } catch {
                const now = new Date();
                setTimerData(prev => ({
                    ...prev,
                    date: now,
                }));
                updateDateTimeInputs(now);
            }
        } else {
            const now = new Date();
            setTimerData(prev => ({
                ...prev,
                date: now,
            }));
            updateDateTimeInputs(now);
        }
    }, [initialData, updateDateTimeInputs]);

    // Close handler for main modal
    const closeHandler = useCallback(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsVisible(false);
            onClose();
            resetForm();
        });
    }, [translateY, opacity, SCREEN_HEIGHT, onClose, resetForm]);

    // Animation effects
    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            closeHandler();
        }
    }, [visible, translateY, opacity, closeHandler]);

    // Clear error when inputs change
    useEffect(() => {
        if (error) setError('');
    }, [timerData.title, timerData.personName, timerData.recurrenceInterval, error]);

    // Validation helpers
    const isValidDate = useCallback((y, m, d) => {
        const date = new Date(y, m - 1, d);
        return (
            date.getFullYear() === y &&
            date.getMonth() === m - 1 &&
            date.getDate() === d
        );
    }, []);

    const isValidTime = useCallback((h, min, s) =>
        h >= 0 && h < 24 && min >= 0 && min < 60 && s >= 0 && s < 60
        , []);

    const getTimerType = useCallback((date) => {
        if (mode === 'countdown') return true;
        if (mode === 'countup') return false;
        const now = new Date();
        return new Date(date) > now;
    }, [mode]);

    // Handle date/time changes for modern picker
    const handleModernDateChange = useCallback((date) => {
        setModernDate(date);

        const [Y, M, D] = date.split('/');
        setDateInputs(prev => ({
            ...prev,
            year: Y,
            month: M,
            day: D,
        }));
    }, []);

    const handleModernTimeChange = useCallback((time) => {
        const CleanTime = time.length === 5 ? time + ':00' : time;
        setModernTime(CleanTime);

        const [H, M, S] = CleanTime.split(':');
        setDateInputs(prev => ({
            ...prev,
            hour: H,
            minute: M,
            second: S,
        }));
    }, []);

    // Handle date/time part changes for traditional picker
    const handleDateTimePartChange = useCallback((part, value) => {
        setDateInputs(prev => {
            const Updated = {
                ...prev,
                [part]: value,
            };

            const D = Updated.year + '/' + Updated.month + '/' + Updated.day;
            const T = Updated.hour + ':' + Updated.minute + ':' + Updated.second;

            setModernDate(D);
            setModernTime(T);

            return Updated;
        });
    }, []);

    // Display formatters
    const formatDisplayDate = useCallback(() => {
        if (useModernPicker && modernDate) {
            const [year, month, day] = modernDate.split('/');
            return `${day}/${month}/${year}`;
        }
        return `${dateInputs.day}/${dateInputs.month}/${dateInputs.year}`;
    }, [useModernPicker, modernDate, dateInputs]);

    const formatDisplayTime = useCallback(() => {
        if (useModernPicker && modernTime) {
            return modernTime;
        }

        const H = String(dateInputs.hour ?? '00').padStart(2, '0');
        const M = String(dateInputs.minute ?? '00').padStart(2, '0');
        const S = String(dateInputs.second ?? '00').padStart(2, '0');

        return `${H}:${M}:${S}`;
    }, [useModernPicker, modernTime, dateInputs]);

    const getMaxDay = (Y, M) => {
        const today = new Date();
        const isCurrentMonth = Number(Y) === today.getFullYear() && Number(M) === today.getMonth() + 1;

        const daysInMonth = new Date(Y, M, 0).getDate(); // M is 1-based
        const mindays = Math.min(today.getDate(), daysInMonth);
        return isCurrentMonth && mode !== 'countdown' ?( mindays !== 1 ? mindays - 1 : mindays) : daysInMonth;
    };

    // Main add/save handler
    const handleAdd = useCallback(() => {
        if (!timerData.title.trim() || !timerData.personName.trim()) {
            setError('Please fill in all required fields.');
            return;
        }

        if (timerData.priority === '') {
            setError('Please select a priority.');
            return;
        }

        if (timerData.isRecurring && !timerData.recurrenceInterval.trim()) {
            setError('Please specify the recurrence interval.');
            return;
        }

        let finalDate;

        if (!useModernPicker) {
            const y = parseInt(dateInputs.year, 10);
            const m = parseInt(dateInputs.month, 10);
            const d = parseInt(dateInputs.day, 10);
            const h = parseInt(dateInputs.hour, 10);
            const min = parseInt(dateInputs.minute, 10);
            const s = parseInt(dateInputs.second, 10);

            if (
                isNaN(y) || isNaN(m) || isNaN(d) ||
                isNaN(h) || isNaN(min) || isNaN(s)
            ) {
                setError('Please enter a valid date and time.');
                return;
            }
            if (!isValidDate(y, m, d)) {
                setError('Invalid date.');
                return;
            }
            if (!isValidTime(h, min, s)) {
                setError('Invalid time.');
                return;
            }

            finalDate = new Date(y, m - 1, d, h, min, s);
        } else {
            if (!modernDate || !modernTime) {
                setError('Please select both date and time.');
                return;
            }

            const [year, month, day] = modernDate.split('/').map(Number);
            const [hour, minute] = modernTime.split(':').map(Number);

            finalDate = new Date(year, month - 1, day, hour, minute, 0);
        }

        const timerToSave = {
            ...timerData,
            date: finalDate,
            isCountdown: getTimerType(finalDate),
        };

        if (initialData) {
            timerToSave.id = initialData.id;
        }

        onAdd(timerToSave);
        closeHandler();
    }, [
        timerData,
        useModernPicker,
        dateInputs,
        modernDate,
        modernTime,
        isValidDate,
        isValidTime,
        getTimerType,
        initialData,
        onAdd,
        closeHandler
    ]);

    // Memoized styles
    const styles = useMemo(() => StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: (headerMode === 'fixed' ? colors.cardLighter : colors.background) + '90',
            justifyContent: 'flex-end',
        },
        bottomSheet: {
            height: BOTTOM_SHEET_HEIGHT,
            backgroundColor: colors.modalBg,
            borderTopLeftRadius: variables.radius.lg,
            borderTopRightRadius: variables.radius.lg,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 20,
            borderWidth: border,
            borderColor: colors.border,
        },
        dateTimeModal: {
            height: SCREEN_HEIGHT * (useModernPicker ? 0.65 : 0.30),
            backgroundColor: colors.modalBg,
            borderTopLeftRadius: variables.radius.lg,
            borderTopRightRadius: variables.radius.lg,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 20,
            borderWidth: border,
            borderColor: colors.border,
            padding: 20,
        },
        handle: {
            width: 40,
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginTop: 12,
            marginBottom: 8,
        },
        contentContainer: {
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        },
        modePill: {
            position: 'absolute',
            top: 10,
            right: 20,
            backgroundColor: colors.snackbarBg,
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: variables.radius.sm,
            borderWidth: border,
            borderColor: colors.border,
        },
        modeText: {
            color: colors.text,
            fontSize: 12,
            textAlign: 'center',
        },
        modalTitle: {
            color: colors.textTitle,
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 16,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
            paddingBottom: 16
        },
        input: {
            backgroundColor: colors.highlight + '22',
            color: colors.text,
            padding: 10,
            borderRadius: variables.radius.sm,
            marginBottom: 0,
            borderWidth: border,
            borderColor: 'transparent',
            fontSize: 14,
        },
        dateTimeField: {
            backgroundColor: colors.highlight + '12',
            color: colors.text,
            padding: 12,
            borderRadius: variables.radius.sm,
            marginBottom: 12,
            borderWidth: border,
            borderColor: 'transparent',
            fontSize: 16,
            textAlign: 'center',
            fontWeight: '600',
            letterSpacing: 5,
        },
        dateTimeLabel: {
            color: colors.textDesc,
            fontSize: 14,
            fontWeight: 'bold',
            marginBottom: 4,
        },
        priorityContainer: {
            flexDirection: 'row',
            width: '55%',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
            backgroundColor: colors.highlight + '22',
            padding: 2,
            borderRadius: variables.radius.sm,
            borderWidth: border,
            borderColor: colors.border,
        },
        arrowButton: {
            backgroundColor: colors.snackbarBg,
            padding: 8,
            borderRadius: variables.radius.sm,
        },
        priorityText: {
            color: colors.text,
            fontSize: 14,
            fontWeight: 'bold',
        },
        recurringContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
        },
        label: {
            color: colors.text,
            fontSize: 14,
            height: 20,
            fontWeight: 'bold',
        },
        buttonContainer: {
            flexDirection: 'column',
            marginTop: 'auto',
            borderTopColor: colors.border,
            borderTopWidth: border,
            paddingTop: 20,
            gap: 10,
        },
        addButton: {
            backgroundColor: colors.highlight,
            borderWidth: isBorder ? 0.5 : 0,
            borderColor: colors.border,
            padding: 10,
            borderRadius: variables.radius.sm,
            justifyContent: 'center',
            alignItems: 'center'
        },
        cancelButton: {
            backgroundColor: colors.highlight + '20',
            borderWidth: isBorder ? 0.5 : 0,
            borderColor: colors.border,
            padding: 10,
            borderRadius: variables.radius.sm,
            justifyContent: 'center',
            alignItems: 'center'
        },
        buttonText: {
            color: colors.text,
            fontSize: 14,
            textAlign: 'center',
            fontWeight: 'bold',
            height: 18,
        },
        inputRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            marginVertical: 4,
        },
        priorityParentContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        error: {
            color: '#ef4444',
            fontSize: 13,
            marginBottom: 8,
            textAlign: 'center',
            backgroundColor: 'rgba(239, 68, 68, 0.18)',
            borderWidth: isBorder ? 0.5 : 0,
            borderColor: '#ef4444',
            padding: 10,
            borderRadius: variables.radius.sm,
            height: 40
        },
        scrollContent: {
            flexGrow: 1,
        },
        confirmButton: {
            backgroundColor: colors.highlight,
            padding: 15,
            borderRadius: variables.radius.sm,
            marginTop: 20,
            alignItems: 'center',
        },
        confirmButtonText: {
            color: colors.card,
            fontSize: 16,
            fontWeight: 'bold',
        },
    }), [
        headerMode,
        colors,
        variables,
        border,
        isBorder,
        BOTTOM_SHEET_HEIGHT,
        SCREEN_HEIGHT,
        useModernPicker
    ]);

    // Traditional date picker component
    const TraditionalDatePicker = useMemo(() => () => (
        <View style={styles.inputRow}>
            <View style={{ width: '32%' }}>
                <WheelPickerInput
                    label="Day"
                    value={dateInputs.day}
                    onValueChange={val => handleDateTimePartChange('day', val)}
                    minValue={
                        mode === 'countdown' &&
                            Number(dateInputs.year) === new Date().getFullYear() &&
                            Number(dateInputs.month) === new Date().getMonth() + 1
                            ? new Date().getDate() + 1
                            : 1
                    }
                    maxValue={
                        getMaxDay(Number(dateInputs.year), Number(dateInputs.month))
                    }
                    colors={colors}
                    formatValue={val => val.toString()}
                    pickerType="wheel"
                />
            </View>
            <View style={{ width: '32%' }}>
                <WheelPickerInput
                    label="Month"
                    value={dateInputs.month}
                    onValueChange={val => handleDateTimePartChange('month', val)}
                    minValue={
                        mode === 'countdown' && Number(dateInputs.year) === new Date().getFullYear()
                            ? new Date().getMonth() + 1
                            : 1
                    }
                    maxValue={Number(dateInputs.year) === new Date().getFullYear() && mode !== 'countdown' ? new Date().getMonth() + 1 : 12}
                    colors={colors}
                    formatValue={val => val.toString()}
                    pickerType="wheel"
                />
            </View>
            <View style={{ width: '32%' }}>
                <WheelPickerInput
                    label="Year"
                    value={dateInputs.year}
                    onValueChange={val => handleDateTimePartChange('year', val)}
                    minValue={mode === 'countdown' ? new Date().getFullYear() : 1970}
                    maxValue={mode === 'countdown' ? new Date().getFullYear() + 30 : new Date().getFullYear()}
                    colors={colors}
                    formatValue={val => val.toString()}
                    pickerType="wheel"
                />
            </View>
        </View>
    ), [dateInputs, handleDateTimePartChange, mode, colors, styles]);

    // Traditional time picker component
    const TraditionalTimePicker = useMemo(() => () => (
        <View style={styles.inputRow}>
            <View style={{ width: '32%' }}>
                <WheelPickerInput
                    label="Hour"
                    value={dateInputs.hour}
                    onValueChange={val => handleDateTimePartChange('hour', val)}
                    minValue={0}
                    maxValue={24}
                    colors={colors}
                    formatValue={val => val.toString()}
                    pickerType="wheel"
                />
            </View>
            <View style={{ width: '32%' }}>
                <WheelPickerInput
                    label="Minute"
                    value={dateInputs.minute}
                    onValueChange={val => handleDateTimePartChange('minute', val)}
                    minValue={0}
                    maxValue={59}
                    colors={colors}
                    formatValue={val => val.toString()}
                    pickerType="wheel"
                />
            </View>
            <View style={{ width: '32%' }}>
                <WheelPickerInput
                    label="Second"
                    value={dateInputs.second}
                    onValueChange={val => handleDateTimePartChange('second', val)}
                    minValue={0}
                    maxValue={59}
                    colors={colors}
                    formatValue={val => val.toString()}
                    pickerType="wheel"
                />
            </View>
        </View>
    ), [dateInputs, handleDateTimePartChange, colors, styles]);

    if (!isVisible) return null;

    return (
        <>
            <Modal
                visible={isVisible}
                transparent
                animationType="none"
                onRequestClose={closeHandler}
                statusBarTranslucent
            >
                <Animated.View style={[styles.overlay, { opacity }]}>
                    <TouchableWithoutFeedback onPress={closeHandler}>
                        <View style={{ flex: 1 }} />
                    </TouchableWithoutFeedback>

                    <Animated.View style={[
                        styles.bottomSheet,
                        { transform: [{ translateY }] }
                    ]}>
                        <View style={styles.handle} />

                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.contentContainer}>
                                <View style={styles.modePill}>
                                    <Text style={styles.modeText}>
                                        {timerData.isCountdown ? 'Countdown' : 'Countup'}
                                    </Text>
                                </View>
                                <Text style={styles.modalTitle}>
                                    {initialData ? 'Edit Timer' : 'Add Timer'}
                                </Text>

                                <View style={styles.scrollContent}>
                                    <View style={styles.inputRow}>
                                        <View style={{ width: '45%' }}>
                                            <LabelInput
                                                label="Person Name"
                                                value={timerData.personName}
                                                onChangeText={text => setTimerData(prev => ({
                                                    ...prev,
                                                    personName: text
                                                }))}
                                                style={styles.input}
                                                focus={focus}
                                                setFocus={setFocus}
                                                focusKey="personName"
                                                colors={colors}
                                            />
                                        </View>
                                        <View style={{ width: '50%' }}>
                                            <LabelInput
                                                label="Title"
                                                value={timerData.title}
                                                onChangeText={text => setTimerData(prev => ({
                                                    ...prev,
                                                    title: text
                                                }))}
                                                style={styles.input}
                                                focus={focus}
                                                setFocus={setFocus}
                                                focusKey="title"
                                                colors={colors}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.recurringContainer}>
                                        <Text style={styles.label}>Use Modern Picker?</Text>
                                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                            <Switch
                                                value={useModernPicker}
                                                onValueChange={setUseModernPicker}
                                            />
                                        </View>
                                    </View>

                                    {/* Date and Time Fields */}
                                    <View style={styles.inputRow}>
                                        <View style={{ width: '48%' }}>
                                            <Text style={styles.dateTimeLabel}>Date</Text>
                                            <TouchableOpacity onPress={() => setDateModalVisible(true)}>
                                                <Text style={styles.dateTimeField}>
                                                    {formatDisplayDate()}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ width: '48%' }}>
                                            <Text style={styles.dateTimeLabel}>Time</Text>
                                            <TouchableOpacity onPress={() => setTimeModalVisible(true)}>
                                                <Text style={styles.dateTimeField}>
                                                    {formatDisplayTime()}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.priorityParentContainer}>
                                        <Text style={styles.label}>Priority</Text>
                                        <PickerSheet
                                            value={timerData.priority}
                                            options={priorityOptions}
                                            onChange={value => {
                                                setTimerData(prev => ({
                                                    ...prev,
                                                    priority: value || 'normal'
                                                }));
                                            }}
                                            title={'Priority'}
                                            placeholder="Select Priority"
                                            colors={colors}
                                            variables={variables}
                                        />
                                    </View>

                                    {mode === 'countdown' && (
                                        <View style={styles.recurringContainer}>
                                            <Text style={styles.label}>Is Recurring?</Text>
                                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                                <Switch
                                                    value={timerData.isRecurring}
                                                    onValueChange={val =>
                                                        setTimerData(prev => ({
                                                            ...prev,
                                                            isRecurring: val,
                                                            recurrenceInterval: val ? prev.recurrenceInterval : '',
                                                        }))
                                                    }
                                                />
                                            </View>
                                        </View>
                                    )}

                                    {timerData.isRecurring && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <View style={{ width: '80%' }}>
                                                <LabelInput
                                                    label="(i.e 2 days, 1 month)"
                                                    value={timerData.recurrenceInterval}
                                                    onChangeText={text => setTimerData(prev => ({
                                                        ...prev,
                                                        recurrenceInterval: text
                                                    }))}
                                                    style={styles.input}
                                                    focus={focus}
                                                    setFocus={setFocus}
                                                    focusKey="recurrence"
                                                    colors={colors}
                                                />
                                            </View>

                                            <PickerSheet
                                                value={timerData.recurrenceInterval}
                                                options={recurrenceOptions}
                                                onChange={value => {
                                                    setTimerData(prev => ({
                                                        ...prev,
                                                        recurrenceInterval: value || ''
                                                    }));
                                                }}
                                                title={'Recurrence Interval'}
                                                placeholder=""
                                                colors={colors}
                                                variables={variables}
                                            />
                                        </View>
                                    )}

                                    {error ? <Text style={styles.error}>{error}</Text> : null}
                                </View>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity onPress={closeHandler} style={styles.cancelButton}>
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleAdd}
                                        style={[styles.addButton, { opacity: error ? 0.25 : 1 }]}
                                        disabled={!!error}
                                    >
                                        <Text style={[styles.buttonText, { color: colors.card }]}>
                                            {isDuplicate ? 'Duplicate Timer' : initialData ? 'Save Changes' : 'Add Timer'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Animated.View>
                </Animated.View>
            </Modal>

            {/* Date Modal */}
            <DateTimeModal
                visible={dateModalVisible}
                onClose={() => setDateModalVisible(false)}
                mode={mode}
                type="date"
                value={modernDate}
                onChange={handleModernDateChange}
                useModernPicker={useModernPicker}
                colors={colors}
                styles={styles}
                minDate={mode === 'countdown' ? getToday() : '1970/01/01'}
                maxDate={mode !== 'countdown' ? getToday() : '2050/01/01'}
                formatDisplay={TraditionalDatePicker}
                title="Select Date"
            />

            {/* Time Modal */}
            <DateTimeModal
                visible={timeModalVisible}
                onClose={() => setTimeModalVisible(false)}
                mode={mode}
                type="time"
                value={modernTime}
                onChange={handleModernTimeChange}
                useModernPicker={useModernPicker}
                colors={colors}
                styles={styles}
                minDate={null}
                maxDate={null}
                formatDisplay={TraditionalTimePicker}
                title="Select Time"
            />
        </>
    );
};

export default React.memo(AddTimer);