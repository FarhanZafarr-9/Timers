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

    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingTimer, setEditingTimer] = useState(null);
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [isSelectable, setIsSelectable] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [times, setTimes] = useState({});
    const [sortMethod, setSortMethod] = useState('priority');
    const [messages, setMessages] = useState([]);

    // REMOVED: message state and scaleAnim - these were conflicting with the new system

    // Update the addMessage function to use better IDs
    const addMessage = useCallback((text) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setMessages(prev => [...prev, { id, text }]);
    }, []);

    // Update the removeMessage function
    const removeMessage = useCallback((messageId) => {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }, []);

    // Update your handlers to use the new addMessage function
    const handleSortChange = useCallback((method) => {
        setSortMethod(method);
        addMessage(`Sorted by ${method}`);
    }, [addMessage]);

    // Memoize filtered timers to prevent unnecessary recalculations
    const filteredTimers = useMemo(() => {
        return timers.filter(timer => {
            const matchesMode = isCountdown ? timer.isCountdown : !timer.isCountdown;

            if (privacyMode !== 'off') {
                return matchesMode;
            }

            const matchesSearch =
                !searchQuery.trim() ||
                timer.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                timer.personName?.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesMode && matchesSearch;
        });
    }, [timers, isCountdown, privacyMode, searchQuery]);

    const sortedTimers = useMemo(() => {
        let arr = [...filteredTimers];
        switch (sortMethod) {
            case 'priority':
                arr.sort((a, b) => (a.priority || '').localeCompare(b.priority || ''));
                break;
            case 'timeLeft':
                arr.sort((a, b) => {
                    const aTime = isCountdown
                        ? new Date(a.date).getTime() - Date.now()
                        : Date.now() - new Date(a.date).getTime();
                    const bTime = isCountdown
                        ? new Date(b.date).getTime() - Date.now()
                        : Date.now() - new Date(b.date).getTime();
                    return aTime - bTime;
                });
                break;
            case 'recurring':
                arr = arr.filter(t => t.isRecurring);
                break;
            case 'nonRecurring':
                arr = arr.filter(t => !t.isRecurring);
                break;
            default:
                break;
        }

        return arr;
    }, [filteredTimers, sortMethod, isCountdown]);

    // Memoize formatTime function to prevent recreation on every render
    const formatTime = useCallback((timeValue, timer = null) => {
        if (isCountdown) {
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
    }, [isCountdown]);

    // Optimize time calculation with useCallback and reduce frequency
    const updateTimes = useCallback(() => {
        const updated = {};
        filteredTimers.forEach(timer => {
            if (isCountdown) {
                const timerInstance = timer instanceof Timer ? timer : new Timer(timer);
                const effectiveDate = timerInstance.getEffectiveDate();
                const remaining = Math.max(effectiveDate.getTime() - Date.now(), 0);
                updated[timer.id] = formatTime(remaining, timer);
            } else {
                const startTime = new Date(timer.date).getTime();
                const now = Date.now();
                const elapsed = Math.max(now - startTime, 0);
                updated[timer.id] = formatTime(elapsed);
            }
        });
        setTimes(updated);
    }, [filteredTimers, isCountdown, formatTime]);

    // Reduce update frequency and use requestAnimationFrame for better performance
    useEffect(() => {
        let rafId;
        let lastUpdate = 0;

        const tick = (timestamp) => {
            // Update only once per second
            if (timestamp - lastUpdate >= 1000) {
                updateTimes();
                lastUpdate = timestamp;
            }
            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);

        return () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [updateTimes]);

    const handleSelect = useCallback((id) => {
        setSelectedIds(ids =>
            ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
        );
    }, []);

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
            // Close expanded card if it was deleted
            if (expandedCardId === id) {
                setExpandedCardId(null);
            }
        } catch (error) {
            addMessage('Error deleting timer');
        }
    }, [removeTimer, expandedCardId, addMessage]);

    const handleCardClick = useCallback((timerId) => {
        if (isSelectable) {
            handleSelect(timerId);
        } else {
            setExpandedCardId(expandedCardId === timerId ? null : timerId);
        }
    }, [isSelectable, handleSelect, expandedCardId]);

    // Optimized render function with better memoization
    const renderTimerCard = useCallback(({ item: timer }) => (
        <TimerCard
            timer={timer}
            {...(isCountdown
                ? { remainingTime: times[timer.id] || '0s' }
                : { elapsedTime: times[timer.id] || '0s' }
            )}
            onDelete={handleDeleteTimer}
            onEdit={handleEditTimer}
            isExpanded={expandedCardId === timer.id}
            onClick={() => handleCardClick(timer.id)}
            selectable={isSelectable}
            selected={selectedIds.includes(timer.id)}
            colors={colors}
            variables={variables}
            isCountdown={isCountdown}
            searchText={searchQuery}
            privacyMode={privacyMode}
        />
    ), [
        times,
        expandedCardId,
        isSelectable,
        selectedIds,
        colors,
        isCountdown,
        searchQuery,
        privacyMode,
        handleDeleteTimer,
        handleEditTimer,
        handleCardClick
    ]);

    const keyExtractor = useCallback((item) => item.id.toString(), []);

    const handleBatchDelete = useCallback(async () => {
        if (selectedIds.length === 0) return;

        try {
            await Promise.all(selectedIds.map(id => removeTimer(id)));
            addMessage(`Deleted ${selectedIds.length} timer${selectedIds.length > 1 ? 's' : ''}`);
            setSelectedIds([]);
            setIsSelectable(false);
            if (selectedIds.includes(expandedCardId)) {
                setExpandedCardId(null);
            }
        } catch (error) {
            addMessage('Error deleting timers');
        }
    }, [selectedIds, removeTimer, expandedCardId, addMessage]);

    const handleBatchDeletePress = useCallback(() => {
        if (!isSelectable) {
            setIsSelectable(true);
            addMessage("Select timers to delete");
        } else if (selectedIds.length > 0) {
            handleBatchDelete();
        } else {
            setIsSelectable(false);
            addMessage("Selection mode cancelled");
        }
    }, [isSelectable, selectedIds.length, handleBatchDelete, addMessage]);

    const ListHeaderComponent = useMemo(() => (
        <HeaderControls
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={setSearchQuery}
            onAdd={() => setModalVisible(true)}
            onBatchDelete={handleBatchDeletePress}
            isSelectable={isSelectable}
            selectedCount={selectedIds.length}
            colors={colors}
            variables={variables}
            sortMethod={sortMethod}
            onSortChange={handleSortChange}
            sortOptions={sortOptions}
        />
    ), [
        searchQuery,
        isSelectable,
        selectedIds.length,
        colors,
        variables,
        handleBatchDeletePress,
        sortMethod,
        handleSortChange
    ]);

    const ListEmptyComponent = useCallback(() => (
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

    // REMOVED: The conflicting useEffect for message/scaleAnim

    // Memoize styles to prevent recreation on every render
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
                    maxToRenderPerBatch: 10,
                    windowSize: 10,
                    initialNumToRender: 10,
                    updateCellsBatchingPeriod: 50,
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