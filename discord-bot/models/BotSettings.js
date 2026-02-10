const mongoose = require('mongoose');

const botSettingsSchema = new mongoose.Schema({
    settingKey: {
        type: String,
        required: true,
        unique: true,
        enum: ['maidName', 'aiMode', 'aiProvider', 'aiApiKey'],
    },
    settingValue: {
        type: mongoose.Schema.Types.Mixed, // Can be string, boolean, etc.
        required: true,
    },
    updatedBy: {
        type: String, // Discord user ID of admin who made the change
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Static method to get a setting
botSettingsSchema.statics.getSetting = async function (key, defaultValue = null) {
    const setting = await this.findOne({ settingKey: key });
    return setting ? setting.settingValue : defaultValue;
};

// Static method to update a setting
botSettingsSchema.statics.updateSetting = async function (key, value, adminId = null) {
    return await this.findOneAndUpdate(
        { settingKey: key },
        {
            settingValue: value,
            updatedBy: adminId,
            updatedAt: new Date(),
        },
        { upsert: true, new: true }
    );
};

// Initialize default settings
botSettingsSchema.statics.initializeDefaults = async function () {
    const defaults = [
        { settingKey: 'maidName', settingValue: 'Seraphina Lumière' },
        { settingKey: 'aiMode', settingValue: false },
        { settingKey: 'aiProvider', settingValue: 'gemini' },
    ];

    for (const setting of defaults) {
        await this.findOneAndUpdate(
            { settingKey: setting.settingKey },
            setting,
            { upsert: true, setDefaultsOnInsert: true }
        );
    }
};

module.exports = mongoose.model('BotSettings', botSettingsSchema);
