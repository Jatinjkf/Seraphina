const { SlashCommandBuilder } = require('discord.js');
const UserPreferences = require('../models/UserPreferences');
const { getMessage } = require('../utils/personality');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-channel')
        .setDescription('Set up your learning channel where Seraphina will detect images'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;
        const channelId = interaction.channelId;

        // Update user preferences with learning channel
        const prefs = await UserPreferences.findOneAndUpdate(
            { userId },
            {
                userId,
                learningChannelId: channelId,
            },
            { upsert: true, new: true }
        );

        const message = await getMessage('setup', 'channelConfigured', {
            honorific: prefs.honorific || 'Master',
            channel: `<#${channelId}>`,
        });

        await interaction.editReply(message);
    },
};
