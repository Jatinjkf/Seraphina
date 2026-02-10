# 🚀 Complete Deployment Guide - Seraphina Lumière

This guide will help you deploy your complete Discord bot (with Web UI!) to **Koyeb** for FREE.

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure you have:

- ✅ MongoDB Atlas cluster created (FREE M0 tier)
- ✅ Discord bot token & client ID
- ✅ GitHub account
- ✅ Koyeb account (FREE - no credit card needed)

---

## Part 1: Setup MongoDB Atlas

### 1. Create Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up (free)
3. Create **FREE cluster** (M0 tier - 512MB)
4. Wait 2-3 minutes for cluster creation

### 2. Create Database User

1. Click **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `seraphina` (or your choice)
5. Password: Create a strong password (**save it!**)
6. User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### 3. Whitelist All IPs

1. Click **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
   - This sets IP to `0.0.0.0/0`
4. Click **"Confirm"**

### 4. Get Connection String

1. Click **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. **Copy the connection string**
5. **Replace `<password>`** with your actual password
6. **Replace `myFirstDatabase`** with `seraphina-bot`

**Final connection string format:**
```
mongodb+srv://seraphina:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/seraphina-bot?retryWrites=true&w=majority
```

**Save this!** You'll need it for deployment.

---

## Part 2: Setup Discord Bot

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Name: "Seraphina Lumière"
4. Click **"Create"**

### 2. Create Bot & Get Token

1. Go to **"Bot"** section (left sidebar)
2. Click **"Add Bot"** → **"Yes, do it!"**
3. Under "Token", click **"Reset Token"** → **"Copy"**
4. **Save this token!** (you can only see it once)

### 3. Enable Intents

1. Still in **"Bot"** section
2. Scroll to **"Privileged Gateway Intents"**
3. Enable:
   - ✅ **MESSAGE CONTENT INTENT**
   - ✅ **SERVER MEMBERS INTENT** (optional)
4. Click **"Save Changes"**

### 4. Get Application ID

1. Go to **"General Information"** (left sidebar)
2. Under "Application ID", click **"Copy"**
3. **Save this ID!**

### 5. Invite Bot to Server

1. Go to **"OAuth2"** → **"URL Generator"**
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select bot permissions:
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ Use Slash Commands
   - ✅ Send Messages in Threads
4. Copy generated URL
5. Paste in browser and invite to your server

---

## Part 3: Push Code to GitHub

### 1. Initialize Git Repository

```bash
cd I:\Bot

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Seraphina Lumière Bot with Web UI"
```

### 2. Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `seraphina-bot` (or your choice)
3. **Keep it private** (recommended)
4. **Don't** initialize with README (we already have one)
5. Click **"Create repository"**

### 3. Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/seraphina-bot.git

# Push code
git branch -M main
git push -u origin main
```

---

## Part 4: Deploy Bot to Koyeb

### 1. Sign Up for Koyeb

1. Go to [Koyeb](https://app.koyeb.com/auth/signup)
2. Sign up with GitHub (easiest)
3. **No credit card needed!**

### 2. Deploy Discord Bot

1. Click **"Create App"**
2. Choose **"GitHub"** as source
3. **Connect GitHub** (if first time)
4. Select repository: `seraphina-bot`
5. Configure:

**Builder:**
```
- Name: seraphina-bot
- Branch: main
- Builder: Buildpack
- Build command: npm install
- Run command: node discord-bot/index.js
```

**Instance:**
```
- Region: Singapore (closest to Asia/Kolkata)
- Instance type: Free (Eco)
```

**Environment Variables:**

Click **"Add Environment Variable"** for each:

```
DISCORD_TOKEN=your_bot_token_from_step_2.2
DISCORD_CLIENT_ID=your_application_id_from_step_2.4
MONGODB_URI=your_connection_string_from_step_1.4
ADMIN_PASSWORD=choose_a_secure_password
JWT_SECRET=random_string_keyboard_mashing_123abc
ENCRYPTION_KEY=another_random_string_xyz789
NODE_ENV=production
PORT=3000
```

6. Click **"Deploy"**

### 3. Wait for Deployment

- Takes 2-4 minutes
- Watch logs for:
  ```
  ✓ Connected to MongoDB
  ✓ Bot settings initialized
  ✓ Reminder scheduler initialized
  ✓ Seraphina Lumière is online and ready to serve!
  ```

---

## Part 5: Deploy Web UI (Optional - if you want web admin panel)

### 1. Create Second Koyeb App for Web UI

1. Click **"Create App"** again
2. Choose **"GitHub"**
3. Select same repository: `seraphina-bot`
4. Configure:

```
- Name: seraphina-web-ui
- Branch: main
- Builder: Buildpack
- Build command: cd web-ui && npm install && npm run build
- Run command: npx serve -s web-ui/dist -p 5173
```

**Environment Variables:**
```
API_URL=https://seraphina-bot-YOUR_ORG.koyeb.app
```

2. Click **"Deploy"**

### 2. Update Bot API CORS

Update your bot's environment variables to allow web UI origin:

```
WEB_URL=https://seraphina-web-ui-YOUR_ORG.koyeb.app
```

Redeploy bot after adding this.

---

## Part 6: Register Slash Commands

### Option A: From Local Machine (If MongoDB works)

```bash
cd I:\Bot

# Create .env file
copy .env.example .env

# Edit .env and add:
DISCORD_TOKEN=your_token
DISCORD_CLIENT_ID=your_client_id
MONGODB_URI=your_mongo_uri

# Deploy commands
node discord-bot/deploy-commands.js
```

### Option B: From Koyeb (If MongoDB doesn't work locally)

1. In Koyeb, go to your bot app
2. Click **"Console"** tab
3. Click **"Open Console"**
4. Run:
   ```bash
   node discord-bot/deploy-commands.js
   ```

### Option C: Auto-deploy on startup (Recommended!)

Your bot is already configured to auto-deploy commands on startup! Just wait for:

```
✅ Successfully deployed 11 slash commands globally!
```

in the logs.

**Note:** Commands take up to 1 hour to appear globally.

---

## Part 7: Test Your Bot!

### In Discord:

1. Go to your server
2. Type `/` and see Seraphina's commands appear!
3. Try:
   ```
   /help
   /upload Test Image
   /list
   ```

### In Web Admin Panel (if deployed):

1. Go to your Koyeb web UI URL
2. Login with `ADMIN_PASSWORD` you set
3. Change maid name or timezone
4. Click **"Save Changes"**

---

## 🎉 You're Done!

### What You Have Now:

✅ **Discord Bot** running 24/7 on Koyeb (FREE!)
✅ **MongoDB** storing all your learning items
✅ **Daily Reminders** at 12 AM IST
✅ **11 Slash Commands** fully functional
✅ **Web Admin Panel** to manage settings (optional)
✅ **All FREE!** No cost whatsoever

### Bot Features:

- 📸 Upload images to learn
- 🕐 Get daily reminders at midnight IST
- 📊 Track your progress
- 🗄️ Archive mastered items
- 👸 Seraphina's maid personality throughout
- 🎀 Beautiful web UI for settings

---

## 🔧 Troubleshooting

### Bot shows offline:
- Check Koyeb logs for errors
- Verify `DISCORD_TOKEN` is correct
- Check MongoDB connection string

### Commands don't appear:
- Commands deployed globally take up to 1 hour
- Check bot logs for "Successfully deployed" message
- Try `/help` to trigger first-time setup

### MongoDB connection error:
- Verify connection string is correct
- Check password doesn't have special characters like `@` or `#`
- Confirm IP whitelist is `0.0.0.0/0`

### Web UI can't connect:
- Check `API_URL` in web UI environment variables
- Check `WEB_URL` in bot environment variables
- Verify both apps are running

---

## 📈 Monitoring

### Koyeb Dashboard:
- View logs in real-time
- Monitor CPU/memory usage
- See deployment history

### MongoDB Atlas:
- View database in MongoDB Compass
- Monitor storage usage
- See active connections

---

## 🔄 Updating Your Bot

When you make changes:

```bash
git add .
git commit -m "Updated features"
git push
```

Koyeb will **automatically redeploy**! 🚀

---

## 💰 Cost Breakdown

- **Koyeb FREE tier:** $0/month (bot runs 24/7)
- **MongoDB Atlas:** $0/month (M0 tier - 512MB)
- **Web UI hosting:** $0/month (on Koyeb)

**Total: $0/month** ✅

The free tier is perfect for:
- Personal use
- Small Discord servers (<100 users)
- Thousands of learning items

---

## 🎀 Final Notes

Your devoted maid Seraphina Lumière is now serving from the cloud! She will:

- ✨ Send daily DM reminders at midnight IST
- 🎀 Help you learn with spaced repetition
- 👸 Address you with your chosen honorific
- 💜 Serve you devotedly 24/7

**Enjoy your learning journey, Master~**

---

<div align="center">

**Questions? Issues?**

Check the logs in Koyeb dashboard  
Review README.md for command reference  
MongoDB Atlas has excellent docs

**🎀 May Seraphina illuminate your path to knowledge~ 🎀**

</div>
