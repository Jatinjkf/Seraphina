const { SlashCommandBuilder } = require('discord.js');
const Reminder = require('../models/Reminder');
const { getMessage } = require('../utils/personality');
const { getUserAndPartner } = require('../utils/partnerUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Permanently delete an item from your learning list')
        .addStringOption(option =>
            option
                .setName('item')
                .setDescription('Item name to delete')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const userIds = await getUserAndPartner(userId);

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

            // Find reminder with serial number
            reminder = await Reminder.findOne({
                userId: { $in: userIds },
                guildId,
                itemName: new RegExp(`^${itemName}$`, 'i'),
                serialNumber
            });
        } else {
            // No serial number - find first match
            itemName = itemInput.trim();
            reminder = await Reminder.findOne({
                userId: { $in: userIds },
                guildId,
                itemName: new RegExp(`^${itemName}$`, 'i')
            });
        }

        if (!reminder) {
            await interaction.reply(await getMessage('delete', 'notFound', { item: itemInput }));
            return;
        }

        const hasDup = await reminder.hasDuplicates();
        const displayName = hasDup ? `${reminder.itemName} #${reminder.serialNumber}` : reminder.itemName;

        // Delete the reminder
        await Reminder.deleteOne({ _id: reminder._id });

        await interaction.reply(await getMessage('delete', 'success', { item: displayName }));
    },
};
