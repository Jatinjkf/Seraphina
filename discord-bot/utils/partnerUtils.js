const Partnership = require('../models/Partnership');

/**
 * Get user IDs to query (user + partner if exists in this guild)
 * @param {string} userId - User ID
 * @param {string} guildId - Guild ID
 * @returns {Promise<string[]>} - Array of user IDs to query
 */
async function getUserAndPartner(userId, guildId) {
    // Find active partnership in this guild
    const partnership = await Partnership.findOne({
        $or: [
            { user1Id: userId, guildId, status: 'active' },
            { user2Id: userId, guildId, status: 'active' }
        ]
    });

    if (!partnership) {
        return [userId];
    }

    // Return both user IDs
    const partnerId = partnership.user1Id === userId
        ? partnership.user2Id
        : partnership.user1Id;

    return [userId, partnerId];
}

/**
 * Check if user has a partner in specific guild
 * @param {string} userId - User ID
 * @param {string} guildId - Guild ID
 * @returns {Promise<string|null>} - Partner ID or null
 */
async function getPartnerId(userId, guildId) {
    const partnership = await Partnership.findOne({
        $or: [
            { user1Id: userId, guildId, status: 'active' },
            { user2Id: userId, guildId, status: 'active' }
        ]
    });

    if (!partnership) return null;

    return partnership.user1Id === userId
        ? partnership.user2Id
        : partnership.user1Id;
}

module.exports = {
    getUserAndPartner,
    getPartnerId,
};
