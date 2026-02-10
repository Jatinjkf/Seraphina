const mongoose = require('mongoose');

const archiveSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    guildId: {
        type: String,
        required: true,
        index: true,
    },
    itemName: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: false, // Optional - some archives might not have images
    },
    storageChannelId: {
        type: String,
        required: false,
    },
    storageMessageId: {
        type: String,
        required: false,
    },
    originalFrequency: {
        type: String,
        enum: ['daily', 'every2days', 'every3days', 'weekly', 'biweekly', 'monthly'],
    },
    archivedAt: {
        type: Date,
        default: Date.now,
    },
    learnedAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for faster queries by guild
archiveSchema.index({ userId: 1, guildId: 1, archivedAt: -1 });

module.exports = mongoose.model('Archive', archiveSchema);
