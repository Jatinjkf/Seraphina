const { shouldShowAds } = require('./subscriptionUtils');
const { getAffiliateAd } = require('./affiliateUtils');

/**
 * Add ad footer to message if user should see ads
 * @param {string} message - Original message
 * @param {string} userId - Discord user ID
 * @returns {Promise<string>} Message with or without ad
 */
async function addAdFooter(message, userId) {
    const showAds = await shouldShowAds(userId);

    if (!showAds) {
        return message;
    }

    const ad = await getAffiliateAd(userId);
    return `${message}${ad}`;
}

/**
 * Get ad footer only (for adding to embeds, menus, etc.)
 * Uses affiliate system with weighted distribution
 * @param {string} userId - Discord user ID
 * @returns {Promise<string>} Ad message or empty string
 */
async function getAdFooter(userId) {
    return await getAffiliateAd(userId);
}

module.exports = {
    addAdFooter,
    getAdFooter
};
