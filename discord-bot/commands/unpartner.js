const { SlashCommandBuilder } = require('discord.js');
const UserPreferences = require('../models/UserPreferences');
const { getMessage } = require('../utils/personality');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unpartner')
        .setDescription('Leave your current partnership'),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Check if user has a partner
        const userPrefs = await UserPreferences.findOne({ userId });

        if (!userPrefs?.partnerId) {
            await interaction.reply({
                content: await getMessage('partner', 'noPartner'),
                ephemeral: true,
            });
            return;
        }

        const partnerId = userPrefs.partnerId;
        const partner = await interaction.client.users.fetch(partnerId);

        // Remove partnership from both users
        await UserPreferences.findOneAndUpdate(
            { userId },
            { $unset: { partnerId: "" } }
        );

        await UserPreferences.findOneAndUpdate(
            { userId: partnerId },
            { $unset: { partnerId: "" } }
        );

        await interaction.reply({
            content: await getMessage('partner', 'partnershipEnded', {
                partner: partner.tag
            }),
        });

        // Notify the former partner
        try {
            const dmChannel = await partner.createDM();
            await dmChannel.send(
                await getMessage('partner', 'partnerLeft', {
                    user: interaction.user.tag
                })
            );
        } catch (error) {
            console.error('Failed to send DM to former partner:', error);
        }
    },
};
