import Timer from './Timer';
import { loadTimers, saveTimers } from '../storage/timerStorage';

export class TimerManager {
    constructor() {
        this.timers = [];
        this._isInitialized = false;
    }

    async loadFromStorage() {
        let saved = await loadTimers();
        if (!Array.isArray(saved)) saved = [];

        this.timers = saved.map(d => {
            const T = new Timer(d);
            // Calculate nextDate before scheduling to avoid render cycle updates
            T.nextDate = T.getEffectiveDate();
            return T;
        });

        // Schedule notifications after all timers are created and state is stable
        setTimeout(() => {
            this.timers.forEach(timer => {
                timer.scheduleNotification();
            });
        }, 100);

        this._isInitialized = true;
        return this.timers;
    }

    async initializeTimers() {
        if (this._isInitialized) {
            return this.timers;
        }

        let saved = await loadTimers();
        if (!Array.isArray(saved)) saved = [];

        this.timers = saved.map(d => {
            const T = new Timer(d);
            T.nextDate = T.getEffectiveDate();
            return T;
        });

        // Defer notification scheduling to prevent render cycle updates
        setTimeout(() => {
            this.timers.forEach(timer => {
                timer.scheduleNotification();
            });
        }, 100);

        await this.saveTimers();
        this._isInitialized = true;
        return this.timers;
    }

    async saveTimers() {
        try {
            const timerData = this.timers.map(t => t.toJSON());
            await saveTimers(timerData);
            console.log(`💾 Saved ${this.timers.length} timers to storage`);
        } catch (error) {
            console.error('❌ Failed to save timers:', error);
            throw error;
        }
    }

    async addTimer(D) {
        try {
            const T = new Timer(D);
            T.nextDate = T.getEffectiveDate();

            this.timers.push(T);

            // Schedule notification after timer is added to prevent state conflicts
            setTimeout(() => {
                T.scheduleNotification();
            }, 50);

            await this.saveTimers();
            console.log(`✅ Added timer: ${T.title} (${T.id})`);
            return T;
        } catch (error) {
            console.error('❌ Failed to add timer:', error);
            throw error;
        }
    }

    async editTimer(D) {
        try {
            const I = this.timers.findIndex(t => t.id === D.id);
            if (I === -1) {
                console.warn(`⚠️ Timer with ID ${D.id} not found for editing`);
                return null;
            }

            // Cancel old notification
            this.timers[I].cancelNotification();

            // Create updated timer
            const T = new Timer({ ...this.timers[I], ...D });
            T.nextDate = T.getEffectiveDate();

            this.timers[I] = T;

            // Schedule new notification after update
            setTimeout(() => {
                T.scheduleNotification();
            }, 50);

            await this.saveTimers();
            console.log(`✏️ Updated timer: ${T.title} (${T.id})`);
            return T;
        } catch (error) {
            console.error('❌ Failed to edit timer:', error);
            throw error;
        }
    }

    async removeTimer(ID) {
        try {
            const I = this.timers.findIndex(t => t.id === ID);
            if (I === -1) {
                console.warn(`⚠️ Timer with ID ${ID} not found for removal`);
                return false;
            }

            // Cancel notification before removing
            this.timers[I].cancelNotification();
            const removedTimer = this.timers.splice(I, 1)[0];

            await this.saveTimers();
            console.log(`🗑️ Removed timer: ${removedTimer.title} (${ID})`);
            return true;
        } catch (error) {
            console.error('❌ Failed to remove timer:', error);
            throw error;
        }
    }

    getTimer(ID) {
        return this.timers.find(t => t.id === ID);
    }

    getAllTimers() {
        return [...this.timers]; // Return a copy to prevent external mutations
    }

    async clearAllTimers() {
        try {
            // Cancel all notifications
            this.timers.forEach(t => t.cancelNotification());

            this.timers = [];
            await this.saveTimers();
            console.log('🧹 Cleared all timers');
        } catch (error) {
            console.error('❌ Failed to clear timers:', error);
            throw error;
        }
    }

    async advanceRecurringTimer(ID) {
        try {
            const T = this.getTimer(ID);
            if (!T || !T.isRecurring) {
                console.warn(`⚠️ Timer ${ID} not found or not recurring`);
                return false;
            }

            T.cancelNotification();
            T.nextDate = T.getEffectiveDate();

            // Schedule notification after advancing
            setTimeout(() => {
                T.scheduleNotification();
            }, 50);

            await this.saveTimers();
            console.log(`⏭️ Advanced recurring timer: ${T.title} (${ID})`);
            return true;
        } catch (error) {
            console.error('❌ Failed to advance recurring timer:', error);
            throw error;
        }
    }

    // Helper method to refresh all timer effective dates
    async refreshTimers() {
        try {
            let hasChanges = false;

            this.timers.forEach(timer => {
                const oldNextDate = timer.nextDate;
                timer.nextDate = timer.getEffectiveDate();

                if (oldNextDate?.getTime() !== timer.nextDate?.getTime()) {
                    hasChanges = true;
                    // Reschedule notification if date changed
                    setTimeout(() => {
                        timer.scheduleNotification();
                    }, 50);
                }
            });

            if (hasChanges) {
                await this.saveTimers();
                console.log('🔄 Refreshed timer dates');
            }
        } catch (error) {
            console.error('❌ Failed to refresh timers:', error);
        }
    }
}