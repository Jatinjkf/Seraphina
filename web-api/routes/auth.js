const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
require('dotenv').config();
const { generateToken } = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Admin login with password
 */
router.post('/login', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password required' });
        }

        // Simple password check (can be enhanced with bcrypt later)
        if (password === process.env.ADMIN_PASSWORD) {
            const token = generateToken('admin', true);

            res.json({
                success: true,
                token,
                expiresIn: '24h',
                message: 'Admin login successful',
            });
        } else {
            res.status(401).json({
                error: 'Invalid password',
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * POST /api/auth/verify
 * Verify if token is valid
 */
router.post('/verify', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token required' });
    }

    const jwt = require('jsonwebtoken');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({
            valid: true,
            isAdmin: decoded.isAdmin || false,
            userId: decoded.userId,
        });
    } catch (error) {
        res.json({
            valid: false,
            error: 'Invalid or expired token',
        });
    }
});

module.exports = router;
