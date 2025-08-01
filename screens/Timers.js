import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import TimerCard from '../components/TimerCard';
import AddTimer from '../components/AddTimer';
import HeaderActions from '../components/HeaderActions';
import ActionBottomNav from '../components/ActionBottomNav';
import { useTimers } from '../utils/TimerContext';
import { Icons } from '../assets/icons';
import { useTheme } from '../utils/ThemeContext';
import HeaderScreen from '../components/HeaderScreen';
import { useSecurity } from '../utils/SecurityContext';
import { sortOptions } from '../utils/functions';
import uuid from 'react-native-uuid';
import ConfirmSheet from '../components/ConfirmSheet'
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';

export default function Timers({ route }) {

    const { mode } = route.params;
    const isCountdown = mode === 'countdown';
    const { privacyMode } = useSecurity();
    const { variables, colors, border, layoutMode, defaultUnit } = useTheme();
    const { timers, addTimer, editTimer, removeTimer, toggleFavourite } = useTimers();

    const [sortMethod, setSortMethod] = useState(`${isCountdown ? 'timeLeft' : 'priority'}`);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [editingTimer, setEditingTimer] = useState(null);
    const [isSelectable, setIsSelectable] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState(() => () => { });
    const [timerToDelete, setTimerToDelete] = useState(null);
    const [confirmVisible, setConfirmVisible] = useState(false);
    // Add state for ActionBottomNav visibility
    const [showActionNav, setShowActionNav] = useState(false);

    const showToast = (type, text1, text2 = '') => {
        Toast.show({
            type,
            text1,
            text2,
        });
    };

    useFocusEffect(
        useCallback(() => {
            return () => {
                setShowActionNav(false);
            };
        }, [])
    );

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const addMessage = useCallback((text, type = 'info') => {
        showToast(type, capitalize(type), text);
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
                    const aDate = a.getEffectiveDate?.() || a.date;
                    const bDate = b.getEffectiveDate?.() || b.date;

                    const aDiff = isCountdown
                        ? dayjs(aDate).diff()
                        : dayjs().diff(aDate);

                    const bDiff = isCountdown
                        ? dayjs(bDate).diff()
                        : dayjs().diff(bDate);

                    return aDiff - bDiff;
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
                addMessage('Timer updated successfully', 'success');
            } else if (!isDuplicate) {
                await addTimer(newTimer);
                addMessage('Timer added successfully', 'success');
            } else {
                const duplicateTimer = {
                    ...newTimer,
                    id: uuid.v4(),
                };
                await addTimer(duplicateTimer);
                addMessage('Timer duplicated successfully', 'success');
            }
            setModalVisible(false);
        } catch (error) {
            addMessage('Error saving timer', 'error');
        }
    }, [editingTimer, editTimer, addTimer, addMessage, isDuplicate]);

    const handleEditTimer = useCallback((timer) => {
        setEditingTimer(timer);
        setModalVisible(true);
    }, []);

    const handleDeleteTimer = useCallback(async (id) => {
        try {
            await removeTimer(id);
            addMessage('Timer deleted', 'success');
            setSelectedIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });

        } catch (error) {
            addMessage('Error deleting timer', 'error');
        }
    }, [removeTimer, addMessage]);

    const promptDeleteSingle = useCallback((id) => {
        setTimerToDelete(id);
        setConfirmAction(() => async () => {
            await handleDeleteTimer(id);
            setTimerToDelete(null);
            setConfirmVisible(false);
        });
        setConfirmVisible(true);
    }, [handleDeleteTimer]);

    const handleCardClick = useCallback((timerId) => {
        if (isSelectable) {
            handleSelect(timerId);
        }
    }, [isSelectable, handleSelect]);

    function renderTimerCard({ item: timer }) {
        const isSelected = selectedIds.has(timer.id);

        return (
            <TimerCard
                timer={timer}
                onDelete={promptDeleteSingle}
                onEdit={handleEditTimer}
                handleDuplicate={() => {
                    setIsDuplicate(true);
                    setEditingTimer(timer);
                    setModalVisible(true);
                }}
                handleFavourite={toggleFavourite}
                onClick={() => handleCardClick(timer.id)}
                selectable={isSelectable}
                selected={isSelected}
                isCountdown={isCountdown}
                searchText={searchQuery}
                buttons={isSelectable ? 'off' : 'on'} // Hide buttons when in selection mode
                layoutMode={layoutMode}
                defaultUnit={defaultUnit}
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
            addMessage(`Deleted ${idsArray.length} timer${idsArray.length > 1 ? 's' : ''}`, 'success');
            setSelectedIds(new Set());
            setIsSelectable(false);
            setConfirmVisible(false);
        } catch (error) {
            addMessage('Error deleting timers', 'error');
        }
    }, [selectedIds, removeTimer, addMessage]);

    const executeBatchDelete = useCallback(() => {
        handleBatchDelete();
    }, [handleBatchDelete]);

    const handleBatchDeletePress = useCallback(() => {
        const selectedCount = selectedIds.size;

        if (!isSelectable) {
            setIsSelectable(true);
            setShowActionNav(false); // Close action nav when entering selection mode
            addMessage("Select timers to delete");
        } else if (selectedCount > 0) {
            setConfirmAction(() => executeBatchDelete);
            setConfirmVisible(true);
        } else {
            setIsSelectable(false);
            addMessage("Selection mode cancelled");
        }
    }, [isSelectable, selectedIds.size, executeBatchDelete, addMessage]);

    // Handle ActionBottomNav toggle
    const handleToggleActionNav = useCallback(() => {
        setShowActionNav(prev => !prev);
    }, []);

    // Handle ActionBottomNav add
    const handleActionNavAdd = useCallback(() => {
        setModalVisible(true);
        setShowActionNav(false);
    }, []);

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
            borderWidth: border,
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
    }), [colors, variables, border]);

    const ListHeaderComponent = useMemo(() => (
        <HeaderActions
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
            showActionNav={showActionNav}
            onToggleActionNav={handleToggleActionNav}
        />
    ), [
        searchQuery,
        isSelectable,
        selectedIds.size,
        colors,
        variables,
        handleBatchDeletePress,
        sortMethod,
        handleSortChange,
        showActionNav,
        handleToggleActionNav
    ]);

    const ListEmptyComponent = useMemo(() => (
        <View style={styles.emptyContainer}>
            {filteredTimers.length === 0 && <Text style={styles.emptyText}>No timers found.</Text>}
            <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.85}
                onPress={() => setModalVisible(true)}
            >
                <Icons.Material name="add-circle" size={18} color={colors.highlight} style={{ marginRight: 6 }} />
                <Text style={styles.actionText}>Quick Add Timer</Text>
            </TouchableOpacity>
        </View>
    ), [colors, styles]);

    const handleModalClose = useCallback(() => {
        setModalVisible(false);
        setEditingTimer(null);
        setIsDuplicate(false);
    }, []);

    return (
        <>
            <HeaderScreen
                key={`layout-${layoutMode}-unit-${defaultUnit}`}
                headerIcon={<Icons.Ion name={mode === 'countdown' ? 'arrow-down' : 'arrow-up'} size={18} color={colors.highlight} />}
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
                    numColumns: layoutMode === 'grid' ? 2 : 1,
                    showsVerticalScrollIndicator: false,
                    keyboardShouldPersistTaps: 'handled',
                    removeClippedSubviews: false,
                    maxToRenderPerBatch: 8,
                    windowSize: 8,
                    initialNumToRender: 8,
                    updateCellsBatchingPeriod: 100,
                    getItemLayout: null,
                    contentContainerStyle: {
                        paddingBottom: 95,
                        minHeight: '100%',
                    }
                }}
            />

            {/* ActionBottomNav positioned at the bottom of the screen */}
            <ActionBottomNav
                visible={showActionNav}
                onClose={() => setShowActionNav(false)}
                onAdd={handleActionNavAdd}
                onBatchToggle={handleBatchDeletePress}
                isSelectable={isSelectable}
                sortValue={sortMethod}
                onSortChange={handleSortChange}
                sortOptions={sortOptions}
                colors={colors}
                variables={variables}
            />

            <ConfirmSheet
                visible={confirmVisible}
                onClose={() => { setConfirmVisible(false); setTimerToDelete(null); }}
                onConfirm={confirmAction}
                title={timerToDelete ? 'Delete Timer' : 'Delete Timers'}
                message={
                    timerToDelete
                        ? 'Delete this timer? This action cannot be undone.'
                        : `Delete ${selectedIds.size} timer${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`
                }
                confirmText="Delete"
                cancelText="Cancel"
                confirmColor="#ef4444"
                icon="trash-outline"
                colors={colors}
                variables={variables}
            />

            <AddTimer
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