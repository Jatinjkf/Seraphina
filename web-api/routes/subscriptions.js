const express = require('express');
const router = express.Router();
const Subscription = require('../../discord-bot/models/Subscription');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/admin/subscriptions
 * Get all subscriptions
 */
router.get('/subscriptions', requireAuth, async (req, res) => {
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
 * POST /api/admin/subscriptions/grant
 * Manually grant Pro subscription
 */
router.post('/subscriptions/grant', requireAuth, async (req, res) => {
    try {
        const { userId, duration } = req.body;

        if (!userId || !duration) {
            return res.status(400).json({ error: 'User ID and duration required' });
        }

        // Calculate expiration date
        let expirationDate;
        if (duration === 'lifetime') {
            expirationDate = new Date('2099-12-31');
        } else {
            const months = parseInt(duration);
            expirationDate = new Date();
            expirationDate.setMonth(expirationDate.getMonth() + months);
        }

        // Create or update subscription
        const subscription = await Subscription.findOneAndUpdate(
            { userId },
            {
                userId,
                tier: 'pro',
                status: 'active',
                currentPeriodEnd: expirationDate,
                razorpaySubscriptionId: `MANUAL_${Date.now()}`,
                grantedBy: 'admin',
                grantMethod: 'manual',
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        // Send DM to user via Discord client
        try {
            const client = req.app.get('discordClient');
            if (client) {
                const user = await client.users.fetch(userId);
                const dmChannel = await user.createDM();
                
                await dmChannel.send(`🎉 **Congratulations, Master~**\n\nYou've been granted **Pro subscription** ${duration === 'lifetime' ? 'for **LIFETIME**' : `for **${duration} month(s)**`}!\n\n✨ **Pro Benefits Unlocked:**\n• Unlimited learning items per server\n• Ad-free experience\n• Priority support\n• Early access to new features\n\n💫 Use \`/help\` to see all commands!\n\nThank you for being amazing! 🎀\n- Seraphina Lumière`);
            }
        } catch (dmError) {
            console.error('Could not send DM:', dmError);
        }

        res.json({
            success: true,
            message: 'Pro subscription granted successfully',
            subscription
        });

    } catch (error) {
        console.error('Grant Pro error:', error);
        res.status(500).json({ error: 'Failed to grant subscription' });
    }
});

/**
 * POST /api/admin/subscriptions/revoke
 * Manually revoke Pro subscription
 */
router.post('/subscriptions/revoke', requireAuth, async (req, res) => {
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
