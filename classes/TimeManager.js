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
            // Convert loaded data to Timer instances
            this.timers = loadedTimers.map(timerData => new Timer(timerData));
            //console.log('Timers loaded into memory:', this.timers.length);
        } catch (error) {
            //console.error('Error loading timers from storage:', error);
            this.timers = [];
        }
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
                // Remove nextDate so Timer constructor recalculates it
                const { nextDate, ...rest } = { ...this.timers[index], ...timerData };
                const updatedTimer = new Timer(rest);

                this.timers[index] = updatedTimer;
                console.log('Timer edited:', this.timers[index]);
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
            this.timers = [];
            await this.saveToStorage();
            console.log('All timers cleared');
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

    // Initialize sample timers
    async initializeTimers() {
        try {
            const existingTimers = await loadTimers();
            console.log('Existing timers:', existingTimers.length);

            // Find the most futuristic and oldest dates
            let maxFuture = null;
            let minPast = null;
            for (const t of existingTimers) {
                const d = new Date(t.date);
                if (!maxFuture || d > maxFuture) maxFuture = d;
                if (!minPast || d < minPast) minPast = d;
            }

            // If no timers, use now as base
            if (!maxFuture) maxFuture = new Date();
            if (!minPast) minPast = new Date();

            const sampleData = [];
            const total = 10; // 5 countdown + 5 countup

            // Start from the most futuristic and oldest dates
            let countdownBase = new Date(maxFuture);
            let countupBase = new Date(minPast);

            for (let i = 0; i < total; i++) {
                const isCountdown = i < 5;
                const baseIndex = existingTimers.length + (isCountdown ? i + 1 : 20 + i - 5 + 1);
                const isRecurring = i % 4 === 0;
                const recurrenceInterval = isRecurring
                    ? { value: i % 5 + 1, unit: isCountdown ? 'days' : 'weeks' }
                    : null;

                let date;
                if (isCountdown) {
                    // Each new timer is 1 hour after the previous
                    countdownBase = new Date(countdownBase.getTime() + 60 * 60 * 1000);
                    date = new Date(countdownBase);
                } else {
                    // Each new timer is 1 hour before the previous
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

            // Append new timers to existing timers
            const updatedTimers = [...existingTimers, ...sampleData];
            console.log('Saving timers:', updatedTimers.length);

            await saveTimers(updatedTimers);

            // Reload from storage to ensure consistency
            await this.loadFromStorage();
            console.log('Sample data initialized with recurring and expired timers.');
        } catch (error) {
            console.error('Error initializing timers:', error);
            throw error;
        }
    }

    // Calculate the next occurrence for recurring timers
    calculateNextDate(currentDate, recurrenceInterval) {
        try {
            const date = new Date(currentDate);
            switch (recurrenceInterval.unit) {
                case 'days':
                    date.setDate(date.getDate() + recurrenceInterval.value);
                    break;
                case 'weeks':
                    date.setDate(date.getDate() + recurrenceInterval.value * 7);
                    break;
                case 'months':
                    date.setMonth(date.getMonth() + recurrenceInterval.value);
                    break;
                case 'years':
                    date.setFullYear(date.getFullYear() + recurrenceInterval.value);
                    break;
                default:
                    throw new Error('Invalid recurrence interval unit');
            }
            return date.toISOString();
        } catch (error) {
            console.error('Error calculating next date:', error);
            throw error;
        }
    }
}