const express = require('express');
const router = express.Router();
const Reminder = require('../../discord-bot/models/Reminder');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/reminders
 * Get all reminders for authenticated user
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;

        const reminders = await Reminder.find({ userId })
            .sort({ frequency: 1, itemName: 1 });

        // Add display names
        const remindersWithDisplay = await Promise.all(
            reminders.map(async (r) => {
                const hasDup = await r.hasDuplicates();
                return {
                    ...r.toObject(),
                    displayName: hasDup ? `${r.itemName} #${r.serialNumber}` : r.itemName,
                };
            })
        );

        res.json({
            success: true,
            count: remindersWithDisplay.length,
            reminders: remindersWithDisplay,
        });
    } catch (error) {
        console.error('Error fetching reminders:', error);
        res.status(500).json({ error: 'Failed to fetch reminders' });
    }
});

module.exports = router;
