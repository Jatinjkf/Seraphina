const { ChannelType } = require('discord.js');

/**
 * Parse image message to extract item name and frequency
 * Format: "Item Name [frequency]" or just "Item Name"
 * @param {string} content - Message content
 * @returns {object} - { itemName, frequency }
 */
function parseImageMessage(content) {
    // Extract frequency if specified in brackets: [daily], [weekly], etc.
    const frequencyMatch = content.match(/\[(daily|every2days|every3days|weekly|biweekly|monthly)\]/i);

    let frequency = 'daily'; // Default
    let itemName = content.trim();

    if (frequencyMatch) {
        frequency = frequencyMatch[1].toLowerCase();
        // Remove the frequency tag from item name
        itemName = content.replace(/\[.*?\]/g, '').trim();
    }

    return { itemName, frequency };
}

/**
 * Check if channel is a learning channel
 * @param {Channel} channel
 * @param {string} userId
 * @returns {boolean}
 */
async function isLearningChannel(channel, userId) {
    const UserPreferences = require('../models/UserPreferences');

    const prefs = await UserPreferences.findOne({ userId });

    if (!prefs || !prefs.learningChannelId) {
        return false;
    }

    return channel.id === prefs.learningChannelId;
}

/**
 * Copy image to storage channel (or use original if not configured)
 * @param {Message} message - Original message with attachment
 * @param {Client} client - Discord client
 * @returns {Object} - { channelId, messageId } for storage
 */
async function copyToStorageChannel(message, client) {
    const GuildSettings = require('../models/GuildSettings');

    // Get storage channel ID for THIS guild
    const storageChannelId = await GuildSettings.getStorageChannel(message.guild.id);

    // If storage channel not configured for this guild, use original message location
    if (!storageChannelId) {
        console.log(`⚠️ Storage channel not configured for guild ${message.guild.name} - using original message location`);
        return {
            channelId: message.channel.id,
            messageId: message.id,
        };
    }

    const storageChannel = await client.channels.fetch(storageChannelId);

    if (!storageChannel) {
        console.log(`⚠️ Storage channel not found for guild ${message.guild.name} - using original message location`);
        return {
            channelId: message.channel.id,
            messageId: message.id,
        };
    }

    // Verify storage channel is in the same guild
    if (storageChannel.guild.id !== message.guild.id) {
        console.warn(`⚠️ Storage channel is in different guild! Using original message location`);
        return {
            channelId: message.channel.id,
            messageId: message.id,
        };
    }

    // Verify bot has required permissions in storage channel
    const permissions = storageChannel.permissionsFor(client.user);
    if (!permissions || !permissions.has('SendMessages') || !permissions.has('AttachFiles')) {
        console.warn(`⚠️ Bot lacks permissions in storage channel ${storageChannelId} (needs SendMessages + AttachFiles)`);
        return {
            channelId: message.channel.id,
            messageId: message.id,
        };
    }

    // Get the attachment
    const attachment = message.attachments.first();

    if (!attachment) {
        throw new Error('No attachment found');
    }

    // Send to storage channel with metadata
    const storageMessage = await storageChannel.send({
        content: `**User:** ${message.author.tag} (${message.author.id})\n**Server:** ${message.guild.name}\n**Original:** ${message.url}`,
        files: [attachment.url],
    });

    return {
        channelId: storageMessage.channel.id,
        messageId: storageMessage.id,
    };
}

/**
 * Delete message after delay
 * @param {Message} message
 * @param {number} delayMs - Delay in milliseconds
 */
async function deleteAfterDelay(message, delayMs = 60000) {
    setTimeout(async () => {
        try {
            if (message.deletable) {
                await message.delete();
            }
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    }, delayMs);
}

/**
 * Update pinned ledger message
 * @param {Channel} channel
 * @param {string} userId
 */
async function updateLedger(channel, userId) {
    const Reminder = require('../models/Reminder');
    const { formatDate } = require('./dateFormatter');
    const { getMaidName } = require('./personality');
    const { getUserAndPartner } = require('./partnerUtils');

    // Get user and partner IDs
    const userIds = await getUserAndPartner(userId);
    const isPartnership = userIds.length > 1;

    // Get all reminders for user (and partner if exists)
    const reminders = await Reminder.find({
        userId: { $in: userIds }
    }).sort({ frequency: 1, itemName: 1 });

    if (reminders.length === 0) {
        return; // No ledger needed if no items
    }

    // Group by frequency
    const grouped = {};
    for (const reminder of reminders) {
        if (!grouped[reminder.frequency]) {
            grouped[reminder.frequency] = [];
        }

        const hasDup = await reminder.hasDuplicates();
        const displayName = hasDup
            ? `${reminder.itemName} #${reminder.serialNumber}`
            : reminder.itemName;

        grouped[reminder.frequency].push({
            name: displayName,
            next: formatDate(reminder.nextReminder),
            userId: reminder.userId // For ownership emoji
        });
    }

    // Build ledger message
    const maidName = await getMaidName();

    let menu = '```\n';
    menu += '╔═══════════════════════════════════════════╗\n';
    menu += '║    🎀 SERAPHINA\'S SERVICE MENU 🎀         ║\n';

    if (isPartnership) {
        // Get both user names and truncate to fit
        const userIds = await getUserAndPartner(userId, channel.guild.id);
        const users = await Promise.all(
            userIds.map(id => channel.client.users.fetch(id).catch(() => null))
        );

        const name1 = users[0] ? users[0].username.substring(0, 10) : 'User';
        const name2 = users[1] ? users[1].username.substring(0, 10) : 'Partner';

        const partnershipText = `${name1} & ${name2}`;
        const paddedText = partnershipText.length > 37
            ? partnershipText.substring(0, 34) + '...'
            : partnershipText.padEnd(37, ' ');

        menu += '║                                           ║\n';
        menu += `║  👥 ${paddedText}  ║\n`;

        // Add emoji legend
        const { getPartnershipEmoji } = require('./partnershipEmojiUtils');
        const emoji1 = await getPartnershipEmoji(userIds[0], channel.guild.id) || '•';
        const emoji2 = await getPartnershipEmoji(userIds[1], channel.guild.id) || '•';
        const legend = `${emoji1} ${name1} | ${emoji2} ${name2}`;
        const paddedLegend = legend.padEnd(37, ' ');
        menu += `║     ${paddedLegend}  ║\n`;
    }

    menu += '╠═══════════════════════════════════════════╣\n';
    menu += '║                                           ║\n';

    // Frequency titles and icons
    const frequencyConfig = {
        daily: { icon: '📌', title: 'DAILY' },
        every2days: { icon: '📍', title: 'EVERY 3 DAYS' },
        every3days: { icon: '📅', title: 'EVERY 3 DAYS' },
        weekly: { icon: '📆', title: 'WEEKLY' },
        biweekly: { icon: '🗓️', title: 'BI-WEEKLY' },
        monthly: { icon: '📋', title: 'MONTHLY' }
    };

    // Order frequencies
    const frequencyOrder = ['daily', 'every2days', 'every3days', 'weekly', 'biweekly', 'monthly'];

    for (const freq of frequencyOrder) {
        const items = grouped[freq];
        if (items && items.length > 0) {
            const config = frequencyConfig[freq];

            // Section header
            menu += `║  ${config.icon} ${config.title.padEnd(37, ' ')}║\n`;

            // Items
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const isLast = i === items.length - 1;
                const prefix = isLast ? '└─' : '├─';

                // Format: "├─ name...........date"
                // NO emoji in channel ledger (shared view, no personal context)
                const maxNameLength = 28;
                let itemText = item.name;
                if (itemText.length > maxNameLength) {
                    itemText = itemText.substring(0, maxNameLength - 3) + '...';
                }

                const dots = '.'.repeat(Math.max(1, maxNameLength - itemText.length));
                const line = `  ${prefix} ${itemText}${dots}${item.next}`;

                menu += `║${line.padEnd(43, ' ')}║\n`;
            }

            menu += '║                                           ║\n';
        }
    }

    // Footer with random motivational quote (full quote, no truncation)
    const { responses } = require('./personality');
    const randomQuote = responses.ledgerQuotes[Math.floor(Math.random() * responses.ledgerQuotes.length)];

    menu += '╠═══════════════════════════════════════════╣\n';

    // Word wrap the quote to fit width (43 chars per line)
    const quoteWidth = 41; // Account for "║ " prefix and " ║" suffix
    const words = randomQuote.split(' ');
    let currentLine = '';
    const quoteLines = [];

    for (const word of words) {
        if ((currentLine + word).length <= quoteWidth) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            if (currentLine) quoteLines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) quoteLines.push(currentLine);

    // Add quote lines to menu
    for (const line of quoteLines) {
        menu += `║ ${line.padEnd(quoteWidth, ' ')} ║\n`;
    }

    menu += '╚═══════════════════════════════════════════╝\n';
    menu += '```';

    if (isPartnership) {
        // Add partnership legend outside the code block
        ledgerText += '\n\n*👥 = Partner\'s item*';
    }

    // Check if primary user is Pro subscriber (AFTER quote, for solo learning)
    if (!isPartnership && userId) {
        const Subscription = require('../models/Subscription');
        const userSub = await Subscription.findOne({ userId });
        const isPro = userSub && userSub.isPro();

        // Add footer message based on subscription status
        if (isPro) {
            // Pro user - show thankful maid message
            ledgerText += '\n\n*🎀 Your devoted maid is honored to serve you, Master~ This maid shall forever cherish your patronage! ✨*';
        } else {
            // Free user - show upgrade message (NO PRICE)
            ledgerText += '\n\n*💎 Upgrade to Seraphina Pro for unlimited items! Use* `/subscribe` *~*';
        }
    }

    // Smart ledger update: edit if recent, resend if buried
    try {
        // Fetch recent messages (last 20)
        const recentMessages = await channel.messages.fetch({ limit: 20 });

        // Find existing ledger message
        const existingLedger = recentMessages.find(m =>
            m.author.id === channel.client.user.id &&
            m.content.includes("SERAPHINA'S SERVICE MENU")
        );

        if (existingLedger) {
            // Found recent ledger - edit it
            await existingLedger.edit(ledgerText);
            console.log(`✓ Updated learning ledger in #${channel.name}`);
        } else {
            // No recent ledger found - send new one
            await channel.send(ledgerText);
            console.log(`✓ Sent fresh learning ledger to #${channel.name}`);
        }
    } catch (error) {
        console.error('Error updating ledger:', error);
        // Fallback: just send new message
        try {
            await channel.send(ledgerText);
        } catch (sendError) {
            console.error('Could not send ledger:', sendError);
        }
    }
}

module.exports = {
    parseImageMessage,
    isLearningChannel,
    copyToStorageChannel,
    deleteAfterDelay,
    updateLedger,
};
