import uuid from 'react-native-uuid';
import { scheduleNotification } from '../utils/Notify';
import dayjs from 'dayjs';
import * as Notifications from 'expo-notifications';

export default class Timer {
    constructor({
        id,
        title,
        personName,
        priority = 'normal',
        date,
        isFavourite = null,
        isRecurring = false,
        recurrenceInterval = null,
        isCountdown = true,
        nextDate = null,
        notificationId = null,
        reminderNotificationId = null,
        notificationScheduledFor = null,
    }) {
        this.id = id || uuid.v4();
        this.title = title;
        this.personName = personName;
        this.priority = priority;
        this.date = date instanceof Date ? date : new Date(date);
        this.isFavourite = isFavourite ?? false;
        this.isRecurring = isRecurring;
        this.recurrenceInterval = recurrenceInterval;
        this.isCountdown = isCountdown;
        this.notificationId = notificationId;
        this.reminderNotificationId = reminderNotificationId;
        this.notificationScheduledFor = notificationScheduledFor ? new Date(notificationScheduledFor) : null;

        // Cache the effective date to prevent recalculation
        this._cachedEffectiveDate = null;
        this._lastCalculated = null;

        // Set nextDate if provided, otherwise calculate it
        this.nextDate = nextDate ? (nextDate instanceof Date ? nextDate : new Date(nextDate)) : null;

        // Only calculate next occurrence if we don't have a nextDate and timer is recurring
        if (!this.nextDate && this.isRecurring) {
            this.nextDate = this.calculateNextOccurrence();
        }
    }

    calculateNextOccurrence() {
        if (!this.isRecurring || !this.recurrenceInterval) {
            return null;
        }

        const { value, unit } = this._parseRecurrenceInterval();
        if (!value || !unit) return null;

        const baseDate = new Date(this.date);
        const nextDate = new Date(baseDate);

        switch (unit) {
            case 'second':
            case 'seconds':
                nextDate.setSeconds(nextDate.getSeconds() + value);
                break;
            case 'minute':
            case 'minutes':
                nextDate.setMinutes(nextDate.getMinutes() + value);
                break;
            case 'hour':
            case 'hours':
                nextDate.setHours(nextDate.getHours() + value);
                break;
            case 'day':
            case 'days':
                nextDate.setDate(nextDate.getDate() + value);
                break;
            case 'week':
            case 'weeks':
                nextDate.setDate(nextDate.getDate() + value * 7);
                break;
            case 'month':
            case 'months':
                nextDate.setMonth(nextDate.getMonth() + value);
                break;
            case 'year':
            case 'years':
                nextDate.setFullYear(nextDate.getFullYear() + value);
                break;
            default:
                return null;
        }

        return nextDate;
    }

    calculateNextOccurrenceFrom(fromDate) {
        if (!this.isRecurring || !this.recurrenceInterval) {
            return null;
        }

        const { value, unit } = this._parseRecurrenceInterval();
        if (!value || !unit) return null;

        const baseDate = new Date(fromDate);
        const nextDate = new Date(baseDate);

        switch (unit) {
            case 'second':
            case 'seconds':
                nextDate.setSeconds(nextDate.getSeconds() + value);
                break;
            case 'minute':
            case 'minutes':
                nextDate.setMinutes(nextDate.getMinutes() + value);
                break;
            case 'hour':
            case 'hours':
                nextDate.setHours(nextDate.getHours() + value);
                break;
            case 'day':
            case 'days':
                nextDate.setDate(nextDate.getDate() + value);
                break;
            case 'week':
            case 'weeks':
                nextDate.setDate(nextDate.getDate() + value * 7);
                break;
            case 'month':
            case 'months':
                nextDate.setMonth(nextDate.getMonth() + value);
                break;
            case 'year':
            case 'years':
                nextDate.setFullYear(nextDate.getFullYear() + value);
                break;
            default:
                return null;
        }

        return nextDate;
    }

    _parseRecurrenceInterval() {
        if (typeof this.recurrenceInterval === 'string') {
            const parts = this.recurrenceInterval.trim().split(/\s+/);
            const value = parseInt(parts[0], 10);
            const unit = parts[1]?.toLowerCase().replace(/s$/, '');
            return { value, unit };
        } else if (this.recurrenceInterval && typeof this.recurrenceInterval === 'object') {
            const value = this.recurrenceInterval.value;
            const unit = this.recurrenceInterval.unit?.toLowerCase().replace(/s$/, '');
            return { value, unit };
        }
        return { value: null, unit: null };
    }

    updateToNextOccurrence() {
        if (!this.nextDate || !this.isRecurring) return;

        this.date = new Date(this.nextDate);
        this.nextDate = this.calculateNextOccurrence();
        // Clear cache when dates change
        this._invalidateCache();
    }

    recalculateNextOccurrence() {
        if (this.isRecurring) {
            this.nextDate = this.calculateNextOccurrence();
        } else {
            this.nextDate = null;
        }
        this._invalidateCache();
    }

    _invalidateCache() {
        this._cachedEffectiveDate = null;
        this._lastCalculated = null;
    }

    // FIXED: Cache the effective date with proper invalidation
    getEffectiveDate() {
        const now = Date.now();

        // Return cached result if it's still valid (within 1 minute)
        if (this._cachedEffectiveDate && this._lastCalculated &&
            (now - this._lastCalculated) < 60000) {
            return this._cachedEffectiveDate;
        }

        let effectiveDate;

        if (!this.isRecurring) {
            effectiveDate = this.date;
        } else {
            const nowDate = new Date();

            // If main date is in the future, use it
            if (this.date > nowDate) {
                effectiveDate = this.date;
            }
            // If we have a nextDate and it's in the future, use it
            else if (this.nextDate && this.nextDate > nowDate) {
                effectiveDate = this.nextDate;
            }
            // Calculate next occurrence from now
            else {
                let currentDate = new Date(this.date);
                while (currentDate <= nowDate) {
                    const nextOccurrence = this.calculateNextOccurrenceFrom(currentDate);
                    if (!nextOccurrence) break;
                    currentDate = nextOccurrence;
                }
                effectiveDate = currentDate;

                // Update nextDate if significantly different
                if (!this.nextDate || Math.abs(currentDate.getTime() - this.nextDate.getTime()) > 1000) {
                    this.nextDate = currentDate;
                }
            }
        }

        // Cache the result
        this._cachedEffectiveDate = effectiveDate;
        this._lastCalculated = now;

        return effectiveDate;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            personName: this.personName,
            priority: this.priority,
            date: this.date.toISOString(),
            isFavourite: this.isFavourite,
            isRecurring: this.isRecurring,
            recurrenceInterval: this.recurrenceInterval,
            isCountdown: this.isCountdown,
            nextDate: this.nextDate ? this.nextDate.toISOString() : null,
            notificationId: this.notificationId,
            reminderNotificationId: this.reminderNotificationId,
            notificationScheduledFor: this.notificationScheduledFor ? this.notificationScheduledFor.toISOString() : null,
        };
    }

    toggleFavourite() {
        this.isFavourite = !this.isFavourite;
        return this.isFavourite;
    }

    // FIXED: Synchronous scheduling with proper checks
    async scheduleNotification() {
        if (!this.isCountdown) {
            console.log(`⏭️ Skipping notification for non-countdown timer: ${this.id}`);
            return;
        }

        const date = this.getEffectiveDate();
        const now = dayjs();
        const targetTime = dayjs(date);
        const seconds = targetTime.diff(now, 'second');

        if (seconds <= 0) {
            console.warn(`⚠️ Skipping notification for ${this.id}: time already passed`);
            return;
        }

        // Check if we need to reschedule
        if (!this.shouldRescheduleNotification()) {
            console.log(`✅ Notification already scheduled correctly for ${this.id}`);
            return;
        }

        try {
            // Cancel existing notifications
            await this.cancelNotification();

            const message = `⏰ "${this.title}" just finished`;
            const subMessage = this.personName ? `For ${this.personName}` : '';
            const fullMessage = `${message}${subMessage ? ' - ' + subMessage : ''}`;

            // Schedule main notification
            const notifId = await scheduleNotification(
                seconds,
                this.title,
                fullMessage,
                {
                    id: this.id,
                    timerId: this.id,
                    type: 'timer_complete'
                }
            );

            this.notificationId = notifId;
            this.notificationScheduledFor = new Date(date);

            // Schedule reminder notification (5 minutes before, if more than 10 minutes away)
            if (seconds > 600) { // More than 10 minutes
                const reminderSeconds = seconds - 300; // 5 minutes before
                const reminderMessage = `🔔 Reminder: "${this.title}" in 5 minutes`;

                const reminderNotifId = await scheduleNotification(
                    reminderSeconds,
                    `Reminder: ${this.title}`,
                    `${reminderMessage}${subMessage ? ' - ' + subMessage : ''}`,
                    {
                        id: `${this.id}_reminder`,
                        timerId: this.id,
                        type: 'timer_reminder'
                    }
                );

                this.reminderNotificationId = reminderNotifId;
            }

            console.log(`✅ Scheduled notifications for ${this.id} at ${targetTime.format('HH:mm:ss')}`);

        } catch (error) {
            console.error(`❌ Failed to schedule notification for ${this.id}`, error);
            throw error;
        }
    }

    async cancelNotification() {
        const promises = [];

        if (this.notificationId) {
            promises.push(
                Notifications.cancelScheduledNotificationAsync(this.notificationId)
                    .then(() => console.log(`❌ Cancelled main notification for ${this.id}`))
                    .catch((err) => console.error(`❌ Failed to cancel main notification for ${this.id}`, err))
            );
        }

        if (this.reminderNotificationId) {
            promises.push(
                Notifications.cancelScheduledNotificationAsync(this.reminderNotificationId)
                    .then(() => console.log(`❌ Cancelled reminder notification for ${this.id}`))
                    .catch((err) => console.error(`❌ Failed to cancel reminder notification for ${this.id}`, err))
            );
        }

        if (promises.length > 0) {
            await Promise.allSettled(promises);
        }

        this.notificationId = null;
        this.reminderNotificationId = null;
        this.notificationScheduledFor = null;
    }

    shouldRescheduleNotification() {
        if (!this.notificationId || !this.notificationScheduledFor) {
            return true;
        }

        const effectiveDate = this.getEffectiveDate();
        const scheduledTime = dayjs(this.notificationScheduledFor);
        const effectiveTime = dayjs(effectiveDate);

        // Allow 5 second tolerance to prevent micro-rescheduling
        const timeDiff = Math.abs(effectiveTime.diff(scheduledTime, 'second'));

        return timeDiff > 5;
    }

    // Helper method to check if timer is active (not expired)
    isActive() {
        const effectiveDate = this.getEffectiveDate();
        return dayjs(effectiveDate).isAfter(dayjs());
    }

    // Helper method to get time remaining
    getTimeRemaining() {
        if (!this.isActive()) return 0;

        const effectiveDate = this.getEffectiveDate();
        return dayjs(effectiveDate).diff(dayjs(), 'second');
    }
}