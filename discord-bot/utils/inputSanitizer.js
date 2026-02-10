/**
 * Escape special regex characters in user input
 * @param {string} string - Input string
 * @returns {string} - Escaped string safe for regex
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Sanitize item name to prevent XSS and other issues
 * @param {string} itemName - Item name from user
 * @returns {string} - Sanitized item name
 */
function sanitizeItemName(itemName) {
    // Remove potentially dangerous characters
    return itemName.trim().replace(/[<>]/g, '');
}

/**
 * Validate Discord channel ID format
 * @param {string} channelId - Channel ID to validate
 * @returns {boolean} - True if valid
 */
function isValidChannelId(channelId) {
    return /^\d{17,19}$/.test(channelId);
}

module.exports = {
    escapeRegex,
    sanitizeItemName,
    isValidChannelId
};
