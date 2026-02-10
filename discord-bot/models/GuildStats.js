const mongoose = require('mongoose');

/**
 * Track bot guild statistics
 * Records when bot joins/leaves servers
 */
const guildStatsSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    guildName: {
        type: String,
        required: true,
    },
    memberCount: {
        type: Number,
        default: 0,
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
    leftAt: {
        type: Date,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    // Track activity
    lastActivity: {
        type: Date,
        default: Date.now,
    },
    commandsUsed: {
        type: Number,
        default: 0,
    },
    // Owner info
    ownerId: {
        type: String,
    },
    ownerTag: {
        type: String,
    },
});

// Index for stats queries
guildStatsSchema.index({ isActive: 1, joinedAt: -1 });
guildStatsSchema.index({ lastActivity: -1 });

module.exports = mongoose.model('GuildStats', guildStatsSchema);
