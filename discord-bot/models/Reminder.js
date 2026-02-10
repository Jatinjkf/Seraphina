const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
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
    serialNumber: {
        type: Number,
        required: true,
        default: 1,
    },
    storageChannelId: {
        type: String,
        required: true,
    },
    storageMessageId: {
        type: String,
        required: true,
    },
    frequency: {
        type: String,
        enum: ['daily', 'every2days', 'every3days', 'weekly', 'biweekly', 'monthly'],
        default: 'daily',
    },
    nextReminder: {
        type: Date,
        required: true,
    },
    lastReminded: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create compound index for user + guild + item name queries
reminderSchema.index({ userId: 1, guildId: 1 });
reminderSchema.index({ userId: 1, guildId: 1, itemName: 1 });

// Virtual for display name
reminderSchema.virtual('displayName').get(function () {
    return this.serialNumber > 1 ? `${this.itemName} #${this.serialNumber}` : this.itemName;
});

// Method to check if there are duplicates for this item name in this guild
reminderSchema.methods.hasDuplicates = async function () {
    const count = await this.constructor.countDocuments({
        userId: this.userId,
        guildId: this.guildId,
        itemName: this.itemName,
    });
    return count > 1;
};

// Static method to get next serial number for an item in a specific guild
reminderSchema.statics.getNextSerialNumber = async function (userId, guildId, itemName) {
    const count = await this.countDocuments({ userId, guildId, itemName });
    return count + 1;
};

// Ensure virtuals are included in JSON
reminderSchema.set('toJSON', { virtuals: true });
reminderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Reminder', reminderSchema);
