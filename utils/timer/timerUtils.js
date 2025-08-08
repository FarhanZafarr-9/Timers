import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(duration);
dayjs.extend(advancedFormat);

export function getDetailedTimeDisplay(timer, now) {
    const target = timer.isRecurring && timer.date < now ? timer.nextDate : timer.date;
    const diff = dayjs.duration(Math.abs(target - now));

    const parts = [
        { V: diff.years(), L: 'year' },
        { V: diff.months(), L: 'month' },
        { V: diff.days(), L: 'day' },
        { V: diff.hours(), L: 'hour' },
        { V: diff.minutes(), L: 'minute' },
        { V: diff.seconds(), L: 'second' },
    ];

    const P = parts.filter(p => p.V > 0);
    if (timer.isCountdown && !timer.isRecurring && (timer.date - now) <= 0) return 'Timer Completed';
    if (P.length === 0) return '0 seconds';

    return P.map((p, i) => {
        const L = p.V === 1 ? p.L : p.L + 's';
        const S = i === P.length - 1 ? '' : i === P.length - 2 ? ' and ' : ', ';
        return `${p.V} ${L}${S}`;
    }).join('');
}

export function calculateNextOccurrence(timer, now) {
    if (!timer.isRecurring || !timer.recurrenceInterval) {
        return { nextDate: timer.date, recurrenceCount: 0 };
    }

    const [count, unit] = timer.recurrenceInterval.split(' ');
    const countNum = parseInt(count, 10) || 1;
    const unitClean = unit.toLowerCase().replace(/s$/, '');

    const startDate = dayjs(timer.date);
    const nowDate = dayjs(now);

    // If current time is before the start date, return the original date
    if (nowDate.isBefore(startDate)) {
        return { nextDate: timer.date, recurrenceCount: 0 };
    }

    // Calculate how many complete intervals have passed since start
    const diff = nowDate.diff(startDate, unitClean, true); // true for floating point
    const intervalsPassed = Math.floor(diff / countNum);

    // Calculate the next occurrence date
    const nextDate = startDate.add((intervalsPassed + 1) * countNum, unitClean);

    return {
        nextDate: nextDate.valueOf(),
        recurrenceCount: intervalsPassed + 1 // This should be the count of occurrences, not intervals passed
    };
}

export function calculateProgress(TMR, NOW) {
    if (!TMR.isCountdown) return 0;

    const NOWD = dayjs(NOW);

    if (!TMR.isRecurring) {
        // For non-recurring timers
        const BASE = dayjs(TMR.date);
        const TARGET = BASE;

        if (NOWD.isAfter(TARGET)) {
            return 100; // Timer completed
        }

        // This doesn't make much sense for non-recurring countdown timers
        // as there's no "start" point to calculate progress from
        return 0;
    }

    // For recurring timers
    const TARGET = dayjs(TMR.date < NOW ? TMR.nextDate : TMR.date);

    // Parse recurrence interval
    const PARTS = (TMR.recurrenceInterval || '').split(' ');
    if (PARTS.length !== 2 || isNaN(PARTS[0])) return 0;

    const C = parseInt(PARTS[0]);
    const U = PARTS[1].toLowerCase().replace(/s$/, '');

    // Calculate the previous occurrence (start of current cycle)
    const PREV = TARGET.subtract(C, U);

    // If current time is before the cycle start, progress is 0
    if (NOWD.isBefore(PREV)) {
        return 0;
    }

    // If current time is after the target, progress is 100
    if (NOWD.isAfter(TARGET)) {
        return 100;
    }

    const TOT = TARGET.diff(PREV);
    const ELAPSED = NOWD.diff(PREV);

    return Math.max(0, Math.min(100, (ELAPSED / TOT) * 100));
}

export function getFormattedDate(TMR, NOW) {
    let BASE;

    if (TMR.isRecurring && dayjs(TMR.date).isBefore(NOW)) {
        // For recurring timers that have passed their original date,
        // we need to calculate the next occurrence
        const result = calculateNextOccurrence(TMR, NOW.valueOf());
        BASE = result.nextDate;
    } else {
        BASE = TMR.date;
    }

    return dayjs(BASE).format('ddd, MMM D, YYYY • hh:mm A');
}

export function getTimeParts(timer, now) {
    let target;

    if (timer.isRecurring && timer.date < now) {
        // For recurring timers past their original date, use nextDate
        target = timer.nextDate;
    } else {
        // For non-recurring or future recurring timers, use original date
        target = timer.date;
    }

    const diff = timer.isCountdown
        ? Math.max(0, target - now) // Countdown: time remaining
        : Math.abs(now - timer.date); // Elapsed: time since original date

    const duration = dayjs.duration(diff);

    return [
        duration.years(),
        duration.months(),
        duration.days(),
        duration.hours(),
        duration.minutes(),
        duration.seconds()
    ];
}

export const getChippedTime = (unit, timeParts) => {
    const [years, months, days, hours, minutes, seconds] = timeParts;

    // Create a duration from parts
    const duration = dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds
    });

    switch (unit) {
        case 'years': return duration.asYears().toFixed(2);
        case 'months': return duration.asMonths().toFixed(2);
        case 'days': return duration.asDays().toFixed(2);
        case 'hours': return duration.asHours().toFixed(2);
        case 'minutes': return duration.asMinutes().toFixed(2);
        case 'seconds': return duration.asSeconds().toFixed(0);
        default: return '';
    }
};

export const getReminderOffset = (secondsUntilEnd) => {
    const duration = dayjs.duration(secondsUntilEnd, 'seconds');

    if (duration.asDays() > 14) return dayjs.duration(2, 'days').asSeconds();
    if (duration.asDays() > 7) return dayjs.duration(1, 'day').asSeconds();
    if (duration.asDays() > 1) return dayjs.duration(6, 'hours').asSeconds();
    if (duration.asHours() > 6) return dayjs.duration(2, 'hours').asSeconds();
    if (duration.asHours() > 1) return dayjs.duration(30, 'minutes').asSeconds();
    if (duration.asMinutes() > 10) return dayjs.duration(5, 'minutes').asSeconds();
    if (duration.asMinutes() > 1) return 30;
    return 0;
};