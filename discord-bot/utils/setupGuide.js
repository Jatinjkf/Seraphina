const { EmbedBuilder } = require('discord.js');

/**
 * Create user guide embed for learning channel
 */
function createUserGuide(guildName) {
    return new EmbedBuilder()
        .setColor(0xFF1493) // Deep pink
        .setTitle('🎀 How to Use Seraphina Lumière ✨')
        .setDescription('Your devoted maid companion for spaced repetition learning!')
        .addFields(
            {
                name: '📚 Quick Start for Users',
                value:
                    '**1. Set Your Learning Channel** (one-time)\n' +
                    '   `/setup-channel #your-preferred-channel`\n\n' +
                    '**2. Post Images with Captions**\n' +
                    '   Just post an image with a caption in your learning channel!\n' +
                    '   I\'ll automatically create reminders~ 🌸\n\n' +
                    '**3. Get Daily Reminders**\n' +
                    '   I\'ll DM you at midnight with items to review! 💫'
            },
            {
                name: '✨ Essential Commands',
                value:
                    '• `/upload` - Manually add a reminder\n' +
                    '• `/list` - View all your active reminders\n' +
                    '• `/view <item>` - See a specific reminder\n' +
                    '• `/delete <item>` - Remove a reminder\n' +
                    '• `/stats` - Check your progress!'
            },
            {
                name: '🤝 Study with Friends',
                value:
                    '• `/partner @friend` - Invite a study buddy!\n' +
                    '• You can see each other\'s items (in this server only)\n' +
                    '• `/leave-partner` - End partnership'
            },
            {
                name: '🏆 Advanced Features',
                value:
                    '• `/archive <item>` - Mark as mastered\n' +
                    '• `/unarchive <item>` - Resume learning\n' +
                    '• `/rename <old> <new>` - Rename an item\n' +
                    '• `/move <item> <freq>` - Change reminder frequency\n' +
                    '• `/settings` - View your preferences'
            },
            {
                name: '💡 Pro Tips',
                value:
                    '✨ **Auto-detection** works in your learning channel - just post images!\n' +
                    '💫 **Partnerships** are server-specific - different partners in different servers\n' +
                    '🎯 Use **meaningful names** for easy searching\n' +
                    '📊 Check `/stats` regularly to track your progress!'
            },
            {
                name: '⚙️ For Administrators',
                value:
                    'Server already set up! To reconfigure:\n' +
                    '• `/setup-wizard` - Re-run server setup\n' +
                    '• Requires Administrator permission'
            }
        )
        .setFooter({ text: `At your service in ${guildName} 💕` })
        .setTimestamp();
}

/**
 * Post and pin guide in learning channel
 */
async function postAndPinGuide(channel, guildName) {
    try {
        const guide = createUserGuide(guildName);
        const message = await channel.send({ embeds: [guide] });

        // Pin the message
        await message.pin();

        // Delete the "{user} pinned a message" notification if bot can manage messages
        const pinnedNotification = (await channel.messages.fetch({ limit: 1 })).first();
        if (pinnedNotification?.type === 6 && channel.permissionsFor(channel.guild.members.me).has('ManageMessages')) {
            await pinnedNotification.delete().catch(() => { });
        }

        return message.id;
    } catch (error) {
        console.error('Error posting guide:', error);
        throw error;
    }
}

module.exports = { createUserGuide, postAndPinGuide };
