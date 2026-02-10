const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Reminder = require('../models/Reminder');
const Archive = require('../models/Archive');
const UserPreferences = require('../models/UserPreferences');
const { getMessage } = require('../utils/personality');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View your learning progress and statistics'),

    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const prefs = await UserPreferences.findOne({ userId }) || { honorific: 'Master' };

        // Get counts for THIS GUILD only
        const activeCount = await Reminder.countDocuments({ userId, guildId });
        const archivedCount = await Archive.countDocuments({ userId, guildId });
        const totalCount = activeCount + archivedCount;

        // Get breakdown by frequency for THIS GUILD
        const frequencies = await Reminder.aggregate([
            { $match: { userId, guildId } },
            { $group: { _id: '$frequency', count: { $sum: 1 } } }
        ]);

        const freqMap = {
            daily: 0,
            every2days: 0,
            every3days: 0,
            weekly: 0,
            biweekly: 0,
            monthly: 0,
        };

        frequencies.forEach(f => {
            if (freqMap.hasOwnProperty(f._id)) {
                freqMap[f._id] = f.count;
            }
        });

        // Build stats message
        const header = await getMessage('stats', 'header', { honorific: prefs.honorific });
        const magnificent = await getMessage('stats', 'magnificent', { honorific: prefs.honorific });

        let statsMsg = `${header}\n\n`;
        statsMsg += `**📊 Overview**\n`;
        statsMsg += `• Active Items: ${activeCount}\n`;
        statsMsg += `• Mastered Items: ${archivedCount}\n`;
        statsMsg += `• Total Items: ${totalCount}\n\n`;

        if (activeCount > 0) {
            statsMsg += `**📅 Frequency Breakdown**\n`;
            if (freqMap.daily > 0) statsMsg += `• Daily: ${freqMap.daily}\n`;
            if (freqMap.every2days > 0) statsMsg += `• Every 2 Days: ${freqMap.every2days}\n`;
            if (freqMap.every3days > 0) statsMsg += `• Every 3 Days: ${freqMap.every3days}\n`;
            if (freqMap.weekly > 0) statsMsg += `• Weekly: ${freqMap.weekly}\n`;
            if (freqMap.biweekly > 0) statsMsg += `• Bi-weekly: ${freqMap.biweekly}\n`;
            if (freqMap.monthly > 0) statsMsg += `• Monthly: ${freqMap.monthly}\n`;
            statsMsg += `\n`;
        }

        statsMsg += `✨ ${magnificent}`;

        const embed = new EmbedBuilder()
            .setColor('#9333ea')
            .setDescription(statsMsg)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};
