import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
    Keyboard,
    Switch,
    Platform,
    Dimensions,
    Animated,
    Modal
} from 'react-native';
import { Icons } from '../assets/icons';
import FloatingLabelInput from './FloatingLabelInput';
import { useTheme } from '../utils/ThemeContext';
import { WheelPicker, WheelPickerInput } from './RollerPickerInput';
import BottomSheetPicker from './BottomSheetPicker';
import { priorityOptions, recurrenceOptions } from '../utils/functions';



const AddTimerModal = ({ visible, onClose, onAdd, initialData, mode, isDuplicate }) => {
    const priorities = priorityOptions;
    const [timerData, setTimerData] = useState({
        title: '',
        personName: '',
        priority: 'normal',
        date: new Date(),
        isRecurring: false,
        recurrenceInterval: '',
        isCountdown: mode === 'countdown',
    });

    const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
    const BOTTOM_SHEET_HEIGHT = Math.min(SCREEN_HEIGHT * 0.7, mode === 'countdown' ? 660 : 550);

    const { variables, colors, isBorder, headerMode } = useTheme();
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const [yearInput, setYearInput] = useState('');
    const [monthInput, setMonthInput] = useState('');
    const [dayInput, setDayInput] = useState('');
    const [hourInput, setHourInput] = useState('');
    const [minuteInput, setMinuteInput] = useState('');
    const [secondInput, setSecondInput] = useState('');
    const [error, setError] = useState('');

    const [focus, setFocus] = useState({
        personName: false,
        title: false,
        recurrence: false,
        year: false,
        month: false,
        day: false,
        hour: false,
        minute: false,
        second: false,
    });

    useEffect(() => {
        if (visible) {
            showBottomSheet();
        } else {
            hideBottomSheet();
        }
    }, [visible]);

    const showBottomSheet = () => {
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
    };

    const hideBottomSheet = () => {
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
        ]).start();
    };

    useEffect(() => {
        if (!visible) {
            resetForm();
        }
    }, [visible, mode]);

    const resetForm = () => {
        setTimerData({
            title: '',
            personName: '',
            priority: 'normal',
            date: new Date(),
            isRecurring: false,
            recurrenceInterval: '',
            isCountdown: mode === 'countdown',
        });

        const now = new Date();
        setYearInput(String(now.getFullYear()));
        setMonthInput(String(now.getMonth() + 1).padStart(2, '0'));
        setDayInput(String(now.getDate()).padStart(2, '0'));
        setHourInput(String(now.getHours()).padStart(2, '0'));
        setMinuteInput(String(now.getMinutes()).padStart(2, '0'));
        setSecondInput(String(now.getSeconds()).padStart(2, '0'));
        setError('');

        setFocus({
            personName: false,
            title: false,
            recurrence: false,
            year: false,
            month: false,
            day: false,
            hour: false,
            minute: false,
            second: false,
        });
    };

    useEffect(() => {
        let initialDate;
        if (initialData) {
            try {
                initialDate = new Date(initialData.date);
                if (isNaN(initialDate)) throw new Error('Invalid date');
            } catch {
                initialDate = new Date();
            }
            setTimerData({
                ...initialData,
                date: initialDate,
                recurrenceInterval: initialData.recurrenceInterval || '',
                isCountdown: initialData.isCountdown,
            });
        } else {
            initialDate = new Date();
            setTimerData({
                title: '',
                personName: '',
                priority: 'normal',
                date: initialDate,
                isRecurring: false,
                recurrenceInterval: '',
                isCountdown: mode === 'countdown',
            });
        }

        setYearInput(String(initialDate.getFullYear()));
        setMonthInput(String(initialDate.getMonth() + 1).padStart(2, '0'));
        setDayInput(String(initialDate.getDate()).padStart(2, '0'));
        setHourInput(String(initialDate.getHours()).padStart(2, '0'));
        setMinuteInput(String(initialDate.getMinutes()).padStart(2, '0'));
        setSecondInput(String(initialDate.getSeconds()).padStart(2, '0'));
    }, [initialData, mode]);

    const getTimerType = (date) => {
        if (mode === 'countdown') return true;
        if (mode === 'countup') return false;
        const now = new Date();
        return new Date(date) > now;
    };

    const isValidDate = (y, m, d) => {
        const date = new Date(y, m - 1, d);
        return (
            date.getFullYear() === y &&
            date.getMonth() === m - 1 &&
            date.getDate() === d
        );
    };

    useEffect(() => {
        if (!error) return;
        setError('');
    }, [
        timerData.title,
        timerData.personName,
        timerData.recurrenceInterval,
        yearInput,
        monthInput,
        dayInput,
        hourInput,
        minuteInput,
        secondInput
    ]);

    const isValidTime = (h, min, s) =>
        h >= 0 && h < 24 && min >= 0 && min < 60 && s >= 0 && s < 60;

    const handleAdd = () => {
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


        const y = parseInt(yearInput, 10);
        const m = parseInt(monthInput, 10);
        const d = parseInt(dayInput, 10);
        const h = parseInt(hourInput, 10);
        const min = parseInt(minuteInput, 10);
        const s = parseInt(secondInput, 10);

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

        const finalDate = new Date(y, m - 1, d, h, min, s);

        const timerToSave = initialData
            ? { ...timerData, id: initialData.id, date: finalDate }
            : { ...timerData, date: finalDate };

        timerToSave.isCountdown = getTimerType(finalDate);

        onAdd(timerToSave);
        onClose();
    };

    const handleDatePartChange = (part, value) => {
        if (part === 'year') setYearInput(value);
        if (part === 'month') setMonthInput(value);
        if (part === 'day') setDayInput(value);
    };

    const handleTimePartChange = (part, value) => {
        if (part === 'hour') setHourInput(value);
        if (part === 'minute') setMinuteInput(value);
        if (part === 'second') setSecondInput(value);
    };

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: (headerMode === 'fixed' ? colors.settingBlock : colors.background) + '90', // for modals
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
            borderWidth: isBorder ? 0.75 : 0,
            borderColor: colors.border,
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
            borderWidth: isBorder ? 0.75 : 0,
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
            marginBottom: 26,
        },
        input: {
            backgroundColor: colors.highlight + '22',
            color: colors.text,
            padding: 10,
            borderRadius: variables.radius.sm,
            marginBottom: 0,
            borderWidth: isBorder ? 0.75 : 0,
            borderColor: 'transparent',
            fontSize: 14,
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
            borderWidth: isBorder ? 0.75 : 0,
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
            borderTopWidth: 0.75,
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
    });

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <Animated.View style={[styles.overlay, { opacity: opacity }]}>
                <TouchableWithoutFeedback onPress={onClose}>
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
                                        <FloatingLabelInput
                                            label="Person Name"
                                            value={timerData.personName}
                                            onChangeText={text => setTimerData({ ...timerData, personName: text })}
                                            style={styles.input}
                                            focus={focus}
                                            setFocus={setFocus}
                                            focusKey="personName"
                                            colors={colors}
                                        />
                                    </View>
                                    <View style={{ width: '50%' }}>
                                        <FloatingLabelInput
                                            label="Title"
                                            value={timerData.title}
                                            onChangeText={text => setTimerData({ ...timerData, title: text })}
                                            style={styles.input}
                                            focus={focus}
                                            setFocus={setFocus}
                                            focusKey="title"
                                            colors={colors}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputRow}>
                                    <View style={{ width: '32%' }}>
                                        <WheelPickerInput
                                            label="Year"
                                            value={yearInput}
                                            onValueChange={val => handleDatePartChange('year', val)}
                                            minValue={mode === 'countdown' ? new Date().getFullYear() : 1970}
                                            maxValue={mode === 'countdown' ? new Date().getFullYear() + 10 : new Date().getFullYear()}
                                            colors={colors}
                                            formatValue={(val) => val.toString()}
                                            pickerType="wheel"
                                        />
                                    </View>
                                    <View style={{ width: '32%' }}>
                                        <WheelPickerInput
                                            label="Month"
                                            value={monthInput}
                                            onValueChange={val => handleDatePartChange('month', val)}
                                            minValue={1}
                                            maxValue={12}
                                            colors={colors}
                                            formatValue={(val) => val.toString()}
                                            pickerType="wheel"
                                        />
                                    </View>
                                    <View style={{ width: '32%' }}>
                                        <WheelPickerInput
                                            label="Day"
                                            value={dayInput}
                                            onValueChange={val => handleDatePartChange('day', val)}
                                            minValue={1}
                                            maxValue={31}
                                            colors={colors}
                                            formatValue={(val) => val.toString()}
                                            pickerType="wheel"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputRow}>
                                    <View style={{ width: '32%' }}>
                                        <WheelPickerInput
                                            label="Hour"
                                            value={hourInput}
                                            onValueChange={val => handleTimePartChange('hour', val)}
                                            minValue={0}
                                            maxValue={23}
                                            colors={colors}
                                            formatValue={(val) => val.toString()}
                                            pickerType="wheel"
                                        />
                                    </View>
                                    <View style={{ width: '32%' }}>
                                        <WheelPickerInput
                                            label="Minute"
                                            value={minuteInput}
                                            onValueChange={val => handleTimePartChange('minute', val)}
                                            minValue={0}
                                            maxValue={59}
                                            colors={colors}
                                            formatValue={(val) => val.toString()}
                                            pickerType="wheel"
                                        />
                                    </View>
                                    <View style={{ width: '32%' }}>
                                        <WheelPickerInput
                                            label="Second"
                                            value={secondInput}
                                            onValueChange={val => handleTimePartChange('second', val)}
                                            minValue={0}
                                            maxValue={59}
                                            colors={colors}
                                            formatValue={(val) => val.toString()}
                                            pickerType="wheel"
                                        />
                                    </View>
                                </View>

                                <View style={styles.priorityParentContainer}>
                                    <Text style={styles.label}>Priority</Text>
                                    <BottomSheetPicker
                                        value={timerData.priority}
                                        options={priorityOptions}
                                        onChange={value => {
                                            if (value) {
                                                setError('');
                                                setTimerData({ ...timerData, priority: value });
                                            } else {
                                                setTimerData({ ...timerData, priority: 'normal' });
                                            }
                                        }}
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
                                                    setTimerData({
                                                        ...timerData,
                                                        isRecurring: val,
                                                        recurrenceInterval: val ? timerData.recurrenceInterval : '',
                                                    })
                                                }
                                                trackColor={{
                                                    false: colors.switchTrack,
                                                    true: colors.switchTrackActive,
                                                }}
                                                thumbColor={timerData.isRecurring ? colors.switchThumbActive : colors.switchThumb}
                                                style={{ transform: [{ scale: 0.95 }] }}
                                            />
                                        </View>

                                    </View>
                                )}

                                {timerData.isRecurring && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>

                                        <View style={{ width: '80%' }}>
                                            <FloatingLabelInput
                                                label="Recurrence Interval (e.g., 2 days, 1 month)"
                                                value={timerData.recurrenceInterval}
                                                onChangeText={text => setTimerData({ ...timerData, recurrenceInterval: text })}
                                                style={styles.input}
                                                focus={focus}
                                                setFocus={setFocus}
                                                focusKey="recurrence"
                                                colors={colors}
                                            />
                                        </View>

                                        <BottomSheetPicker
                                            value={timerData.recurrenceInterval}
                                            options={recurrenceOptions}
                                            onChange={value => {
                                                if (value) {
                                                    setError('');
                                                    setTimerData({ ...timerData, recurrenceInterval: value });
                                                } else {
                                                    setTimerData({ ...timerData, recurrenceInterval: null });
                                                }
                                            }}
                                            placeholder=""
                                            colors={colors}
                                            variables={variables}
                                        />
                                    </View>
                                )}

                                {error ? <Text style={styles.error}>{error}</Text> : null}
                            </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
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
    );
};

export default AddTimerModal;