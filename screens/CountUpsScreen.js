/*
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Animated } from 'react-native';
import TimerCard from '../components/TimerCard';
import AddTimerModal from '../components/AddTimerModal';
import HeaderControls from '../components/HeaderControls';
import { useTimers } from '../utils/TimerContext';
import { Icons } from '../assets/icons';
import { useTheme } from '../utils/ThemeContext';
import ScreenWithHeader from '../components/ScreenWithHeder';

export default function CountUpsScreen() {
    const { timers, addTimer, removeTimer, editTimer } = useTimers();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingTimer, setEditingTimer] = useState(null);
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [isSelectable, setIsSelectable] = useState(false);
    const {theme, colors} = useTheme();

    // --- Selection state and handler ---
    const [selectedIds, setSelectedIds] = useState([]);
    const handleSelect = (id) => {
        setSelectedIds(ids =>
            ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
        );
    };

    // Filter only countup timers
    const filteredTimers = timers.filter(
        timer =>
            !timer.isCountdown &&
            (
                !searchQuery.trim() ||
                timer.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                timer.personName?.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );

    // Elapsed time calculation
    const [elapsedTimes, setElapsedTimes] = useState({});
    useEffect(() => {
        const interval = setInterval(() => {
            const updated = {};
            filteredTimers.forEach(timer => {
                const startTime = new Date(timer.date).getTime();
                const now = Date.now();
                const elapsed = Math.max(now - startTime, 0);
                updated[timer.id] = formatElapsedTime(elapsed);
            });
            setElapsedTimes(updated);
        }, 1000);
        return () => clearInterval(interval);
    }, [filteredTimers]);

    const formatElapsedTime = (elapsed) => {
        let ms = elapsed;
        const years = Math.floor(ms / (1000 * 60 * 60 * 24 * 365));
        ms -= years * 1000 * 60 * 60 * 24 * 365;
        const months = Math.floor(ms / (1000 * 60 * 60 * 24 * 30.44)); // average month
        ms -= months * 1000 * 60 * 60 * 24 * 30.44;
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        ms -= days * 1000 * 60 * 60 * 24;
        const hours = Math.floor(ms / (1000 * 60 * 60));
        ms -= hours * 1000 * 60 * 60;
        const minutes = Math.floor(ms / (1000 * 60));
        ms -= minutes * 1000 * 60;
        const seconds = Math.floor(ms / 1000);

        return `${years}y ${months}mo ${days}d ${hours}h ${minutes}m ${seconds}s`;
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
            headerTitle="Countup Timers"
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
                                elapsedTime={elapsedTimes[timer.id]}
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
                    mode="countup"
                    
                    colors={colors}
                />
            </View>
        </ScreenWithHeader>
    );
}
*/