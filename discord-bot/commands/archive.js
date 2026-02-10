const { SlashCommandBuilder } = require('discord.js');
const Reminder = require('../models/Reminder');
const Archive = require('../models/Archive');
const { getMessage } = require('../utils/personality');
const { getUserAndPartner } = require('../utils/partnerUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('archive')
        .setDescription('Archive a mastered item')
        .addStringOption(option =>
            option
                .setName('item')
                .setDescription('Item name to archive')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const userIds = await getUserAndPartner(userId, guildId);

        const reminders = await Reminder.find({
            userId: { $in: userIds }
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
        const itemInput = interaction.options.getString('item');
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const userIds = await getUserAndPartner(userId);

        // Parse item name and serial number
        const match = itemInput.match(/^(.+?)\s*#(\d+)$/);
        let itemName, serialNumber;

        if (match) {
            itemName = match[1].trim();
            serialNumber = parseInt(match[2]);
        } else {
            itemName = itemInput.trim();
            serialNumber = null;
        }

        // Find reminder
        let reminder;
        if (serialNumber) {
            reminder = await Reminder.findOne({
                userId: { $in: userIds },
                guildId,
                itemName: new RegExp(`^${itemName}$`, 'i'),
                serialNumber
            });
        } else {
            reminder = await Reminder.findOne({
                userId: { $in: userIds },
                guildId,
                itemName: new RegExp(`^${itemName}$`, 'i')
            });
        }

        if (!reminder) {
            await interaction.reply(await getMessage('archive', 'notFound', { item: itemInput }));
            return;
        }

        const hasDup = await reminder.hasDuplicates();
        const displayName = hasDup ? `${reminder.itemName} #${reminder.serialNumber}` : reminder.itemName;

        // Create archive entry with storage references
        const archive = new Archive({
            userId: reminder.userId,
            guildId: reminder.guildId,
            itemName: reminder.itemName,
            storageChannelId: reminder.storageChannelId,
            storageMessageId: reminder.storageMessageId,
            originalFrequency: reminder.frequency,
        });

        await archive.save();
        await Reminder.deleteOne({ _id: reminder._id });

        await interaction.reply(await getMessage('archive', 'success', { item: displayName }));
    },
};
