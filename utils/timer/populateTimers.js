import dayjs from 'dayjs';

export async function populateTimers(timerManager, options = {}) {
    const { countdownCount = 5, countupCount = 5 } = options;

    // Get existing timers to understand current state
    const existingTimers = timerManager.getAllTimers();

    // Analyze existing timers
    const existingCountdowns = existingTimers.filter(t => t.isCountdown);
    const existingCountups = existingTimers.filter(t => !t.isCountdown);

    // Find boundary dates for intelligent positioning
    const { latestCountdownDate, earliestCountupDate } = findBoundaryDates(
        existingCountdowns,
        existingCountups
    );

    console.log(`📊 Creating ${countdownCount} countdown and ${countupCount} countup timers`);
    console.log(`📅 Latest countdown: ${latestCountdownDate ? dayjs(latestCountdownDate).format('YYYY-MM-DD HH:mm') : 'none'}`);
    console.log(`📅 Earliest countup: ${earliestCountupDate ? dayjs(earliestCountupDate).format('YYYY-MM-DD HH:mm') : 'none'}`);

    const createdTimers = [];

    // Create countdown timers (future dates)
    for (let i = 0; i < countdownCount; i++) {
        const countdownTimer = await createCountdownTimer(timerManager, i, latestCountdownDate);
        if (countdownTimer) {
            createdTimers.push(countdownTimer);
        }
    }

    // Create countup timers (past dates)
    for (let i = 0; i < countupCount; i++) {
        const countupTimer = await createCountupTimer(timerManager, i, earliestCountupDate);
        if (countupTimer) {
            createdTimers.push(countupTimer);
        }
    }

    console.log(`✅ Successfully created ${createdTimers.length} timers`);
    return createdTimers;
}

/**
 * Find boundary dates from existing timers
 */
function findBoundaryDates(existingCountdowns, existingCountups) {
    let latestCountdownDate = null;
    let earliestCountupDate = null;

    // Find the latest countdown date (furthest future date)
    existingCountdowns.forEach(timer => {
        const effectiveDate = timer.getEffectiveDate();
        if (!latestCountdownDate || dayjs(effectiveDate).isAfter(dayjs(latestCountdownDate))) {
            latestCountdownDate = effectiveDate;
        }
    });

    // Find the earliest countup date (furthest past date)
    existingCountups.forEach(timer => {
        const timerDate = timer.date;
        if (!earliestCountupDate || dayjs(timerDate).isBefore(dayjs(earliestCountupDate))) {
            earliestCountupDate = timerDate;
        }
    });

    return { latestCountdownDate, earliestCountupDate };
}

/**
 * Create a realistic countdown timer
 */
async function createCountdownTimer(timerManager, index, latestCountdownDate) {
    try {
        // Calculate base date - start from latest existing countdown or now
        const baseDate = latestCountdownDate ? dayjs(latestCountdownDate) : dayjs();

        // Generate future dates with varying intervals
        const minutesToAdd = generateCountdownInterval(index);
        const targetDate = baseDate.add(minutesToAdd, 'minute');

        const countdownTemplates = [
            {
                title: "Team Meeting Prep",
                personName: "Sarah Chen",
                priority: "high",
                isRecurring: true,
                recurrenceInterval: "1 week"
            },
            {
                title: "Project Deadline",
                personName: "Alex Rodriguez",
                priority: "high",
                isRecurring: false
            },
            {
                title: "Lunch Break",
                personName: null,
                priority: "normal",
                isRecurring: true,
                recurrenceInterval: "1 day"
            },
            {
                title: "Client Call",
                personName: "Emily Johnson",
                priority: "high",
                isRecurring: false
            },
            {
                title: "Code Review Session",
                personName: "Michael Park",
                priority: "normal",
                isRecurring: true,
                recurrenceInterval: "3 days"
            },
            {
                title: "Workout Time",
                personName: null,
                priority: "low",
                isRecurring: true,
                recurrenceInterval: "2 days"
            },
            {
                title: "Weekly Report Due",
                personName: "Lisa Wang",
                priority: "normal",
                isRecurring: true,
                recurrenceInterval: "1 week"
            },
            {
                title: "Doctor Appointment",
                personName: null,
                priority: "high",
                isRecurring: false
            }
        ];

        const template = countdownTemplates[index % countdownTemplates.length];

        const timerData = {
            title: template.title,
            personName: template.personName,
            priority: template.priority,
            date: targetDate.toDate(),
            isFavourite: Math.random() > 0.7, // 30% chance of being favourite
            isRecurring: template.isRecurring,
            recurrenceInterval: template.recurrenceInterval,
            isCountdown: true
        };

        const timer = await timerManager.addTimer(timerData);
        console.log(`⏰ Created countdown: "${timer.title}" at ${dayjs(timer.date).format('MMM DD, HH:mm')}`);

        return timer;
    } catch (error) {
        console.error(`❌ Failed to create countdown timer ${index}:`, error);
        return null;
    }
}

/**
 * Create a realistic countup timer (past event)
 */
async function createCountupTimer(timerManager, index, earliestCountupDate) {
    try {
        // Calculate base date - start from earliest existing countup or go back from now
        const baseDate = earliestCountupDate ? dayjs(earliestCountupDate) : dayjs();

        // Generate past dates with varying intervals
        const minutesToSubtract = generateCountupInterval(index);
        const targetDate = baseDate.subtract(minutesToSubtract, 'minute');

        const countupTemplates = [
            {
                title: "Morning Run",
                personName: null,
                priority: "low"
            },
            {
                title: "Study Session",
                personName: "Jordan Smith",
                priority: "normal"
            },
            {
                title: "Meditation Time",
                personName: null,
                priority: "low"
            },
            {
                title: "Project Planning",
                personName: "David Kim",
                priority: "normal"
            },
            {
                title: "Reading Time",
                personName: null,
                priority: "low"
            },
            {
                title: "Team Retrospective",
                personName: "Rachel Green",
                priority: "normal"
            },
            {
                title: "Cooking Practice",
                personName: null,
                priority: "low"
            },
            {
                title: "Language Learning",
                personName: "Carlos Martinez",
                priority: "normal"
            }
        ];

        const template = countupTemplates[index % countupTemplates.length];

        const timerData = {
            title: template.title,
            personName: template.personName,
            priority: template.priority,
            date: targetDate.toDate(),
            isFavourite: Math.random() > 0.8, // 20% chance of being favourite
            isRecurring: false, // Countup timers are typically not recurring
            recurrenceInterval: null,
            isCountdown: false
        };

        const timer = await timerManager.addTimer(timerData);
        console.log(`⏱️ Created countup: "${timer.title}" from ${dayjs(timer.date).format('MMM DD, HH:mm')}`);

        return timer;
    } catch (error) {
        console.error(`❌ Failed to create countup timer ${index}:`, error);
        return null;
    }
}

/**
 * Generate realistic intervals for countdown timers
 */
function generateCountdownInterval(index) {
    const intervals = [
        15,      // 15 minutes
        30,      // 30 minutes  
        60,      // 1 hour
        120,     // 2 hours
        240,     // 4 hours
        480,     // 8 hours
        720,     // 12 hours
        1440,    // 1 day
        2880,    // 2 days
        4320     // 3 days
    ];

    // Use index to create consistent but varied intervals
    const baseInterval = intervals[index % intervals.length];

    // Add some randomness (±20%) to make it more realistic
    const variance = Math.random() * 0.4 - 0.2; // -20% to +20%
    const finalInterval = Math.floor(baseInterval * (1 + variance));

    // Ensure minimum of 5 minutes
    return Math.max(finalInterval, 5);
}

/**
 * Generate realistic intervals for countup timers (past events)
 */
function generateCountupInterval(index) {
    const intervals = [
        30,      // 30 minutes ago
        90,      // 1.5 hours ago
        180,     // 3 hours ago
        360,     // 6 hours ago
        720,     // 12 hours ago
        1440,    // 1 day ago
        2880,    // 2 days ago
        4320,    // 3 days ago
        7200,    // 5 days ago
        10080    // 1 week ago
    ];

    const baseInterval = intervals[index % intervals.length];

    // Add randomness for realistic variation
    const variance = Math.random() * 0.3 - 0.15; // -15% to +15%
    const finalInterval = Math.floor(baseInterval * (1 + variance));

    return Math.max(finalInterval, 10);
}

/**
 * Utility function to populate timers with custom templates
 */
export async function populateTimersWithCustomData(timerManager, customTimers) {
    const createdTimers = [];

    for (const timerData of customTimers) {
        try {
            // Validate required fields
            if (!timerData.title || !timerData.date) {
                console.warn('⚠️ Skipping invalid timer data:', timerData);
                continue;
            }

            // Ensure proper date format
            const processedData = {
                ...timerData,
                date: dayjs(timerData.date).toDate(),
                isCountdown: timerData.isCountdown !== false, // Default to true
                isFavourite: timerData.isFavourite || false,
                isRecurring: timerData.isRecurring || false,
                priority: timerData.priority || 'normal'
            };

            const timer = await timerManager.addTimer(processedData);
            createdTimers.push(timer);

            console.log(`✅ Created custom timer: "${timer.title}"`);
        } catch (error) {
            console.error('❌ Failed to create custom timer:', error);
        }
    }

    return createdTimers;
}

/**
 * Quick function to clear and repopulate all timers
 */
export async function resetAndPopulate(timerManager, options = {}) {
    console.log('🧹 Clearing existing timers...');
    await timerManager.clearAllTimers();

    console.log('📝 Populating with new test data...');
    return await populateTimers(timerManager, options);
}