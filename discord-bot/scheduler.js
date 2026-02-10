const cron = require('node-cron');
const moment = require('moment-timezone');
const Reminder = require('./models/Reminder');
const UserPreferences = require('./models/UserPreferences');
const { getMessage } = require('./utils/personality');
const { calculateNextReminder, formatDate, getCurrentTimeIST } = require('./utils/dateFormatter');
const { getPartnerId } = require('./utils/partnerUtils');
const config = require('./config');

/**
 * Reminder scheduler - runs daily at 12:00 AM IST
 * Checks all reminders and sends those that are due
 */
async function initializeScheduler(client) {
    console.log('✓ Reminder scheduler initialized');
    console.log(`  Will run daily at ${config.bot.reminderTime} IST`);

    // Schedule: '0 0 * * *' = Every day at 00:00 (midnight)
    // Cron format: minute hour day month weekday
    cron.schedule('0 0 * * *', async () => {
        console.log(`[${getCurrentTimeIST().format()}] Running daily reminder check...`);
        await sendDueReminders(client);
    }, {
        timezone: config.bot.timezone
    });

    // For testing: also allow manual trigger
    // Uncomment this line to test reminders every minute:
    // cron.schedule('* * * * *', async () => await sendDueReminders(client));
}

/**
 * Find and send all due reminders
 */
async function sendDueReminders(client) {
    try {
        const now = getCurrentTimeIST().toDate();

        // Find all reminders that are due (nextReminder <= now)
        const dueReminders = await Reminder.find({
            nextReminder: { $lte: now }
        });

        console.log(`  Found ${dueReminders.length} due reminders`);

        if (dueReminders.length === 0) {
            return;
        }

        // Group reminders by user (and include partners)
        const userReminders = new Map();

        for (const reminder of dueReminders) {
            const userId = reminder.userId;

            // Add to reminder owner's list
            if (!userReminders.has(userId)) {
                userReminders.set(userId, []);
            }
            userReminders.get(userId).push(reminder);

            // Also add to partner's list if exists
            const partnerId = await getPartnerId(userId);
            if (partnerId) {
                if (!userReminders.has(partnerId)) {
                    userReminders.set(partnerId, []);
                }
                // Only add if not already in partner's list
                const partnerList = userReminders.get(partnerId);
                if (!partnerList.find(r => r._id.equals(reminder._id))) {
                    userReminders.get(partnerId).push(reminder);
                }
            }
        }

        // Send reminders to each user
        for (const [userId, reminders] of userReminders) {
            await sendUserReminders(client, userId, reminders);
        }

        console.log(`  Sent reminders to ${userReminders.size} users`);

    } catch (error) {
        console.error('Error sending reminders:', error);
    }
}

/**
 * Send reminders to a specific user
 */
async function sendUserReminders(client, userId, reminders) {
    try {
        // Get user preferences
        const prefs = await UserPreferences.findOne({ userId }) || { honorific: 'Master' };

        // Try to DM the user
        const user = await client.users.fetch(userId);
        if (!user) {
            console.warn(`  User ${userId} not found`);
            return;
        }

        // Build reminder message
        const header = await getMessage('reminders', 'dailyHeader', { honorific: prefs.honorific });
        let message = header;

        for (const reminder of reminders) {
            const hasDup = await reminder.hasDuplicates();
            const displayName = hasDup
                ? `${reminder.itemName} #${reminder.serialNumber}`
                : reminder.itemName;

            // Check if this is a partner's item
            const isPartnerItem = reminder.userId !== userId;
            const ownerTag = isPartnerItem ? ' 👥' : '';

            message += `\n📌 **${displayName}${ownerTag}**`;

            // Only update reminder if this is the owner
            if (!isPartnerItem) {
                reminder.lastReminded = new Date();
                reminder.nextReminder = calculateNextReminder(reminder.frequency, new Date());
                await reminder.save();
            }
        }

        const footer = await getMessage('reminders', 'footer', {
            honorific: prefs.honorific,
            count: reminders.length,
        });
        message += footer;

        // Send DM
        try {
            await user.send(message);
            console.log(`  ✓ Sent ${reminders.length} reminders to ${user.tag}`);
        } catch (dmError) {
            console.warn(`  ✗ Could not DM ${user.tag}: ${dmError.message}`);
            // Optionally: Try to send in a server channel if DMs are disabled
        }

    } catch (error) {
        console.error(`Error sending reminders to user ${userId}:`, error);
    }
}

/**
 * Manual trigger for testing (can call from command)
 */
async function triggerRemindersNow(client) {
    console.log('[Manual Trigger] Sending due reminders...');
    await sendDueReminders(client);
}

module.exports = {
    initializeScheduler,
    triggerRemindersNow,
};
