const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Reminder = require('../models/Reminder');
const { formatDate, formatFrequency } = require('../utils/dateFormatter');
const { getMessage } = require('../utils/personality');
const { getUserAndPartner } = require('../utils/partnerUtils');
const BotSettings = require('../models/BotSettings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view')
        .setDescription('View a specific learning item')
        .addStringOption(option =>
            option
                .setName('item')
                .setDescription('Name of the item to view')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const userIds = await getUserAndPartner(userId, guildId);

        const reminders = await Reminder.find({
            userId: { $in: userIds },
            guildId
        }).limit(25);

        const choices = [];
        for (const reminder of reminders) {
            const hasDup = await reminder.hasDuplicates();
            const displayName = hasDup
                ? `${reminder.itemName} #${reminder.serialNumber}`
                : reminder.itemName;

            if (displayName.toLowerCase().includes(focusedValue)) {
                choices.push({ name: displayName, value: displayName });
            }
        }

        await interaction.respond(choices.slice(0, 25));
    },

    async execute(interaction) {
        await interaction.deferReply();

        const itemInput = interaction.options.getString('item');
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const userIds = await getUserAndPartner(userId);

        // Parse item name and serial number
        const match = itemInput.match(/^(.+?)\s*#(\d+)$/);
        let itemName, serialNumber;
        let reminder;

        if (match) {
            itemName = match[1].trim();
            serialNumber = parseInt(match[2]);

            reminder = await Reminder.findOne({
                userId: { $in: userIds },
                guildId,
                itemName: new RegExp(`^${itemName}$`, 'i'),
                serialNumber
            });
        } else {
            itemName = itemInput.trim();
            reminder = await Reminder.findOne({
                userId: { $in: userIds },
                guildId,
                itemName: new RegExp(`^${itemName}$`, 'i')
            });
        }

        if (!reminder) {
            await interaction.editReply(await getMessage('view', 'notFound', { item: itemInput }));
            return;
        }

        try {
            // Fetch storage channel
            const storageChannelId = await BotSettings.getSetting('storageChannelId') || reminder.storageChannelId;
            const storageChannel = await interaction.client.channels.fetch(storageChannelId);

            if (!storageChannel) {
                throw new Error('Storage channel not found');
            }

            const storageMessage = await storageChannel.messages.fetch(reminder.storageMessageId);
            if (!storageMessage || storageMessage.attachments.size === 0) {
                throw new Error('Image not found in storage message');
            }

            const attachment = storageMessage.attachments.first();
            const hasDup = await reminder.hasDuplicates();
            const displayName = hasDup ? `${reminder.itemName} #${reminder.serialNumber}` : reminder.itemName;

            const detailsMessage = await getMessage('view', 'details', {
                frequency: formatFrequency(reminder.frequency),
                date: formatDate(reminder.nextReminder),
            });

            const embed = new EmbedBuilder()
                .setColor('#9333ea')
                .setTitle(displayName)
                .setDescription(detailsMessage)
                .setImage(attachment.url)
                .setFooter({ text: `Frequency: ${reminder.frequency}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching image:', error);
            await interaction.editReply('Oh dear, Master... I cannot retrieve the image. It may have been deleted.');
        }
    },
};
