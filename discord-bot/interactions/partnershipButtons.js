const Partnership = require('../models/Partnership');
const { getMessage } = require('../utils/personality');

/**
 * Handle button interactions for partnership system
 */
async function handlePartnershipButtons(interaction) {
    const customId = interaction.customId;

    // Parse button custom ID format: accept_partner_{senderId}_{guildId} or decline_partner_{senderId}_{guildId}
    const parts = customId.split('_');
    const action = parts[0]; // 'accept' or 'decline'
    const senderId = parts[2]; // User who sent the invite
    const guildId = parts[3]; // Guild where partnership is

    const userId = interaction.user.id; // User who clicked the button

    if (action === 'accept') {
        // Check if there's a pending invite
        const partnership = await Partnership.findOne({
            user1Id: senderId,
            user2Id: userId,
            guildId,
            status: 'pending'
        });

        if (!partnership) {
            return interaction.reply({
                content: await getMessage('partner', 'noPendingInvite'),
                ephemeral: true,
            });
        }

        // Check if inviter already partnered (maybe they partnered with someone else)
        const existingPartnership = await Partnership.findOne({
            $or: [
                { user1Id: senderId, guildId, status: 'active' },
                { user2Id: senderId, guildId, status: 'active' }
            ]
        });

        if (existingPartnership) {
            await interaction.reply({
                content: await getMessage('partner', 'inviterAlreadyPartnered'),
                ephemeral: true,
            });

            // Delete stale invite
            await Partnership.deleteOne({ _id: partnership._id });
            return;
        }

        // Check if user already has a partner in this guild (limit: 1 partner)
        const userPartnership = await Partnership.findOne({
            $or: [
                { user1Id: userId, guildId, status: 'active' },
                { user2Id: userId, guildId, status: 'active' }
            ]
        });

        if (userPartnership) {
            const partnerId = userPartnership.user1Id === userId
                ? userPartnership.user2Id
                : userPartnership.user1Id;
            const partnerUser = await interaction.client.users.fetch(partnerId);

            return interaction.reply({
                content: `🎀 You already have a partner in this server (${partnerUser.username})! You must leave your current partnership before accepting a new one, Master~`,
                ephemeral: true
            });
        }

        // Activate partnership and assign emojis
        partnership.status = 'active';
        partnership.acceptedAt = new Date();

        // Assign random emoji pair (fixed for this partnership)
        const emojiPairs = [
            ['🔵', '🟢'], // Blue & Green
            ['🟣', '🟡'], // Purple & Yellow
            ['🔴', '🟠'], // Red & Orange
            ['💙', '💚'], // Blue Heart & Green Heart
            ['💜', '💛'], // Purple Heart & Yellow Heart
            ['🌸', '🌺'], // Pink Flower & Red Flower
            ['⭐', '✨'], // Star & Sparkles
            ['🎀', '🎨'], // Ribbon & Art
        ];

        const randomPair = emojiPairs[Math.floor(Math.random() * emojiPairs.length)];
        partnership.user1Emoji = randomPair[0]; // Sender gets first emoji
        partnership.user2Emoji = randomPair[1]; // Accepter gets second emoji

        await partnership.save();

        // Get partner details
        const partner = await interaction.client.users.fetch(senderId);

        // Confirm to user
        await interaction.reply({
            content: await getMessage('partner', 'partnershipAccepted', {
                partner: partner.tag
            }),
        });

        // Notify the inviter
        try {
            await partner.send(
                await getMessage('partner', 'partnershipConfirmed', {
                    partner: interaction.user.tag
                })
            );
        } catch (error) {
            console.error('Failed to send DM to partner:', error);
        }

        // Disable the buttons
        await interaction.message.edit({ components: [] });

    } else if (action === 'decline') {
        // Find and delete pending invite
        const partnership = await Partnership.findOne({
            user1Id: senderId,
            user2Id: userId,
            guildId,
            status: 'pending'
        });

        if (!partnership) {
            return interaction.reply({
                content: await getMessage('partner', 'noPendingInvite'),
                ephemeral: true,
            });
        }

        const partner = await interaction.client.users.fetch(senderId);

        // Delete partnership
        await Partnership.deleteOne({ _id: partnership._id });

        await interaction.reply({
            content: await getMessage('partner', 'invitationDeclined', {
                partner: partner.tag
            }),
            ephemeral: true,
        });

        // Notify the inviter
        try {
            await partner.send(
                await getMessage('partner', 'invitationWasDeclined', {
                    user: interaction.user.tag
                })
            );
        } catch (error) {
            console.error('Failed to send DM:', error);
        }

        // Disable the buttons
        await interaction.message.edit({ components: [] });
    }
}

module.exports = { handlePartnershipButtons };
