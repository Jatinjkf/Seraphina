const { shouldShowAds } = require('./subscriptionUtils');

/**
 * Affiliate links configuration
 */
const affiliateLinks = {
    // Amazon Associates
    amazon: {
        tag: process.env.AMAZON_AFFILIATE_TAG || 'your-tag-20',
        baseUrl: 'https://www.amazon.in',
        links: {
            learningBooks: 'https://amzn.to/learning-books',
            studyGuides: 'https://amzn.to/study-guides',
            notebooks: 'https://amzn.to/notebooks'
        }
    },

    // Udemy Affiliate
    udemy: {
        refCode: process.env.UDEMY_REF_CODE || 'your-ref-code',
        baseUrl: 'https://click.linksynergy.com/deeplink',
        links: {
            programming: `https://www.udemy.com/?ranMID=39197&ranEAID=${process.env.UDEMY_REF_CODE}`,
            languages: `https://www.udemy.com/courses/teaching-and-academics/language/?ranMID=39197&ranEAID=${process.env.UDEMY_REF_CODE}`,
            business: `https://www.udemy.com/courses/business/?ranMID=39197&ranEAID=${process.env.UDEMY_REF_CODE}`
        }
    },

    // Coursera Affiliate
    coursera: {
        aid: process.env.COURSERA_AID || 'your-aid',
        links: {
            allCourses: `https://www.coursera.org/?irclickid=${process.env.COURSERA_AID}`,
            certificates: `https://www.coursera.org/professional-certificates?irclickid=${process.env.COURSERA_AID}`
        }
    },

    // Discord Nitro
    discord: {
        referralLink: process.env.DISCORD_NITRO_LINK || 'https://discord.com/nitro'
    },

    // Notion Affiliate
    notion: {
        partnerId: process.env.NOTION_PARTNER_ID || 'your-partner-id',
        link: `https://affiliate.notion.so/${process.env.NOTION_PARTNER_ID}`
    }
};

/**
 * Affiliate ad messages with tracking links
 */
const affiliateMessages = [
    // Self-promotion (highest priority)
    {
        type: 'self',
        weight: 40, // 40% chance
        messages: [
            '💎 _Upgrade to Seraphina Pro for unlimited items and no ads! Only ₹399/month~_',
            '✨ _Remove ads and unlock unlimited learning with Seraphina Pro! ₹399/month_',
            '🎀 _Master, upgrade to Pro for an ad-free experience! Just ₹399/month~_',
            '🌟 _Support Seraphina\'s development - Upgrade to Pro! ₹399/month_'
        ]
    },

    // Udemy courses (25%)
    {
        type: 'udemy',
        weight: 25,
        messages: [
            `📚 _Sponsored: Master any skill on Udemy! Thousands of courses. → ${affiliateLinks.udemy.links.programming}_`,
            `💡 _Learn programming, languages, business on Udemy! → ${affiliateLinks.udemy.links.business}_`,
            `🎓 _Udemy: 200,000+ courses to boost your learning! → ${affiliateLinks.udemy.links.programming}_`
        ]
    },

    // Amazon books (20%)
    {
        type: 'amazon',
        weight: 20,
        messages: [
            `📖 _Reading enhances learning! Check out study guides → ${affiliateLinks.amazon.links.studyGuides}_`,
            `📚 _Build your learning library with Amazon books → ${affiliateLinks.amazon.links.learningBooks}_`,
            `📝 _Quality notebooks make studying better! → ${affiliateLinks.amazon.links.notebooks}_`
        ]
    },

    // Discord Nitro (10%)
    {
        type: 'discord',
        weight: 10,
        messages: [
            `💎 _Discord Nitro: Better voice quality + custom emojis → ${affiliateLinks.discord.referralLink}_`,
            `🎮 _Upgrade your Discord experience with Nitro! → ${affiliateLinks.discord.referralLink}_`
        ]
    },

    // Notion (5%)
    {
        type: 'notion',
        weight: 5,
        messages: [
            `📝 _Notion: All-in-one workspace for notes & projects → ${affiliateLinks.notion.link}_`,
            `🗂️ _Organize your learning with Notion! → ${affiliateLinks.notion.link}_`
        ]
    }
];

/**
 * Get weighted random affiliate message
 * ONLY from configured affiliates + self-promotion
 * @returns {string} Affiliate message
 */
function getWeightedAffiliateAd() {
    // Filter to only configured affiliates
    const configuredMessages = affiliateMessages.filter(item => {
        // Always include self-promotion
        if (item.type === 'self') return true;

        // Check if affiliate is configured
        switch (item.type) {
            case 'amazon':
                return process.env.AMAZON_AFFILIATE_TAG && process.env.AMAZON_AFFILIATE_TAG !== 'your-tag-20';
            case 'udemy':
                return process.env.UDEMY_REF_CODE && process.env.UDEMY_REF_CODE !== 'your-ref-code';
            case 'coursera':
                return process.env.COURSERA_AID && process.env.COURSERA_AID !== 'your-aid';
            case 'notion':
                return process.env.NOTION_PARTNER_ID && process.env.NOTION_PARTNER_ID !== 'your-partner-id';
            case 'discord':
                return process.env.DISCORD_NITRO_LINK && process.env.DISCORD_NITRO_LINK !== 'https://discord.com/nitro';
            default:
                return false;
        }
    });

    // If no configured affiliates, only show self-promotion
    if (configuredMessages.length === 0 || configuredMessages.length === 1) {
        const selfPromo = affiliateMessages[0].messages;
        return selfPromo[Math.floor(Math.random() * selfPromo.length)];
    }

    // Calculate total weight from configured items only
    const totalWeight = configuredMessages.reduce((sum, item) => sum + item.weight, 0);

    // Random number between 0 and total weight
    let random = Math.random() * totalWeight;

    // Select message based on weight
    for (const item of configuredMessages) {
        if (random < item.weight) {
            // Pick random message from this category
            const messages = item.messages;
            return messages[Math.floor(Math.random() * messages.length)];
        }
        random -= item.weight;
    }

    // Fallback to self-promotion
    return affiliateMessages[0].messages[0];
}

/**
 * Get affiliate ad for free users
 * @param {string} userId - Discord user ID
 * @returns {Promise<string>} Ad message or empty string
 */
async function getAffiliateAd(userId) {
    const showAds = await shouldShowAds(userId);

    if (!showAds) {
        return '';
    }

    return `\n\n${getWeightedAffiliateAd()}`;
}

/**
 * Track affiliate click (optional)
 * @param {string} userId - Discord user ID
 * @param {string} affiliateType - Type of affiliate (udemy, amazon, etc.)
 */
async function trackAffiliateClick(userId, affiliateType) {
    // Optional: Log to database for analytics
    console.log(`Affiliate click: ${userId} -> ${affiliateType}`);

    // Could track in MongoDB:
    // await AffiliateClick.create({ userId, affiliateType, timestamp: new Date() });
}

/**
 * Get affiliate link by category
 * @param {string} category - Category (learning, books, tools)
 * @returns {string} Affiliate link
 */
function getAffiliateLink(category) {
    switch (category) {
        case 'courses':
            return affiliateLinks.udemy.links.programming;
        case 'books':
            return affiliateLinks.amazon.links.learningBooks;
        case 'tools':
            return affiliateLinks.notion.link;
        case 'discord':
            return affiliateLinks.discord.referralLink;
        default:
            return affiliateLinks.udemy.links.programming;
    }
}

/**
 * Update affiliate links in personality messages
 * This replaces placeholder links with actual affiliate links
 */
function initializeAffiliateLinks() {
    console.log('✓ Affiliate system initialized');
    console.log(`  - Amazon tag: ${affiliateLinks.amazon.tag !== 'your-tag-20' ? '✓' : '✗ Not configured'}`);
    console.log(`  - Udemy ref: ${affiliateLinks.udemy.refCode !== 'your-ref-code' ? '✓' : '✗ Not configured'}`);
    console.log(`  - Coursera: ${affiliateLinks.coursera.aid !== 'your-aid' ? '✓' : '✗ Not configured'}`);
}

module.exports = {
    affiliateLinks,
    getAffiliateAd,
    getWeightedAffiliateAd,
    trackAffiliateClick,
    getAffiliateLink,
    initializeAffiliateLinks
};
