const mongoose = require('mongoose');

const partnershipSchema = new mongoose.Schema({
    user1Id: {
        type: String,
        required: true,
        index: true,
    },
    user2Id: {
        type: String,
        required: true,
        index: true,
    },
    guildId: {
        type: String,
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['pending', 'active'],
        default: 'pending',
    },
    user1Emoji: {
        type: String,
        default: null, // Randomly assigned when accepted
    },
    user2Emoji: {
        type: String,
        default: null, // Randomly assigned when accepted
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    acceptedAt: {
        type: Date,
        default: null,
    },
});

// Compound index for querying partnerships in specific guilds
partnershipSchema.index({ user1Id: 1, user2Id: 1, guildId: 1 }, { unique: true });
partnershipSchema.index({ guildId: 1, status: 1 });

module.exports = mongoose.model('Partnership', partnershipSchema);
