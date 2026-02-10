const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    // Discord user ID
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Subscription tier
    tier: {
        type: String,
        enum: ['free', 'pro'],
        default: 'free'
    },

    // Stripe data
    stripeCustomerId: {
        type: String,
        default: null
    },

    stripeSubscriptionId: {
        type: String,
        default: null
    },

    // Subscription status
    status: {
        type: String,
        enum: ['active', 'cancelled', 'past_due', 'trialing'],
        default: 'active'
    },

    // Billing period
    currentPeriodStart: {
        type: Date,
        default: null
    },

    currentPeriodEnd: {
        type: Date,
        default: null
    },

    // Cancellation
    cancelAtPeriodEnd: {
        type: Boolean,
        default: false
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
subscriptionSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Check if user is on pro tier
subscriptionSchema.methods.isPro = function () {
    return this.tier === 'pro' &&
        this.status === 'active' &&
        (!this.currentPeriodEnd || this.currentPeriodEnd > new Date());
};

// Check if subscription is active
subscriptionSchema.methods.isActive = function () {
    return this.status === 'active' &&
        (!this.currentPeriodEnd || this.currentPeriodEnd > new Date());
};

// Get item limit based on tier
subscriptionSchema.methods.getItemLimit = function () {
    if (this.isPro()) {
        return Infinity;
    }
    return 25; // Free tier limit
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
