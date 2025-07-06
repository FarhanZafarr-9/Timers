import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import TimerCard from '../components/TimerCard';
import AddTimerModal from '../components/AddTimerModal';
import HeaderControls from '../components/HeaderControls';
import { useTimers } from '../utils/TimerContext';
import { Icons } from '../assets/icons';
import { useTheme } from '../utils/ThemeContext';
import ScreenWithHeader from '../components/ScreenWithHeder';
import Timer from '../classes/Timer';
import { useSecurity } from '../utils/SecurityContext';
import { sortOptions } from '../utils/functions';
import Snackbar from '../components/SnackBar';

export default function TimersScreen({ route }) {
    const { mode } = route.params;
    const isCountdown = mode === 'countdown';
    const { privacyMode } = useSecurity();
    const { variables, colors } = useTheme();
    const { timers, addTimer, editTimer, removeTimer } = useTimers();

    // State management
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingTimer, setEditingTimer] = useState(null);
    const [expandedCardIds, setExpandedCardIds] = useState(new Set());
    const [isSelectable, setIsSelectable] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [times, setTimes] = useState({});
    const [sortMethod, setSortMethod] = useState('priority');
    const [messages, setMessages] = useState([]);

    // Refs for performance optimization
    const timesRef = useRef({});
    const updateIntervalRef = useRef(null);
    const lastUpdateRef = useRef(0);

    // Optimized message handling
    const addMessage = useCallback((text) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setMessages(prev => [...prev, { id, text }]);
    }, []);

    const removeMessage = useCallback((messageId) => {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }, []);

    // Optimized sort handler
    const handleSortChange = useCallback((method) => {
        setSortMethod(method);
        addMessage(`Sorted by ${method}`);
    }, [addMessage]);

    // Memoized filtered timers with better caching
    const filteredTimers = useMemo(() => {
        const filtered = timers.filter(timer => {
            const matchesMode = isCountdown ? timer.isCountdown : !timer.isCountdown;

            if (privacyMode !== 'off') {
                return matchesMode;
            }

            if (!searchQuery.trim()) {
                return matchesMode;
            }

            const query = searchQuery.toLowerCase();
            const matchesSearch =
                timer.title?.toLowerCase().includes(query) ||
                timer.personName?.toLowerCase().includes(query);

            return matchesMode && matchesSearch;
        });

        return filtered;
    }, [timers, isCountdown, privacyMode, searchQuery]);

    // Optimized sorting with better performance
    const sortedTimers = useMemo(() => {
        const arr = [...filteredTimers];

        switch (sortMethod) {
            case 'priority':
                return arr.sort((a, b) => (a.priority || '').localeCompare(b.priority || ''));
            case 'timeLeft':
                return arr.sort((a, b) => {
                    const now = Date.now();
                    const aTime = isCountdown
                        ? new Date(a.date).getTime() - now
                        : now - new Date(a.date).getTime();
                    const bTime = isCountdown
                        ? new Date(b.date).getTime() - now
                        : now - new Date(b.date).getTime();
                    return aTime - bTime;
                });
            case 'recurring':
                return arr.filter(t => t.isRecurring);
            case 'nonRecurring':
                return arr.filter(t => !t.isRecurring);
            default:
                return arr;
        }
    }, [filteredTimers, sortMethod, isCountdown]);

    // Optimized time formatting with caching
    const formatTime = useCallback((timeValue) => {
        if (isCountdown) {
            const seconds = Math.floor(timeValue / 1000);
            if (seconds <= 0) return '0s';

            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            const months = Math.floor(days / 30.44);
            const years = Math.floor(months / 12);

            const parts = [];
            if (years > 0) parts.push(`${years}y`);
            if (months % 12 > 0) parts.push(`${months % 12}mo`);
            if (Math.floor(days % 30.44) > 0) parts.push(`${Math.floor(days % 30.44)}d`);
            if (hours % 24 > 0) parts.push(`${hours % 24}h`);
            if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
            if (seconds % 60 > 0 || parts.length === 0) parts.push(`${seconds % 60}s`);

            return parts.slice(0, 3).join(' '); // Limit to 3 parts for readability
        } else {
            const totalSeconds = Math.floor(timeValue / 1000);
            const years = Math.floor(totalSeconds / (365 * 24 * 60 * 60));
            const months = Math.floor((totalSeconds % (365 * 24 * 60 * 60)) / (30.44 * 24 * 60 * 60));
            const days = Math.floor((totalSeconds % (30.44 * 24 * 60 * 60)) / (24 * 60 * 60));
            const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
            const seconds = totalSeconds % 60;

            const parts = [];
            if (years > 0) parts.push(`${years}y`);
            if (months > 0) parts.push(`${months}mo`);
            if (days > 0) parts.push(`${days}d`);
            if (hours > 0) parts.push(`${hours}h`);
            if (minutes > 0) parts.push(`${minutes}m`);
            if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

            return parts.slice(0, 3).join(' '); // Limit to 3 parts for readability
        }
    }, [isCountdown]);

    // Highly optimized time updates with throttling
    const updateTimes = useCallback(() => {
        const now = Date.now();

        // Throttle updates to prevent excessive calculations
        if (now - lastUpdateRef.current < 900) return;
        lastUpdateRef.current = now;

        const updated = { ...timesRef.current };
        let hasChanges = false;

        filteredTimers.forEach(timer => {
            let timeValue;

            if (isCountdown) {
                const timerInstance = timer instanceof Timer ? timer : new Timer(timer);
                const effectiveDate = timerInstance.getEffectiveDate();
                timeValue = Math.max(effectiveDate.getTime() - now, 0);
            } else {
                const startTime = new Date(timer.date).getTime();
                timeValue = Math.max(now - startTime, 0);
            }

            const formattedTime = formatTime(timeValue);
            if (updated[timer.id] !== formattedTime) {
                updated[timer.id] = formattedTime;
                hasChanges = true;
            }
        });

        if (hasChanges) {
            timesRef.current = updated;
            setTimes(updated);
        }
    }, [filteredTimers, isCountdown, formatTime]);

    // Optimized timer updates with better interval management
    useEffect(() => {
        // Initial update
        updateTimes();

        // Set up interval for updates
        updateIntervalRef.current = setInterval(updateTimes, 1000);

        return () => {
            if (updateIntervalRef.current) {
                clearInterval(updateIntervalRef.current);
            }
        };
    }, [updateTimes]);

    // Optimized selection handlers using Set
    const handleSelect = useCallback((id) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    // Optimized timer operations
    const handleAddTimer = useCallback(async (newTimer) => {
        try {
            if (editingTimer) {
                await editTimer(newTimer);
                setEditingTimer(null);
                addMessage('Timer updated successfully');
            } else {
                await addTimer(newTimer);
                addMessage('Timer added successfully');
            }
            setModalVisible(false);
        } catch (error) {
            addMessage('Error saving timer');
        }
    }, [editingTimer, editTimer, addTimer, addMessage]);

    const handleEditTimer = useCallback((timer) => {
        setEditingTimer(timer);
        setModalVisible(true);
    }, []);

    const handleDeleteTimer = useCallback(async (id) => {
        try {
            await removeTimer(id);
            addMessage('Timer deleted');

            // Clean up expanded and selected states
            setExpandedCardIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });

            setSelectedIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        } catch (error) {
            addMessage('Error deleting timer');
        }
    }, [removeTimer, addMessage]);

    // Optimized card click handler
    const handleCardClick = useCallback((timerId) => {
        if (isSelectable) {
            handleSelect(timerId);
        } else {
            setExpandedCardIds(prev => {
                const newSet = new Set(prev);
                if (newSet.has(timerId)) {
                    newSet.delete(timerId);
                } else {
                    newSet.add(timerId);
                }
                return newSet;
            });
        }
    }, [isSelectable, handleSelect]);

    // Memoized render function with better prop stability
    const renderTimerCard = useCallback(({ item: timer }) => {
        const timeValue = times[timer.id] || '0s';
        const isExpanded = expandedCardIds.has(timer.id);
        const isSelected = selectedIds.has(timer.id);

        return (
            <TimerCard
                timer={timer}
                {...(isCountdown
                    ? { remainingTime: timeValue }
                    : { elapsedTime: timeValue }
                )}
                onDelete={handleDeleteTimer}
                onEdit={handleEditTimer}
                isExpanded={isExpanded}
                onClick={() => handleCardClick(timer.id)}
                selectable={isSelectable}
                selected={isSelected}
                colors={colors}
                variables={variables}
                isCountdown={isCountdown}
                searchText={searchQuery}
                privacyMode={privacyMode}
            />
        );
    }, [
        times,
        expandedCardIds,
        selectedIds,
        isSelectable,
        colors,
        variables,
        isCountdown,
        searchQuery,
        privacyMode,
        handleDeleteTimer,
        handleEditTimer,
        handleCardClick
    ]);

    const keyExtractor = useCallback((item) => item.id.toString(), []);

    // Optimized batch operations
    const handleBatchDelete = useCallback(async () => {
        const idsArray = Array.from(selectedIds);
        if (idsArray.length === 0) return;

        try {
            await Promise.all(idsArray.map(id => removeTimer(id)));
            addMessage(`Deleted ${idsArray.length} timer${idsArray.length > 1 ? 's' : ''}`);
            setSelectedIds(new Set());
            setIsSelectable(false);
            setExpandedCardIds(prev => {
                const newSet = new Set(prev);
                idsArray.forEach(id => newSet.delete(id));
                return newSet;
            });
        } catch (error) {
            addMessage('Error deleting timers');
        }
    }, [selectedIds, removeTimer, addMessage]);

    const handleBatchDeletePress = useCallback(() => {
        const selectedCount = selectedIds.size;

        if (!isSelectable) {
            setIsSelectable(true);
            addMessage("Select timers to delete");
        } else if (selectedCount > 0) {
            handleBatchDelete();
        } else {
            setIsSelectable(false);
            addMessage("Selection mode cancelled");
        }
    }, [isSelectable, selectedIds.size, handleBatchDelete, addMessage]);

    // Memoized styles
    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        content: {
            flex: 1,
            paddingHorizontal: 10,
        },
        emptyContainer: {
            alignItems: 'center',
            marginTop: 40,
        },
        emptyText: {
            color: colors.textDesc,
            fontSize: 16,
            textAlign: 'center',
            fontStyle: 'italic',
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            borderRadius: variables.radius.sm,
            backgroundColor: colors.cardLighter,
            borderWidth: 0.75,
            borderColor: colors.cardBorder,
            justifyContent: 'center',
            marginTop: 16,
            paddingHorizontal: 35,
        },
        actionText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
        },
    }), [colors, variables]);


    // Memoized components
    const ListHeaderComponent = useMemo(() => (
        <HeaderControls
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={setSearchQuery}
            onAdd={() => setModalVisible(true)}
            onBatchDelete={handleBatchDeletePress}
            isSelectable={isSelectable}
            selectedCount={selectedIds.size}
            colors={colors}
            variables={variables}
            sortMethod={sortMethod}
            onSortChange={handleSortChange}
            sortOptions={sortOptions}
        />
    ), [
        searchQuery,
        isSelectable,
        selectedIds.size,
        colors,
        variables,
        handleBatchDeletePress,
        sortMethod,
        handleSortChange
    ]);

    const ListEmptyComponent = useMemo(() => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No timers found.</Text>
            <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.85}
                onPress={() => setModalVisible(true)}
            >
                <Icons.Material name="add-circle" size={18} color={colors.highlight} style={{ marginRight: 6 }} />
                <Text style={styles.actionText}>Quick Add Timer</Text>
            </TouchableOpacity>
        </View>
    ), [colors]);

    const handleModalClose = useCallback(() => {
        setModalVisible(false);
        setEditingTimer(null);
    }, []);


    return (
        <>
            <ScreenWithHeader
                headerIcon={<Icons.Ion name="timer-outline" size={18} color={colors.highlight} />}
                headerTitle={isCountdown ? "Countdown Timers" : "Countup Timers"}
                borderRadius={variables.radius.md}
                paddingMargin={0}
                useFlatList={true}
                flatListProps={{
                    data: sortedTimers,
                    renderItem: renderTimerCard,
                    keyExtractor,
                    ListHeaderComponent,
                    ListEmptyComponent,
                    showsVerticalScrollIndicator: false,
                    keyboardShouldPersistTaps: 'handled',
                    removeClippedSubviews: true,
                    maxToRenderPerBatch: 8,
                    windowSize: 8,
                    initialNumToRender: 8,
                    updateCellsBatchingPeriod: 100,
                    getItemLayout: null, // Let FlatList handle dynamic heights
                    contentContainerStyle: {
                        paddingBottom: 95,
                        minHeight: '100%'
                    }
                }}
            />

            {messages.map((msg, idx) => (
                <Snackbar
                    key={msg.id}
                    text={msg.text}
                    onClose={() => removeMessage(msg.id)}
                    style={{ bottom: 100 + (messages.length - 1 - idx) * 48 }}
                />
            ))}

            <AddTimerModal
                visible={isModalVisible}
                onClose={handleModalClose}
                onAdd={handleAddTimer}
                initialData={editingTimer}
                mode={mode}
            />
        </>
    );
}