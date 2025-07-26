import uuid from 'react-native-uuid';
import { scheduleNotification } from '../utils/Notify'; // adjust the path as needed
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
        this.priority = priority; // 'low', 'normal', 'high'
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

    /**
     * Calculates the next occurrence of the timer based on the recurrence interval
     * @returns {Date|null} The next occurrence date, or null if not recurring
     */
    calculateNextOccurrence() {
        if (!this.isRecurring || !this.recurrenceInterval) {
            return null;
        }

        const { value, unit } = this._parseRecurrenceInterval();
        if (!value || !unit) return null;

        // Use the main date as the base for calculation, not nextDate
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

    /**
     * Calculates the next occurrence from a specific date
     * @param {Date} fromDate - The date to calculate from
     * @returns {Date|null} The next occurrence date, or null if not recurring
     */
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

    /**
     * Parses the recurrence interval into value and unit
     * @returns {Object} Contains value (number) and unit (string)
     * @private
     */
    _parseRecurrenceInterval() {
        if (typeof this.recurrenceInterval === 'string') {
            const parts = this.recurrenceInterval.trim().split(/\s+/);
            const value = parseInt(parts[0], 10);
            // Remove trailing 's' to normalize units (e.g. 'days' -> 'day')
            const unit = parts[1]?.toLowerCase().replace(/s$/, '');
            return { value, unit };
        } else if (this.recurrenceInterval && typeof this.recurrenceInterval === 'object') {
            const value = this.recurrenceInterval.value;
            const unit = this.recurrenceInterval.unit?.toLowerCase().replace(/s$/, '');
            return { value, unit };
        }
        return { value: null, unit: null };
    }

    /**
     * Updates the timer's date to the next occurrence
     */
    updateToNextOccurrence() {
        if (!this.nextDate || !this.isRecurring) return;

        // Move current nextDate to date, then calculate the new nextDate
        this.date = new Date(this.nextDate);
        this.nextDate = this.calculateNextOccurrence();
    }

    /**
     * Recalculates the next occurrence based on current date
     * Useful after editing timer properties
     */
    recalculateNextOccurrence() {
        if (this.isRecurring) {
            this.nextDate = this.calculateNextOccurrence();
        } else {
            this.nextDate = null;
        }
    }

    /**
     * Gets the effective date for countdown (either main date or nextDate if recurring and nextDate is in future)
     * @returns {Date} The date to use for countdown calculations
     */
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

        // Calculate next occurrence from now
        let currentDate = new Date(this.date);
        while (currentDate <= now) {
            const nextOccurrence = this.calculateNextOccurrenceFrom(currentDate);
            if (!nextOccurrence) break;
            currentDate = nextOccurrence;
        }

        this.nextDate = currentDate;
        return currentDate;
    }

    /**
     * Serializes the timer for storage
     * @returns {Object} Plain object representation of the timer
     */
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

    /**
 * Toggles the favourite status
 * @returns {boolean} The new favourite status
 */
    toggleFavourite() {
        this.isFavourite = !this.isFavourite;
        return this.isFavourite;
    }

    scheduleNotification() {
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
                    schedule(); // still try scheduling the new one
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

        // If the scheduled date doesn't match the current effective date, reschedule
        const scheduledTs = dayjs(this.notificationScheduledFor).unix();
        const effectiveTs = dayjs(effectiveDate).unix();

        return scheduledTs !== effectiveTs;
    }

}