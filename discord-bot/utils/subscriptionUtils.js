const Subscription = require('../models/Subscription');
const Reminder = require('../models/Reminder');
const { getMessage } = require('./personality');

/**
 * Get or create user subscription
 * @param {string} userId - Discord user ID
 * @returns {Promise<Object>} Subscription object
 */
async function getSubscription(userId) {
    let subscription = await Subscription.findOne({ userId });

    // Create free tier subscription if doesn't exist
    if (!subscription) {
        subscription = await Subscription.create({
            userId,
            tier: 'free',
            status: 'active'
        });
    }

    return subscription;
}

/**
 * Check if user can add more items in a specific guild
 * @param {string} userId - Discord user ID
 * @param {string} guildId - Guild ID
 * @returns {Promise<Object>} { canAdd: boolean, limit: number, current: number, tier: string }
 */
async function checkItemLimit(userId, guildId) {
    const subscription = await getSubscription(userId);
    const limit = subscription.getItemLimit();
    const current = await Reminder.countDocuments({ userId, guildId });

    return {
        canAdd: current < limit,
        limit,
        current,
        tier: subscription.tier,
        isPro: subscription.isPro()
    };
}

/**
 * Get upgrade message for user
 * @param {string} current - Current item count
 * @param {string} limit - Item limit
 * @returns {Promise<string>} Upgrade message
 */
async function getUpgradeMessage(current, limit) {
    return `⚠️ **Upgrade Required** 🎀

You've reached your Free tier limit (**${current}/${limit} items** in this server).

✨ **Upgrade to Seraphina Pro** for:
• 💎 **Unlimited items per server**
• 🎀 **No ads**
• 👥 **Partner features**
• 📦 **Archive system**
• 🌟 **Priority support**
• 🤖 **Future AI features**

**Only $6.99/month!**

🔗 Upgrade now: [Your Pricing Page URL]

💭 _Keep learning with Seraphina~_`;
}

/**
 * Check if user should see ads
 * @param {string} userId - Discord user ID
 * @returns {Promise<boolean>} True if user should see ads
 */
async function shouldShowAds(userId) {
    const subscription = await getSubscription(userId);
    return !subscription.isPro();
}

/**
 * Get user's tier info for a specific guild
 * @param {string} userId - Discord user ID
 * @param {string} guildId - Guild ID
 * @returns {Promise<Object>} Tier information
 */
async function getTierInfo(userId, guildId) {
    const subscription = await getSubscription(userId);
    const itemCount = await Reminder.countDocuments({ userId, guildId });

    return {
        tier: subscription.tier,
        isPro: subscription.isPro(),
        status: subscription.status,
        limit: subscription.getItemLimit(),
        current: itemCount,
        remaining: subscription.isPro() ? 'Unlimited' : Math.max(0, subscription.getItemLimit() - itemCount)
    };
}

/**
 * Upgrade user to pro
 * @param {string} userId - Discord user ID
 * @param {string} stripeCustomerId - Stripe customer ID
 * @param {string} stripeSubscriptionId - Stripe subscription ID
 * @param {Date} periodStart - Period start date
 * @param {Date} periodEnd - Period end date
 * @returns {Promise<Object>} Updated subscription
 */
async function upgradeToPro(userId, stripeCustomerId, stripeSubscriptionId, periodStart, periodEnd) {
    return await Subscription.findOneAndUpdate(
        { userId },
        {
            tier: 'pro',
            status: 'active',
            stripeCustomerId,
            stripeSubscriptionId,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false
        },
        { upsert: true, new: true }
    );
}

/**
 * Downgrade user to free
 * @param {string} userId - Discord user ID
 * @returns {Promise<Object>} Updated subscription
 */
async function downgradeToFree(userId) {
    return await Subscription.findOneAndUpdate(
        { userId },
        {
            tier: 'free',
            status: 'active',
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            currentPeriodStart: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false
        },
        { new: true }
    );
}

/**
 * Cancel subscription at period end
 * @param {string} userId - Discord user ID
 * @returns {Promise<Object>} Updated subscription
 */
async function cancelAtPeriodEnd(userId) {
    return await Subscription.findOneAndUpdate(
        { userId },
        { cancelAtPeriodEnd: true },
        { new: true }
    );
}

/**
 * Update subscription from Stripe webhook
 * @param {Object} stripeSubscription - Stripe subscription object
 * @returns {Promise<Object>} Updated subscription
 */
async function updateFromStripe(stripeSubscription) {
    const userId = stripeSubscription.metadata.userId;

    const status = stripeSubscription.status === 'active' ||
        stripeSubscription.status === 'trialing'
        ? 'active'
        : stripeSubscription.status;

    return await Subscription.findOneAndUpdate(
        { userId },
        {
            status,
            stripeCustomerId: stripeSubscription.customer,
            stripeSubscriptionId: stripeSubscription.id,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
        },
        { upsert: true, new: true }
    );
}

module.exports = {
    getSubscription,
    checkItemLimit,
    getUpgradeMessage,
    shouldShowAds,
    getTierInfo,
    upgradeToPro,
    downgradeToFree,
    cancelAtPeriodEnd,
    updateFromStripe
};
