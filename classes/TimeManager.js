import Timer from './Timer';
import { loadTimers, saveTimers } from '../storage/timerStorage';

export class TimerManager {
    constructor() {
        this.timers = [];
        this._isInitialized = false;
        this._schedulingQueue = new Set(); // Track timers being scheduled
    }

    async loadFromStorage() {
        let saved = await loadTimers();
        if (!Array.isArray(saved)) saved = [];

        this.timers = saved.map(d => {
            const T = new Timer(d);
            // Calculate nextDate immediately to prevent render-time calculations
            T.nextDate = T.getEffectiveDate();
            return T;
        });

        // Schedule notifications in batch after loading
        await this._batchScheduleNotifications();

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

        // Schedule notifications after initialization
        await this._batchScheduleNotifications();
        await this.saveTimers();

        this._isInitialized = true;
        return this.timers;
    }

    // IMPROVED: Batch notification scheduling to prevent conflicts
    async _batchScheduleNotifications() {
        const activeTimers = this.timers.filter(timer =>
            timer.isCountdown && timer.isActive()
        );

        console.log(`📅 Scheduling notifications for ${activeTimers.length} active timers`);

        // Schedule in parallel but track progress
        const schedulePromises = activeTimers.map(async (timer) => {
            if (this._schedulingQueue.has(timer.id)) {
                console.log(`⏳ Skipping ${timer.id} - already scheduling`);
                return;
            }

            this._schedulingQueue.add(timer.id);

            try {
                await timer.scheduleNotification();
            } catch (error) {
                console.error(`❌ Failed to schedule for ${timer.id}:`, error);
            } finally {
                this._schedulingQueue.delete(timer.id);
            }
        });

        await Promise.allSettled(schedulePromises);
        console.log(`✅ Completed batch scheduling`);
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

            // Schedule notification immediately if it's a countdown timer
            if (T.isCountdown && T.isActive()) {
                await T.scheduleNotification();
            }

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

            // Cancel old notifications first
            await this.timers[I].cancelNotification();

            // Create updated timer
            const T = new Timer({ ...this.timers[I], ...D });
            T.nextDate = T.getEffectiveDate();

            this.timers[I] = T;

            // Schedule new notification if needed
            if (T.isCountdown && T.isActive()) {
                await T.scheduleNotification();
            }

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

            // Cancel notifications before removing
            await this.timers[I].cancelNotification();
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
            // Cancel all notifications in parallel
            const cancelPromises = this.timers.map(t => t.cancelNotification());
            await Promise.allSettled(cancelPromises);

            this.timers = [];
            this._schedulingQueue.clear();
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

            await T.cancelNotification();
            T.updateToNextOccurrence(); // This will also invalidate cache

            // Schedule new notification
            if (T.isCountdown && T.isActive()) {
                await T.scheduleNotification();
            }

            await this.saveTimers();
            console.log(`⏭️ Advanced recurring timer: ${T.title} (${ID})`);
            return true;
        } catch (error) {
            console.error('❌ Failed to advance recurring timer:', error);
            throw error;
        }
    }

    // IMPROVED: More efficient refresh with change detection
    async refreshTimers() {
        try {
            let hasChanges = false;
            const refreshPromises = [];

            this.timers.forEach(timer => {
                const oldNextDate = timer.nextDate?.getTime();

                // Invalidate cache and recalculate
                timer._invalidateCache();
                const newEffectiveDate = timer.getEffectiveDate();

                if (timer.isRecurring) {
                    timer.nextDate = newEffectiveDate;
                }

                const newNextDate = timer.nextDate?.getTime();

                if (oldNextDate !== newNextDate) {
                    hasChanges = true;

                    // Reschedule if needed
                    if (timer.isCountdown && timer.isActive()) {
                        refreshPromises.push(timer.scheduleNotification());
                    }
                }
            });

            // Wait for all rescheduling to complete
            if (refreshPromises.length > 0) {
                await Promise.allSettled(refreshPromises);
            }

            if (hasChanges) {
                await this.saveTimers();
                console.log('🔄 Refreshed timer dates');
            }
        } catch (error) {
            console.error('❌ Failed to refresh timers:', error);
        }
    }

    // NEW: Method to handle expired timers
    async handleExpiredTimers() {
        try {
            const expiredRecurringTimers = this.timers.filter(timer =>
                timer.isRecurring && !timer.isActive()
            );

            for (const timer of expiredRecurringTimers) {
                await this.advanceRecurringTimer(timer.id);
            }

            if (expiredRecurringTimers.length > 0) {
                console.log(`🔄 Advanced ${expiredRecurringTimers.length} expired recurring timers`);
            }
        } catch (error) {
            console.error('❌ Failed to handle expired timers:', error);
        }
    }

    // NEW: Method to toggle favourite status
    async toggleFavourite(ID) {
        try {
            const timer = this.getTimer(ID);
            if (!timer) {
                console.warn(`⚠️ Timer with ID ${ID} not found`);
                return false;
            }

            timer.toggleFavourite();
            await this.saveTimers();
            console.log(`⭐ Toggled favourite for: ${timer.title} (${ID})`);
            return timer.isFavourite;
        } catch (error) {
            console.error('❌ Failed to toggle favourite:', error);
            throw error;
        }
    }

    // NEW: Get timers that need attention (expired, soon to expire)
    getTimersNeedingAttention() {
        const now = new Date();
        const in5Minutes = new Date(now.getTime() + 5 * 60 * 1000);

        return {
            expired: this.timers.filter(t => !t.isActive() && !t.isRecurring),
            expiringSoon: this.timers.filter(t => {
                const effectiveDate = t.getEffectiveDate();
                return effectiveDate > now && effectiveDate <= in5Minutes;
            }),
            recurringToAdvance: this.timers.filter(t =>
                t.isRecurring && !t.isActive()
            )
        };
    }
}