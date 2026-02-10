const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-storage')
        .setDescription('Set up a storage channel for learning images (Admin only)')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to use for storing images')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const guildId = interaction.guild.id;
        const guildName = interaction.guild.name;
        const channel = interaction.options.getChannel('channel');

        if (!channel) {
            // Clear storage channel
            await GuildSettings.clearStorageChannel(guildId);
            await interaction.editReply({
                content: '✅ Storage channel cleared! Images will now be stored in their original locations.',
            });
            return;
        }

        // Set storage channel for this guild
        await GuildSettings.setStorageChannel(guildId, channel.id, guildName);

        await interaction.editReply({
            content: `✅ Storage channel set to ${channel}! All learning images will be stored here.`,
        });
    },
};
