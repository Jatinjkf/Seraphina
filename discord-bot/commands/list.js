const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const Reminder = require('../models/Reminder');
const Partnership = require('../models/Partnership');
const Subscription = require('../models/Subscription');
const { getAffiliateAd } = require('../utils/affiliateUtils');
const { getMessage } = require('../utils/messageProvider');
const { formatDate } = require('../utils/dateFormatter');
const { getUserAndPartner } = require('../utils/partnerUtils');
const UserPreferences = require('../models/UserPreferences');

const ITEMS_PER_PAGE = 20;
const BUTTON_TIMEOUT = 5 * 60 * 1000; // 5 minutes

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('View your learning ledger'),

    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        // Get user IDs (user + partner if exists)
        const userIds = await getUserAndPartner(userId, guildId);
        const isPartnership = userIds.length > 1;

        // Fetch all reminders for user and partner IN THIS GUILD
        const allReminders = await Reminder.find({
            userId: { $in: userIds },
            guildId
        }).sort({ nextReminder: 1 });

        if (allReminders.length === 0) {
            const message = await getMessage('list', 'empty');
            return interaction.editReply(message);
        }

        // Build display data for all reminders
        const reminderData = [];
        for (const reminder of allReminders) {
            const hasDup = await reminder.hasDuplicates();
            const displayName = hasDup
                ? `${reminder.itemName} #${reminder.serialNumber}`
                : reminder.itemName;

            reminderData.push({
                name: displayName,
                next: formatDate(reminder.nextReminder),
                frequency: reminder.frequency,
                userId: reminder.userId // Store owner for emoji indicator
            });
        }

        // Calculate total pages
        const totalPages = Math.ceil(reminderData.length / ITEMS_PER_PAGE);
        let currentPage = 0;

        // Function to build menu for a specific page
        const buildMenu = (page) => {
            const startIdx = page * ITEMS_PER_PAGE;
            const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, reminderData.length);
            const pageReminders = reminderData.slice(startIdx, endIdx);

            // Group reminders by frequency
            const grouped = {
                daily: [],
                every2days: [],
                every3days: [],
                weekly: [],
                biweekly: [],
                monthly: []
            };

            for (const item of pageReminders) {
                grouped[item.frequency].push(item);
            }

            // Build elegant menu format
            let menu = '╔═══════════════════════════════════════════╗\n';
            menu += '║    🎀 SERAPHINA\'S SERVICE MENU 🎀         ║\n';

            // Show partnership if exists (truncate names to fit)
            if (isPartnership) {
                const partnerUser = interaction.client.users.cache.get(userIds.find(id => id !== userId));
                const currentUserName = interaction.user.username.substring(0, 10);
                const partnerName = partnerUser ? partnerUser.username.substring(0, 10) : 'Partner';

                // Format: "Master Name1 & Master Name2" but fit in 37 chars
                const partnershipText = `${currentUserName} & ${partnerName}`;
                const paddedText = partnershipText.length > 37
                    ? partnershipText.substring(0, 34) + '...'
                    : partnershipText.padEnd(37, ' ');

                menu += '║                                           ║\n';
                menu += `║  👥 ${paddedText}  ║\n`;

                // Add emoji legend
                const { getPartnershipEmoji } = require('../utils/partnershipEmojiUtils');
                const userEmoji = await getPartnershipEmoji(userId, guildId) || '•';
                const partnerEmoji = await getPartnershipEmoji(userIds.find(id => id !== userId), guildId) || '•';
                const legend = `${userEmoji} ${currentUserName} | ${partnerEmoji} ${partnerName}`;
                const paddedLegend = legend.padEnd(37, ' ');
                menu += `║     ${paddedLegend}  ║\n`;
            }


            // Only show page indicator if multiple pages
            if (totalPages > 1) {
                menu += '╠═══════════════════════════════════════════╣\n';
                menu += `║  Page ${page + 1}/${totalPages} • ${reminderData.length} items total${' '.repeat(Math.max(0, 17 - String(reminderData.length).length - String(totalPages).length))}║\n`;
            }

            menu += '╠═══════════════════════════════════════════╣\n';
            menu += '║                                           ║\n';

            // Frequency titles and icons
            const frequencyConfig = {
                daily: { icon: '📌', title: 'DAILY ITEMS' },
                every2days: { icon: '📍', title: 'EVERY 2 DAYS' },
                every3days: { icon: '📅', title: 'EVERY 3 DAYS' },
                weekly: { icon: '📆', title: 'WEEKLY' },
                biweekly: { icon: '🗓️', title: 'BI-WEEKLY' },
                monthly: { icon: '📋', title: 'MONTHLY' }
            };

            // Order frequencies
            const frequencyOrder = ['daily', 'every2days', 'every3days', 'weekly', 'biweekly', 'monthly'];

            for (const freq of frequencyOrder) {
                if (grouped[freq] && grouped[freq].length > 0) {
                    const config = frequencyConfig[freq];

                    // Section header
                    menu += `║  ${config.icon} ${config.title.padEnd(37, ' ')}║\n`;

                    // Items
                    for (let i = 0; i < grouped[freq].length; i++) {
                        const item = grouped[freq][i];
                        const isLast = i === grouped[freq].length - 1;
                        const prefix = isLast ? '└─' : '├─';

                        // Add ownership indicator emoji (fixed per partnership)
                        let ownerEmoji = '';
                        if (isPartnership) {
                            const { getItemOwnerEmoji } = require('../utils/partnershipEmojiUtils');
                            ownerEmoji = await getItemOwnerEmoji(item.userId, guildId) || '•';
                        }

                        // Format: "├─ 🔵 name...........date"
                        const maxNameLength = isPartnership ? 24 : 28;
                        let itemText = item.name;
                        if (itemText.length > maxNameLength) {
                            itemText = itemText.substring(0, maxNameLength - 3) + '...';
                        }

                        const dots = '.'.repeat(Math.max(1, maxNameLength - itemText.length));
                        const line = isPartnership
                            ? `  ${prefix} ${ownerEmoji} ${itemText}${dots}${item.next}`
                            : `  ${prefix} ${itemText}${dots}${item.next}`;

                        menu += `║${line.padEnd(43, ' ')}║\n`;
                    }

                    menu += '║                                           ║\n';
                }
            }

            // Footer with random motivational quote (full quote, no truncation)
            const { responses } = require('../utils/personality');
            const randomQuote = responses.ledgerQuotes[Math.floor(Math.random() * responses.ledgerQuotes.length)];

            menu += '╠═══════════════════════════════════════════╣\n';

            // Word wrap the quote to fit width (43 chars per line)
            const maxWidth = 41; // Inside the box borders
            const words = randomQuote.split(' ');
            let currentLine = '';
            const lines = [];

            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                if (testLine.length <= maxWidth) {
                    currentLine = testLine;
                } else {
                    if (currentLine) lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) lines.push(currentLine);

            // Add quote lines
            for (const line of lines) {
                menu += `║  ${line.padEnd(maxWidth, ' ')}║\n`;
            }

            menu += '╚═══════════════════════════════════════════╝\n';
            menu += '```';

            return menu;
        };

        // Function to build button row
        const buildButtons = (page) => {
            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('list_prev')
                        .setLabel('Previous')
                        .setEmoji('◀️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('list_next')
                        .setLabel('Next')
                        .setEmoji('▶️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === totalPages - 1)
                );
        };

        // Initial menu
        let initialMenu = await buildMenu(currentPage);

        // Check if user is Pro subscriber
        const userSub = await Subscription.findOne({ userId });
        const isPro = userSub && userSub.isPro();

        // Add footer message based on subscription status (AFTER quotes)
        if (isPro) {
            // Pro user - show thankful maid message
            initialMenu += '\n\n*🎀 Your devoted maid is honored to serve you, Master~ This maid shall forever cherish your patronage! ✨*';
        } else {
            // Free user - show upgrade message (NO PRICE in servers)
            initialMenu += '\n\n*💎 Upgrade to Seraphina Pro for unlimited items and exclusive perks! Use* `/subscribe` *for details~*';
        }

        // Send with or without buttons
        const messageOptions = { content: initialMenu };
        if (totalPages > 1) {
            messageOptions.components = [buildButtons(currentPage)];
        }

        const message = await interaction.editReply(messageOptions);

        // If only one page, we're done
        if (totalPages <= 1) return;

        // Create button collector
        const collector = message.createMessageComponentCollector({
            time: BUTTON_TIMEOUT
        });

        collector.on('collect', async (i) => {
            // Only allow the command user to click buttons
            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: '❌ These buttons are not for you, Master~',
                    ephemeral: true
                });
            }

            // Update page
            if (i.customId === 'list_next') {
                currentPage++;
            } else if (i.customId === 'list_prev') {
                currentPage--;
            }

            // Rebuild menu (await since buildMenu is now async)
            let newMenu = await buildMenu(currentPage);
            newMenu += adFooter;

            // Update message
            await i.update({
                content: newMenu,
                components: [buildButtons(currentPage)]
            });
        });

        collector.on('end', () => {
            // Disable buttons after timeout
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('list_prev')
                        .setLabel('Previous')
                        .setEmoji('◀️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('list_next')
                        .setLabel('Next')
                        .setEmoji('▶️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                );

            message.edit({ components: [disabledRow] }).catch(() => {
                // Message might be deleted, ignore error
            });
        });
    },
};
