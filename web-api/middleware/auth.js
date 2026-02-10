const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware to verify JWT token
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        req.user = user;
        next();
    });
}

/**
 * Middleware to verify admin access
 */
function authenticateAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Admin access required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        // Check if user is admin
        if (!user.isAdmin) {
            return res.status(403).json({ error: 'Admin privileges required' });
        }

        req.user = user;
        next();
    });
}

/**
 * Generate JWT token for user
 */
function generateToken(userId, isAdmin = false) {
    return jwt.sign(
        {
            userId,
            isAdmin,
            timestamp: Date.now(),
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
}

module.exports = {
    authenticateToken,
    authenticateAdmin,
    requireAuth: authenticateAdmin, // Alias for admin routes
    generateToken,
};

