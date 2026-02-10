const express = require('express');
const router = express.Router();
const Archive = require('../../discord-bot/models/Archive');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/archives
 * Get all archived items for authenticated user
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;

        const archives = await Archive.find({ userId })
            .sort({ archivedAt: -1 });

        res.json({
            success: true,
            count: archives.length,
            archives,
        });
    } catch (error) {
        console.error('Error fetching archives:', error);
        res.status(500).json({ error: 'Failed to fetch archives' });
    }
});

module.exports = router;
