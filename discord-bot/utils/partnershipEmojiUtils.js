/**
 * Get partnership emoji for a user
 * @param {string} userId - User ID to get emoji for
 * @param {string} guildId - Guild ID
 * @returns {Promise<string|null>} - Emoji if in partnership, null otherwise
 */
async function getPartnershipEmoji(userId, guildId) {
    const Partnership = require('../models/Partnership');

    const partnership = await Partnership.findOne({
        $or: [
            { user1Id: userId, guildId, status: 'active' },
            { user2Id: userId, guildId, status: 'active' }
        ]
    });

    if (!partnership) return null;

    // Return user's assigned emoji
    if (partnership.user1Id === userId) {
        return partnership.user1Emoji;
    } else {
        return partnership.user2Emoji;
    }
}

/**
 * Get emoji for a specific item owner in a partnership context
 * @param {string} itemOwnerId - ID of the user who owns the item
 * @param {string} guildId - Guild ID
 * @returns {Promise<string|null>} - Owner's partnership emoji or null
 */
async function getItemOwnerEmoji(itemOwnerId, guildId) {
    return await getPartnershipEmoji(itemOwnerId, guildId);
}

module.exports = { getPartnershipEmoji, getItemOwnerEmoji };
