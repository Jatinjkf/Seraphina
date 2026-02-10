const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-wizard')
        .setDescription('Configure server settings (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Double-check admin permission
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: '❌ Only administrators can run server setup, Master~',
                ephemeral: true
            });
        }

        // Create welcome embed
        const embed = new EmbedBuilder()
            .setColor(0xFF1493)
            .setTitle('🎀 Seraphina Setup Wizard')
            .setDescription('Let\'s configure your server in a few simple steps, Master!')
            .addFields(
                {
                    name: '📝 What We\'ll Set Up',
                    value:
                        '**Required:**\n' +
                        '• Learning Channel - Where users post images\n' +
                        '• Storage Channel - Where images are permanently stored\n\n' +
                        '**Optional:**\n' +
                        '• Admin Role - Who can manage bot settings\n' +
                        '• Timezone - For future per-server reminders\n' +
                        '• Welcome DMs - Greet new users'
                },
                {
                    name: '⏱️ Time Required',
                    value: '~30 seconds'
                }
            )
            .setFooter({ text: 'Click the button below to begin! ✨' });

        const startButton = new ButtonBuilder()
            .setCustomId('start_setup_wizard')
            .setLabel('Start Setup')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎀');

        const row = new ActionRowBuilder()
            .addComponents(startButton);

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    },
};
