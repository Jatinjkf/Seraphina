const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

// Initialize Express app
const app = express();

// Trust proxy for Koyeb/production deployments
app.set('trust proxy', 1);

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for Vercel deployment
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

// General API rate limiting (100 requests per 15 minutes)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limit for sensitive endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: 'Too many authentication attempts, please try again later',
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/admin/', authLimiter);

// Request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✓ API connected to MongoDB');
    })
    .catch(err => {
        console.error('✗ MongoDB connection error:', err);
        process.exit(1);
    });

// API Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const preferencesRoutes = require('./routes/preferences');
const remindersRoutes = require('./routes/reminders');
const archivesRoutes = require('./routes/archives');
const contactRoutes = require('./routes/contact');
const statsRoutes = require('./routes/stats');
const guildStatsRoutes = require('./routes/guildStats');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/archives', archivesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/stats', guildStatsRoutes); // Guild statistics




// Health check (for UptimeRobot - responds at root!)
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Seraphina API',
        timestamp: new Date().toISOString(),
    });
});

// Health check (API path)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path,
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✓ API server running on port ${PORT}`);
    console.log(`  http://localhost:${PORT}/api/health`);
});

module.exports = app;
