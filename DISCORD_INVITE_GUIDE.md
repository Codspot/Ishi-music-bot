# 🔗 Discord Bot Invite Link Generator

## 🤖 **Your Bot Information**

- **Client ID**: `1411357064453685391`
- **Bot Name**: Ishi Music Bot

---

## 🚀 **Quick Invite Link (Ready to Use)**

### **Full Permissions Invite Link:**

```
https://discord.com/api/oauth2/authorize?client_id=1411357064453685391&permissions=414531450944&scope=bot%20applications.commands
```

### **Minimal Permissions Invite Link:**

```
https://discord.com/api/oauth2/authorize?client_id=1411357064453685391&permissions=2184267776&scope=bot%20applications.commands
```

---

## 🛡️ **Permissions Breakdown**

### **Full Permissions (`414531450944`):**

- ✅ **Read Messages**
- ✅ **Send Messages**
- ✅ **Send Messages in Threads**
- ✅ **Embed Links**
- ✅ **Attach Files**
- ✅ **Read Message History**
- ✅ **Add Reactions**
- ✅ **Use Slash Commands**
- ✅ **Connect to Voice**
- ✅ **Speak in Voice**
- ✅ **Use Voice Activity**
- ✅ **Priority Speaker**
- ✅ **Mute Members**
- ✅ **Deafen Members**
- ✅ **Move Members**
- ✅ **Manage Messages**

### **Minimal Permissions (`2184267776`):**

- ✅ **Read Messages**
- ✅ **Send Messages**
- ✅ **Embed Links**
- ✅ **Connect to Voice**
- ✅ **Speak in Voice**
- ✅ **Use Slash Commands**

---

## 📋 **How to Create New Invite Link**

### **Method 1: Use Ready Links Above ⚡**

Just copy and paste the links above - they're ready to use!

### **Method 2: Discord Developer Portal 🔧**

1. **Go to**: [Discord Developer Portal](https://discord.com/developers/applications)
2. **Select your bot**: Ishi Music Bot
3. **OAuth2** → **URL Generator**
4. **Scopes**: Select `bot` and `applications.commands`
5. **Bot Permissions**: Select permissions needed:
   ```
   ✅ Send Messages
   ✅ Use Slash Commands
   ✅ Connect
   ✅ Speak
   ✅ Embed Links
   ✅ Read Message History
   ```
6. **Copy the generated URL**

### **Method 3: Manual URL Construction 🛠️**

```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=PERMISSIONS&scope=bot%20applications.commands
```

Replace:

- `CLIENT_ID` → `1411357064453685391`
- `PERMISSIONS` → Permission integer (see above)

---

## 🎯 **Permission Calculator**

### **Common Permission Values:**

- **Basic Bot**: `2147483648` (Use Slash Commands only)
- **Text Bot**: `2184237056` (Messages + Slash Commands)
- **Music Bot**: `2184267776` (Voice + Messages + Slash Commands)
- **Full Music Bot**: `414531450944` (All music bot features)

### **Individual Permission Values:**

```
View Channels: 1024
Send Messages: 2048
Embed Links: 16384
Read Message History: 65536
Use Slash Commands: 2147483648
Connect: 1048576
Speak: 2097152
```

---

## 🔒 **Security Best Practices**

### **⚠️ IMPORTANT: Regenerate Bot Token**

Your current token is **exposed** in the .env file. For security:

1. **Go to**: [Discord Developer Portal](https://discord.com/developers/applications)
2. **Select your bot** → **Bot** section
3. **Click "Reset Token"**
4. **Copy the new token**
5. **Update your .env file** with new token
6. **Update Render environment variables**

### **🛡️ Safe Practices:**

- ✅ Never share bot tokens publicly
- ✅ Use environment variables for tokens
- ✅ Add `.env` to `.gitignore`
- ✅ Regenerate tokens if compromised

---

## 🎵 **Testing Your Bot**

After inviting with the new link:

1. **Join a voice channel**
2. **Test commands**:
   ```
   /help
   /play never gonna give you up
   /stats
   ```
3. **Check permissions** if commands fail

---

## 🌐 **For Render Deployment**

When deploying to Render, use the **new regenerated token**:

```env
DISCORD_TOKEN=your_new_regenerated_token_here
CLIENT_ID=1411357064453685391
```

---

## 🎉 **Ready to Invite!**

**Recommended Invite Link (Full Features):**

```
https://discord.com/api/oauth2/authorize?client_id=1411357064453685391&permissions=414531450944&scope=bot%20applications.commands
```

**This link includes all permissions needed for:**

- 🎵 Music playback
- 📝 Slash commands
- 🔊 Voice channel access
- 📋 Queue management
- 🎛️ Advanced features

**Click the link above to invite your bot to Discord servers!** 🚀
