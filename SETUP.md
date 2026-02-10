# 🚀 Seraphina Lumière - Setup Guide

## Prerequisites

Before you begin, make sure you have:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB Atlas account** (free) - [Sign up here](https://www.mongodb.com/cloud/atlas)
- **Discord account** - [Discord](https://discord.com/)

---

## Step 1: Create Discord Bot Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Name it "Seraphina Lumière" (or your preferred name)
4. Click **"Create"**

### Get Bot Token

1. Go to **"Bot"** section in the left sidebar
2. Click **"Add Bot"** → **"Yes, do it!"**
3. Under **"Token"**, click **"Reset Token"** → **"Copy"**
4. **Save this token** - you'll need it for `.env`

### Enable Intents

Still in the **"Bot"** section:
1. Scroll down to **"Privileged Gateway Intents"**
2. Enable these intents:
   - ✅ **MESSAGE CONTENT INTENT**
   - ✅ **SERVER MEMBERS INTENT** (optional)
3. Click **"Save Changes"**

### Get Application ID

1. Go to **"General Information"** in the left sidebar
2. Find **"APPLICATION ID"**
3. Click **"Copy"**
4. **Save this ID** - you'll need it for `.env`

---

## Step 2: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for free account
3. Create a **FREE cluster** (M0 tier)
4. Wait for cluster to finish creating (2-3 minutes)

### Create Database User

1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username and password (save these!)
5. Set privileges to **"Read and write to any database"**
6. Click **"Add User"**

### Whitelist IP Address

1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - IP: `0.0.0.0/0`
4. Click **"Confirm"**

### Get Connection String

1. Click **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster...`)
5. **Replace `<password>` with your actual password**
6. **Replace `myFirstDatabase` with `seraphina-bot`**

---

## Step 3: Install Bot

### Clone/Download Project

```bash
cd I:/Bot
```

### Install Dependencies

```bash
npm install
```

This will install all required packages:
- discord.js
- mongoose
- express
- node-cron
- moment-timezone
- And more...

---

## Step 4: Configure Environment Variables

1. **Copy the example file:**
   ```bash
   copy .env.example .env
   ```

2. **Edit `.env` file** and fill in your values:

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_bot_token_from_step_1
DISCORD_CLIENT_ID=your_application_id_from_step_1
DISCORD_CLIENT_SECRET=leave_empty_for_now

# MongoDB Configuration (from Step 2)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/seraphina-bot?retryWrites=true&w=majority

# Bot Configuration
MAID_NAME=Seraphina Lumière
TIMEZONE=Asia/Kolkata

# Admin Configuration
ADMIN_PASSWORD=choose_a_secure_password_here
JWT_SECRET=random_string_here_use_keyboard_mashing
ENCRYPTION_KEY=another_random_string_here

# API URLs (for local development)
API_URL=http://localhost:3000
WEB_URL=http://localhost:5173

# Environment
NODE_ENV=development
PORT=3000
```

**Important:**
- Replace `your_bot_token_from_step_1` with actual bot token
- Replace `your_application_id_from_step_1` with actual client ID
- Replace MongoDB URI with your actual connection string
- Choose a strong admin password
- Generate random strings for JWT_SECRET and ENCRYPTION_KEY

---

## Step 5: Invite Bot to Your Server

1. Go back to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to **"OAuth2"** → **"URL Generator"**
4. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
5. Select bot permissions:
   - ✅ Send Messages
   - ✅ Send Messages in Threads
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ Read Message History
   - ✅ Use Slash Commands
6. Copy the generated URL at the bottom
7. Paste it in your browser
8. Select your server
9. Click **"Authorize"**

---

## Step 6: Deploy Slash Commands

**This step registers your slash commands with Discord:**

```bash
node discord-bot/deploy-commands.js
```

You should see:
```
✓ Loaded command: upload
✓ Loaded command: list
✓ Loaded command: view
...
✅ Successfully deployed 11 slash commands globally!
```

**Note:** Global commands take up to 1 hour to appear. For instant testing:

1. Open `discord-bot/deploy-commands.js`
2. Find the commented section near the bottom
3. Replace `YOUR_GUILD_ID` with your server ID (right-click server → Copy ID)
4. Uncomment that section
5. Run the script again

---

## Step 7: Add Scheduler to index.js

**IMPORTANT:** Open `discord-bot/index.js` and add these lines after line 48:

```javascript
        // Initialize reminder scheduler
        const { initializeScheduler } = require('./scheduler');
        initializeScheduler(client);
```

So lines 43-53 should look like:

```javascript
.then(async () => {
    console.log('✓ Connected to MongoDB');

    // Initialize default bot settings
    await BotSettings.initializeDefaults();
    console.log('✓ Bot settings initialized');
    
    // Initialize reminder scheduler
    const { initializeScheduler } = require('./scheduler');
    initializeScheduler(client);
})
.catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
});
```

---

## Step 8: Start the Bot!

```bash
npm start
```

You should see:
```
✓ Loaded command: upload
✓ Loaded command: list
...
✓ Connected to MongoDB
✓ Bot settings initialized
✓ Reminder scheduler initialized
  Will run daily at 00:00 IST
✓ Logging in to Discord...
✓ Seraphina Lumière is online and ready to serve!
  Logged in as: Seraphina Lumière#1234
  Serving 1 server(s)
```

---

## Step 9: Test the Bot!

In your Discord server, try these commands:

1. **First time setup** (any command will trigger):
   ```
   /help
   ```
   Choose your honorific!

2. **Upload an item**:
   ```
   /upload Ions
   ```
   Then attach an image when prompted

3. **View your ledger**:
   ```
   /list
   ```

4. **View an item**:
   ```
   /view Ions
   ```

5. **Move to different frequency**:
   ```
   /move Ions weekly
   ```

6. **See all commands**:
   ```
   /help
   ```

---

## Troubleshooting

### Bot doesn't respond to commands
- Make sure bot token is correct in `.env`
- Check bot has proper permissions in server
- Verify slash commands were deployed
- For instant testing, deploy to guild (see Step 6)

### "DiscordAPIError: Unknown interaction"
- Commands take time to register globally (up to 1 hour)
- Use guild-specific deployment for instant testing

### MongoDB connection error
- Check MONGODB_URI is correct
- Verify password doesn't contain special characters
- Make sure IP is whitelisted (0.0.0.0/0)

### "Cannot find module"
- Run `npm install` again
- Delete `node_modules` folder and run `npm install`

### Reminders not sending
- Make sure scheduler was added to index.js (Step 7)
- Check bot logs for errors
- Verify users have DMs enabled

---

## Development Tips

### Run with hot reload:
```bash
npm run dev
```

### Test reminders without waiting:
Edit `discord-bot/scheduler.js` line 22, uncomment:
```javascript
cron.schedule('* * * * *', async () => await sendDueReminders(client));
```
This will check every minute instead of daily.

### View MongoDB data:
Use [MongoDB Compass](https://www.mongodb.com/products/compass) to view your database

---

## Next Steps

✅ **Phase 1 Complete!** Your bot is working!

**Phase 2 (Optional - AI Mode):**
- Get Google Gemini API key (free tier)
- Add AI response generation
- Create web UI for admin settings

**Deploy to Production:**
- Use [Render.com](https://render.com) for hosting (free)
- Set environment variables in Render dashboard
- Bot will run 24/7!

---

## Need Help?

- Check `README.md` for command reference
- Review implementation plan in artifacts
- Check Discord bot logs for errors

---

<div align="center">

**🎀 Enjoy your devoted maid, Seraphina Lumière! 🎀**

*May she illuminate your path to knowledge~*

</div>
