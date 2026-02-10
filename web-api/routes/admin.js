const express = require('express');
const router = express.Router();
const BotSettings = require('../../discord-bot/models/BotSettings');
const { authenticateAdmin } = require('../middleware/auth');

/**
 * GET /api/admin/settings
 * Get all global bot settings (admin only)
 */
router.get('/settings', authenticateAdmin, async (req, res) => {
    try {
        const settings = {};

        // Get all settings
        const settingsKeys = ['maidName', 'aiMode', 'aiProvider', 'storageChannelId'];

        for (const key of settingsKeys) {
            settings[key] = await BotSettings.getSetting(key);
        }

        res.json({
            success: true,
            settings,
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

/**
 * PUT /api/admin/settings
 * Update global bot settings (admin only)
 */
router.put('/settings', authenticateAdmin, async (req, res) => {
    try {
        const { settingKey, settingValue } = req.body;

        if (!settingKey) {
            return res.status(400).json({ error: 'Setting key required' });
        }

        // Allowed settings to update
        const allowedSettings = ['maidName', 'aiMode', 'aiProvider', 'timezone', 'storageChannelId'];

        if (!allowedSettings.includes(settingKey)) {
            return res.status(400).json({ error: 'Invalid setting key' });
        }

        // Update setting
        await BotSettings.updateSetting(settingKey, settingValue, req.user.userId);

        res.json({
            success: true,
            message: `${settingKey} updated successfully`,
            setting: {
                key: settingKey,
                value: settingValue,
            },
        });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ error: 'Failed to update setting' });
    }
});

/**
 * POST /api/admin/settings/bulk
 * Update multiple settings at once
 */
router.post('/settings/bulk', authenticateAdmin, async (req, res) => {
    try {
        const { settings } = req.body;

        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({ error: 'Settings object required' });
        }

        const updated = [];
        const allowedSettings = ['maidName', 'aiMode', 'aiProvider', 'timezone', 'storageChannelId'];

        for (const [key, value] of Object.entries(settings)) {
            if (allowedSettings.includes(key)) {
                await BotSettings.updateSetting(key, value, req.user.userId);
                updated.push(key);
            }
        }

        res.json({
            success: true,
            message: `Updated ${updated.length} settings`,
            updated,
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

module.exports = router;
