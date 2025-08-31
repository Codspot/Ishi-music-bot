#!/bin/bash

# DigitalOcean Deployment Script for Ishi Music Bot
# Run this script on your DigitalOcean droplet

echo "🚀 Starting Ishi Music Bot deployment on DigitalOcean..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}❌ Please run this script as the musicbot user, not root${NC}"
    echo "Switch to musicbot user: su - musicbot"
    exit 1
fi

# Get repository URL
read -p "Enter your GitHub repository URL: " REPO_URL

# Get Spotify credentials
read -p "Enter your Spotify Client ID: " SPOTIFY_CLIENT_ID
read -p "Enter your Spotify Client Secret: " SPOTIFY_CLIENT_SECRET

# Get Discord token
read -p "Enter your Discord Bot Token: " DISCORD_TOKEN

echo -e "${YELLOW}📥 Cloning repository...${NC}"
git clone $REPO_URL ishi-music-bot
cd ishi-music-bot

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production

echo -e "${YELLOW}⚙️ Creating environment file...${NC}"
cat > .env << EOF
# Discord Bot Configuration
DISCORD_TOKEN=$DISCORD_TOKEN
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
SPOTIFY_CLIENT_ID=$SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET=$SPOTIFY_CLIENT_SECRET

# YouTube Configuration (Secondary)
YOUTUBE_PREMIUM=false
PREFER_SOUNDCLOUD=false
EOF

echo -e "${YELLOW}📁 Creating logs directory...${NC}"
mkdir -p logs

echo -e "${YELLOW}🚀 Starting bot with PM2...${NC}"
pm2 start ecosystem.config.json

echo -e "${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save

echo -e "${GREEN}✅ Bot deployed successfully!${NC}"
echo -e "${GREEN}📊 Check status: pm2 status${NC}"
echo -e "${GREEN}📋 View logs: pm2 logs ishi-music-bot${NC}"
echo -e "${GREEN}🔄 Restart bot: pm2 restart ishi-music-bot${NC}"

echo -e "${YELLOW}🎵 Your Spotify-first Discord music bot is now running!${NC}"
