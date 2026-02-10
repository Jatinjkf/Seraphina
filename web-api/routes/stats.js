const express = require('express');
const router = express.Router();
const Reminder = require('../../discord-bot/models/Reminder');
const Archive = require('../../discord-bot/models/Archive');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/stats
 * Get user statistics
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;

        // Count active and archived items
        const activeCount = await Reminder.countDocuments({ userId });
        const archivedCount = await Archive.countDocuments({ userId });

        // Get frequency breakdown
        const frequencies = await Reminder.aggregate([
            { $match: { userId } },
            { $group: { _id: '$frequency', count: { $sum: 1 } } }
        ]);

        const freqBreakdown = {};
        frequencies.forEach(f => {
            freqBreakdown[f._id] = f.count;
        });

        res.json({
            success: true,
            stats: {
                active: activeCount,
                archived: archivedCount,
                total: activeCount + archivedCount,
                frequencies: freqBreakdown,
            },
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

module.exports = router;
