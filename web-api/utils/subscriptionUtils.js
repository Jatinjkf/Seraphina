const Subscription = require('../../discord-bot/models/Subscription');

/**
 * Upgrade user to Pro subscription
 * @param {string} userId - Discord user ID
 * @param {number} months - Duration in months
 * @param {string} source - Payment source (razorpay, stripe, manual)
 * @returns {Promise<Object>} Subscription object
 */
async function upgradeToPro(userId, months, source = 'manual') {
    try {
        // Calculate end date
        const now = new Date();
        const endDate = new Date(now);

        // If months is 9999, treat as lifetime (100 years)
        if (months >= 9999) {
            endDate.setFullYear(endDate.getFullYear() + 100);
        } else {
            endDate.setMonth(endDate.getMonth() + months);
        }

        // Find or create subscription
        let subscription = await Subscription.findOne({ userId });

        if (subscription) {
            // Update existing subscription
            subscription.tier = 'pro';
            subscription.status = 'active';
            subscription.currentPeriodEnd = endDate;
            subscription.paymentSource = source;
            await subscription.save();
        } else {
            // Create new subscription
            subscription = await Subscription.create({
                userId,
                tier: 'pro',
                status: 'active',
                currentPeriodEnd: endDate,
                paymentSource: source
            });
        }

        console.log(`✓ User ${userId} upgraded to Pro (${months} months, source: ${source})`);
        return subscription;

    } catch (error) {
        console.error('Error upgrading to Pro:', error);
        throw error;
    }
}

/**
 * Downgrade user to Free tier
 * @param {string} userId - Discord user ID
 * @returns {Promise<Object>} Subscription object
 */
async function downgradeToFree(userId) {
    try {
        const subscription = await Subscription.findOne({ userId });

        if (!subscription) {
            // No subscription exists, create free tier
            const newSub = await Subscription.create({
                userId,
                tier: 'free',
                status: 'active'
            });
            console.log(`✓ User ${userId} set to Free tier (new)`);
            return newSub;
        }

        // Update to free
        subscription.tier = 'free';
        subscription.status = 'active';
        subscription.currentPeriodEnd = null;
        subscription.paymentSource = null;
        await subscription.save();

        console.log(`✓ User ${userId} downgraded to Free`);
        return subscription;

    } catch (error) {
        console.error('Error downgrading to Free:', error);
        throw error;
    }
}

/**
 * Update subscription from Stripe webhook
 * @param {Object} stripeData - Stripe event data
 * @returns {Promise<Object>} Updated subscription
 */
async function updateFromStripe(stripeData) {
    try {
        const { customer, status, current_period_end } = stripeData;

        // Find subscription by Stripe customer ID
        // Note: You'll need to add stripeCustomerId field to Subscription model
        const subscription = await Subscription.findOne({
            stripeCustomerId: customer
        });

        if (!subscription) {
            throw new Error(`Subscription not found for Stripe customer: ${customer}`);
        }

        // Update based on status
        if (status === 'active') {
            subscription.tier = 'pro';
            subscription.status = 'active';
            subscription.currentPeriodEnd = new Date(current_period_end * 1000);
        } else if (status === 'canceled' || status === 'past_due') {
            subscription.tier = 'free';
            subscription.status = 'canceled';
        }

        subscription.paymentSource = 'stripe';
        await subscription.save();

        console.log(`✓ Subscription updated from Stripe for user ${subscription.userId}`);
        return subscription;

    } catch (error) {
        console.error('Error updating from Stripe:', error);
        throw error;
    }
}

/**
 * Get user subscription
 * @param {string} userId - Discord user ID
 * @returns {Promise<Object>} Subscription object
 */
async function getSubscription(userId) {
    try {
        let subscription = await Subscription.findOne({ userId });

        // Create free tier if doesn't exist
        if (!subscription) {
            subscription = await Subscription.create({
                userId,
                tier: 'free',
                status: 'active'
            });
            console.log(`✓ Created free tier subscription for user ${userId}`);
        }

        return subscription;

    } catch (error) {
        console.error('Error getting subscription:', error);
        throw error;
    }
}

module.exports = {
    upgradeToPro,
    downgradeToFree,
    updateFromStripe,
    getSubscription
};
