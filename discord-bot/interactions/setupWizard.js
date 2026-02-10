const { ChannelSelectMenuBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, ChannelType, ActionRowBuilder, EmbedBuilder, ComponentType, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');
const { postAndPinGuide } = require('../utils/setupGuide');

/**
 * Handle setup wizard button and flow
 */
async function handleSetupWizard(interaction) {
    // Check admin permission
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
            content: '❌ Only administrators can set up the server, Master~',
            ephemeral: true
        });
    }

    // Step 1: Select Learning Channel
    await showLearningChannelSelect(interaction);
}

/**
 * Step 1: Learning Channel Selection
 */
async function showLearningChannelSelect(interaction) {
    const embed = new EmbedBuilder()
        .setColor(0xFF1493)
        .setTitle('🎀 Step 1: Learning Channel')
        .setDescription('Select the channel where users will post their learning materials.\n\n📝 Users can also set personal preferences with `/setup-channel`');

    const channelSelect = new ChannelSelectMenuBuilder()
        .setCustomId('setup_learning_channel')
        .setPlaceholder('Select learning channel')
        .setChannelTypes([ChannelType.GuildText])
        .setMaxValues(1);

    const row = new ActionRowBuilder().addComponents(channelSelect);

    if (interaction.replied || interaction.deferred) {
        await interaction.editReply({
            embeds: [embed],
            components: [row]
        });
    } else {
        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }
}

/**
 * Step 2: Storage Channel Selection
 */
async function showStorageChannelSelect(interaction, learningChannelId) {
    const embed = new EmbedBuilder()
        .setColor(0xFF1493)
        .setTitle('🎀 Step 2: Storage Channel')
        .setDescription('Select where images should be permanently stored.\n\n⚠️ I need **SendMessages**, **AttachFiles**, and **ManageMessages** permissions here!');

    const channelSelect = new ChannelSelectMenuBuilder()
        .setCustomId(`setup_storage_channel_${learningChannelId}`)
        .setPlaceholder('Select storage channel')
        .setChannelTypes([ChannelType.GuildText])
        .setMaxValues(1);

    const row = new ActionRowBuilder().addComponents(channelSelect);

    await interaction.update({
        embeds: [embed],
        components: [row]
    });
}

/**
 * Step 3: Optional Settings
 */
async function showOptionalSettings(interaction, learningChannelId, storageChannelId) {
    const embed = new EmbedBuilder()
        .setColor(0xFF1493)
        .setTitle('🎀 Step 3: Optional Settings')
        .setDescription('These are optional but recommended!\n\nSelect **Admin Role**, **Timezone**, or click **Skip** to finish.');

    const skipButton = {
        type: 2,
        style: 1,
        label: 'Skip & Finish Setup',
        custom_id: `setup_skip_${learningChannelId}_${storageChannelId}`,
        emoji: { name: '✅' }
    };

    const configureButton = {
        type: 2,
        style: 2,
        label: 'Configure Optional Settings',
        custom_id: `setup_configure_${learningChannelId}_${storageChannelId}`,
        emoji: { name: '⚙️' }
    };

    await interaction.update({
        embeds: [embed],
        components: [{
            type: 1,
            components: [configureButton, skipButton]
        }]
    });
}

/**
 * Show admin role selector
 */
async function showAdminRoleSelect(interaction, learningChannelId, storageChannelId) {
    const embed = new EmbedBuilder()
        .setColor(0xFF1493)
        .setTitle('⚙️ Select Admin Role (Optional)')
        .setDescription('Choose a role that can manage bot settings.\n\n💡 Server administrators can always use `/setup-wizard`');

    const roleSelect = new RoleSelectMenuBuilder()
        .setCustomId(`setup_admin_role_${learningChannelId}_${storageChannelId}`)
        .setPlaceholder('Select admin role (optional)')
        .setMaxValues(1);

    const skipButton = {
        type: 2,
        style: 2,
        label: 'Skip',
        custom_id: `setup_skip_admin_${learningChannelId}_${storageChannelId}`
    };

    await interaction.update({
        embeds: [embed],
        components: [
            { type: 1, components: [roleSelect] },
            { type: 1, components: [skipButton] }
        ]
    });
}

/**
 * Complete setup and save settings
 */
async function completeSetup(interaction, learningChannelId, storageChannelId, adminRoleId = null) {
    const guildId = interaction.guild.id;

    // Validate channels
    const learningChannel = await interaction.guild.channels.fetch(learningChannelId);
    const storageChannel = await interaction.guild.channels.fetch(storageChannelId);

    if (!learningChannel || !storageChannel) {
        return interaction.update({
            content: '❌ Invalid channel selection. Please try again!',
            embeds: [],
            components: []
        });
    }

    // Check bot permissions in storage channel
    const permissions = storageChannel.permissionsFor(interaction.guild.members.me);
    if (!permissions.has(['SendMessages', 'AttachFiles', 'ManageMessages'])) {
        return interaction.update({
            content: `⚠️ I need **SendMessages**, **AttachFiles**, and **ManageMessages** permissions in ${storageChannel}!\n\nPlease grant these permissions and run \`/setup-wizard\` again, Master~`,
            embeds: [],
            components: []
        });
    }

    // Save to database
    await GuildSettings.findOneAndUpdate(
        { guildId },
        {
            $set: {
                learningChannelId,
                storageChannelId,
                adminRoleId,
                setupCompleted: true,
                setupBy: interaction.user.id,
                setupAt: new Date()
            }
        },
        { upsert: true, new: true }
    );

    // Post and pin guide in learning channel
    let guideMessageId;
    try {
        guideMessageId = await postAndPinGuide(learningChannel, interaction.guild.name);

        // Save guide message ID
        await GuildSettings.findOneAndUpdate(
            { guildId },
            { $set: { guideMessageId } }
        );
    } catch (error) {
        console.error('Failed to post guide:', error);
    }

    // Success message
    const successEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Setup Complete!')
        .setDescription(`Your server is now ready, Master! 🎀`)
        .addFields(
            {
                name: '📚 Learning Channel',
                value: `${learningChannel}`,
                inline: true
            },
            {
                name: '📦 Storage Channel',
                value: `${storageChannel}`,
                inline: true
            }
        )
        .setFooter({ text: 'Users can now start learning! Check the pinned message in the learning channel for instructions.' });

    if (adminRoleId) {
        const adminRole = await interaction.guild.roles.fetch(adminRoleId);
        successEmbed.addFields({
            name: '⚙️ Admin Role',
            value: `${adminRole}`,
            inline: true
        });
    }

    await interaction.update({
        embeds: [successEmbed],
        components: []
    });

    console.log(`✅ Setup completed for ${interaction.guild.name} by ${interaction.user.tag}`);
}

module.exports = { handleSetupWizard, showLearningChannelSelect, showStorageChannelSelect, showOptionalSettings, showAdminRoleSelect, completeSetup };
