const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const UserPreferences = require('../models/UserPreferences');
const { getMessage, getMaidName } = require('./personality');

/**
 * Check if this is a user's first time and show setup flow
 * @param {Interaction} interaction - Discord interaction
 * @returns {boolean} True if first time, false otherwise
 */
async function checkAndShowFirstTimeSetup(interaction) {
    const userId = interaction.user.id;

    // Check if user has preferences
    let prefs = await UserPreferences.findOne({ userId });

    if (!prefs || prefs.isFirstTime) {
        await showFirstTimeSetup(interaction);
        return true;
    }

    return false;
}

/**
 * Show first-time setup flow
 */
async function showFirstTimeSetup(interaction) {
    const maidName = await getMaidName();

    const welcomeMsg = await getMessage('firstTime', 'welcome', { maidName });

    // Create honorific selection buttons
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('honorific_master')
                .setLabel('Master')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('honorific_goshujin')
                .setLabel('Goshujin-sama')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('honorific_lord')
                .setLabel('My Lord/Lady')
                .setStyle(ButtonStyle.Primary)
        );

    const embed = new EmbedBuilder()
        .setColor('#9333ea')
        .setTitle(`✨ Welcome to ${maidName}'s Service ✨`)
        .setDescription(welcomeMsg)
        .setFooter({ text: 'Choose your preferred honorific below~' });

    await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
    });
}

/**
 * Complete first-time setup
 */
async function completeFirstTimeSetup(userId, honorific) {
    await UserPreferences.findOneAndUpdate(
        { userId },
        {
            userId,
            honorific,
            isFirstTime: false,
        },
        { upsert: true, new: true }
    );
}

module.exports = {
    checkAndShowFirstTimeSetup,
    showFirstTimeSetup,
    completeFirstTimeSetup,
};
