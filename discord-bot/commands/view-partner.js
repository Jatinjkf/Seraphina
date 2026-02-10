const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserPreferences = require('../models/UserPreferences');
const { getMessage } = require('../utils/personality');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view-partner')
        .setDescription('View your current learning partner'),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Check if user has a partner
        const userPrefs = await UserPreferences.findOne({ userId });

        if (!userPrefs?.partnerId) {
            // Check for pending invite
            if (userPrefs?.pendingPartnerInvite?.from) {
                const inviter = await interaction.client.users.fetch(userPrefs.pendingPartnerInvite.from);
                await interaction.reply({
                    content: await getMessage('partner', 'pendingInviteFrom', {
                        user: inviter.tag
                    }),
                    ephemeral: true,
                });
                return;
            }

            await interaction.reply({
                content: await getMessage('partner', 'noPartner'),
                ephemeral: true,
            });
            return;
        }

        const partner = await interaction.client.users.fetch(userPrefs.partnerId);
        const partnerPrefs = await UserPreferences.findOne({ userId: userPrefs.partnerId });

        const embed = new EmbedBuilder()
            .setColor('#9333ea')
            .setTitle('💑 Learning Partnership')
            .addFields(
                { name: 'Partner', value: `${partner.tag}`, inline: true },
                { name: 'Honorific', value: partnerPrefs?.honorific || 'Master', inline: true },
            )
            .setFooter({ text: 'Use /unpartner to end the partnership' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
