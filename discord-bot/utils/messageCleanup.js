/**
 * Auto-delete message cleanup utility
 * Keeps channels clean by removing bot responses after timeout
 */

/**
 * Auto-delete a message after specified seconds
 * @param {Message} message - Discord message to delete
 * @param {number} seconds - Seconds to wait before deletion
 */
async function autoDeleteAfter(message, seconds = 30) {
    if (!message || !message.deletable) return;

    setTimeout(async () => {
        try {
            await message.delete();
        } catch (error) {
            // Message already deleted or bot lacks permissions
            // Silently fail - this is not critical
        }
    }, seconds * 1000);
}

/**
 * Delete multiple messages after timeout
 * @param {Array<Message>} messages - Array of messages to delete
 * @param {number} seconds - Seconds to wait
 */
async function autoDeleteMultiple(messages, seconds = 30) {
    for (const message of messages) {
        await autoDeleteAfter(message, seconds);
    }
}

/**
 * Cleanup timeouts by message type
 */
const CLEANUP_TIMEOUTS = {
    LIST: 30,           // /list command
    VIEW: 30,           // /view command
    UPLOAD_SUCCESS: 15, // Upload confirmations
    ERROR: 20,          // Error messages
    MOVE_SUCCESS: 15,   // Move confirmations
    RENAME_SUCCESS: 15, // Rename confirmations
    DELETE_SUCCESS: 10, // Delete confirmations
};

module.exports = {
    autoDeleteAfter,
    autoDeleteMultiple,
    CLEANUP_TIMEOUTS
};
