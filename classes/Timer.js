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
    }

    recalculateNextOccurrence() {
        if (this.isRecurring) {
            this.nextDate = this.calculateNextOccurrence();
        } else {
            this.nextDate = null;
        }
    }

    // FIXED: Cache the effective date to prevent recalculation during renders
    getEffectiveDate() {
        if (!this.isRecurring) {
            return this.date;
        }

        const now = new Date();

        // If main date is in the future, use it
        if (this.date > now) {
            return this.date;
        }

        // If we have a nextDate and it's in the future, use it
        if (this.nextDate && this.nextDate > now) {
            return this.nextDate;
        }

        // Calculate next occurrence from now - but don't modify state during this call
        let currentDate = new Date(this.date);
        while (currentDate <= now) {
            const nextOccurrence = this.calculateNextOccurrenceFrom(currentDate);
            if (!nextOccurrence) break;
            currentDate = nextOccurrence;
        }

        // Only update nextDate if it's significantly different (avoid micro-updates)
        if (!this.nextDate || Math.abs(currentDate.getTime() - this.nextDate.getTime()) > 1000) {
            this.nextDate = currentDate;
        }

        return currentDate;
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

    // FIXED: Prevent scheduling during render cycles
    scheduleNotification() {
        // Use setTimeout to defer the scheduling to next tick
        setTimeout(() => {
            this._performScheduling();
        }, 0);
    }

    _performScheduling() {
        const date = this.getEffectiveDate();
        const now = dayjs();
        const seconds = dayjs(date).diff(now, 'second');

        if (seconds <= 0) {
            console.warn(`⚠️ Skipping notification for ${this.id}: time already passed`);
            return;
        }

        const message = `⏰ "${this.title}" just finished`;
        const subMessage = this.personName ? `For ${this.personName}` : '';

        const schedule = () => {
            scheduleNotification(seconds, this.title, `${message}${subMessage ? ' - ' + subMessage : ''}`, { id: this.id })
                .then((notifId) => {
                    this.notificationId = notifId;
                    this.notificationScheduledFor = new Date(date);
                })
                .catch((error) => {
                    console.error(`❌ Failed to schedule notification for ${this.id}`, error);
                });
        };

        if (this.notificationId) {
            Notifications.cancelScheduledNotificationAsync(this.notificationId)
                .then(() => {
                    console.log(`🔁 Replacing old notification for ${this.id}`);
                    schedule();
                })
                .catch((err) => {
                    console.error(`❌ Failed to cancel old notification for ${this.id}`, err);
                    schedule();
                });
        } else {
            schedule();
        }
    }

    cancelNotification() {
        if (!this.notificationId) {
            console.warn(`⚠️ No notification ID to cancel for ${this.id}`);
            return;
        }

        Notifications.cancelScheduledNotificationAsync(this.notificationId)
            .then(() => {
                console.log(`❌ Cancelled notification for ${this.id}`);
            })
            .catch((err) => {
                console.error(`❌ Failed to cancel notification for ${this.id}`, err);
            })
            .finally(() => {
                this.notificationId = null;
                this.notificationScheduledFor = null;
            });
    }

    shouldRescheduleNotification() {
        const effectiveDate = this.getEffectiveDate();

        if (!this.notificationId || !this.notificationScheduledFor) return true;

        const scheduledTs = dayjs(this.notificationScheduledFor).unix();
        const effectiveTs = dayjs(effectiveDate).unix();

        return scheduledTs !== effectiveTs;
    }
}