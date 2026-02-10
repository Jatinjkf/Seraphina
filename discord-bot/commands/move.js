const { SlashCommandBuilder } = require('discord.js');
const Reminder = require('../models/Reminder');
const { calculateNextReminder } = require('../utils/dateFormatter');
const { formatDate } = require('../utils/dateFormatter');
const { getMessage } = require('../utils/personality');
const { getUserAndPartner } = require('../utils/partnerUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Change the reminder frequency for an item')
        .addStringOption(option =>
            option
                .setName('item')
                .setDescription('Item name')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option
                .setName('frequency')
                .setDescription('New frequency')
                .setRequired(true)
                .addChoices(
                    { name: 'Daily', value: 'daily' },
                    { name: 'Every 2 Days', value: 'every2days' },
                    { name: 'Every 3 Days', value: 'every3days' },
                    { name: 'Weekly', value: 'weekly' },
                    { name: 'Bi-weekly', value: 'biweekly' },
                    { name: 'Monthly', value: 'monthly' }
                )
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
        const newFrequency = interaction.options.getString('frequency');
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
            await interaction.reply(await getMessage('move', 'notFound', { item: itemInput }));
            return;
        }

        // Update frequency
        reminder.frequency = newFrequency;
        reminder.nextReminder = calculateNextReminder(newFrequency);
        await reminder.save();

        const hasDup = await reminder.hasDuplicates();
        const displayName = hasDup ? `${reminder.itemName} #${reminder.serialNumber}` : reminder.itemName;

        await interaction.reply(
            await getMessage('move', 'success', {
                item: displayName,
                frequency: newFrequency.replace(/([A-Z])/g, ' $1').toLowerCase(),
                date: formatDate(reminder.nextReminder),
            })
        );
    },
};
