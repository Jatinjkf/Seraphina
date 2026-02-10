const path = require('path');
// Load .env from project root (parent dir) or current dir
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
    // Discord Configuration
    discord: {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
    },

    // MongoDB Configuration
    mongodb: {
        uri: process.env.MONGODB_URI,
    },

    // Bot Configuration (hardcoded - admin can change via web UI)
    bot: {
        maidName: 'Seraphina Lumière',
        timezone: 'Asia/Kolkata',
        reminderTime: '00:00', // 12:00 AM IST
    },

    // Admin Configuration
    admin: {
        password: process.env.ADMIN_PASSWORD,
        userIds: process.env.ADMIN_USER_IDS ? process.env.ADMIN_USER_IDS.split(',') : [],
    },

    // Security
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '24h',
    },

    encryption: {
        key: process.env.ENCRYPTION_KEY,
    },

    // API Configuration
    api: {
        url: process.env.API_URL || 'http://localhost:3000',
        port: process.env.PORT || 3000,
    },

    web: {
        url: process.env.WEB_URL || 'http://localhost:5173',
    },

    // AI Configuration (Phase 2)
    ai: {
        provider: process.env.AI_PROVIDER || 'gemini',
        geminiKey: process.env.GEMINI_API_KEY,
        openaiKey: process.env.OPENAI_API_KEY,
        claudeKey: process.env.CLAUDE_API_KEY,
    },

    // Reminder Frequencies (in days)
    frequencies: {
        daily: 1,
        every2days: 2,
        every3days: 3,
        weekly: 7,
        biweekly: 14,
        monthly: 30,
    },
};
