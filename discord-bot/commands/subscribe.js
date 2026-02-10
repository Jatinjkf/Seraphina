const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('subscribe')
        .setDescription('Upgrade to Seraphina Pro (unlimited items, no ads)'),

    async execute(interaction) {
        // Reply in server (ephemeral - only user sees it)
        await interaction.reply({
            content: '💌 I\'ve sent you a private message with subscription details, Master~ Please check your DMs!',
            ephemeral: true
        });

        // Send DM with full subscription flow
        try {
            const dmChannel = await interaction.user.createDM();

            // 1. Welcome embed
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#9333ea')
                .setTitle('🎀 Upgrade to Seraphina Pro')
                .setDescription('Thank you for your interest in Pro subscription, Master~\n\n✨ *Let me explain the benefits and terms...*')
                .addFields(
                    {
                        name: '💎 Pro Benefits',
                        value: '• **Unlimited** learning items per server\n• **No advertisements**\n• **Priority support**\n• **Early access** to new features'
                    },
                    {
                        name: '💰 Price',
                        value: '**₹399/month** (cancel anytime)\n*~$5 USD* - Less than a coffee per week!'
                    },
                    {
                        name: '📝 Important',
                        value: 'Please review the terms and refund policy below before proceeding~'
                    }
                )
                .setTimestamp()
                .setFooter({ text: 'Scroll down to continue' });

            await dmChannel.send({ embeds: [welcomeEmbed] });

            // 2. Terms & Conditions
            const termsEmbed = new EmbedBuilder()
                .setColor('#3b82f6')
                .setTitle('📋 Terms & Conditions')
                .setDescription('**Please read carefully, Master~**')
                .addFields(
                    {
                        name: '1️⃣ Subscription Service',
                        value: '• Billed monthly at ₹399\n• Auto-renews each month\n• Cancel anytime (no future charges)'
                    },
                    {
                        name: '2️⃣ Usage Rights',
                        value: '• Pro features work across all servers\n• Personal use only\n• Subject to Discord ToS'
                    },
                    {
                        name: '3️⃣ Payment Processing',
                        value: '• Secure via Razorpay\n• We don\'t store payment info\n• Billing managed by Razorpay'
                    },
                    {
                        name: '4️⃣ Fair Use',
                        value: '• No abuse of unlimited items\n• No spam or automated uploads\n• We reserve right to suspend abuse'
                    }
                )
                .setFooter({ text: 'Full terms at TERMS_OF_SERVICE.md' });

            await dmChannel.send({ embeds: [termsEmbed] });

            // 3. Refund Policy (CRITICAL)
            const refundEmbed = new EmbedBuilder()
                .setColor('#ef4444')
                .setTitle('🚫 Refund Policy - Please Read')
                .setDescription('**All subscription payments are NON-REFUNDABLE.**')
                .addFields(
                    {
                        name: '❓ Why no refunds?',
                        value: '• Free tier available to try first\n• Digital service with instant access\n• Monthly billing (low commitment)\n• Standard for SaaS products'
                    },
                    {
                        name: '✅ What you CAN do:',
                        value: '• **Cancel anytime** (no future charges)\n• Keep Pro until billing period ends\n• Re-subscribe later if desired\n• Contact support for technical issues'
                    },
                    {
                        name: '⚠️ Important',
                        value: '**By proceeding, you acknowledge:**\n• This is a monthly subscription\n• Payments are non-refundable\n• You accept the terms above'
                    }
                )
                .setFooter({ text: 'Support: Snugtojo@gmail.com' });

            await dmChannel.send({ embeds: [refundEmbed] });

            // 4. Accept/Decline buttons
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('subscribe_accept')
                        .setLabel('I Accept - Proceed to Payment')
                        .setEmoji('✅')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('subscribe_decline')
                        .setLabel('Cancel')
                        .setEmoji('❌')
                        .setStyle(ButtonStyle.Danger)
                );

            const confirmEmbed = new EmbedBuilder()
                .setColor('#9333ea')
                .setTitle('✅ Ready to Upgrade, Master~?')
                .setDescription('**By clicking "I Accept", you agree to:**\n• Terms & Conditions stated above\n• No-refund policy\n• Monthly billing of ₹399\n\n*This agreement becomes binding upon payment completion*')
                .setFooter({ text: 'Take your time to review everything~' });

            await dmChannel.send({
                embeds: [confirmEmbed],
                components: [row]
            });

        } catch (error) {
            console.error('Failed to send subscription DM:', error);

            // If DM fails (user has DMs disabled)
            await interaction.followUp({
                content: '❌ I couldn\'t send you a DM, Master~\n\n**Please enable DMs:**\n1. Right-click server name\n2. Privacy Settings\n3. Enable "Direct Messages"\n4. Try `/subscribe` again!',
                ephemeral: true
            });
        }
    }
};
