#!/bin/bash

# Quick update script for DigitalOcean server
# This script pulls the latest changes and restarts the bot

echo "🔄 Updating Ishi Music Bot on DigitalOcean server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Not in bot directory. Please cd to ishi-music-bot directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📥 Pulling latest changes from repository...${NC}"
git pull origin main

echo -e "${YELLOW}📦 Installing/updating dependencies...${NC}"
npm install --production

echo -e "${YELLOW}🔄 Restarting bot with PM2...${NC}"
pm2 restart ishi-music-bot

echo -e "${YELLOW}⏳ Waiting for bot to stabilize...${NC}"
sleep 5

echo -e "${YELLOW}📊 Checking bot status...${NC}"
pm2 status ishi-music-bot

echo -e "${GREEN}✅ Bot updated successfully!${NC}"
echo -e "${GREEN}📋 View logs: pm2 logs ishi-music-bot${NC}"
echo -e "${GREEN}📊 Monitor: pm2 monit${NC}"

# Show last few log lines to confirm it's working
echo -e "${YELLOW}📋 Recent logs:${NC}"
pm2 logs ishi-music-bot --lines 10 --nostream

echo -e "${GREEN}🎵 Ishi Music Bot is now running with the latest fixes!${NC}"
