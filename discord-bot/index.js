const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const BotSettings = require('./models/BotSettings');

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
    ],
    partials: [Partials.Channel, Partials.Message],
});

// Create command collection
client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`✓ Loaded command: ${command.data.name}`);
        } else {
            console.warn(`⚠ Command at ${filePath} is missing required "data" or "execute" property`);
        }
    }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if ('name' in event && 'execute' in event) {
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
            console.log(`✓ Loaded event: ${event.name}`);
        } else {
            console.warn(`⚠ Event at ${filePath} is missing required "name" or "execute" property`);
        }
    }
}

// Connect to MongoDB
mongoose.connect(config.mongodb.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log('✓ Connected to MongoDB');

        // Initialize default bot settings
        await BotSettings.initializeDefaults();
        console.log('✓ Bot settings initialized');

        // Initialize affiliate system
        const { initializeAffiliateLinks } = require('./utils/affiliateUtils');
        initializeAffiliateLinks();

        // Initialize reminder scheduler
        const { initializeScheduler } = require('./scheduler');
        initializeScheduler(client);
    })
    .catch(err => {
        console.error('✗ MongoDB connection error:', err);
        process.exit(1);
    });

// Bot ready event
client.once('ready', async () => {
    const maidName = await BotSettings.getSetting('maidName', 'Seraphina Lumière');
    console.log(`✓ ${maidName} is online and ready to serve!`);
    console.log(`  Logged in as: ${client.user.tag}`);
    console.log(`  Serving ${client.guilds.cache.size} server(s)`);

    // Sync existing guilds to GuildStats on startup
    try {
        const GuildStats = require('./models/GuildStats');
        let synced = 0;
        for (const [guildId, guild] of client.guilds.cache) {
            const existing = await GuildStats.findOne({ guildId });
            if (!existing) {
                let ownerTag = 'Unknown';
                try {
                    const owner = await client.users.fetch(guild.ownerId);
                    ownerTag = owner.tag || owner.username;
                } catch (e) { }

                await GuildStats.create({
                    guildId: guild.id,
                    guildName: guild.name,
                    memberCount: guild.memberCount,
                    joinedAt: guild.joinedAt || new Date(),
                    isActive: true,
                    ownerId: guild.ownerId,
                    ownerTag,
                    lastActivity: new Date(),
                });
                synced++;
            } else {
                // Update member count and name for existing records
                await GuildStats.updateOne(
                    { guildId },
                    {
                        $set: {
                            guildName: guild.name,
                            memberCount: guild.memberCount,
                            isActive: true,
                        }
                    }
                );
            }
        }
        if (synced > 0) {
            console.log(`✓ Synced ${synced} existing guild(s) to stats`);
        }
        console.log(`✓ Guild stats up to date (${client.guilds.cache.size} servers tracked)`);
    } catch (error) {
        console.error('Error syncing guild stats:', error);
    }

    // Rotating status messages
    const statusMessages = [
        '🎀 Organizing Master\'s ledger~',
        '📚 Preparing daily reminders~',
        '✨ Serving devotedly~',
        '💫 Watching Master\'s progress',
        '🌸 Tidying the learning chamber~',
        '💭 Awaiting Master\'s command~',
        '📖 Reviewing study materials~',
        '🌟 Supporting your journey~',
        '💕 At your service, Master~',
        '🎯 Tracking your progress~',
    ];

    // Set initial status
    let statusIndex = 0;
    const setRandomStatus = () => {
        const status = statusMessages[statusIndex];
        client.user.setPresence({
            activities: [{ name: status, type: 4 }], // Type 4 = Custom status
            status: 'online'
        });
        statusIndex = (statusIndex + 1) % statusMessages.length;
    };

    setRandomStatus();

    // Rotate status every 15 minutes
    setInterval(setRandomStatus, 15 * 60 * 1000);
});

// Track new guild joins
client.on('guildCreate', async (guild) => {
    const GuildStats = require('./models/GuildStats');

    try {
        await GuildStats.findOneAndUpdate(
            { guildId: guild.id },
            {
                $set: {
                    guildId: guild.id,
                    guildName: guild.name,
                    memberCount: guild.memberCount,
                    joinedAt: new Date(),
                    isActive: true,
                    ownerId: guild.ownerId,
                    ownerTag: (await client.users.fetch(guild.ownerId).catch(() => null))?.tag || 'Unknown',
                }
            },
            { upsert: true }
        );

        console.log(`✓ Joined new guild: ${guild.name} (${guild.memberCount} members)`);
    } catch (error) {
        console.error('Error tracking guild join:', error);
    }
});

// Track guild leaves
client.on('guildDelete', async (guild) => {
    const GuildStats = require('./models/GuildStats');

    try {
        await GuildStats.findOneAndUpdate(
            { guildId: guild.id },
            {
                $set: {
                    leftAt: new Date(),
                    isActive: false,
                }
            }
        );

        console.log(`✗ Left guild: ${guild.name}`);
    } catch (error) {
        console.error('Error tracking guild leave:', error);
    }
});

// Handle interactions (slash commands)
client.on('interactionCreate', async interaction => {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
        // Block commands in DMs
        if (!interaction.guild) {
            await interaction.reply({
                content: '🎀 Oh, Master~ Seraphina can only serve you in a server!\n\n✨ Please use commands in a server where I\'m invited.\n💌 If you need help, just send me a message here~',
                ephemeral: true
            });
            return;
        }

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}:`, error);
            const errorMessage = 'Oh dear, Master... 💫 Seraphina encountered an error. Please try again? 🙏';

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }

    // Handle button interactions
    if (interaction.isButton()) {
        const customId = interaction.customId;

        try {
            // Partnership buttons
            if (customId.startsWith('accept_partner_') || customId.startsWith('decline_partner_')) {
                const { handlePartnershipButtons } = require('./interactions/partnershipButtons');
                await handlePartnershipButtons(interaction);
                return;
            }

            // Setup wizard button
            if (customId === 'start_setup_wizard') {
                const { handleSetupWizard } = require('./interactions/setupWizard');
                await handleSetupWizard(interaction);
                return;
            }

            // Setup wizard - optional settings buttons
            if (customId.startsWith('setup_configure_')) {
                const { showAdminRoleSelect } = require('./interactions/setupWizard');
                const parts = customId.split('_');
                const learningChannelId = parts[2];
                const storageChannelId = parts[3];
                await showAdminRoleSelect(interaction, learningChannelId, storageChannelId);
                return;
            }

            if (customId.startsWith('setup_skip_')) {
                const { completeSetup } = require('./interactions/setupWizard');
                const parts = customId.split('_');
                if (parts.length === 4) {
                    // Regular skip: setup_skip_{learningId}_{storageId}
                    await completeSetup(interaction, parts[2], parts[3]);
                } else {
                    // Skip admin role: setup_skip_admin_{learningId}_{storageId}
                    await completeSetup(interaction, parts[3], parts[4]);
                }
                return;
            }

            // Subscription buttons (accept/decline)
            if (customId === 'subscribe_accept') {
                const Subscription = require('./models/Subscription');
                const Razorpay = require('razorpay');

                // Check if already Pro
                const existingSub = await Subscription.findOne({ userId: interaction.user.id });
                if (existingSub && existingSub.isPro()) {
                    return interaction.reply({
                        content: '✨ You\'re already a Pro subscriber, Master~',
                        ephemeral: true
                    });
                }

                // Generate payment link
                const razorpay = new Razorpay({
                    key_id: process.env.RAZORPAY_KEY_ID,
                    key_secret: process.env.RAZORPAY_KEY_SECRET
                });

                try {
                    const subscription = await razorpay.subscriptions.create({
                        plan_id: process.env.RAZORPAY_PLAN_ID_PRO,
                        customer_notify: 1,
                        total_count: 12, // 1 year (can renew)
                        notes: {
                            userId: i.user.id,
                            username: i.user.tag
                        }
                    });

                    const { EmbedBuilder } = require('discord.js');
                    const paymentEmbed = new EmbedBuilder()
                        .setColor('#10b981')
                        .setTitle('💳 Complete Your Payment')
                        .setDescription(`Thank you for accepting the terms, Master~\n\nClick the link below to complete your payment securely via Razorpay:`)
                        .addFields(
                            { name: '🔗 Payment Link', value: `[**Click here to pay ₹399**](${subscription.short_url})\n\n*Opens in your browser*` },
                            { name: '⏱️ Link Validity', value: 'Expires in 15 minutes' },
                            { name: '✨ After Payment', value: 'Pro features activate **immediately**!\nYou\'ll receive a confirmation DM.' }
                        )
                        .setFooter({ text: 'Secure payment powered by Razorpay 🔒' });

                    await i.update({
                        embeds: [paymentEmbed],
                        components: [] // Remove buttons
                    });

                } catch (error) {
                    console.error('Razorpay subscription creation error:', error);
                    await i.reply({
                        content: '❌ Failed to generate payment link, Master~ Please try again in a moment or contact support.',
                        ephemeral: true
                    });
                }
                return;
            }

            if (customId === 'subscribe_decline') {
                const { EmbedBuilder } = require('discord.js');
                const cancelEmbed = new EmbedBuilder()
                    .setColor('#6b7280')
                    .setTitle('❌ Subscription Cancelled')
                    .setDescription('No problem at all, Master~\n\nYou can upgrade anytime using `/subscribe` in any server!\n\n✨ The free tier is still amazing with 25 items per server~')
                    .setFooter({ text: 'Thank you for considering Pro!' });

                await i.update({
                    embeds: [cancelEmbed],
                    components: []
                });
                return;
            }

            // First-time setup buttons
            const [action, ...params] = customId.split('_');
            switch (action) {
                case 'honorific':
                    await handleHonorificSelection(interaction, params[0]);
                    break;
                case 'confirm':
                    await handleConfirmation(interaction, params.join('_'));
                    break;
                case 'cancel':
                    await handleCancellation(interaction);
                    break;
                default:
                    console.warn(`Unknown button action: ${action}`);
            }
        } catch (error) {
            console.error(`Error handling button ${customId}:`, error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ An error occurred, Master~ Please try again!',
                    ephemeral: true
                }).catch(() => { });
            }
        }
    }

    // Handle channel select menus (setup wizard)
    if (interaction.isChannelSelectMenu()) {
        const customId = interaction.customId;

        try {
            if (customId === 'setup_learning_channel') {
                const { showStorageChannelSelect } = require('./interactions/setupWizard');
                const selectedChannelId = interaction.values[0];
                await showStorageChannelSelect(interaction, selectedChannelId);
                return;
            }

            if (customId.startsWith('setup_storage_channel_')) {
                const { showOptionalSettings } = require('./interactions/setupWizard');
                const learningChannelId = customId.split('_')[3];
                const storageChannelId = interaction.values[0];
                await showOptionalSettings(interaction, learningChannelId, storageChannelId);
                return;
            }
        } catch (error) {
            console.error(`Error handling channel select:`, error);
        }
    }

    // Handle role select menus (setup wizard)
    if (interaction.isRoleSelectMenu()) {
        const customId = interaction.customId;

        try {
            if (customId.startsWith('setup_admin_role_')) {
                const { completeSetup } = require('./interactions/setupWizard');
                const parts = customId.split('_');
                const learningChannelId = parts[3];
                const storageChannelId = parts[4];
                const adminRoleId = interaction.values[0];
                await completeSetup(interaction, learningChannelId, storageChannelId, adminRoleId);
                return;
            }
        } catch (error) {
            console.error(`Error handling role select:`, error);
        }
    }

    // Handle autocomplete
    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);

        if (command && command.autocomplete) {
            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(`Error in autocomplete for ${interaction.commandName}:`, error);
            }
        }
    }
});

// Load message handler for auto-detection
require('./messageHandler')(client);

// Honorific selection handler
async function handleHonorificSelection(interaction, honorific) {
    const UserPreferences = require('./models/UserPreferences');
    const { getMessage } = require('./utils/personality');

    // Map button values to honorifics
    const honorificMap = {
        master: 'Master',
        goshujin: 'Goshujin-sama',
        lord: interaction.member?.user.id ? 'My Lord' : 'My Lady', // Can add gender selection
        custom: 'Master', // Will prompt for custom in future
    };

    const selectedHonorific = honorificMap[honorific] || 'Master';

    // Save preference
    await UserPreferences.findOneAndUpdate(
        { userId: interaction.user.id },
        {
            userId: interaction.user.id,
            honorific: selectedHonorific,
            isFirstTime: false,
        },
        { upsert: true, new: true }
    );

    // Send confirmation
    const message = await getMessage('firstTime', 'confirmation', { honorific: selectedHonorific });
    await interaction.update({
        content: message,
        components: [], // Remove buttons
    });
}

// Confirmation handler
async function handleConfirmation(interaction, actionData) {
    await interaction.update({
        content: 'Confirmed, Master~',
        components: [],
    });
}

// Cancellation handler
async function handleCancellation(interaction) {
    await interaction.update({
        content: 'Cancelled, Master.',
        components: [],
    });
}

// Error handling
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Handle DM messages - User sends DM to Seraphina
client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Only handle DMs (channel type 1 = DM)
    if (message.channel.type !== 1) return;

    try {
        const Subscription = require('./models/Subscription');
        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        const { getRandomColor } = require('./utils/colorUtils');

        // Check if user has Pro
        const subscription = await Subscription.findOne({ userId: message.author.id });
        const isPro = subscription && subscription.isPro();

        if (isPro) {
            // Pro user response
            const embed = new EmbedBuilder()
                .setColor('#FF0055')
                .setTitle('🎀 Welcome back, Master~')
                .setDescription(`You are currently enjoying **Seraphina Pro**!\nThank you for your continued support ✨`)
                .addFields(
                    {
                        name: '💎 Pro Benefits Active',
                        value: '• Unlimited learning items\n• Ad-free experience\n• Priority support\n• Early access to features',
                        inline: false
                    },
                    {
                        name: '⏰ Subscription Status',
                        value: `Active until:\n**${subscription.currentPeriodEnd?.toLocaleDateString() || 'Lifetime'}**`,
                        inline: false
                    }
                )
                .setFooter({ text: 'Need help? Contact support!' });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Support Server')
                        .setURL('https://discord.gg/MNZ7hNbDFd')
                        .setStyle(ButtonStyle.Link),
                    new ButtonBuilder()
                        .setLabel('Email Support')
                        .setURL('mailto:Snugtojo@gmail.com')
                        .setStyle(ButtonStyle.Link)
                );

            await message.reply({ embeds: [embed], components: [row] });

        } else {
            // Free user response - Upgrade Pitch (Multiple Embeds)

            // 1. Main Upgrade Embed
            const upgradeEmbed = new EmbedBuilder()
                .setColor('#FF0055')
                .setTitle('🎀 Upgrade to Seraphina Pro')
                .setDescription('Thank you for your interest in Pro subscription, Master~\n\n✨ _Let me explain the benefits and terms..._')
                .addFields(
                    {
                        name: '💎 Pro Benefits',
                        value: '• **Unlimited** learning items per server\n• **No advertisements**\n• **Priority support**\n• **Early access** to new features\n',
                        inline: false
                    },
                    {
                        name: '💰 Price',
                        value: '₹399/month (cancel anytime)\n_~$5 USD - Less than a coffee per week!_',
                        inline: false
                    },
                    {
                        name: '📝 Important',
                        value: 'Please review the terms and refund policy below before proceeding~',
                        inline: false
                    }
                )
                .setFooter({ text: 'Scroll down to continue' });

            // 2. Terms & Conditions Embed
            const termsEmbed = new EmbedBuilder()
                .setColor('#3B82F6') // Blue
                .setTitle('📋 Terms & Conditions')
                .setDescription('**Please read carefully, Master~**')
                .addFields(
                    {
                        name: '1️⃣ Subscription Service',
                        value: '• Billed monthly at ₹399\n• Auto-renews each month\n• Cancel anytime (no future charges)',
                        inline: false
                    },
                    {
                        name: '2️⃣ Usage Rights',
                        value: '• Pro features work across all servers\n• Personal use only\n• Subject to Discord ToS',
                        inline: false
                    },
                    {
                        name: '3️⃣ Payment Processing',
                        value: '• Secure via Razorpay\n• We don\'t store payment info\n• Billing managed by Razorpay',
                        inline: false
                    },
                    {
                        name: '4️⃣ Fair Use',
                        value: '• No abuse of unlimited items\n• No spam or automated uploads\n• We reserve right to suspend abuse',
                        inline: false
                    }
                )
                .setFooter({ text: 'Full terms at TERMS_OF_SERVICE.md' });

            // 3. Refund Policy Embed
            const refundEmbed = new EmbedBuilder()
                .setColor('#EF4444') // Red
                .setTitle('🚫 Refund Policy – Please Read')
                .setDescription('**All subscription payments are NON-REFUNDABLE.**')
                .addFields(
                    {
                        name: '❓ Why no refunds?',
                        value: '• Free tier available to try first\n• Digital service with instant access\n• Monthly billing (low commitment)\n• Standard for SaaS products',
                        inline: false
                    },
                    {
                        name: '✅ What you CAN do:',
                        value: '• **Cancel anytime** (no future charges)\n• Keep Pro until billing period ends\n• Re-subscribe later if desired\n• Contact support for technical issues',
                        inline: false
                    },
                    {
                        name: '⚠️ Important',
                        value: 'By proceeding, you acknowledge:\n• This is a monthly subscription\n• Payments are non-refundable\n• You accept the terms above',
                        inline: false
                    }
                )
                .setFooter({ text: 'Support: Snugtojo@gmail.com' });

            // 4. Confirmation Embed
            const confirmEmbed = new EmbedBuilder()
                .setColor('#10B981') // Green
                .setTitle('✅ Ready to Upgrade, Master~?')
                .setDescription('**By clicking "I Accept", you agree to:**\n• Terms & Conditions stated above\n• No-refund policy\n• Monthly billing of ₹399\n\n_This agreement becomes binding upon payment completion_\nTake your time to review everything~');


            // Action Buttons
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('subscribe_accept')
                        .setLabel('I Accept – Proceed to Payment')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('✅'),
                    new ButtonBuilder()
                        .setCustomId('subscribe_decline')
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('✖️')
                );

            await message.reply({
                content: '',
                embeds: [upgradeEmbed, termsEmbed, refundEmbed, confirmEmbed],
                components: [row]
            });
        }

    } catch (error) {
        console.error('DM handler error:', error);
        await message.reply('❌ Sorry Master, I encountered an error~ Please try again or contact support at Snugtojo@gmail.com!');
    }
});

// Login to Discord
client.login(config.discord.token)
    .then(() => {
        console.log('✓ Logging in to Discord...');
    })
    .catch(err => {
        console.error('✗ Failed to login to Discord:', err);
        process.exit(1);
    });

module.exports = client;
