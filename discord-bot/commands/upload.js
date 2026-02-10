const { SlashCommandBuilder } = require('discord.js');
const Reminder = require('../models/Reminder');
const UserPreferences = require('../models/UserPreferences');
const { getMessage } = require('../utils/personality');
const { calculateNextReminder, formatDate } = require('../utils/dateFormatter');
const { checkItemLimit, getUpgradeMessage } = require('../utils/subscriptionUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('upload')
        .setDescription('Upload an image to learn (defaults to daily reminders)')
        .addStringOption(option =>
            option
                .setName('caption')
                .setDescription('Name/caption for this item')
                .setRequired(true)
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const caption = interaction.options.getString('caption');

        // Check subscription (global) and item limit (per-guild)
        const limitCheck = await checkItemLimit(userId, guildId);
        if (!limitCheck.canAdd) {
            const upgradeMsg = await getUpgradeMessage(limitCheck.current, limitCheck.limit);
            return interaction.reply({
                content: upgradeMsg,
                ephemeral: true
            });
        }

        // Get user preferences
        const prefs = await UserPreferences.findOne({ userId }) || { honorific: 'Master' };

        // Ask user to upload image with clear instructions
        await interaction.reply({
            content: `📸 **Step 2:** Please send an image for **"${caption}"** in the next message, ${prefs.honorific}~\n\n` +
                `✨ *Simply upload/paste your image in this channel within the next 60 seconds!*`,
            ephemeral: false,
        });

        // Create message collector to wait for image
        const filter = (m) => m.author.id === userId && m.attachments.size > 0;
        const collector = interaction.channel.createMessageCollector({
            filter,
            time: 60000, // 60 seconds
            max: 1
        });

        collector.on('collect', async (message) => {
            const imageAttachment = message.attachments.first();

            if (!imageAttachment || !imageAttachment.contentType?.startsWith('image/')) {
                const errorMsg = await getMessage('errors', 'noImage', { honorific: prefs.honorific });
                await message.reply(errorMsg);
                return;
            }

            const imageUrl = imageAttachment.url;

            // Check for duplicates and get serial number (per-guild)
            const serialNumber = await Reminder.getNextSerialNumber(userId, guildId, caption);
            const isDuplicate = serialNumber > 1;

            //Calculate next reminder (daily by default)
            const nextReminder = calculateNextReminder('daily');

            // Create reminder
            const reminder = new Reminder({
                userId,
                guildId,
                itemName: caption,
                serialNumber,
                imageUrl,
                frequency: 'daily',
                nextReminder,
            });

            await reminder.save();

            // Send response
            const displayName = await reminder.hasDuplicates()
                ? `${caption} #${serialNumber}`
                : caption;

            const dateStr = formatDate(nextReminder);

            let responseMsg;
            if (isDuplicate) {
                responseMsg = await getMessage('upload', 'duplicate', {
                    honorific: prefs.honorific,
                    item: caption,
                    newItem: displayName,
                });
            } else {
                responseMsg = await getMessage('upload', 'success', {
                    honorific: prefs.honorific,
                    item: caption,
                    frequency: 'daily',
                    date: dateStr,
                });
            }

            await message.reply(responseMsg);
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                interaction.followUp({
                    content: `${prefs.honorific}, the time limit has expired. Please use \`/upload\` again when you're ready~`,
                    ephemeral: true,
                });
            }
        });
    },
};
