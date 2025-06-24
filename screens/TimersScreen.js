import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import TimerCard from '../components/TimerCard';
import AddTimerModal from '../components/AddTimerModal';
import HeaderControls from '../components/HeaderControls';
import { useTimers } from '../utils/TimerContext';
import { Icons } from '../assets/icons';
import { useTheme } from '../utils/variables';
import ScreenWithHeader from '../components/ScreenWithHeder';
import Timer from '../classes/Timer';
import { useSecurity } from '../utils/SecurityContext';

export default function TimersScreen({ route }) {
    const { mode } = route.params; // 'countdown' or 'countup'
    const isCountdown = mode === 'countdown';

    const { privacyMode } = useSecurity();

    // --- Hooks and context ---
    const { theme, colors } = useTheme();
    const { timers, addTimer, editTimer, removeTimer } = useTimers();

    // --- State management ---
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingTimer, setEditingTimer] = useState(null);
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [isSelectable, setIsSelectable] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [times, setTimes] = useState({});

    // Filter timers based on mode and search query
    const filteredTimers = timers.filter(timer => {
        const matchesMode = isCountdown ? timer.isCountdown : !timer.isCountdown;

        // If privacyMode is not 'off', skip search filtering
        if (privacyMode !== 'off') {
            return matchesMode;
        }

        const matchesSearch =
            !searchQuery.trim() ||
            timer.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            timer.personName?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesMode && matchesSearch;
    });

    // Time calculation effect
    useEffect(() => {
        const interval = setInterval(() => {
            const updated = {};
            filteredTimers.forEach(timer => {
                if (isCountdown) {
                    // Countdown logic
                    const timerInstance = timer instanceof Timer ? timer : new Timer(timer);
                    const effectiveDate = timerInstance.getEffectiveDate();
                    const remaining = Math.max(effectiveDate.getTime() - Date.now(), 0);
                    updated[timer.id] = formatTime(remaining, timer);
                } else {
                    // Countup logic
                    const startTime = new Date(timer.date).getTime();
                    const now = Date.now();
                    const elapsed = Math.max(now - startTime, 0);
                    updated[timer.id] = formatTime(elapsed);
                }
            });
            setTimes(updated);
        }, 1000);

        return () => clearInterval(interval);
    }, [filteredTimers, isCountdown]);

    // Format time based on mode
    const formatTime = (timeValue, timer = null) => {
        if (isCountdown) {
            // Countdown formatting
            const seconds = Math.floor(timeValue / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            const months = Math.floor(days / 30.44);
            const years = Math.floor(months / 12);

            const remainingMonths = months % 12;
            const remainingDays = Math.floor(days % 30.44);
            const remainingHours = hours % 24;
            const remainingMinutes = minutes % 60;
            const remainingSeconds = seconds % 60;

            const parts = [];
            if (years > 0) parts.push(`${years}y`);
            if (remainingMonths > 0) parts.push(`${remainingMonths}mo`);
            if (remainingDays > 0) parts.push(`${remainingDays}d`);
            if (remainingHours > 0) parts.push(`${remainingHours}h`);
            if (remainingMinutes > 0) parts.push(`${remainingMinutes}m`);
            if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);

            return parts.join(' ');
        } else {
            // Countup formatting
            let ms = timeValue;
            const years = Math.floor(ms / (1000 * 60 * 60 * 24 * 365));
            ms -= years * 1000 * 60 * 60 * 24 * 365;
            const months = Math.floor(ms / (1000 * 60 * 60 * 24 * 30.44));
            ms -= months * 1000 * 60 * 60 * 24 * 30.44;
            const days = Math.floor(ms / (1000 * 60 * 60 * 24));
            ms -= days * 1000 * 60 * 60 * 24;
            const hours = Math.floor(ms / (1000 * 60 * 60));
            ms -= hours * 1000 * 60 * 60;
            const minutes = Math.floor(ms / (1000 * 60));
            ms -= minutes * 1000 * 60;
            const seconds = Math.floor(ms / 1000);

            const parts = [];
            if (years > 0) parts.push(`${years}y`);
            if (months > 0) parts.push(`${months}mo`);
            if (days > 0) parts.push(`${days}d`);
            if (hours > 0) parts.push(`${hours}h`);
            if (minutes > 0) parts.push(`${minutes}m`);
            if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

            return parts.join(' ');
        }
    };

    // Timer actions
    const handleSelect = (id) => {
        setSelectedIds(ids =>
            ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
        );
    };

    const handleAddTimer = async (newTimer) => {
        if (editingTimer) {
            await editTimer(newTimer);
            setEditingTimer(null);
        } else {
            await addTimer(newTimer);
        }
        setModalVisible(false);
    };

    const handleEditTimer = (timer) => {
        setEditingTimer(timer);
        setModalVisible(true);
    };

    const handleDeleteTimer = async (id) => {
        await removeTimer(id);
    };

    const handleBatchDelete = async () => {
        if (selectedIds.length === 0) return;
        await Promise.all(selectedIds.map(id => removeTimer(id)));
        setSelectedIds([]);
    };

    // Styles
    const styles = StyleSheet.create({
        content: {
            paddingHorizontal: 10,
            paddingBottom: 30,
        },
        emptyText: {
            color: colors.textDesc,
            fontSize: 16,
            textAlign: 'center',
            fontStyle: 'italic',
            marginTop: 40,
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
            borderRadius: 20,
            backgroundColor: colors.cardLighter,
            borderWidth: 0.75,
            borderColor: colors.cardBorder,
            justifyContent: 'center',
            marginTop: 16,
            marginHorizontal: 40,
        },
        actionText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
        },
    });

    return (
        <ScreenWithHeader
            headerIcon={<Icons.Ion name="timer-outline" size={18} color={colors.highlight} />}
            headerTitle={isCountdown ? "Countdown Timers" : "Countup Timers"}
            borderRadius={20}
            paddingMargin={0}
        >
            <View style={styles.content}>
                <HeaderControls
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onSearch={setSearchQuery}
                    onAdd={() => setModalVisible(true)}
                    onBatchDelete={() => {
                        setIsSelectable(!isSelectable);
                        handleBatchDelete();
                    }}
                    isSelectable={isSelectable}
                />

                {filteredTimers.length === 0 ? (
                    <>
                        <Text style={styles.emptyText}>No timers found.</Text>
                        <TouchableOpacity
                            style={styles.actionButton}
                            activeOpacity={0.85}
                            onPress={() => setModalVisible(true)}
                        >
                            <Icons.Material name="add-circle" size={18} color={colors.highlight} style={{ marginRight: 6 }} />
                            <Text style={styles.actionText}>Quick Add Timer</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {filteredTimers.map(timer => (
                            <TimerCard
                                key={timer.id}
                                timer={timer}
                                {...(isCountdown
                                    ? { remainingTime: times[timer.id] }
                                    : { elapsedTime: times[timer.id] }
                                )}
                                onDelete={handleDeleteTimer}
                                onEdit={handleEditTimer}
                                isExpanded={expandedCardId === timer.id}
                                onClick={() => {
                                    isSelectable ? handleSelect(timer.id) :
                                        setExpandedCardId(expandedCardId === timer.id ? null : timer.id);
                                }}
                                selectable={isSelectable}
                                selected={selectedIds.includes(timer.id)}
                                colors={colors}
                                isCountdown={isCountdown}
                                searchText={searchQuery}
                                privacyMode={privacyMode}
                            />
                        ))}
                    </ScrollView>
                )}

                <AddTimerModal
                    visible={isModalVisible}
                    onClose={() => {
                        setModalVisible(false);
                        setEditingTimer(null);
                    }}
                    onAdd={handleAddTimer}
                    initialData={editingTimer}
                    mode={mode}
                />
            </View>
        </ScreenWithHeader>
    );
}