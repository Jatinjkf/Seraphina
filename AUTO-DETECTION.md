# Auto-Detection Learning System - Quick Guide

## 🎀 How It Works

Users post images in a designated learning channel and Seraphina automatically:
1. Detects the image
2. Responds with confirmation
3. Copies image to storage channel
4. Deletes user's message after 1 minute
5. Updates live ledger

---

## 📝 Setup Steps

### 1. Create Storage Channel

In your Discord server:
1. Create a new channel: `#bot-storage`
2. Make it **private** (only bot can see it)
3. Right-click → Copy Channel ID
4. Save this ID

### 2. Configure Storage Channel

**Option A: Via Web UI** (after deployment):
1. Login to admin panel
2. Go to Settings
3. Paste storage channel ID
4. Save

**Option B: Via Bot Settings** (in MongoDB):
```javascript
await BotSettings.updateSetting('storageChannelId', 'YOUR_CHANNEL_ID', 'admin');
```

### 3. Users Setup Their Learning Channel

Each user runs in their preferred channel:
```
/setup-channel
```

Seraphina will respond:
> "Understood, Master~ Seraphina will now watch #learning for your learning materials!"

---

## 💾 Image Format

**Post format:**
```
[Image attachment]
Caption: "Item Name [frequency]"
```

**Examples:**
- `Ions` → Daily (default)
- `Chemistry [weekly]` → Weekly
- `Physics [monthly]` → Monthly

**Supported frequencies:**
- `[daily]`
- `[every2days]`
- `[every3days]`
- `[weekly]`
- `[biweekly]`
- `[monthly]`

---

## 🎯 User Experience

**User posts:**
```
[Uploads image of ions diagram]
"Ions - Positive and negative charges [weekly]"
```

**Seraphina responds:**
```
As you wish, Master~ Seraphina shall remind you of 'Ions' weekly. 
Next reminder: Fri, 14 Feb ✨
```

**After 1 minute:**
- User's message is deleted
- Image copied to #bot-storage
- Ledger updated with new item

**Ledger shows:**
```
╔═══════════════════════════════════════╗
║  🎀 Seraphina Lumière's Learning Ledger 🎀  ║
╚═══════════════════════════════════════╝

**📌 Weekly**
• Ions *(Next: Fri, 14 Feb)*

✨ *Use reactions to manage your items, Master~*
🗑️ Delete | 📦 Archive | ⏰ Change Frequency
```

---

## 🔄 Benefits

✅ **No Discord CDN URL issues** - Uses message IDs instead
✅ **Clean channel** - Auto-deletes user messages
✅ **Live ledger** - Always up to date
✅ **Permanent storage** - Images in dedicated channel
✅ **Natural workflow** - Just post images!

---

## 🛠️ Commands Still Available

Slash commands work alongside auto-detection:
- `/upload <caption>` - Old method still works
- `/list` - See ledger (same as pinned view)
- `/view <item>` - See specific image
- `/move <item> <frequency>` - Change frequency
- All other commands work as before!

---

## 💡 Tips

1. **Pin the ledger** for easy access
2. **Hide #bot-storage** from regular users
3. **Never delete messages** in #bot-storage
4. **Use descriptive captions** for better organization
5. **Check ledger reactions** for quick management

---

**Perfect balance:** Power user commands + casual posting workflow! 🎀✨
