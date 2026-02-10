const BotSettings = require('../models/BotSettings');

/**
 * Maid personality responses (hardcoded mode)
 * All responses use template interpolation for maid name and honorific
 */

const responses = {
    // Greeting messages
    greetings: [
        'Good day, {honorific}~ 🎀 {maidName} is here to serve you! ✨',
        'Welcome back, {honorific}! 💫 {maidName} has missed you~',
        '{maidName} greets you warmly, {honorific}! 🌸',
    ],

    // Upload responses
    upload: {
        success: 'As you wish, {honorific}~ 🎀 {maidName} shall remind you of \'{item}\' {frequency}. Next reminder: {date} ✨',
        duplicate: '{honorific}, you already have \'{item}\' in your collection. 📝 {maidName} has created \'{newItem}\' for you~',
        noCaption: 'Forgive me, {honorific}... 💭 Please include a caption for the image so {maidName} knows what to call it~',
    },

    // Channel setup
    setup: {
        channelConfigured: 'Understood, {honorific}~ {maidName} will now watch {channel} for your learning materials. Simply post images here and I shall take care of everything! ✨',
    },

    partner: {
        cannotPartnerSelf: 'Master, you cannot partner with yourself~ That would be quite peculiar! 💫',
        alreadyHasPartner: 'Master, you are already partnered with {partner}~ Please use `/unpartner` first if you wish to change partners. 🎀',
        targetHasPartner: 'Apologies, Master~ {user} already has a learning partner. 💭',
        targetHasPendingInvite: 'Master, {user} already has a pending partnership invitation~ Please wait for them to respond first. ⏰',
        invitationSent: 'As you wish, Master~ I have sent a partnership invitation to {user}. They shall receive it shortly! 💌',
        invitationReceived: 'Master {sender} has invited you to become learning partners! Use `/accept-partner` to accept or `/decline-partner` to decline~ 💑',
        noPendingInvite: 'Master, you have no pending partnership invitations at this time~ 💭',
        inviterAlreadyPartnered: 'Oh dear, Master~ The person who invited you has already partnered with someone else. The invitation is no longer valid. 💫',
        partnershipAccepted: 'Wonderful, Master! You and {partner} are now learning partners~ Seraphina will keep track of both your items! 🎉✨',
        partnershipConfirmed: 'Master {partner} has accepted your partnership invitation! You are now learning together~ 🎀💕',
        invitationDeclined: 'Understood, Master~ I have declined the partnership invitation from {partner} on your behalf. 🍃',
        invitationWasDeclined: 'Master, {user} has respectfully declined your partnership invitation~ 💭',
        noPartner: 'Master, you do not currently have a learning partner~ Use `/partner @user` to invite someone! 💫',
        partnershipEnded: 'As you wish, Master~ Your partnership with {partner} has ended. You each have your own ledgers now. 🌸',
        partnerLeft: 'Master, {user} has ended your learning partnership~ You each have separate ledgers now. 🍃',
        pendingInviteFrom: 'Master, you have a pending partnership invitation from {user}~ Use `/accept-partner` or `/decline-partner` to respond! 💌',
    },

    // Ledger Motivating Quotes
    ledgerQuotes: [
        'Your devotion to learning fills Seraphina with pride, Master~ ✨',
        'Every step forward is a victory worth celebrating! 💫',
        'Master\'s dedication shines brighter each day~ 🌟',
        'Seraphina believes in your limitless potential! 💪✨',
        'Knowledge is the most elegant jewel one can possess~ 💎',
        'Your journey of mastery inspires me, Master! 🎀',
        'Each review brings you closer to perfection~ ⭐',
        'Seraphina is honored to serve your noble pursuits! 🌸',
        'Your commitment to growth is truly admirable, Master~ 🏆',
        'Together, we shall conquer every challenge! 💫🎀',
        'Master\'s progress brings joy to this humble maid~ 💕',
        'Excellence is not a destination, but a journey we walk together! 🌙',
        'Your learning ledger tells a story of triumph~ 📖✨',
        'Seraphina stands ready to support your every endeavor! 🎯',
        'The path of knowledge is illuminated by your determination~ 🔥',
    ],

    // Sponsored Ad Messages (for free tier users)
    sponsoredMessages: [
        '💎 _Upgrade to Seraphina Pro for unlimited items and no ads! Only $6.99/month~_',
        '✨ _Remove ads and unlock unlimited learning with Seraphina Pro! $6.99/month_',
        '🎀 _Master, upgrade to Pro for an ad-free experience! Just $6.99/month~_',
        '📚 _Sponsored: Check out Udemy for online courses! Learn anything~_',
        '💡 _Tip: Discord Nitro enhances your server experience! (Affiliate link)_',
        '🌟 _Support Seraphina\'s development - Upgrade to Pro! $6.99/month_',
    ],

    // Move responses
    move: {
        success: 'Understood, {honorific}~ ✨ \'{item}\' has been moved to {frequency} reminders. Next reminder: {date} 📅',
        notFound: 'Forgive me, {honorific}... 💭 {maidName} couldn\'t find \'{item}\' in your collection. Please check the name?',
        multipleSuggestion: '{honorific}, you have multiple items named \'{item}\'. 🔍 Please specify which one:\\n{list}',
    },

    // Rename responses
    rename: {
        success: 'Of course, {honorific}~ 📝 {maidName} has renamed \'{oldName}\' to \'{newName}\' for you! ✨',
        notFound: 'I apologize, {honorific}... 💭 {maidName} couldn\'t find \'{item}\' to rename.',
    },

    // Archive responses
    archive: {
        success: 'Wonderful progress, {honorific}~! 🎉 {maidName} has archived \'{item}\'. You\'ve mastered it! ✨🏆',
        notFound: 'Forgive me, {honorific}... 💭 {maidName} cannot find \'{item}\' to archive.',
    },

    // Unarchive responses
    unarchive: {
        success: 'Welcome back, {honorific}~ 📚 \'{item}\' is active again in your {frequency} reminders! ✨',
        notFound: '{honorific}, 💭 {maidName} couldn\'t find \'{item}\' in your archive.',
    },

    // Delete responses
    delete: {
        success: 'As you command, {honorific}. 🗑️ \'{item}\' has been removed by {maidName}.',
        confirmation: '⚠️ {honorific}, are you certain you wish to permanently delete \'{item}\'? This cannot be undone.',
    },

    // Settings responses
    settings: {
        honorificChanged: 'Of course, {honorific}~ 🎀 From now on, {maidName} shall address you as {newHonorific}! ✨',
        viewSettings: '⚙️ **Your Preferences**\n\n🎭 Honorific: {honorific}\n🎀 Maid Name: {maidName}\n\n💭 _Note: Maid name can only be changed by administrators in the web UI._',
    },

    // List/Ledger responses
    list: {
        header: '📋 **{honorific}\'s Learning Ledger** ✨',
        empty: '{honorific}, your ledger is currently empty. 📝 Use `/upload` to add your first item~ ✨',
        footer: '\\n💭 _Use `/view <item>` to see an image, {honorific}_',
    },

    // View responses
    view: {
        header: 'Here is \'{item}\', {honorific}~ 👁️✨',
        details: '📅 **Frequency:** {frequency}\\n⏰ **Next reminder:** {date}',
    },

    // Stats responses
    stats: {
        header: '📊 **{honorific}\'s Progress** ✨',
        magnificent: '{honorific}\'s progress is magnificent~! 🌟💫',
    },

    // Error messages
    errors: {
        noImage: 'Forgive me, {honorific}... 🖼️ {maidName} needs an image attachment for this command.',
        generic: 'Oh dear, {honorific}... 💫 {maidName} encountered an error. Please try again? 🙏',
        noPermission: 'I apologize, {honorific}, but that action requires administrator permissions. 🔒',
    },

    //Reminder messages
    reminders: {
        dailyHeader: '🌙 **Daily Reminders - 12:00 AM IST** ✨\\n\\nGood morning, {honorific}~ 🌸\\n{maidName} has your lessons for today:\\n',
        noReminders: 'No reminders due today, {honorific}. 😌 Enjoy your free time~ 🌺',
        footer: '\\n📚 {honorific} has **{count}** item(s) to review! {maidName} believes in you~ ✨💪',
    },

    // First time setup
    firstTime: {
        welcome: '🎀 Welcome, dear one~ ✨\\n\\nI am **{maidName}**, your most devoted and loyal maid. 💫 Before we begin your learning journey together, I must ask:\\n\\n**How would you like me to address you?** 🌸',
        confirmation: 'Wonderful choice, {honorific}! 🎀 {maidName} is honored to serve you. ✨ Let me show you what I can do~ 💕',
    },
};

/**
 * Get maid name from database settings
 */
async function getMaidName() {
    return await BotSettings.getSetting('maidName', 'Seraphina Lumière');
}

/**
 * Get message with interpolated values
 * @param {string} category - Message category (e.g., 'upload')
 * @param {string} type - Message type (e.g., 'success')
 * @param {Object} vars - Variables to interpolate
 * @returns {string} Formatted message
 */
async function getMessage(category, type, vars = {}) {
    // Get maid name from database
    const maidName = await getMaidName();

    // Default honorific if not provided
    const honorific = vars.honorific || 'Master';

    // Get message template
    let template;
    if (typeof type === 'string') {
        template = responses[category]?.[type] || responses[category];
    } else {
        template = responses[category];
    }

    if (!template) {
        console.error(`Message template not found: ${category}.${type}`);
        return 'An error occurred.';
    }

    // If template is an array, pick random
    if (Array.isArray(template)) {
        template = template[Math.floor(Math.random() * template.length)];
    }

    // Interpolate variables
    let message = template;
    message = message.replace(/{maidName}/g, maidName);
    message = message.replace(/{honorific}/g, honorific);

    // Replace other vars
    for (const [key, value] of Object.entries(vars)) {
        const regex = new RegExp(`{${key}}`, 'g');
        message = message.replace(regex, value);
    }

    return message;
}

/**
 * Get a random greeting
 * @param {string} honorific - User's honorific
 * @returns {string} Random greeting
 */
async function getGreeting(honorific) {
    return await getMessage('greetings', null, { honorific });
}

module.exports = {
    personalities: responses,  // Export for ledgerQuotes access
    responses,
    getMessage,
    getGreeting,
    getMaidName,
};
