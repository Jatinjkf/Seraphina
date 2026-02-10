const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const UserPreferences = require('../models/UserPreferences');
const { getMessage } = require('../utils/personality');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Manage your preferences')
        .addSubcommand(subcommand =>
            subcommand
                .setName('honorific')
                .setDescription('Change how Seraphina addresses you')
                .addStringOption(option =>
                    option
                        .setName('title')
                        .setDescription('Choose your preferred honorific')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Master', value: 'Master' },
                            { name: 'Goshujin-sama (御主人様)', value: 'Goshujin-sama' },
                            { name: 'My Lord', value: 'My Lord' },
                            { name: 'My Lady', value: 'My Lady' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View your current settings')
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;
        const subcommand = interaction.options.getSubcommand();

        let prefs = await UserPreferences.findOne({ userId });
        if (!prefs) {
            prefs = new UserPreferences({
                userId,
                honorific: 'Master',
                isFirstTime: false,
            });
            await prefs.save();
        }

        if (subcommand === 'honorific') {
            const newHonorific = interaction.options.getString('title');

            prefs.honorific = newHonorific;
            await prefs.save();

            const message = await getMessage('settings', 'honorificChanged', {
                honorific: prefs.honorific,
                newHonorific,
            });

            await interaction.editReply(message);

        } else if (subcommand === 'view') {
            const BotSettings = require('../models/BotSettings');
            const GuildSettings = require('../models/GuildSettings');
            const maidName = await BotSettings.getSetting('maidName', 'Seraphina Lumière');

            // Get guild settings for channels
            const guildSettings = await GuildSettings.findOne({ guildId: interaction.guild.id });

            let learningChannel = '❌ Not set';
            let storageChannel = '❌ Not set';

            if (guildSettings) {
                if (guildSettings.learningChannelId) {
                    const channel = interaction.guild.channels.cache.get(guildSettings.learningChannelId);
                    learningChannel = channel ? `#${channel.name}` : '❌ Channel deleted';
                }
                if (guildSettings.botStorageChannelId) {
                    const channel = interaction.guild.channels.cache.get(guildSettings.botStorageChannelId);
                    storageChannel = channel ? `#${channel.name}` : '❌ Channel deleted';
                }
            }

            const message = await getMessage('settings', 'viewSettings', {
                honorific: prefs.honorific,
                maidName,
            });

            // Add guild settings info
            const settingsInfo = `${message}\n\n**📋 Guild Settings:**\n🎓 Learning Channel: ${learningChannel}\n📦 Storage Channel: ${storageChannel}\n\n*Use* \`/setup-wizard\` *to configure channels~*`;

            await interaction.editReply(settingsInfo);
        }
    },
};
