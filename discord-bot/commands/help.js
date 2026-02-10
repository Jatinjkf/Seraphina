const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View all available commands'),

    async execute(interaction) {
        const helpText = `\`\`\`
╔═══════════════════════════════════════════════════╗
║      🎀 Seraphina's Command Directory 🎀          ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║  📋 LEARNING MANAGEMENT                           ║
║  ├─ /upload [image] [frequency]                   ║
║  │  └─ Add a new item to your ledger ✨           ║
║  ├─ /list                                         ║
║  │  └─ View your beautiful learning menu 📖       ║
║  ├─ /view [item]                                  ║
║  │  └─ See details and image of an item 👁️       ║
║  ├─ /move [item] [frequency]                      ║
║  │  └─ Change reminder frequency 🔄               ║
║  ├─ /rename [old name] [new name]                 ║
║  │  └─ Give an item a new name 📝                 ║
║  └─ /delete [item]                                ║
║     └─ Remove item from ledger 🗑️                 ║
║                                                   ║
║  📦 ARCHIVE MANAGEMENT                            ║
║  ├─ /archive [item]                               ║
║  │  └─ Mark item as mastered! 🏆                  ║
║  ├─ /unarchive [item]                             ║
║  │  └─ Restore archived item 📚                   ║
║  └─ /view-archive                                 ║
║     └─ Browse your achievements ✨                ║
║                                                   ║
║  👥 LEARNING PARTNERS                             ║
║  ├─ /partner [@user]                              ║
║  │  └─ Invite someone to learn together 💌        ║
║  ├─ /leave-partner                                ║
║  │  └─ Exit partnership 🍃                        ║
║  └─ /view-partner                                 ║
║     └─ See partner details 👁️                     ║
║                                                   ║
║  ⚙️  CONFIGURATION                                 ║
║  ├─ /setup-channel                                ║
║  │  └─ Enable auto-detection here 🎯              ║
║  ├─ /settings [honorific]                         ║
║  │  └─ Change how I address you 🎭                ║
║  ├─ /stats                                        ║
║  │  └─ View your progress 📊                      ║
║  └─ /subscribe                                    ║
║     └─ Upgrade to Pro! (Unlimited items) 💎       ║
║                                                   ║
╠═══════════════════════════════════════════════════╣
║  📅 REMINDER FREQUENCIES                          ║
║  ├─ [daily] - Every day                           ║
║  ├─ [every2days] - Every 2 days                   ║
║  ├─ [every3days] - Every 3 days                   ║
║  ├─ [weekly] - Every 7 days                       ║
║  ├─ [biweekly] - Every 14 days                    ║
║  └─ [monthly] - Every 30 days                     ║
║                                                   ║
╠═══════════════════════════════════════════════════╣
║  💡 AUTO-DETECTION                                ║
║  └─ Post images in your learning channel with     ║
║     caption "[item name] [frequency]" and I'll    ║
║     add them automatically! ✨                     ║
║                                                   ║
╠═══════════════════════════════════════════════════╣
║  ⏰ REMINDERS                                      ║
║  └─ Sent daily at 12:00 AM IST 🌙                 ║
║                                                   ║
╠═══════════════════════════════════════════════════╣
║  💌 NEED HELP?                                     ║
║  └─ DM me anytime! I'll introduce myself and      ║
║     help you get started~ ✨                       ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
\`\`\`
✨ *Seraphina is devoted to your learning journey, Master~* 🎀

💭 *Use this command anytime you need guidance!*`;

        await interaction.reply({ content: helpText, ephemeral: false });
    },
};
