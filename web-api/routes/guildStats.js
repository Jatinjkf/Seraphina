const express = require('express');
const GuildStats = require('../../discord-bot/models/GuildStats');

const router = express.Router();

/**
 * GET /api/stats/guilds
 * Get guild statistics
 */
router.get('/guilds', async (req, res) => {
    try {
        // Total active guilds
        const totalActive = await GuildStats.countDocuments({ isActive: true });

        // Total all-time guilds
        const totalAllTime = await GuildStats.countDocuments({});

        // Recently joined (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentJoins = await GuildStats.countDocuments({
            joinedAt: { $gte: sevenDaysAgo },
            isActive: true
        });

        // Total members across all guilds
        const memberStats = await GuildStats.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    totalMembers: { $sum: '$memberCount' }
                }
            }
        ]);

        const totalMembers = memberStats[0]?.totalMembers || 0;

        // Recent guilds (last 10)
        const recentGuilds = await GuildStats.find({ isActive: true })
            .sort({ joinedAt: -1 })
            .limit(10)
            .select('guildName memberCount joinedAt ownerTag');

        // Top guild by member count
        const topGuilds = await GuildStats.find({ isActive: true })
            .sort({ memberCount: -1 })
            .limit(5)
            .select('guildName memberCount');

        res.json({
            success: true,
            stats: {
                totalActive,
                totalAllTime,
                recentJoins,
                totalMembers,
                averageMembers: totalActive > 0 ? Math.round(totalMembers / totalActive) : 0
            },
            recentGuilds,
            topGuilds
        });
    } catch (error) {
        console.error('Guild stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch guild statistics'
        });
    }
});

/**
 * GET /api/stats/guilds/all
 * Get all guilds (paginated)
 */
router.get('/guilds/all', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const guilds = await GuildStats.find({ isActive: true })
            .sort({ joinedAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('guildName memberCount joinedAt lastActivity ownerTag');

        const total = await GuildStats.countDocuments({ isActive: true });

        res.json({
            success: true,
            guilds,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Guilds list error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch guilds'
        });
    }
});

module.exports = router;
