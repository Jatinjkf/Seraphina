# 🛠️ Seraphina Lumière - Administrator Guide

**Complete setup and deployment guide for administrators**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Discord Bot Setup](#discord-bot-setup)
4. [MongoDB Setup](#mongodb-setup)
5. [Environment Configuration](#environment-configuration)
6. [Deployment](#deployment)
7. [Web Admin Panel](#web-admin-panel)
8. [Maintenance](#maintenance)
9. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Services
- **Node.js** 18.x or higher
- **MongoDB** database (MongoDB Atlas recommended)
- **Discord Application** with bot account
- **Koyeb Account** (for bot + API hosting)
- **Vercel Account** (for web UI hosting)

### Required Knowledge
- Basic command line usage
- Discord bot permissions
- Environment variables
- Git basics

---

## 🚀 Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/seraphina-bot.git
cd seraphina-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

```bash
cp .env.example .env
```

---

## 🤖 Discord Bot Setup

### Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Name it **"Seraphina Lumière"**
4. Click **"Create"**

### Step 2: Create Bot Account

1. Go to **"Bot"** tab
2. Click **"Add Bot"**
3. Confirm **"Yes, do it!"**
4. Copy the **Bot Token** (save for `.env`)

### Step 3: Configure Bot Settings

**In the Bot tab:**
- ✅ Enable **"Message Content Intent"**
- ✅ Enable **"Server Members Intent"**  
- ✅ Enable **"Presence Intent"**

### Step 4: Get Application Credentials

**In "General Information" tab:**
- Copy **Application ID** (save as `DISCORD_CLIENT_ID`)

**In "OAuth2" tab:**
- Copy **Client Secret** (save as `DISCORD_CLIENT_SECRET`)

### Step 5: Invite Bot to Server

1. Go to **"OAuth2" → "URL Generator"**
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select bot permissions:
   - ✅ Read Messages/View Channels
   - ✅ Send Messages
   - ✅ Manage Messages
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ Read Message History
   - ✅ Add Reactions
   - ✅ Use Slash Commands
4. Copy the generated URL
5. Open URL in browser and invite to your server

---

## 🗄️ MongoDB Setup

### Option 1: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Click **"Create Cluster"**
4. Choose **M0 Free Tier**
5. Select region closest to you
6. Click **"Create Cluster"**

**Get Connection String:**
1. Click **"Connect"**
2. Choose **"Connect your application"**
3. Copy connection string
4. Replace `<password>` with your database password
5. Replace `<database>` with `seraphina`
6. Save as `MONGODB_URI` in `.env`

**Create Database User:**
1. Go to **"Database Access"**
2. **"Add New Database User"**
3. Create username and password
4. Select **"Read and write to any database"**

**Whitelist IP:**
1. Go to **"Network Access"**
2. **"Add IP Address"**
3. Choose **"Allow Access from Anywhere"** (0.0.0.0/0)

### Option 2: Local MongoDB

Install MongoDB locally and use:
```
MONGODB_URI=mongodb://localhost:27017/seraphina
```

---

## ⚙️ Environment Configuration

Edit `.env` file with all required values:

```env
# Discord
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/seraphina

# Admin
ADMIN_PASSWORD=your_secure_password
ADMIN_USER_IDS=1445501186005270538

# Security
JWT_SECRET=generate_random_64_char_string
ENCRYPTION_KEY=generate_random_32_char_string

# Server
PORT=3000
API_URL=https://your-app.koyeb.app
WEB_URL=https://your-app.vercel.app
```

**Generate secure keys:**
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Encryption Key
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

**Get your Discord User ID:**
1. Enable Discord Developer Mode (Settings → Advanced)
2. Right-click your profile
3. Click **"Copy ID"**

---

## 🚀 Deployment

### Local Testing

```bash
# Test bot locally
npm run bot

# Test with API
npm start
```

### Deploy to Koyeb (Bot + API)

1. **Create Koyeb Account:** [koyeb.com](https://www.koyeb.com)

2. **Connect GitHub:**
   - Link your GitHub repository
   - Make sure repo is PRIVATE for closed-source

3. **Create App:**
   - Click **"Create App"**
   - Select **"GitHub"** as source
   - Choose your `seraphina-bot` repository

4. **Configure Service:**
   - **Service Name:** `seraphina`
   - **Build Command:** (leave empty, uses package.json)
   - **Run Command:** `npm start`
   - **Port:** `3000`

5. **Add Environment Variables:**
   - Add ALL variables from `.env`
   - Set each one individually in Koyeb dashboard

6. **Deploy:**
   - Click **"Deploy"**
   - Wait for build to complete
   - Copy the generated URL (use as `API_URL`)

### Deploy Web UI to Vercel

1. **Create Vercel Account:** [vercel.com](https://vercel.com)

2. **Import Project:**
   - Click **"Add New"** → **"Project"**
   - Import from GitHub
   - Select your `seraphina-bot` repository

3. **Configure Build:**
   - **Framework Preset:** Vite
   - **Root Directory:** `web-ui`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Add Environment Variable:**
   - **Name:** `VITE_API_URL`
   - **Value:** Your Koyeb URL (e.g., `https://seraphina-yourname.koyeb.app`)

5. **Deploy:**
   - Click **"Deploy"**
   - Copy the generated Vercel URL (use as `WEB_URL`)

### Register Slash Commands

After first deployment:

```bash
npm run deploy-commands
```

Or manually:
```bash
node discord-bot/deploy-commands.js
```

---

## 🌐 Web Admin Panel

### Accessing the Panel

1. Go to your Vercel URL: `https://your-app.vercel.app`
2. Login with `ADMIN_PASSWORD` from `.env`

### Features

**Settings:**
- Change maid name
- Configure timezone
- Set storage channel ID

**Bot Status:**
- View online/offline status
- Server count
- User count

---

## 🔧 Maintenance

### Updating the Bot

```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Deploy updated commands
npm run deploy-commands

# Restart on Koyeb (automatic on git push)
git push origin main
```

### Database Backups

**MongoDB Atlas Auto-Backups:**
- M10+ clusters have automatic backups
- Free tier (M0): Manual export required

**Manual Backup:**
```bash
mongodump --uri="your_mongodb_uri" --out=./backup
```

### Monitoring

**Koyeb Dashboard:**
- View logs
- Monitor memory/CPU usage
- Check uptime

**Discord Bot Status:**
- Online indicator in server
- Check rotating status messages

---

## 🐛 Troubleshooting

### Bot Not Responding

**Check:**
1. Bot is online in Discord
2. All intents are enabled in Developer Portal
3. Slash commands are registered (`npm run deploy-commands`)
4. Koyeb service is running

**Common Fix:**
```bash
# Re-deploy commands
npm run deploy-commands
```

### Database Connection Errors

**Check:**
1. MongoDB URI is correct
2. Database user has permissions
3. IP whitelist includes 0.0.0.0/0
4. Cluster is active

**Test Connection:**
```bash
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected!')).catch(e => console.error(e))"
```

### Web UI Can't Connect to API

**Check:**
1. `VITE_API_URL` in Vercel matches Koyeb URL
2. CORS is enabled (`origin: '*'` in `web-api/server.js`)
3. Koyeb service is running on port 3000
4. API health endpoint works: `https://your-koyeb.app/api/health`

### Commands Not Appearing

**Solution:**
```bash
# Clear and re-register
npm run deploy-commands

# Wait 5-10 minutes for Discord to update
```

### Reminders Not Sending

**Check:**
1. Scheduler is running (check Koyeb logs)
2. Timezone is correct in `.env`
3. Users have DMs enabled
4. Bot has permission to DM users

---

## 📊 Performance Monitoring

### Resource Usage

**Koyeb Free Tier:**
- 512 MB RAM
- Shared CPU
- Auto-sleeps after inactivity

**Optimization:**
- Use indexes in MongoDB
- Limit message fetch (already optimized)
- Cache frequently accessed data

### Scaling

**When to upgrade:**
- 100+ active users
- High memory usage (>400MB)
- Slow response times

**Koyeb Paid Plans:**
- More RAM/CPU
- No auto-sleep
- Better performance

---

## 🔒 Security Best Practices

1. ✅ Never commit `.env` to Git
2. ✅ Use strong `ADMIN_PASSWORD`
3. ✅ Rotate `JWT_SECRET` regularly
4. ✅ Keep dependencies updated
5. ✅ Use HTTPS only
6. ✅ Limit admin user IDs
7. ✅ Keep repository PRIVATE
8. ✅ Monitor access logs

---

## 📞 Support

**Issues:**
- Check logs in Koyeb dashboard
- Review this guide's troubleshooting section
- Test locally first

**Updates:**
- Watch for dependency updates
- Update Discord.js carefully
- Test before deploying to production

---

<div align="center">

**🎀 Seraphina is now ready to serve~ ✨**

*Thank you for administrating!*

</div>
