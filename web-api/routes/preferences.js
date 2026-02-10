const express = require('express');
const router = express.Router();
const UserPreferences = require('../../discord-bot/models/UserPreferences');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/preferences
 * Get user preferences
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;

        let prefs = await UserPreferences.findOne({ userId });

        if (!prefs) {
            prefs = new UserPreferences({
                userId,
                honorific: 'Master',
                isFirstTime: false,
            });
            await prefs.save();
        }

        res.json({
            success: true,
            preferences: prefs,
        });
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
});

/**
 * PUT /api/preferences
 * Update user preferences
 */
router.put('/', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const { honorific } = req.body;

        if (!honorific) {
            return res.status(400).json({ error: 'Honorific required' });
        }

        const prefs = await UserPreferences.findOneAndUpdate(
            { userId },
            { honorific, updatedAt: new Date() },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            message: 'Preferences updated',
            preferences: prefs,
        });
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

module.exports = router;
