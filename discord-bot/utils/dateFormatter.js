const moment = require('moment-timezone');
const config = require('../config');

/**
 * Format date for display in reminders
 * @param {Date} date - Date to format
 * @param {boolean} relative - Whether to show relative dates (Tomorrow, In 2 days)
 * @returns {string} Formatted date string
 */
function formatDate(date, relative = true) {
    const timezone = config.bot.timezone;
    const now = moment().tz(timezone);
    const target = moment(date).tz(timezone);

    const daysDiff = target.diff(now, 'days');

    if (relative) {
        if (daysDiff === 0) return 'Today';
        if (daysDiff === 1) return 'Tomorrow';
        if (daysDiff > 1 && daysDiff < 7) return `In ${daysDiff} days`;
    }

    // Format: "Mon, 10 Feb" or "Feb 10"
    return target.format('ddd, D MMM');
}

/**
 * Calculate next reminder date based on frequency
 * @param {string} frequency - Reminder frequency
 * @param {Date} fromDate - Starting date (default: now)
 * @returns {Date} Next reminder date
 */
function calculateNextReminder(frequency, fromDate = new Date()) {
    const timezone = config.bot.timezone;
    const frequencies = config.frequencies;

    let nextDate = moment(fromDate).tz(timezone);

    // Add days based on frequency
    const daysToAdd = frequencies[frequency] || 1;
    nextDate.add(daysToAdd, 'days');

    // Set to 12:00 AM IST
    nextDate.startOf('day');

    return nextDate.toDate();
}

/**
 * Get current time in IST
 * @returns {moment.Moment} Current time in IST
 */
function getCurrentTimeIST() {
    return moment().tz(config.bot.timezone);
}

/**
 * Check if it's time to send reminders (12:00 AM IST)
 * @returns {boolean} True if current time matches reminder time
 */
function isReminderTime() {
    const now = getCurrentTimeIST();
    const [hour, minute] = config.bot.reminderTime.split(':').map(Number);

    return now.hour() === hour && now.minute() === minute;
}

/**
 * Format frequency for display
 * @param {string} frequency - Frequency key
 * @returns {string} Human-readable frequency
 */
function formatFrequency(frequency) {
    const frequencyMap = {
        daily: 'Daily',
        every2days: 'Every 2 Days',
        every3days: 'Every 3 Days',
        weekly: 'Weekly',
        biweekly: 'Bi-weekly',
        monthly: 'Monthly',
    };

    return frequencyMap[frequency] || frequency;
}

module.exports = {
    formatDate,
    calculateNextReminder,
    getCurrentTimeIST,
    isReminderTime,
    formatFrequency,
};
