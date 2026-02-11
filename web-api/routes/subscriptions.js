const express = require('express');
const router = express.Router();
const Subscription = require('../../discord-bot/models/Subscription');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/subscriptions
 * Get all subscriptions
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const subscriptions = await Subscription.find()
            .sort({ updatedAt: -1 })
            .limit(100);

        res.json({
            success: true,
            subscriptions
        });
    } catch (error) {
        console.error('Get subscriptions error:', error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

/**
 * POST /api/subscriptions/grant-pro
 * Manually grant Pro subscription
 */
router.post('/grant-pro', requireAuth, async (req, res) => {
    try {
        const { userId, duration } = req.body;
        console.log(`[API] Manual Grant Pro Request: User=${userId}, Duration=${duration}`);

        if (!userId || !duration) {
            console.warn('[API] Grant Pro failed: Missing userId or duration');
            return res.status(400).json({ error: 'User ID and duration required' });
        }

        // Calculate expiration date
        let expirationDate;
        if (duration === 'lifetime') {
            expirationDate = new Date('2099-12-31');
        } else {
            const months = parseInt(duration);
            if (isNaN(months)) {
                return res.status(400).json({ error: 'Invalid duration' });
            }
            expirationDate = new Date();
            expirationDate.setMonth(expirationDate.getMonth() + months);
        }

        console.log(`[API] Calculated Expiration: ${expirationDate.toISOString()}`);

        // Update Subscription
        // Note: Using upsert to create if not exists
        const subscription = await Subscription.findOneAndUpdate(
            { userId },
            {
                $set: {
                    userId,
                    tier: 'pro',
                    status: 'active',
                    currentPeriodEnd: expirationDate,
                    razorpaySubscriptionId: `MANUAL_${Date.now()}`,
                    grantedBy: 'admin', // You might want to pull this from req.user if available
                    grantMethod: 'manual',
                    updatedAt: new Date()
                }
            },
            { upsert: true, new: true, runValidators: true }
        );

        console.log(`[API] Subscription Updated: ${subscription._id}, Tier=${subscription.tier}`);

        // Send DM to user via Discord client logic
        // We rely on the app.get('discordClient') which must be set in server.js
        try {
            const client = req.app.get('discordClient');
            if (client) {
                console.log('[API] Attempting to send DM via Discord Client...');
                const user = await client.users.fetch(userId).catch(() => null);

                if (user) {
                    await user.send({
                        content: `🎉 **Congratulations, Master~**\n\nYou've been granted **Pro subscription** ${duration === 'lifetime' ? 'for **LIFETIME**' : `for **${duration} month(s)**`}!\n\n✨ **Pro Benefits Unlocked:**\n• Unlimited learning items per server\n• Ad-free experience\n• Priority support\n• Early access to new features\n\n💫 Use \`/help\` to see all commands!\n\nThank you for being amazing! 🎀`
                    });
                    console.log(`[API] DM sent to ${user.tag}`);
                } else {
                    console.warn(`[API] User ${userId} not found in cache/fetch.`);
                }
            } else {
                console.warn('[API] Discord client not found on app object.');
            }
        } catch (dmError) {
            console.error('[API] Could not send DM:', dmError);
            // We don't fail the request if DM fails, just log it
        }

        res.json({
            success: true,
            message: 'Pro subscription granted successfully',
            subscription
        });

    } catch (error) {
        console.error('[API] Grant Pro error:', error);
        res.status(500).json({ error: 'Failed to grant subscription', details: error.message });
    }
});

/**
 * POST /api/subscriptions/revoke-pro
 * Manually revoke Pro subscription
 */
router.post('/revoke-pro', requireAuth, async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        const subscription = await Subscription.findOne({ userId });

        if (!subscription || subscription.tier === 'free') {
            return res.status(400).json({ error: 'User is already on Free tier' });
        }

        // Downgrade to free
        subscription.tier = 'free';
        subscription.status = 'cancelled';
        subscription.updatedAt = new Date();
        await subscription.save();

        // Send DM to user
        try {
            const client = req.app.get('discordClient');
            if (client) {
                const user = await client.users.fetch(userId);
                const dmChannel = await user.createDM();

                await dmChannel.send(`📢 **Pro Subscription Update**\n\nYour Pro subscription has ended, Master~\n\nYou've been downgraded to **Free tier**:\n• 25 learning items per server\n• All core features still available\n\n💎 Want Pro back? Use \`/subscribe\` anytime!\n\n- Seraphina Lumière 🎀`);
            }
        } catch (dmError) {
            console.error('Could not send DM:', dmError);
        }

        res.json({
            success: true,
            message: 'Pro subscription revoked successfully',
            subscription
        });

    } catch (error) {
        console.error('Revoke Pro error:', error);
        res.status(500).json({ error: 'Failed to revoke subscription' });
    }
});

module.exports = router;
