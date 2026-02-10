const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'guildCreate',
    once: false,

    async execute(guild) {
        console.log(`✨ Joined new server: ${guild.name} (${guild.id})`);

        // Find first text channel the bot can send messages in
        const channel = guild.channels.cache.find(ch =>
            ch.type === 0 && // Text channel
            ch.permissionsFor(guild.members.me)?.has(['SendMessages', 'EmbedLinks'])
        );

        if (!channel) {
            console.warn(`⚠️ No accessible channels in ${guild.name}`);
            return;
        }

        // Create welcome embed
        const welcomeEmbed = new EmbedBuilder()
            .setColor(0xFF1493) // Deep pink
            .setTitle('🎀 Welcome to Seraphina Lumière! ✨')
            .setDescription('*Your devoted maid companion for spaced repetition learning*')
            .addFields(
                {
                    name: '📚 What I Do',
                    value: 'I help you remember anything with spaced repetition! Post images in a learning channel, and I\'ll send you daily reminders via DM to review them~ 💫'
                },
                {
                    name: '🌟 Key Features',
                    value:
                        '• **Smart Reminders** - Daily DMs at midnight in your timezone\n' +
                        '• **Auto-Detection** - Just post images, I handle the rest!\n' +
                        '• **Study Buddies** - Partner system to learn together\n' +
                        '• **Progress Tracking** - Archive mastered items and track stats\n' +
                        '• **Per-Server Isolation** - Your data stays private per server'
                },
                {
                    name: '🚀 Get Started',
                    value:
                        'Click the button below to set up your server!\n\n' +
                        '**This requires Administrator permission** 🔐\n\n' +
                        'Setup takes ~30 seconds and includes:\n' +
                        '✓ Learning channel selection\n' +
                        '✓ Storage channel configuration\n' +
                        '✓ Optional admin settings'
                },
                {
                    name: '💡 Need Help?',
                    value: 'After setup, I\'ll post a detailed guide in your learning channel!'
                }
            )
            .setFooter({ text: 'Ready to serve, Master~ 💕 | Type /setup-wizard to begin' })
            .setTimestamp();

        // Create setup button
        const setupButton = new ButtonBuilder()
            .setCustomId('start_setup_wizard')
            .setLabel('🎀 Start Server Setup')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('✨');

        const row = new ActionRowBuilder()
            .addComponents(setupButton);

        try {
            await channel.send({
                embeds: [welcomeEmbed],
                components: [row]
            });

            console.log(`✅ Welcome message sent in ${guild.name}`);
        } catch (error) {
            console.error(`Failed to send welcome message in ${guild.name}:`, error);
        }
    }
};
