/**
 * Random color utility for embeds
 * Returns a random color from pink, gold, and blue palette
 */

const EMBED_COLORS = [
    '#ec4899', // Pink
    '#FFD700', // Gold
    '#3498db', // Blue
];

/**
 * Get a random embed color
 * @returns {string} Hex color code
 */
function getRandomColor() {
    return EMBED_COLORS[Math.floor(Math.random() * EMBED_COLORS.length)];
}

module.exports = {
    getRandomColor,
    EMBED_COLORS
};
