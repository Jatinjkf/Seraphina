# Quick Start - Deploy to Koyeb

**Fast track deployment guide - full details in [DEPLOY.md](DEPLOY.md)**

---

## Prerequisites (5 minutes)

1. ✅ MongoDB Atlas cluster (free) - [Create here](https://www.mongodb.com/cloud/atlas/register)
   - Get connection string
   - Replace password and database name

2. ✅ Discord bot (free) - [Developer Portal](https://discord.com/developers/applications)
   - Get bot token
   - Get application/client ID
   - Enable Message Content Intent
   - Invite to server

3. ✅ GitHub repository - Push your code
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/seraphina-bot.git
   git push -u origin main
   ```

---

## Deploy to Koyeb (3 minutes)

### 1. Create Koyeb App

1. Sign up at [Koyeb](https://app.koyeb.com/) (free, no credit card)
2. Connect GitHub
3. Click **"Create App"**

### 2. Configure

```
Name: seraphina-bot
Repository: your-repo
Branch: main
Builder: Buildpack
Build command: npm install
Run command: node discord-bot/index.js
Region: Singapore (or closest to you)
Instance: Free (Eco)
```

### 3. Add Environment Variables

```env
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_id_here
MONGODB_URI=mongodb+srv://username:password@cluster...
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=random_keyboard_mashing_123
ENCRYPTION_KEY=another_random_string_456
NODE_ENV=production
PORT=3000
```

### 4. Deploy!

Click **"Deploy"** and wait 2-3 minutes.

**Look for in logs:**
```
✓ Connected to MongoDB
✓ Bot settings initialized  
✓ Reminder scheduler initialized
✓ Seraphina Lumière is online!
```

---

## Test (2 minutes)

### 1. Welcome & Setup (In Discord)

**When you first invite Seraphina to your server:**
1. She'll send a welcome message immediately
2. Click "🎀 Start Server Setup" button
3. Select learning channel
4. Select storage channel
5. (Optional) Configure admin settings
6. Check pinned message in learning channel!

**Or run manually:**
```
/setup-wizard
```

### 2. Try Commands

In Discord:
```
/help
/upload Test Image
/list
```

**Done!** 🎉

---

## Deploy Web UI (Optional)

Same process, but:
```
Build command: cd web-ui && npm install && npm run build
Run command: npx serve -s web-ui/dist -p 5173
```

---

<div align="center">

**Full guide:** [DEPLOY.md](DEPLOY.md)  
**Commands:** [README.md](README.md)

🎀 Seraphina awaits your command, Master~

</div>
