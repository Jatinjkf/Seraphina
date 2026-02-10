const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const mongoose = require('mongoose');

/**
 * DELETE /api/admin/clear-database
 * Clear database except subscriptions
 */
router.delete('/clear-database', requireAuth, async (req, res) => {
    try {
        const { confirmation } = req.body;

        if (confirmation !== 'CLEAR_ALL_DATA') {
            return res.status(400).json({
                error: 'Invalid confirmation. Send { "confirmation": "CLEAR_ALL_DATA" }'
            });
        }

        // Get all model names except Subscription
        const collections = mongoose.connection.collections;
        const results = {};

        for (const collectionName in collections) {
            // Skip subscription collection
            if (collectionName.toLowerCase() === 'subscriptions') {
                results[collectionName] = 'SKIPPED (preserved)';
                continue;
            }

            const collection = collections[collectionName];
            const deleteResult = await collection.deleteMany({});
            results[collectionName] = `${deleteResult.deletedCount} documents deleted`;
        }

        res.json({
            success: true,
            message: 'Database cleared successfully (subscriptions preserved)',
            results
        });

    } catch (error) {
        console.error('Clear database error:', error);
        res.status(500).json({ error: 'Failed to clear database' });
    }
});

/**
 * GET /api/admin/database-stats
 * Get document counts for all collections
 */
router.get('/database-stats', requireAuth, async (req, res) => {
    try {
        const collections = mongoose.connection.collections;
        const stats = {};

        for (const collectionName in collections) {
            const collection = collections[collectionName];
            const count = await collection.countDocuments();
            stats[collectionName] = count;
        }

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Get database stats error:', error);
        res.status(500).json({ error: 'Failed to get database stats' });
    }
});

module.exports = router;
