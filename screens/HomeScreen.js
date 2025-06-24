import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTimers } from '../utils/TimerContext';
import { useTheme } from '../utils/variables';
import { Icons } from '../assets/icons';
import AddTimerModal from '../components/AddTimerModal';
import ScreenWithHeader from '../components/ScreenWithHeder';

export default function HomeScreen({ navigation }) {

    const { timers, addTimer } = useTimers();
    const [quickAddVisible, setQuickAddVisible] = React.useState(false);

    const {
        theme,         // current theme ('light' or 'dark')
        colors,        // color palette for current theme
        variables,     // design tokens (spacing, radius, etc.)
        newStyles,     // pre-defined styles
        toggleTheme,   // function to toggle between light/dark
        setTheme       // function to set specific theme
    } = useTheme();

    const styles = StyleSheet.create({
        grid: {
            flexDirection: 'row',
            flexWrap: 'nowrap',
            justifyContent: 'space-between',
            alignItems: 'stretch',
            marginBottom: 16,
        },
        leftColumn: {
            flex: 1,
            marginRight: 10,
        },
        rightColumn: {
            flex: 1,
            justifyContent: 'space-between',
        },
        gridItem: {
            borderRadius: 20,
            padding: 15,
            backgroundColor: colors.settingBlock,
            borderWidth: 0.75,
            borderColor: colors.cardBorder,
        },
        totalTimers: {
            height: '100%',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 160,
        },
        countdownTimers: {
            marginBottom: 10,
        },
        gridTitle: {
            color: colors.textDesc,
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 8,
            textTransform: 'uppercase',
        },
        gridValue: {
            color: colors.textTitle,
            fontSize: 32,
            fontWeight: '700',
        },
        quickActionsCard: {
            marginTop: 10,
            backgroundColor: colors.settingBlock,
            borderRadius: 20,
            padding: 14,
            borderWidth: 0.75,
            borderColor: colors.cardBorder,
        },
        quickActionsTitle: {
            color: colors.textDesc,
            fontSize: 14,
            fontWeight: 'bold',
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            paddingLeft: 8,
        },
        quickActionsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            borderRadius: 16,
            marginTop: 6,
            backgroundColor: colors.card,
            borderWidth: 0.75,
            borderColor: colors.cardBorder,
            justifyContent: 'center',
            marginHorizontal: 4,
        },
        actionText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
        },
        quickActionsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        quickActionItem: {
            width: '48%',
            marginBottom: 10,
        },
        fullAction: {
            width: '100%',
        },
    });

    const { totalTimers, countdownTimers, countupTimers } = useMemo(() => {
        const total = timers?.length || 0;
        const countdown = timers?.filter(timer => timer.isCountdown).length || 0;
        const countup = timers?.filter(timer => !timer.isCountdown).length || 0;
        return { totalTimers: total, countdownTimers: countdown, countupTimers: countup };
    }, [timers]);

    return (

        <ScreenWithHeader
            headerIcon={<Icons.Ion name="timer" color={colors.highlight} />}
            headerTitle="Timers"
            borderRadius={20}
            style={styles}
            paddingMargin={15}
        >

            {/* New Horizontal Grid Layout */}
            <View style={styles.grid}>
                {/* Left: Total Timers (takes 2 rows) */}
                <View style={[styles.gridItem, styles.leftColumn, styles.totalTimers]}>
                    <Text style={styles.gridTitle}>Total Timers</Text>
                    <Text style={styles.gridValue}>{totalTimers}</Text>
                </View>
                {/* Right: Countdown and Countup stacked */}
                <View style={styles.rightColumn}>
                    <View style={[styles.gridItem, styles.countdownTimers]}>
                        <Text style={styles.gridTitle}>Countdowns</Text>
                        <Text style={styles.gridValue}>{countdownTimers}</Text>
                    </View>
                    <View style={[styles.gridItem, styles.countupTimers]}>
                        <Text style={styles.gridTitle}>Countups</Text>
                        <Text style={styles.gridValue}>{countupTimers}</Text>
                    </View>
                </View>
            </View>

            {/* Quick Actions Card */}
            <View style={styles.quickActionsCard}>
                <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                    <View style={styles.quickActionItem}>
                        <TouchableOpacity
                            style={[styles.actionButton]}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('CountDowns')}
                        >
                            <Icons.Material name="timer" size={15} color={colors.highlight} style={{ marginRight: 6 }} />
                            <Text style={styles.actionText}>Countdowns</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.quickActionItem}>
                        <TouchableOpacity
                            style={[styles.actionButton]}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('CountUps')}
                        >
                            <Icons.Material name="timer" size={15} color={colors.highlight} style={{ marginRight: 6 }} />
                            <Text style={styles.actionText}>Countups</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.quickActionItem}>
                        <TouchableOpacity
                            style={[styles.actionButton]}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('Settings')}
                        >
                            <Icons.Material name="settings" size={15} color={colors.highlight} style={{ marginRight: 6 }} />
                            <Text style={styles.actionText}>Settings</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.quickActionItem}>
                        <TouchableOpacity
                            style={[styles.actionButton]}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('About', { addNew: true })}
                        >
                            <Icons.Ion name="information-circle" size={15} color={colors.highlight} style={{ marginRight: 6 }} />
                            <Text style={styles.actionText}>About</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.quickActionItem, styles.fullAction]}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.actionButton]}
                            activeOpacity={0.85}
                            onPress={() => setQuickAddVisible(true)}
                        >
                            <Icons.Material name="add-circle" size={15} color={colors.highlight} style={{ marginRight: 6 }} />
                            <Text style={styles.actionText}>Quick Add Timer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <AddTimerModal
                    visible={quickAddVisible}
                    onClose={() => setQuickAddVisible(false)}
                    onAdd={(timer) => {
                        // Determine mode based on date
                        const now = new Date();
                        const timerDate = new Date(timer.date);
                        timer.isCountdown = timerDate > now;
                        addTimer(timer);
                        setQuickAddVisible(false);
                    }}
                    mode={null}
                />
            </View>
        </ScreenWithHeader>
    );
}