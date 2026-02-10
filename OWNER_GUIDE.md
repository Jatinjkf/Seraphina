# 🎀 Seraphina - Owner's Complete Guide

**For Bot Owner: Jatin**

---

## 📋 Table of Contents

1. [Subscription & Partnership Logic](#subscription--partnership-logic)
2. [Payment Setup (Razorpay)](#payment-setup-razorpay)
3. [Environment Variables Complete Guide](#environment-variables)
4. [Admin Responsibilities](#admin-responsibilities)
5. [Monetization Strategy](#monetization-strategy)
6. [Deployment Workflow](#deployment-workflow)

---

## 🤝 Subscription & Partnership Logic

### **Can Subscription Users Partner with Free Users?**

**YES! ✅** Here's how it works:

**Scenario 1: Pro + Free Partnership**
```
User A (Pro):  Unlimited items
User B (Free): 25 items max
```

**Result:**
- ✅ They can partner
- ✅ User A sees User B's items (all 25)
- ✅ User B sees User A's items (all unlimited)
- ✅ **Both get combined view in `/list`**

**Limits:**
- User B still can't upload more than 25 items total
- User A has no limit
- Partnership doesn't bypass User B's personal limit

---

### **Partnership Logic**

**Per-Guild System:**
```javascript
// One partnership per guild
Guild A: User1 ↔ User2
Guild B: User1 ↔ User3  // Same User1, different partner!
```

**Free Tier Limits:**
- ✅ 25 items per server
- ✅ 1 partner per server
- ✅ Can have different partners in different servers

**Pro Tier Benefits:**
- ✅ Unlimited items per server
- ✅ Unlimited partners per server (future feature)
- ✅ Priority support

**Code Check:**
```javascript
// Location: discord-bot/commands/upload.js (around line 30)
const subscription = await Subscription.findOne({ userId });
const limit = subscription?.isPro() ? Infinity : 25;

// Check item count per guild
const itemCount = await Reminder.countDocuments({ 
    userId, 
    guildId,
    frequency: { $ne: 'archived' }
});

if (itemCount >= limit) {
    return interaction.reply({
        content: `You've reached your limit! Upgrade to Pro for unlimited items~`
    });
}
```

**Partnership doesn't change individual limits!**

---

## 💳 Payment Setup (Razorpay)

### **What You Need:**

1. **Razorpay Account** (Indian payment gateway)
2. **Environment Variables**
3. **Plan Created in Dashboard**
4. **Webhook Endpoint Set**

---

### **Step 1: Create Razorpay Account**

1. Go to https://razorpay.com
2. Sign up with business email
3. Complete KYC (required for live mode)
4. **Get API Keys:**
   - Dashboard → Settings → API Keys
   - **Test Mode:** `rzp_test_...`
   - **Live Mode:** `rzp_live_...` (after activation)

---

### **Step 2: Create Subscription Plan**

**In Razorpay Dashboard:**

1. Go to **Subscriptions** → **Plans**
2. Click **Create New Plan**

**Settings:**
```
Plan Name: Seraphina Pro
Plan ID: (auto-generated, e.g., plan_xxxxx)
Billing Cycle: Monthly
Amount: ₹399
Currency: INR
Description: Unlimited learning items, priority support
```

3. **Copy the Plan ID** → Add to `.env`:
```env
RAZORPAY_PLAN_ID_PRO=plan_xxxxx
```

---

### **Step 3: Set Up Webhooks**

**Purpose:** Razorpay notifies your server when:
- Payment succeeds
- Subscription created
- Payment fails
- Subscription cancelled

**Setup:**
1. Dashboard → Settings → Webhooks
2. Click **Add New Webhook**

**Settings:**
```
Webhook URL: https://your-koyeb-app.koyeb.app/api/payment/webhook
Active Events:
  - subscription.activated
  - subscription.charged
  - subscription.cancelled
  - subscription.paused
  - subscription.resumed
  - payment.failed
Secret: (auto-generated)
```

3. **Copy webhook secret** → Add to `.env`:
```env
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx
```

---

### **Step 4: Configure Environment**

**Add to `.env`:**
```env
# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx
RAZORPAY_PLAN_ID_PRO=plan_xxxxx
```

**For production:**
- Switch from `rzp_test_` to `rzp_live_`
- Requires activated account (KYC approved)

---

### **Step 5: Test Payment Flow**

**Test in Discord:**
```
1. User types: /subscribe
2. Bot sends payment link
3. User clicks link → Redirected to Razorpay checkout
4. User fills: Card number, CVV, etc.
5. Payment succeeds → Webhook fires
6. Bot updates user to Pro tier
7. User can now upload unlimited items!
```

**Test Card (Test Mode):**
```
Card: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
Name: Test User
```

---

## 🔐 Environment Variables

### **Complete `.env` Setup**

Create `.env` file in root directory:

```env
# ====================================
# CRITICAL - DISCORD
# ====================================
DISCORD_TOKEN=your_bot_token_from_developer_portal
DISCORD_CLIENT_ID=your_application_id
DISCORD_CLIENT_SECRET=your_oauth2_secret

# ====================================
# CRITICAL - DATABASE
# ====================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/seraphina

# ====================================
# CRITICAL - ADMIN
# ====================================
ADMIN_PASSWORD=your_strong_password_123
ADMIN_USER_IDS=1445501186005270538

# ====================================
# CRITICAL - SECURITY
# ====================================
JWT_SECRET=generate_with_crypto_randomBytes_64_hex
ENCRYPTION_KEY=generate_with_crypto_randomBytes_16_hex

# ====================================
# PAYMENTS - RAZORPAY
# ====================================
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx
RAZORPAY_PLAN_ID_PRO=plan_xxxxx

# ====================================
# SERVER
# ====================================
PORT=3000
API_URL=https://your-koyeb-app.koyeb.app
WEB_URL=https://your-vercel-app.vercel.app

# ====================================
# OPTIONAL - AFFILIATES
# ====================================
AMAZON_AFFILIATE_TAG=yourtag-21
UDEMY_REF_CODE=your_ref
COURSERA_AID=your_aid
NOTION_PARTNER_ID=your_id
```

---

### **How to Generate Secrets**

**JWT_SECRET (64 bytes):**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**ENCRYPTION_KEY (16 bytes = 32 chars hex):**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

**Example output:**
```
JWT_SECRET=a1b2c3d4e5f6...xyz
ENCRYPTION_KEY=1234567890abcdef1234567890abcdef
```

---

## 👨‍💼 Admin Responsibilities

### **As Bot Owner, You Manage:**

### **1. Global Settings (Web Admin Panel)**

**Access:** `http://your-domain.com/admin`

**What You Control:**
- ✅ Maid's Name (globally - "Seraphina Lumière")
- ✅ Reminder Timezone (for DM reminders)
- ✅ Bot Statistics
- ✅ Future: AI Mode settings

**What You DON'T Control:**
- ❌ Per-server storage channels (server admins via Discord)
- ❌ Individual user preferences
- ❌ Partnership management (users self-manage)

---

### **2. Subscription Management**

**Manual Subscription (for VIPs/testing):**

**Via MongoDB:**
```javascript
// Connect to MongoDB
use seraphina

// Give Pro to a user
db.subscriptions.insertOne({
    userId: "123456789012345678",
    tier: "pro",
    status: "active",
    currentPeriodEnd: new Date("2025-12-31"),
    createdAt: new Date(),
    updatedAt: new Date()
})

// Check user's subscription
db.subscriptions.findOne({ userId: "123456789012345678" })

// Remove Pro
db.subscriptions.updateOne(
    { userId: "123456789012345678" },
    { $set: { tier: "free", status: "cancelled" } }
)
```

---

### **3. Support & Moderation**

**Common User Issues:**

**"Bot not responding"**
- Check Koyeb logs
- Verify MongoDB connection
- Check Discord intent enabled

**"Setup not working"**
- Admin permissions required
- Bot needs permissions in channels

**"Payment failed"**
- Check Razorpay dashboard
- Verify webhook URL is accessible
- Check webhook logs in code

**"Partner system broken"**
- Both users must be in same server
- Partnership limit: 1 per guild (free tier)
- DM invite buttons work (not slash commands)

---

### **4. Database Maintenance**

**Regular Tasks:**

**View Statistics:**
```javascript
// Total users
db.subscriptions.countDocuments()

// Pro users
db.subscriptions.countDocuments({ tier: "pro", status: "active" })

// Total reminders
db.reminders.countDocuments()

// Total servers
db.guildsettings.countDocuments()
```

**Cleanup Inactive Guilds:**
```javascript
// Find guilds bot is no longer in
// (Manual check required via Discord)

// Delete guild data
db.guildsettings.deleteOne({ guildId: "old_guild_id" })
db.reminders.deleteMany({ guildId: "old_guild_id" })
db.partnerships.deleteMany({ guildId: "old_guild_id" })
```

---

## 💰 Monetization Strategy

### **Tiered Pricing**

**Free Tier:**
- 25 items per server
- 1 partner per server
- Daily DM reminders
- All core features

**Pro Tier - ₹399/month ($5 USD)**
- ✅ Unlimited items per server
- ✅ Unlimited partners per server (future)
- ✅ Priority support
- ✅ Early access to new features
- ✅ Custom honorifics (future)

---

### **Revenue Streams**

**1. Subscriptions (Primary)**
- Target: 100 Pro subscribers = ₹39,900/month
- Target: 500 Pro subscribers = ₹1,99,500/month

**2. Affiliate Commissions (Secondary)**
- Amazon Associates (books, study materials)
- Udemy courses
- Notion subscriptions
- Discord Nitro

---

### **Revenue Tracking**

**Razorpay Dashboard:**
- View all transactions
- Export reports (CSV/Excel)
- Refunds management
- Settlement tracking

**Database Queries:**
```javascript
// Count active Pro users
db.subscriptions.countDocuments({ tier: "pro", status: "active" })

// Calculate monthly revenue
// Active Pro * ₹399
```

---

## 📢 Ads & Affiliate Marketing System

### **How It Works**

**Your bot has a built-in affiliate marketing system that shows ads to FREE users only!**

**System Overview:**
```javascript
// Free users see ads
User has Pro subscription? → No ads ✅
User is Free tier? → Show affiliate links 💰
```

---

### **Ad Display Logic**

**Code Location:** `discord-bot/utils/adUtils.js`

**When Ads Show:**
- After `/list` command (bottom of menu)
- After `/stats` command
- After `/help` command
- Basically appended to most command responses

**Who Sees Ads:**
- ✅ Free tier users (no subscription)
- ❌ Pro tier users (paid subscription)

**Ad Format:**
```
╚═══════════════════════════════════════════╝
✨ Seraphina serves devotedly~

💡 Studying Python? Check out this Udemy course:
https://udemy.com/course/python?ref=YOUR_CODE

🎀 Upgrade to Pro (₹399/mo) to remove ads!
```

---

### **Affiliate Programs Setup**

#### **1. Amazon Associates (India)**

**Sign Up:**
1. Go to https://affiliate-program.amazon.in
2. Create account
3. Get your affiliate tag (e.g., `yourtag-21`)

**Add to `.env`:**
```env
AMAZON_AFFILIATE_TAG=yourtag-21
```

**How Bot Uses It:**
```javascript
// Recommends study books for free users
const bookLink = `https://amazon.in/dp/B08X1234?tag=${process.env.AMAZON_AFFILIATE_TAG}`;
```

**Commission:**
- 4-8% on book sales
- Payment: Monthly via bank transfer

---

#### **2. Udemy Affiliate Program**

**Sign Up:**
1. Go to https://udemy.com/affiliate
2. Apply (usually approved in 1-2 days)
3. Get your referral code

**Add to `.env`:**
```env
UDEMY_REF_CODE=your_ref_code
```

**How Bot Uses It:**
```javascript
// Recommends courses based on user's learning topics
const courseLink = `https://udemy.com/course/python-bootcamp?ref=${process.env.UDEMY_REF_CODE}`;
```

**Commission:**
- 15-20% on course sales
- Payment: Monthly via PayPal/Payoneer

---

#### **3. Coursera Affiliate (via Impact)**

**Sign Up:**
1. Go to https://impact.com
2. Apply for Coursera program
3. Get affiliate ID

**Add to `.env`:**
```env
COURSERA_AID=your_affiliate_id
```

**Commission:**
- 10-45% on subscriptions
- Payment: Monthly via Impact platform

---

#### **4. Notion Affiliate**

**Sign Up:**
1. Go to https://notion.so/affiliates
2. Apply (manual approval)
3. Get partner ID

**Add to `.env`:**
```env
NOTION_PARTNER_ID=your_partner_id
```

**Commission:**
- $10 per new signup
- Recurring: 50% for 1 year
- Payment: Monthly via Stripe

---

### **Affiliate Rotation System**

**Code Location:** `discord-bot/utils/affiliateUtils.js`

**How It Works:**
```javascript
// Weighted distribution
const affiliates = [
    { name: 'amazon', weight: 30 },     // 30% chance
    { name: 'udemy', weight: 25 },      // 25% chance
    { name: 'coursera', weight: 20 },   // 20% chance
    { name: 'notion', weight: 15 },     // 15% chance
    { name: 'discord', weight: 10 }     // 10% chance
];

// Random selection based on weights
const selectedAd = weightedRandom(affiliates);
```

**Why Weighted?**
- Higher commission products get more visibility
- Amazon converts best (highest weight)
- Discord Nitro is just bonus (lowest weight)

---

### **Customizing Ads**

**File to Edit:** `discord-bot/utils/affiliateUtils.js`

**Add Your Own Affiliate:**
```javascript
const affiliateAds = {
    // ... existing affiliates ...
    
    yourAffiliate: {
        messages: [
            '💰 Check out this amazing tool: {link}',
            '🔥 Special offer: {link}'
        ],
        links: [
            'https://example.com/product?ref=YOUR_CODE'
        ],
        weight: 20 // Adjust visibility
    }
};
```

**Change Weights:**
```javascript
// Give Amazon more visibility
{ name: 'amazon', weight: 40 },  // Increased from 30

// Reduce Discord Nitro
{ name: 'discord', weight: 5 }   // Decreased from 10
```

---

### **Tracking Affiliate Revenue**

**Manual Tracking:**

**Create Spreadsheet:**
```
Date | Platform | Clicks | Conversions | Revenue
-----|----------|--------|-------------|--------
2026-02-01 | Amazon | 150 | 12 | ₹1,200
2026-02-01 | Udemy | 80 | 5 | $45
2026-02-01 | Notion | 30 | 2 | $20
```

**Where to Get Data:**
- **Amazon:** Dashboard → Reports → Earnings
- **Udemy:** Partner Dashboard → Analytics
- **Coursera:** Impact.com → Reports
- **Notion:** Partner Portal → Revenue

---

### **Estimated Revenue**

**Based on 1000 FREE users:**

**Assumptions:**
- 50% see ads (500 users)
- 1% conversion rate (5 sales/month)

**Monthly Estimate:**
```
Amazon (books): 5 sales × ₹200 × 5% = ₹50
Udemy (courses): 3 sales × $50 × 15% = $22.50
Notion: 2 signups × $10 = $20
Total: ~₹1,500 + $42.50 (~₹5,000/month)
```

**With 10,000 FREE users:**
```
Estimated: ~₹50,000/month from affiliates
```

**Affiliate revenue is PASSIVE!** 💰

---

### **Pro Tier Removes Ads**

**User Experience:**

**Before (Free):**
```
╚═══════════════════════════════════════════╝

💡 Learning Java? Get this top-rated course:
https://udemy.com/course/java?ref=YOUR_CODE

🎀 Upgrade to Pro to remove ads! /subscribe
```

**After (Pro):**
```
╚═══════════════════════════════════════════╝
✨ Seraphina serves devotedly at your side, Master~
```

**Clean, ad-free experience = incentive to upgrade!**

---

### **Best Practices**

**DO:**
- ✅ Keep ads relevant to learning
- ✅ Rotate affiliates for variety
- ✅ Track which affiliates convert best
- ✅ Use clear "Remove ads" CTA
- ✅ Test different ad placements

**DON'T:**
- ❌ Spam users with too many ads
- ❌ Show ads to Pro users (ruins experience)
- ❌ Use shady affiliate products
- ❌ Hide that links are affiliates (be transparent)

---

### **Compliance & Disclosure**

**Legal Requirements:**

**Add to Privacy Policy:**
```
Affiliate Disclosure:
Seraphina may display affiliate links to third-party products.
We may earn a commission from purchases made through these links
at no additional cost to you.
```

**Add to Bot Footer:**
```
💼 Includes affiliate links
```

**FTC Compliance (if targeting US users):**
- Must disclose affiliate relationships
- Already included in ad text

---

### **Advanced: A/B Testing Ads**

**Test Different Approaches:**

**Variant A (Direct):**
```
💡 Get this Python course: [link]
```

**Variant B (Soft sell):**
```
📚 Students love this Python course: [link]
```

**Variant C (With emoji):**
```
🔥 Top-rated Python course: [link]
```

**Track conversions and use what works best!**

---

### **Quick Commands For You**

**Check if user sees ads:**
```javascript
// In MongoDB
db.subscriptions.findOne({ userId: "USER_ID" })
// If tier: "free" → sees ads
// If tier: "pro" → no ads
```

**Temporarily disable all ads:**
```javascript
// In discord-bot/utils/adUtils.js
async function getAdFooter(userId) {
    return ''; // Disable all ads
}
```

**Force show specific affiliate:**
```javascript
// In discord-bot/utils/affiliateUtils.js
return affiliateAds.udemy; // Always show Udemy
```

---

### **Revenue Comparison**

**Subscriptions vs Affiliates (10,000 users):**

**Subscriptions (Primary):**
```
100 Pro users × ₹399 = ₹39,900/month
```

**Affiliates (Secondary):**
```
9,900 Free users → ~₹50,000/month
```

**Total Potential: ~₹90,000/month** 💰

**Affiliates complement subscriptions perfectly!**

---

## 🚀 Deployment Workflow

### **Local Development**

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Update .env
# (Add your local MongoDB for testing)

# 4. Test bot locally
cd discord-bot
node index.js

# 5. Test in Discord (test server)
```

---

### **Deployment to Production**

**Step 1: Push to GitHub**
```bash
git add .
git commit -m "Added onboarding wizard"
git push origin main
```

**Step 2: Deploy Bot to Koyeb**
1. Koyeb auto-deploys from GitHub
2. Check deployment logs
3. Verify bot online in Discord

**Step 3: Deploy Web UI to Vercel**
```bash
cd web-ui
vercel --prod
```

**Step 4: Deploy API**
(Same Koyeb instance as bot, auto-deploys)

---

### **Post-Deployment Checklist**

- [ ] Bot shows online in Discord
- [ ] `/setup-wizard` works in test server
- [ ] Payment link generates correctly
- [ ] Test payment (test mode)
- [ ] Webhook receives events
- [ ] Admin panel accessible
- [ ] No errors in logs

---

### **Monitoring**

**Check Daily:**
- Koyeb deployment status
- Error logs (Koyeb dashboard)
- MongoDB connection
- Razorpay transactions

**Check Weekly:**
- Subscription renewals
- Failed payments (retry/contact users)
- User feedback in Discord
- Feature requests

---

## 🛡️ Security Best Practices

### **Never Share:**
- `.env` file
- Razorpay secrets
- MongoDB URI
- JWT secrets
- Admin password

### **Rotate Regularly:**
- Admin password (3 months)
- JWT_SECRET (6 months)
- Razorpay webhook secret (if compromised)

### **Backup:**
- MongoDB (weekly)
  ```bash
  mongodump --uri="your_mongodb_uri"
  ```
- Config files
- Critical server settings

---

## 📞 Support Channels

**For Users:**
- Official Discord server (you create)
- Email: Snugtojo@gmail.com
- `/help` command in bot

**For You (Owner):**
- Razorpay support: capital.support@razorpay.com
- MongoDB support: support@mongodb.com
- Koyeb support: support@koyeb.com
- Discord Developer: discord.com/support

---

## 🎯 Quick Reference

### **Key URLs**

```
Bot Admin Panel: https://your-domain.com/admin
Razorpay Dashboard: https://dashboard.razorpay.com
MongoDB Atlas: https://cloud.mongodb.com
Koyeb Dashboard: https://app.koyeb.com
Discord Developer: https://discord.com/developers
```

### **Key Commands (Your Access)**

**Discord (Bot Owner):**
- You have all commands
- Can manually grant Pro via database
- Can view all server stats

**MongoDB:**
- Full database access
- Can manually edit subscriptions
- Can view analytics

**Razorpay:**
- View all transactions
- Issue refunds
- Cancel subscriptions

---

## ✅ Final Checklist

**Before Going Live:**

- [ ] KYC approved on Razorpay
- [ ] Switched to `rzp_live_` keys
- [ ] Created live subscription plan
- [ ] Webhook URL updated to production
- [ ] All `.env` variables set in Koyeb
- [ ] Bot tested in multiple servers
- [ ] Payment flow tested end-to-end
- [ ] Admin panel secured
- [ ] Support channel created
- [ ] Terms of Service written
- [ ] Privacy Policy published
- [ ] Refund policy documented

---

**Your bot is production-ready! 🎀**

**Questions?** Refer to:
- [Razorpay Docs](https://razorpay.com/docs/)
- [Discord.js Guide](https://discordjs.guide/)
- [MongoDB Docs](https://docs.mongodb.com/)

**May Seraphina serve thousands of learners devotedly!** ✨
