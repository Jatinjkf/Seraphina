const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const Partnership = require('../models/Partnership');
const { getMessage } = require('../utils/personality');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('partner')
        .setDescription('Invite someone to be your learning partner in this server')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user you want to partner with')
                .setRequired(true)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const senderId = interaction.user.id;
        const guildId = interaction.guild.id;

        // Check if trying to partner with self
        if (targetUser.id === senderId) {
            return interaction.reply({
                content: await getMessage('partner', 'cannotPartnerSelf'),
                ephemeral: true
            });
        }

        // Check if sender already has a partner in this guild
        const senderPartnership = await Partnership.findOne({
            $or: [
                { user1Id: senderId, guildId, status: 'active' },
                { user2Id: senderId, guildId, status: 'active' }
            ]
        });

        if (senderPartnership) {
            const partnerId = senderPartnership.user1Id === senderId
                ? senderPartnership.user2Id
                : senderPartnership.user1Id;
            const partnerUser = await interaction.client.users.fetch(partnerId);
            return interaction.reply({
                content: await getMessage('partner', 'alreadyHasPartner', {
                    partner: partnerUser.username
                }),
                ephemeral: true
            });
        }

        // Check if target already has a partner in this guild
        const targetPartnership = await Partnership.findOne({
            $or: [
                { user1Id: targetUser.id, guildId, status: 'active' },
                { user2Id: targetUser.id, guildId, status: 'active' }
            ]
        });

        if (targetPartnership) {
            return interaction.reply({
                content: await getMessage('partner', 'targetHasPartner', {
                    user: targetUser.username
                }),
                ephemeral: true
            });
        }

        // Check if target already has a pending invite in this guild
        const pendingInvite = await Partnership.findOne({
            user2Id: targetUser.id,
            guildId,
            status: 'pending'
        });

        if (pendingInvite) {
            return interaction.reply({
                content: await getMessage('partner', 'targetHasPendingInvite', {
                    user: targetUser.username
                }),
                ephemeral: true
            });
        }

        // Create pending partnership
        await Partnership.create({
            user1Id: senderId, // Inviter
            user2Id: targetUser.id, // Invitee
            guildId,
            status: 'pending'
        });

        // Create buttons
        const acceptButton = new ButtonBuilder()
            .setCustomId(`accept_partner_${senderId}_${guildId}`)
            .setLabel('Accept Partnership')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success);

        const declineButton = new ButtonBuilder()
            .setCustomId(`decline_partner_${senderId}_${guildId}`)
            .setLabel('Decline')
            .setEmoji('❌')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(acceptButton, declineButton);

        // Send invitation message in learning channel (not DMs!)
        try {
            const inviteMessage = await getMessage('partner', 'invitationReceived', {
                sender: interaction.user.username
            });

            // Get guild settings to find learning channel
            const GuildSettings = require('../models/GuildSettings');
            const guildSettings = await GuildSettings.findOne({ guildId });

            let targetChannel;
            if (guildSettings && guildSettings.learningChannelId) {
                targetChannel = interaction.guild.channels.cache.get(guildSettings.learningChannelId);
            }

            // Fallback to current channel if no learning channel set
            if (!targetChannel) {
                targetChannel = interaction.channel;
            }

            await targetChannel.send({
                content: `${targetUser}, ${inviteMessage}\n\n🏰 **From:** ${interaction.user}\n🎀 *Please respond within 24 hours~*`,
                components: [row]
            });

            // Confirm to sender
            const confirmMessage = await getMessage('partner', 'invitationSent', {
                user: targetUser.username
            });
            await interaction.reply({
                content: confirmMessage,
                ephemeral: true
            });

            // Set timeout to auto-decline after 24 hours
            setTimeout(async () => {
                await Partnership.deleteOne({
                    user1Id: senderId,
                    user2Id: targetUser.id,
                    guildId,
                    status: 'pending'
                });
            }, 24 * 60 * 60 * 1000);

        } catch (error) {
            console.error('Could not send partner invitation:', error);

            // Delete pending partnership if DM failed
            await Partnership.deleteOne({
                user1Id: senderId,
                user2Id: targetUser.id,
                guildId,
                status: 'pending'
            });

            return interaction.reply({
                content: `❌ I couldn't send a DM to ${targetUser.username}. They may have DMs disabled, Master~`,
                ephemeral: true
            });
        }
    },
};
