import { saveTimers, loadTimers } from '../storage/timerStorage';
import Timer from './Timer';
import uuid from 'react-native-uuid';

export class TimerManager {
    constructor() {
        this.timers = [];
    }

    // Load timers from storage
    async loadFromStorage() {
        try {
            const loadedTimers = await loadTimers();
            // Convert loaded data to Timer instances WITHOUT scheduling notifications
            this.timers = loadedTimers.map(timerData => new Timer(timerData, { skipNotificationScheduling: true }));

            // Schedule notifications for all loaded timers
            this.scheduleNotificationsForAllTimers();

            //console.log('Timers loaded into memory:', this.timers.length);
        } catch (error) {
            //console.error('Error loading timers from storage:', error);
            this.timers = [];
        }
    }

    // Schedule notifications for all timers
    scheduleNotificationsForAllTimers() {
        this.timers.forEach(timer => {
            if (timer.shouldRescheduleNotification?.()) {
                timer.scheduleNotification();
            }
        });
    }

    // Save timers to storage
    async saveToStorage() {
        try {
            // Convert Timer instances to plain objects for storage
            const timerData = this.timers.map(timer => ({
                id: timer.id,
                title: timer.title,
                personName: timer.personName,
                priority: timer.priority,
                date: timer.date,
                isFavourite: timer.isFavourite,
                isRecurring: timer.isRecurring,
                recurrenceInterval: timer.recurrenceInterval,
                isCountdown: timer.isCountdown,
                notificationId: timer.notificationId,
                reminderNotificationId: timer.reminderNotificationId,
                // Include any other properties your Timer class has
            }));
            await saveTimers(timerData);
        } catch (error) {
            //console.error('Error saving timers to storage:', error);
        }
    }

    // Add a new timer
    async addTimer(timerData) {
        try {
            const newTimer = new Timer({
                id: timerData.id || uuid.v4(),
                ...timerData,
            });

            // Only schedule notification if the timer date is in the future
            const timerDate = new Date(newTimer.date);
            const now = new Date();

            if (timerDate > now && newTimer.scheduleNotification) {
                newTimer.scheduleNotification();
            }

            this.timers.push(newTimer);
            await this.saveToStorage();
            return newTimer;
        } catch (error) {
            //console.error('Error adding timer:', error);
            throw error;
        }
    }

    // Remove a timer by ID
    async removeTimer(id) {
        try {
            const timerToRemove = this.timers.find(timer => timer.id === id);
            if (timerToRemove) {
                // Cancel any existing notifications before removing
                if (timerToRemove.cancelNotification) {
                    timerToRemove.cancelNotification();
                }
            }

            const initialLength = this.timers.length;
            this.timers = this.timers.filter((timer) => timer.id !== id);

            if (this.timers.length === initialLength) {
                //console.warn(`Timer with ID ${id} not found for removal.`);
                return false;
            }

            await this.saveToStorage();
            return true;
        } catch (error) {
            console.error('Error removing timer:', error);
            throw error;
        }
    }

    // Edit an existing timer
    async editTimer(timerData) {
        try {
            const index = this.timers.findIndex((t) => t.id === timerData.id);
            if (index !== -1) {
                const oldTimer = this.timers[index];

                // Cancel old notifications before updating
                if (oldTimer.cancelNotification) {
                    oldTimer.cancelNotification();
                }

                // Remove nextDate so Timer constructor recalculates it
                const { nextDate, ...rest } = { ...this.timers[index], ...timerData };
                const updatedTimer = new Timer(rest);

                // Only schedule notification if the timer date is in the future
                const timerDate = new Date(updatedTimer.date);
                const now = new Date();

                if (timerDate > now && updatedTimer.scheduleNotification) {
                    updatedTimer.scheduleNotification();
                }

                this.timers[index] = updatedTimer;
                //console.log('Timer edited:', this.timers[index]);
                await this.saveToStorage();
                return updatedTimer;
            } else {
                console.warn(`Timer with ID ${timerData.id} not found for editing.`);
                throw new Error(`Timer with ID ${timerData.id} not found`);
            }
        } catch (error) {
            console.error('Error editing timer:', error);
            throw error;
        }
    }

    // Clear all timers
    async clearAllTimers() {
        try {
            // Cancel all notifications before clearing
            this.timers.forEach(timer => {
                if (timer.cancelNotification) {
                    timer.cancelNotification();
                }
            });

            this.timers = [];
            await this.saveToStorage();
            //console.log('All timers cleared');
        } catch (error) {
            console.error('Error clearing all timers:', error);
            throw error;
        }
    }

    // Get a timer by ID
    getTimer(id) {
        return this.timers.find((t) => t.id === id);
    }

    // Get all timers (return a copy to prevent external mutations)
    getAllTimers() {
        return [...this.timers];
    }

    // Get timers by type
    getCountdownTimers() {
        return this.timers.filter(timer => timer.isCountdown);
    }

    getCountupTimers() {
        return this.timers.filter(timer => !timer.isCountdown);
    }

    // Get timers by priority
    getTimersByPriority(priority) {
        return this.timers.filter(timer => timer.priority === priority);
    }

    // Get active timers (for countdown timers that haven't expired)
    getActiveTimers() {
        const now = new Date();
        return this.timers.filter(timer => {
            if (!timer.isCountdown) return true; // Countup timers are always "active"
            return new Date(timer.date) > now;
        });
    }

    async initializeTimers() {
        try {
            const existingTimers = await loadTimers();
            if (!Array.isArray(existingTimers)) {
                existingTimers = [];
            }

            let maxFuture = null;
            let minPast = null;
            for (const t of existingTimers) {
                const d = new Date(t.date);
                if (isNaN(d.getTime())) continue; // Skip invalid dates

                if (!maxFuture || d > maxFuture) maxFuture = d;
                if (!minPast || d < minPast) minPast = d;
            }

            if (!maxFuture) maxFuture = new Date();
            if (!minPast) minPast = new Date();

            const sampleData = [];
            const total = 10; // 5 countdown + 5 countup

            let countdownBase = new Date(maxFuture);
            let countupBase = new Date(minPast);

            for (let i = 0; i < total; i++) {
                const isCountdown = i < 5;
                const baseIndex = existingTimers.length + (isCountdown ? i + 1 : 20 + i - 5 + 1);
                const isRecurring = isCountdown ? true : false;

                let recurrenceInterval = null;
                if (isRecurring) {
                    const value = i % 5 + 1;
                    const unit = isCountdown ? 'days' : 'weeks';
                    recurrenceInterval = `${value} ${unit}`;
                }

                let date;
                if (isCountdown) {
                    countdownBase = new Date(countdownBase.getTime() + 60 * 60 * 1000);
                    date = new Date(countdownBase);
                } else {
                    countupBase = new Date(countupBase.getTime() - 60 * 60 * 1000);
                    date = new Date(countupBase);
                }

                sampleData.push({
                    id: uuid.v4(),
                    title: `${isCountdown ? 'Countdown' : 'Countup'} Timer ${baseIndex}`,
                    personName: `Person ${baseIndex}`,
                    priority: i % 3 === 0 ? 'high' : i % 2 === 0 ? 'normal' : 'low',
                    date: date.toISOString(),
                    isRecurring,
                    recurrenceInterval,
                    isCountdown,
                });
            }

            const updatedTimers = [...existingTimers, ...sampleData];
            await saveTimers(updatedTimers);

            await this.loadFromStorage();
            console.log('Sample data initialized with recurring and expired timers.');
        } catch (error) {
            console.error('Error initializing timers:', error.message);
            throw error;
        }
    };

    // Advance a recurring timer to its next occurrence
    async advanceRecurringTimer(timerId) {
        try {
            const timer = this.getTimer(timerId);
            if (!timer || !timer.isRecurring) {
                return false;
            }

            const now = new Date();
            const { nextDate } = this.calculateNextOccurrence(timer, now);

            // Update the timer with the new date
            const updatedTimerData = {
                ...timer,
                date: new Date(nextDate)
            };

            await this.editTimer(updatedTimerData);
            return true;
        } catch (error) {
            console.error('Error advancing recurring timer:', error);
            throw error;
        }
    }

    // Get expired timers that need to be advanced
    getExpiredRecurringTimers() {
        const now = new Date();
        return this.timers.filter(timer => {
            return timer.isRecurring &&
                timer.isCountdown &&
                new Date(timer.date) <= now;
        });
    }
    calculateNextOccurrence(timer, now = new Date()) {
        if (!timer.isRecurring || !timer.recurrenceInterval) {
            return {
                nextDate: timer.date,
                recurrenceCount: 0
            };
        }

        const [countStr, unitRaw] = timer.recurrenceInterval.split(' ');
        const count = parseInt(countStr, 10) || 1;
        const unit = unitRaw.toLowerCase().endsWith('s')
            ? unitRaw.toLowerCase().slice(0, -1)
            : unitRaw.toLowerCase();

        const addMap = {
            second: (date, n) => date.setSeconds(date.getSeconds() + n),
            minute: (date, n) => date.setMinutes(date.getMinutes() + n),
            hour: (date, n) => date.setHours(date.getHours() + n),
            day: (date, n) => date.setDate(date.getDate() + n),
            week: (date, n) => date.setDate(date.getDate() + n * 7),
            month: (date, n) => date.setMonth(date.getMonth() + n),
            year: (date, n) => date.setFullYear(date.getFullYear() + n),
        };

        let nextDate = new Date(timer.date);
        let recurrenceCount = 0;

        while (nextDate.getTime() < now.getTime()) {
            addMap[unit]?.(nextDate, count);
            recurrenceCount++;

            // Safety check to prevent infinite loops
            if (recurrenceCount > 10000) break;
        }

        return {
            nextDate: nextDate.getTime(),
            recurrenceCount: recurrenceCount - 1
        };
    }

    async toggleFavourite(timerId) {
        const timer = this.getTimer(timerId);
        if (timer) {
            const newStatus = timer.toggleFavourite();
            console.log('❤️ Favourite toggled to:', newStatus);
            await this.saveToStorage();
            return newStatus;
        }
        console.warn('⚠️ Timer not found for toggling favourite:', timerId);
        return null;
    }


}