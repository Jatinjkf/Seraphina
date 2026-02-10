const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { upgradeToPro, downgradeToFree, updateFromStripe, getSubscription } = require('../utils/subscriptionUtils');

// Initialize Razorpay ONLY if keys are provided (optional for testing)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('✓ Razorpay initialized');
} else {
    console.log('⚠ Razorpay not configured - payment endpoints will be disabled');
}

/**
 * Create Razorpay subscription order
 * POST /api/payment/create-subscription
 * Body: { userId, planId }
 */
router.post('/create-subscription', async (req, res) => {
    if (!razorpay) {
        return res.status(503).json({
            error: 'Payment system not configured',
            message: 'Razorpay API keys not found in environment variables'
        });
    }

    try {
        const { userId, planId } = req.body;

        if (!userId || !planId) {
            return res.status(400).json({ error: 'Missing userId or planId' });
        }

        // Create subscription
        const subscription = await razorpay.subscriptions.create({
            plan_id: planId || process.env.RAZORPAY_PLAN_ID_PRO, // Default to Pro plan
            customer_notify: 1,
            total_count: 12, // 12 months, then auto-renew
            notes: {
                userId: userId
            }
        });

        res.json({
            subscriptionId: subscription.id,
            status: subscription.status
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});

/**
 * Verify Razorpay payment
 * POST /api/payment/verify
 * Body: { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, userId }
 */
router.post('/verify', async (req, res) => {
    if (!razorpay) {
        return res.status(503).json({
            error: 'Payment system not configured',
            message: 'Razorpay API keys not found in environment variables'
        });
    }

    try {
        const {
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
            userId
        } = req.body;

        // Verify signature
        const body = razorpay_payment_id + '|' + razorpay_subscription_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid signature' });
        }

        // Fetch subscription details from Razorpay
        const subscription = await razorpay.subscriptions.fetch(razorpay_subscription_id);

        // Upgrade user to pro
        await upgradeToPro(
            userId,
            subscription.id, // Use subscription ID as customer ID
            razorpay_subscription_id,
            new Date(subscription.start_at * 1000),
            new Date(subscription.end_at * 1000)
        );

        res.json({
            success: true,
            message: 'Payment verified and subscription activated!'
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

/**
 * Razorpay webhook handler
 * POST /api/payment/webhook
 */
router.post('/webhook', async (req, res) => {
    if (!razorpay) {
        return res.status(503).json({ error: 'Payment system not configured' });
    }

    try {
        // Verify webhook signature
        const signature = req.headers['x-razorpay-signature'];
        const body = JSON.stringify(req.body);

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(400).json({ error: 'Invalid webhook signature' });
        }

        const event = req.body.event;
        const payload = req.body.payload.subscription.entity;

        console.log(`Razorpay webhook received: ${event}`);

        // Handle different events
        switch (event) {
            case 'subscription.activated':
            case 'subscription.charged':
                // Upgrade user to pro
                const userId = payload.notes.userId;
                await upgradeToPro(
                    userId,
                    payload.id,
                    payload.id,
                    new Date(payload.start_at * 1000),
                    new Date(payload.end_at * 1000)
                );
                break;

            case 'subscription.cancelled':
            case 'subscription.completed':
            case 'subscription.expired':
                // Downgrade user to free
                const cancelledUserId = payload.notes.userId;
                await downgradeToFree(cancelledUserId);
                break;

            case 'subscription.paused':
            case 'subscription.halted':
                // Optionally pause access
                console.log(`Subscription paused for user: ${payload.notes.userId}`);
                break;

            default:
                console.log(`Unhandled event: ${event}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

/**
 * Get user subscription status
 * GET /api/payment/subscription/:userId
 */
router.get('/subscription/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const subscription = await getSubscription(userId);

        res.json({
            tier: subscription.tier,
            status: subscription.status,
            isPro: subscription.isPro(),
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ error: 'Failed to fetch subscription' });
    }
});

/**
 * Cancel subscription
 * POST /api/payment/cancel-subscription
 * Body: { userId }
 */
router.post('/cancel-subscription', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        const subscription = await getSubscription(userId);

        if (!subscription.stripeSubscriptionId) {
            return res.status(400).json({ error: 'No active subscription found' });
        }

        // Cancel subscription in Razorpay
        await razorpay.subscriptions.cancel(subscription.stripeSubscriptionId);

        // Mark as cancelled in database
        subscription.cancelAtPeriodEnd = true;
        subscription.status = 'cancelled';
        await subscription.save();

        res.json({
            success: true,
            message: 'Subscription cancelled. Access continues until end of billing period.'
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});

/**
 * Get pricing plans
 * GET /api/payment/plans
 */
router.get('/plans', (req, res) => {
    res.json({
        free: {
            name: 'Free',
            price: 0,
            currency: 'INR',
            features: [
                '25 learning items per server',
                'All reminder frequencies',
                'Basic commands',
                'Ads included'
            ]
        },
        pro: {
            name: 'Pro',
            price: 399,
            currency: 'INR',
            interval: 'month',
            planId: process.env.RAZORPAY_PLAN_ID_PRO,
            features: [
                'Unlimited learning items per server',
                'No ads',
                'Partner system',
                'Archive features',
                'Priority support',
                'Future AI features'
            ]
        }
    });
});

/**
 * Get payment provider key (generic endpoint)
 * GET /api/payment/payment-key
 */
router.get('/payment-key', (req, res) => {
    res.json({
        key: process.env.RAZORPAY_KEY_ID || ''
    });
});

module.exports = router;
