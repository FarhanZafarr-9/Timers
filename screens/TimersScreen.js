import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import TimerCard from '../components/TimerCard';
import AddTimerModal from '../components/AddTimerModal';
import HeaderControls from '../components/HeaderControls';
import { useTimers } from '../utils/TimerContext';
import { Icons } from '../assets/icons';
import { useTheme } from '../utils/ThemeContext';
import ScreenWithHeader from '../components/ScreenWithHeder';
import { useSecurity } from '../utils/SecurityContext';
import { sortOptions } from '../utils/functions';
import Snackbar from '../components/SnackBar';
import uuid from 'react-native-uuid';

export default function TimersScreen({ route }) {
    const { mode } = route.params;
    const isCountdown = mode === 'countdown';
    const { privacyMode } = useSecurity();
    const { variables, colors, isBorder } = useTheme();
    const { timers, addTimer, editTimer, removeTimer } = useTimers();

    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingTimer, setEditingTimer] = useState(null);
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [expandedCardIds, setExpandedCardIds] = useState(new Set());
    const [isSelectable, setIsSelectable] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [sortMethod, setSortMethod] = useState('priority');
    const [messages, setMessages] = useState([]);

    const addMessage = useCallback((text) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setMessages(prev => [...prev, { id, text }]);
    }, []);

    const removeMessage = useCallback((messageId) => {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }, []);

    const handleSortChange = useCallback((method) => {
        setSortMethod(method);
        addMessage(`Sorted by ${method}`);
    }, [addMessage]);

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

    const handleAddTimer = useCallback(async (newTimer) => {
        try {
            if (editingTimer && !isDuplicate) {
                await editTimer(newTimer);
                setEditingTimer(null);
                addMessage('Timer updated successfully');
            } else if (!isDuplicate) {
                await addTimer(newTimer);
                addMessage('Timer added successfully');
            } else {
                const duplicateTimer = {
                    ...newTimer,
                    id: uuid.v4(),
                };
                await addTimer(duplicateTimer);
                addMessage('Timer duplicated successfully');
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

    function renderTimerCard({ item: timer }) {
        const isExpanded = expandedCardIds.has(timer.id);
        const isSelected = selectedIds.has(timer.id);

        return (
            <TimerCard
                timer={timer}
                onDelete={handleDeleteTimer}
                onEdit={handleEditTimer}
                handleDuplicate={() => {
                    setIsDuplicate(true);
                    setEditingTimer(timer);
                    setModalVisible(true);
                }}
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
    }

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
            paddingVertical: 12,
            borderRadius: variables.radius.md,
            backgroundColor: colors.cardLighter,
            borderWidth: isBorder ? 0.75 : 0,
            borderColor: colors.cardBorder,
            justifyContent: 'center',
            marginTop: 16,
            paddingHorizontal: 45,
        },
        actionText: {
            color: colors.text,
            fontSize: 14,
            fontWeight: '600',
        },
    }), [colors, variables]);

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
        setIsDuplicate(false);
    }, []);

    return (
        <>
            <ScreenWithHeader
                headerIcon={<Icons.Ion name={mode === 'countdown' ? 'arrow-down':'arrow-up'} size={18} color={colors.highlight} />}
                headerTitle={isCountdown ? "Countdowns" : "Countups"}
                borderRadius={variables.radius.lg}
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
                    getItemLayout: null,
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
                isDuplicate={isDuplicate}
                mode={mode}
            />
        </>
    );
}