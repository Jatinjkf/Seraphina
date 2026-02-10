const { SlashCommandBuilder } = require('discord.js');
const Reminder = require('../models/Reminder');
const UserPreferences = require('../models/UserPreferences');
const { getMessage } = require('../utils/personality');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Rename an item')
        .addStringOption(option =>
            option
                .setName('oldname')
                .setDescription('Current item name')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option
                .setName('newname')
                .setDescription('New name for the item')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const oldName = interaction.options.getString('oldname');
        const newName = interaction.options.getString('newname');

        const prefs = await UserPreferences.findOne({ userId }) || { honorific: 'Master' };

        // Find reminder
        let reminder;
        const serialMatch = oldName.match(/^(.+?)\s*#(\d+)$/);

        if (serialMatch) {
            const [, itemName, serialNum] = serialMatch;
            reminder = await Reminder.findOne({
                userId,
                guildId,
                itemName: itemName.trim(),
                serialNumber: parseInt(serialNum),
            });
        } else {
            const matches = await Reminder.find({ userId, guildId, itemName: oldName });

            if (matches.length === 1) {
                reminder = matches[0];
            } else if (matches.length > 1) {
                const list = matches.map(r => `• ${r.itemName} #${r.serialNumber}`).join('\n');
                const message = await getMessage('move', 'multipleSuggestion', {
                    honorific: prefs.honorific,
                    item: oldName,
                    list,
                });
                await interaction.editReply(message);
                return;
            }
        }

        if (!reminder) {
            const message = await getMessage('rename', 'notFound', {
                honorific: prefs.honorific,
                item: oldName,
            });
            await interaction.editReply(message);
            return;
        }

        // Update name and reset serial number (it's now unique)
        reminder.itemName = newName;
        reminder.serialNumber = 1;
        await reminder.save();

        const message = await getMessage('rename', 'success', {
            honorific: prefs.honorific,
            oldName: oldName,
            newName: newName,
        });

        const reply = await interaction.editReply(message);

        // Auto-delete after 15 seconds
        const { autoDeleteAfter, CLEANUP_TIMEOUTS } = require('../utils/messageCleanup');
        await autoDeleteAfter(reply, CLEANUP_TIMEOUTS.RENAME_SUCCESS);
    },

    async autocomplete(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const focusedValue = interaction.options.getFocused().toLowerCase();

        const reminders = await Reminder.find({ userId, guildId }).limit(25);
        const choices = [];
        const seen = new Set();

        for (const reminder of reminders) {
            const hasDup = await reminder.hasDuplicates();
            const displayName = hasDup
                ? `${reminder.itemName} #${reminder.serialNumber}`
                : reminder.itemName;

            if (!seen.has(displayName) && displayName.toLowerCase().includes(focusedValue)) {
                choices.push({ name: displayName, value: displayName });
                seen.add(displayName);
            }
        }

        await interaction.respond(choices.slice(0, 25));
    },
};
