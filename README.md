# 🎀 Seraphina Lumière - Your Devoted Learning Companion

<div align="center">

![Seraphina Banner](https://via.placeholder.com/800x200/9333ea/ffffff?text=Seraphina+Lumière)

**An elegant Discord bot maid designed to help you master anything through spaced repetition**

[![Discord](https://img.shields.io/badge/Discord-Bot-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](./LICENSE)

[Features](#-features) • [Setup](#-quick-setup) • [Commands](#-commands) • [User Guide](./USER_GUIDE.md) • [Admin Guide](./ADMIN_GUIDE.md)

</div>

---

## ✨ What is Seraphina?

**Seraphina Lumière** is your personal maid companion who helps you learn and remember anything through scientifically-proven spaced repetition. Whether you're studying languages, programming, or any other skill, Seraphina keeps you on track with:

- 🎀 **Easy Server Setup** - 30-second wizard when bot joins your server
- 📸 **Visual Learning** - Upload images with captions for visual memory
- 🔄 **Spaced Repetition** - 6 frequency options (daily to monthly)
- 👥 **Per-Guild Partners** - Study together with different friends per server
- 📊 **Progress Tracking** - Beautiful stats and achievement system
- ✨ **Auto-Detection** - Post images in your learning channel, Seraphina handles the rest
- 💫 **Smart Reminders** - Daily DM notifications at midnight
- 🏰 **Multi-Server Ready** - Fully isolated data per server

---

## 🎯 Features

### **Server Onboarding** 🆕
- Welcome message when bot joins your server
- 30-second setup wizard (admin-only)
- Easy channel selection with dropdowns
- Auto-posted pinned user guide
- Re-run setup anytime with `/setup-wizard`

### **Core Learning System**
- Image-based learning with captions
- 6 reminder frequencies (daily, every 2/3 days, weekly, bi-weekly, monthly)
- Smart duplicate detection with auto-numbering
- Archive system for mastered items
- Item renaming, moving, and management
- Beautiful visual ledger with elegant design

### **Partner System** 🆕
- Per-guild partnerships (1 partner per server)
- Button-based DM invitations (Accept / Decline)
- Shared ledger management within server
- Combined reminders
- Different partners in different servers

### **Auto-Detection**
- Post images in designated channel
- Caption parsing: `[item name] [frequency]`
- Automatic storage and organization
- Smart ledger updates (edits recent, resends when buried)

### **Personality & UI**
- Rotating Discord status (10 unique messages)
- Emoji-rich responses throughout
- Random motivating quotes (15 unique)
- Maid-style menus and interfaces
- Elegant ASCII box designs

### **Web Admin Panel**
- Secure login authentication
- Maid name configuration (global)
- Timezone settings (global DM reminders)
- Bot status monitoring
- Per-server settings info

### **Scheduler**
- Daily reminders at 12:00 AM IST (configurable)
- Smart frequency calculations
- Partner-aware notifications
- Timezone support

---

## 🚀 Quick Setup

### **Prerequisites**
- Node.js 18+
- MongoDB database
- Discord Bot Token
- Discord Application with slash commands enabled

### **Installation**

1. **Clone the repository** (Private access required)
```bash
git clone https://github.com/yourusername/seraphina-bot.git
cd seraphina-bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Deploy slash commands**
```bash
npm run deploy-commands
```

5. **Start the bot**
```bash
npm start
```

**For detailed setup instructions, see [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)**

---

## 📋 Commands

### **Learning Management**
| Command | Description |
|---------|-------------|
| `/upload [image] [frequency]` | Add a new learning item |
| `/list` | View your beautiful learning menu |
| `/view [item]` | See details and image |
| `/move [item] [frequency]` | Change reminder frequency |
| `/rename [old] [new]` | Rename an item |
| `/delete [item]` | Remove permanently |

### **Archive Management**
| Command | Description |
|---------|-------------|
| `/archive [item]` | Mark as mastered |
| `/unarchive [item]` | Restore from archive |
| `/view-archive` | Browse achievements |

### **Partner System** (Per-Guild)
| Command | Description |
|---------|-------------|
| `/partner @user` | Send partnership invite (DM with buttons) |
| `/leave-partner` | Exit current partnership |
| `/view-partner` | See partner info |

### **Server & User Configuration**
| Command | Description |
|---------|-------------|
| `/setup-wizard` | **[Admin]** Run server setup wizard |
| `/setup-channel` | Set your personal learning channel |
| `/settings [honorific]` | Change your preferences |
| `/stats` | View progress statistics |
| `/help` | Show command guide |

**For complete command documentation, see [USER_GUIDE.md](./USER_GUIDE.md)**

---

## 🎀 Screenshots

<div align="center">

### Elegant Learning Menu
![Learning Menu](https://via.placeholder.com/600x400/9333ea/ffffff?text=Service+Menu)

### Partner System
![Partner System](https://via.placeholder.com/600x400/9333ea/ffffff?text=Partner+Invites)

### Progress Stats
![Stats](https://via.placeholder.com/600x400/9333ea/ffffff?text=Progress+Stats)

### Web Admin Panel
![Admin Panel](https://via.placeholder.com/600x400/9333ea/ffffff?text=Admin+Dashboard)

</div>

---

## 📚 Documentation

- **[User Guide](./USER_GUIDE.md)** - Learn how to use Seraphina
- **[Admin Guide](./ADMIN_GUIDE.md)** - Setup and deployment instructions
- **[API Documentation](./API_DOCS.md)** - Web API endpoints
- **[Privacy Policy](./PRIVACY.md)** - Data handling and privacy

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Bot Framework:** Discord.js v14
- **Frontend:** React + Vite
- **Authentication:** JWT
- **Scheduler:** Node-cron
- **Hosting:** Koyeb (Bot + API) + Vercel (Web UI)

---

## 🔒 License & Usage

**Copyright © 2026 Jatin. All Rights Reserved.**

This software is proprietary and confidential. See [LICENSE](./LICENSE) for full terms.

**Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.**

---

## 💼 Commercial Inquiries

Interested in using Seraphina for your community or organization?

- 📧 Email: Snugtojo@gmail.com
- 💬 Discord ID: `1445501186005270538`
- 🌐 Support Server: https://discord.gg/MNZ7hNbDFd

---

## 🙏 Acknowledgments

**Seraphina Lumière** - Devoted to helping you master your craft through elegant learning.

Built with ❤️ and devotion to the art of learning.

---

<div align="center">

**🎀 Thank you for choosing Seraphina~ ✨**

*May your learning journey be filled with progress and achievement!*

</div>
