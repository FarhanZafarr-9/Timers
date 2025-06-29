/*
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import TimerCard from '../components/TimerCard';
import AddTimerModal from '../components/AddTimerModal';
import HeaderControls from '../components/HeaderControls';
import { useTimers } from '../utils/TimerContext';
import { Icons } from '../assets/icons';
import { useTheme } from '../utils/ThemeContext';
import ScreenWithHeader from '../components/ScreenWithHeder';
import Timer from '../classes/Timer';

export default function CountDownsScreen() {

    // --- Hooks and context ---
    const { theme, colors } = useTheme();

    const { timers, addTimer, editTimer, removeTimer } = useTimers();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingTimer, setEditingTimer] = useState(null);
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [isSelectable, setIsSelectable] = useState(false);

    // --- Selection state and handler ---
    const [selectedIds, setSelectedIds] = useState([]);
    const handleSelect = (id) => {
        setSelectedIds(ids =>
            ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
        );
    };

    // Filtered timers based on search
    const filteredTimers = timers.filter(
        timer =>
            timer.isCountdown &&
            (
                !searchQuery.trim() ||
                timer.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                timer.personName?.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );

    // Remaining time calculation (simple, for demo)
    const [remainingTimes, setRemainingTimes] = useState({});
    useEffect(() => {
        const interval = setInterval(() => {
            const updated = {};
            filteredTimers.forEach(timer => {
                const endTime = new Date(timer.date).getTime();
                const now = Date.now();
                const remaining = Math.max(endTime - now, 0);
                updated[timer.id] = formatRemainingTime(remaining, timer);
            });
            setRemainingTimes(updated);
        }, 1000);
        return () => clearInterval(interval);

    }, [filteredTimers]);

    const formatRemainingTime = (remaining, timer) => {
        // If remaining is negative or zero, check for next occurrence
        const timerInstance = timer instanceof Timer ? timer : new Timer(timer);
        const effectiveDate = timerInstance.getEffectiveDate();
        remaining = Math.max(effectiveDate.getTime() - Date.now(), 0);

        // Calculate time units
        const seconds = Math.floor(remaining / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30.44); // Average month length
        const years = Math.floor(months / 12);

        // Get remaining values after higher units are extracted
        const remainingMonths = months % 12;
        const remainingDays = Math.floor(days % 30.44);
        const remainingHours = hours % 24;
        const remainingMinutes = minutes % 60;
        const remainingSeconds = seconds % 60;

        // Build the output string with only relevant units
        const parts = [];

        if (years > 0) parts.push(`${years}y`);
        if (remainingMonths > 0) parts.push(`${remainingMonths}mo`);
        if (remainingDays > 0) parts.push(`${remainingDays}d`);
        if (remainingHours > 0) parts.push(`${remainingHours}h`);
        if (remainingMinutes > 0) parts.push(`${remainingMinutes}m`);
        if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);

        return parts.join(' ');
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
            borderRadius: 8,
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
            headerTitle="Countdown Timers"
            borderRadius={10}
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
                                remainingTime={remainingTimes[timer.id]}
                                onDelete={handleDeleteTimer}
                                onEdit={handleEditTimer}
                                isExpanded={expandedCardId === timer.id}
                                onClick={() => {
                                    isSelectable ? handleSelect(timer.id) : setExpandedCardId(expandedCardId === timer.id ? null : timer.id);
                                }}
                                selectable={isSelectable}
                                selected={selectedIds.includes(timer.id)}
                                colors={colors}
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
                    mode="countdown"
                    
                    colors={colors}
                />
            </View>
        </ScreenWithHeader>
    );
}
*/