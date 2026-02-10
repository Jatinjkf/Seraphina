const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Archive = require('../models/Archive');
const UserPreferences = require('../models/UserPreferences');
const { getMessage } = require('../utils/personality');
const { formatDate } = require('../utils/dateFormatter');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view-archive')
        .setDescription('View all your archived (mastered) items'),

    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const prefs = await UserPreferences.findOne({ userId }) || { honorific: 'Master' };

        const archives = await Archive.find({ userId }).sort({ archivedAt: -1 });

        if (archives.length === 0) {
            await interaction.editReply({
                content: `${prefs.honorific}, your archive is empty. Use \`/archive <item>\` to add mastered items~`,
            });
            return;
        }

        // Build archive message
        let archiveList = `**🏆 ${prefs.honorific}'s Hall of Mastery**\n\n`;

        for (const item of archives) {
            const dateStr = formatDate(item.archivedAt, false);
            archiveList += `• **${item.itemName}** - Mastered on ${dateStr}\n`;
        }

        archiveList += `\n_Total mastered: ${archives.length} items_\n`;
        archiveList += `_Use \`/unarchive <item>\` to restore an item, ${prefs.honorific}_`;

        const embed = new EmbedBuilder()
            .setColor('#fbbf24')
            .setDescription(archiveList)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};
