# 🌊 DigitalOcean Ubuntu Droplet Setup Guide

## 📋 **Prerequisites**

### **1. Get Spotify API Credentials:**
1. Go to https://developer.spotify.com/dashboard
2. Create a new app
3. Copy `Client ID` and `Client Secret`
4. Add to your `.env` file

### **2. Create DigitalOcean Droplet:**
- **OS:** Ubuntu 22.04 LTS
- **Size:** Basic - $6/month (1GB RAM, 1 vCPU)
- **Region:** Choose closest to your users
- **Authentication:** SSH Key (recommended)

---

## 🚀 **Server Setup Commands**

### **Step 1: Connect to Your Droplet**
```bash
ssh root@YOUR_DROPLET_IP
```

### **Step 2: Update System**
```bash
apt update && apt upgrade -y
```

### **Step 3: Install Node.js 18+**
```bash
# Install NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### **Step 4: Install PM2 (Process Manager)**
```bash
npm install -g pm2
```

### **Step 5: Install Git**
```bash
apt install git -y
```

### **Step 6: Install FFmpeg (Required for Audio)**
```bash
apt install ffmpeg -y
```

### **Step 7: Create Bot User (Security)**
```bash
# Create dedicated user for bot
useradd -m -s /bin/bash musicbot

# Switch to bot user
su - musicbot
```

### **Step 8: Clone Your Repository**
```bash
# As musicbot user
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# Install dependencies
npm install --production
```

### **Step 9: Setup Environment Variables**
```bash
# Create .env file
nano .env
```

**Add to .env:**
```env
# Discord Bot Configuration
DISCORD_TOKEN=your_new_discord_token
CLIENT_ID=1411357064453685391

# Bot Settings
PREFIX=!
DEFAULT_VOLUME=50
MAX_QUEUE_SIZE=100

# DigitalOcean Configuration
NODE_ENV=production
DIGITALOCEAN=true
YTSR_NO_UPDATE=true
YTDL_NO_UPDATE=true

# Spotify Integration (Primary)
PREFER_SPOTIFY=true
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# YouTube Configuration (Secondary)
YOUTUBE_PREMIUM=false
PREFER_SOUNDCLOUD=false
```

### **Step 10: Start Bot with PM2**
```bash
# Start the bot
pm2 start index.js --name "ishi-music-bot"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system reboot
pm2 startup
# Follow the instructions shown
```

### **Step 11: Setup Auto-Updates (Optional)**
```bash
# Create update script
nano update-bot.sh
```

**Add to update-bot.sh:**
```bash
#!/bin/bash
cd /home/musicbot/YOUR_REPO_NAME
git pull origin main
npm install --production
pm2 restart ishi-music-bot
```

```bash
# Make executable
chmod +x update-bot.sh

# Setup cron for auto-updates (every 6 hours)
crontab -e
# Add: 0 */6 * * * /home/musicbot/YOUR_REPO_NAME/update-bot.sh
```

---

## 🔒 **Security Setup**

### **1. Setup Firewall**
```bash
# Switch back to root
exit

# Enable UFW firewall
ufw enable

# Allow SSH
ufw allow ssh

# Allow only necessary ports
ufw allow 80/tcp
ufw allow 443/tcp

# Check status
ufw status
```

### **2. Disable Root Login (After SSH key setup)**
```bash
nano /etc/ssh/sshd_config

# Change: PermitRootLogin no
# Change: PasswordAuthentication no

# Restart SSH
systemctl restart ssh
```

---

## 📊 **Management Commands**

### **Check Bot Status:**
```bash
pm2 status
pm2 logs ishi-music-bot
```

### **Restart Bot:**
```bash
pm2 restart ishi-music-bot
```

### **Stop Bot:**
```bash
pm2 stop ishi-music-bot
```

### **Update Bot:**
```bash
cd /home/musicbot/YOUR_REPO_NAME
git pull origin main
npm install --production
pm2 restart ishi-music-bot
```

### **System Monitoring:**
```bash
# Check system resources
htop

# Check disk space
df -h

# Check memory
free -h
```

---

## 🎵 **Spotify-First Benefits**

### **✅ Advantages:**
- **Better Metadata:** Artist info, album art, track details
- **Playlist Support:** Full Spotify playlist integration
- **High-Quality Streams:** Resolves to best available sources
- **Discovery:** Enhanced search and recommendations
- **Reliability:** More stable than direct YouTube access

### **🔄 How It Works:**
1. **Spotify URLs/Searches** → Spotify Plugin handles directly
2. **Regular Searches** → Spotify searches first, then resolves to YouTube/SoundCloud for streaming
3. **Fallbacks** → YouTube → SoundCloud → YtDlp

---

## 🚨 **Important Notes**

### **Before Deployment:**
1. **Regenerate Discord Token** (exposed in chat)
2. **Get Spotify API credentials**
3. **Test locally first**

### **Costs:**
- **DigitalOcean Droplet:** $6/month (1GB RAM)
- **Spotify API:** Free (rate limited)
- **Total:** ~$6/month

### **Performance:**
- **1GB RAM:** Handles ~50 concurrent users
- **CPU:** Sufficient for music bot operations
- **Bandwidth:** 1TB included

---

**Ready to deploy? Follow these steps in order for a successful DigitalOcean setup!**
