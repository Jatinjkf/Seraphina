const { SlashCommandBuilder } = require('discord.js');
const Reminder = require('../models/Reminder');
const Archive = require('../models/Archive');
const UserPreferences = require('../models/UserPreferences');
const { getMessage } = require('../utils/personality');
const { calculateNextReminder, formatFrequency } = require('../utils/dateFormatter');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unarchive')
        .setDescription('Restore an item from archive')
        .addStringOption(option =>
            option
                .setName('item')
                .setDescription('Item to restore')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const itemName = interaction.options.getString('item');

        const prefs = await UserPreferences.findOne({ userId }) || { honorific: 'Master' };

        // Find in archive for THIS GUILD
        const archived = await Archive.findOne({ userId, guildId, itemName });

        if (!archived) {
            const message = await getMessage('unarchive', 'notFound', {
                honorific: prefs.honorific,
                item: itemName,
            });
            await interaction.editReply(message);
            return;
        }

        // Restore to daily by default (or original frequency)
        const frequency = archived.originalFrequency || 'daily';
        const serialNumber = await Reminder.getNextSerialNumber(userId, guildId, itemName);

        const reminder = new Reminder({
            userId,
            guildId,
            itemName: archived.itemName,
            serialNumber,
            imageUrl: archived.imageUrl,
            frequency,
            nextReminder: calculateNextReminder(frequency),
        });

        await reminder.save();

        // Remove from archive
        await Archive.deleteOne({ _id: archived._id });

        const message = await getMessage('unarchive', 'success', {
            honorific: prefs.honorific,
            item: itemName,
            frequency: formatFrequency(frequency),
        });

        await interaction.editReply(message);
    },

    async autocomplete(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const focusedValue = interaction.options.getFocused().toLowerCase();

        const archives = await Archive.find({ userId, guildId }).limit(25);
        const choices = archives
            .filter(a => a.itemName.toLowerCase().includes(focusedValue))
            .map(a => ({ name: a.itemName, value: a.itemName }));

        await interaction.respond(choices.slice(0, 25));
    },
};
