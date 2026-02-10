module.exports = (client) => {
    // Handle regular messages (auto-detection for learning channel)
    client.on('messageCreate', async message => {
        // Ignore bot messages
        if (message.author.bot) return;

        // Handle DMs - send friendly intro message
        if (!message.guild) {
            const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

            const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('✨ Invite Seraphina to Your Server')
                        .setURL(inviteUrl)
                        .setStyle(ButtonStyle.Link)
                );

            const dmMessages = [
                `🎀 **Hello, Master~!** 💕\n\nI'm **Seraphina Lumière**, your devoted learning companion!\n\n✨ I help you master anything using **spaced repetition** — the scientifically-proven memory technique!\n\n📚 **What I can do:**\n• Upload text & images to remember\n• Smart reminders at perfect intervals\n• Track your learning progress\n• Study with a partner!\n\n💌 **To get started:**\n1. Invite me to your server using the button below\n2. Use \`/setup-wizard\` to configure\n3. Start uploading items with \`/upload\`!\n\n*Your devoted maid awaits in the server, Master~* ✨`,
            ];

            const randomMsg = dmMessages[Math.floor(Math.random() * dmMessages.length)];

            try {
                await message.reply({
                    content: randomMsg,
                    components: [row]
                });
            } catch (error) {
                console.error('Error sending DM reply:', error);
            }
            return;
        }

        // Check if message has attachments (images) - guild only from here
        if (message.attachments.size === 0) return;

        const {
            isLearningChannel,
            parseImageMessage,
            copyToStorageChannel,
            deleteAfterDelay,
            updateLedger,
        } = require('./utils/learningChannel');

        const Reminder = require('./models/Reminder');
        const { getMessage } = require('./utils/personality');
        const { calculateNextReminder } = require('./utils/dateFormatter');
        const UserPreferences = require('./models/UserPreferences');
        const { checkItemLimit, getUpgradeMessage } = require('./utils/subscriptionUtils');

        try {
            // Check if this is a learning channel
            const isLearning = await isLearningChannel(message.channel, message.author.id);

            if (!isLearning) return;

            // Get user preferences
            const prefs = await UserPreferences.findOne({ userId: message.author.id });
            const honorific = prefs?.honorific || 'Master';

            // Parse message content
            const { itemName, frequency } = parseImageMessage(message.content || 'Untitled');

            if (!itemName || itemName === '') {
                await message.reply(await getMessage('upload', 'noCaption', { honorific }));
                return;
            }

            // Check subscription limits for THIS GUILD
            const limitCheck = await checkItemLimit(message.author.id, message.guild.id);
            if (!limitCheck.canAdd) {
                const upgradeMsg = await getUpgradeMessage(limitCheck.current, limitCheck.limit);
                await message.reply(upgradeMsg);
                return;
            }


            // Copy image to storage channel (or use original if not configured)
            const storageInfo = await copyToStorageChannel(message, client);

            // Get next serial number for THIS GUILD
            const serialNumber = await Reminder.getNextSerialNumber(message.author.id, message.guild.id, itemName);

            // Create reminder
            const reminder = new Reminder({
                userId: message.author.id,
                guildId: message.guild.id,
                itemName,
                serialNumber,
                storageChannelId: storageInfo.channelId,
                storageMessageId: storageInfo.messageId,
                frequency,
                nextReminder: calculateNextReminder(frequency),
                lastReminded: null,
            });

            await reminder.save();

            // Send confirmation
            const hasDup = await reminder.hasDuplicates();
            const displayName = hasDup
                ? `${reminder.itemName} #${reminder.serialNumber}`
                : reminder.itemName;

            const confirmMessage = await getMessage('upload', 'success', {
                honorific,
                item: displayName,
                frequency: frequency.replace(/([A-Z])/g, ' $1').toLowerCase(),
                date: require('./utils/dateFormatter').formatDate(reminder.nextReminder),
            });

            await message.reply(confirmMessage);

            // Delete original message after 1 minute
            deleteAfterDelay(message, 60000);

            // Update ledger
            await updateLedger(message.channel, message.author.id);

        } catch (error) {
            console.error('Error in auto-detection:', error);
            await message.reply('Oh dear, Master... I encountered an error. Please try again?');
        }
    });
};
