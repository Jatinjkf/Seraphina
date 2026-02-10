const mongoose = require('mongoose');

const guildSettingsSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    storageChannelId: {
        type: String,
        default: null,
    },
    learningChannelId: {
        type: String,
        default: null,
    },
    adminRoleId: {
        type: String,
        default: null,
    },
    timezone: {
        type: String,
        default: 'Asia/Kolkata',
    },
    welcomeDMs: {
        type: Boolean,
        default: false,
    },
    setupCompleted: {
        type: Boolean,
        default: false,
    },
    setupBy: {
        type: String,
        default: null,
    },
    setupAt: {
        type: Date,
        default: null,
    },
    guideMessageId: {
        type: String,
        default: null,
    },
    guildName: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Static method to get storage channel for a guild
guildSettingsSchema.statics.getStorageChannel = async function (guildId) {
    const settings = await this.findOne({ guildId });
    return settings ? settings.storageChannelId : null;
};

// Static method to set storage channel for a guild
guildSettingsSchema.statics.setStorageChannel = async function (guildId, channelId, guildName = null) {
    return await this.findOneAndUpdate(
        { guildId },
        {
            storageChannelId: channelId,
            guildName,
            updatedAt: new Date(),
        },
        { upsert: true, new: true }
    );
};

// Static method to clear storage channel for a guild
guildSettingsSchema.statics.clearStorageChannel = async function (guildId) {
    return await this.findOneAndUpdate(
        { guildId },
        {
            storageChannelId: null,
            updatedAt: new Date(),
        },
        { upsert: true, new: true }
    );
};

module.exports = mongoose.model('GuildSettings', guildSettingsSchema);
