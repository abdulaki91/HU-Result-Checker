# 🖥️ Terminal Deployment Guide

## Git Pull + Node.js Restart Workflow

Since you use terminal to pull code to your server, here's the complete workflow for deploying updates.

## 🚀 Quick Deployment Commands

### Standard Deployment (Recommended)

```bash
# 1. Navigate to your bot directory
cd repositories/telegram-student-results-bot

# 2. Pull latest changes from Git
git pull origin main

# 3. Install/update dependencies (if package.json changed)
npm install

# 4. Restart the Node.js application
npm restart
# OR
pm2 restart telegram-bot
# OR
node app.js
```

### Complete Deployment with Checks

```bash
# 1. Navigate to bot directory
cd repositories/telegram-student-results-bot

# 2. Check current status
echo "📍 Current directory: $(pwd)"
echo "🔄 Current Git branch: $(git branch --show-current)"
echo "📊 Current Git status:"
git status --short

# 3. Pull latest changes
echo "⬇️ Pulling latest changes..."
git pull origin main

# 4. Check if package.json changed
if git diff HEAD~1 HEAD --name-only | grep -q "package.json"; then
    echo "📦 package.json changed, updating dependencies..."
    npm install
else
    echo "📦 No dependency changes detected"
fi

# 5. Restart Node.js application
echo "🔄 Restarting Node.js application..."
# Choose one of the restart methods below
```

## 🔄 Node.js Restart Methods

### Method 1: PM2 (Recommended for Production)

```bash
# Check if PM2 is running your app
pm2 list

# Restart specific app
pm2 restart telegram-bot

# Or restart all PM2 apps
pm2 restart all

# View logs
pm2 logs telegram-bot

# Check status
pm2 status
```

### Method 2: NPM Scripts

```bash
# If you have npm scripts configured
npm run stop
npm run start

# Or combined restart
npm restart
```

### Method 3: Process Management

```bash
# Find and kill existing Node.js process
pkill -f "node app.js"

# Start new process in background
nohup node app.js > app.log 2>&1 &

# Check if process is running
ps aux | grep "node app.js"
```

### Method 4: Direct Node.js

```bash
# Stop current process (if running in foreground)
# Press Ctrl+C

# Start application
node app.js

# Or start in background
nohup node app.js &
```

### Method 5: Using Screen/Tmux

```bash
# Using screen
screen -S telegram-bot
node app.js
# Press Ctrl+A, then D to detach

# Reattach to screen
screen -r telegram-bot

# Using tmux
tmux new-session -d -s telegram-bot 'node app.js'
tmux attach-session -t telegram-bot
```

## 📋 Complete Deployment Script

Create `deploy.sh` for automated deployment:

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Configuration
APP_DIR="repositories/telegram-student-results-bot"
APP_NAME="telegram-bot"
LOG_FILE="deployment.log"

# Navigate to app directory
cd $APP_DIR || exit 1

# Log deployment start
echo "$(date): Starting deployment" >> $LOG_FILE

# Pull latest changes
echo "⬇️ Pulling latest changes..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed"
    exit 1
fi

# Check for dependency changes
if git diff HEAD~1 HEAD --name-only | grep -q "package.json"; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Restart application
echo "🔄 Restarting application..."

# Choose your restart method:
# Option 1: PM2
if command -v pm2 &> /dev/null; then
    pm2 restart $APP_NAME
    echo "✅ Application restarted with PM2"
# Option 2: Kill and restart
else
    pkill -f "node app.js"
    sleep 2
    nohup node app.js > app.log 2>&1 &
    echo "✅ Application restarted manually"
fi

# Verify deployment
echo "🔍 Verifying deployment..."
sleep 5

# Check if process is running
if pgrep -f "node app.js" > /dev/null; then
    echo "✅ Node.js process is running"
else
    echo "❌ Node.js process not found"
    exit 1
fi

# Test application endpoint
if curl -s https://checkresultbot.abdulaki.com/status | grep -q "Active"; then
    echo "✅ Application is responding"
    echo "$(date): Deployment successful" >> $LOG_FILE
    echo "🎉 Deployment completed successfully!"
else
    echo "❌ Application not responding"
    echo "$(date): Deployment failed - app not responding" >> $LOG_FILE
    exit 1
fi
```

Make it executable:

```bash
chmod +x deploy.sh
```

Run deployment:

```bash
./deploy.sh
```

## 🔧 Node.js Management Commands

### Check Application Status

```bash
# Check if Node.js process is running
ps aux | grep "node app.js"
pgrep -f "node app.js"

# Check application endpoint
curl https://checkresultbot.abdulaki.com/status
curl https://checkresultbot.abdulaki.com/health

# Check webhook status
curl -s "https://api.telegram.org/bot8629682635:AAEj2q5-6v1vnKC2Yv2N_flGoE4ClCODtdA/getWebhookInfo" | jq '.result.url'
```

### View Logs

```bash
# View application logs
tail -f app.log
tail -f logs/app.log
tail -f logs/errors.log

# View PM2 logs
pm2 logs telegram-bot

# View system logs
journalctl -u your-app-service -f
```

### Troubleshooting

```bash
# Check Node.js version
node --version
npm --version

# Check port usage
netstat -tulpn | grep :3000
lsof -i :3000

# Check memory usage
free -h
ps aux --sort=-%mem | head

# Check disk space
df -h
```

## 🎯 Quick Reference Commands

### Daily Deployment Workflow

```bash
# 1. Quick deployment
cd repositories/telegram-student-results-bot && git pull && pm2 restart telegram-bot

# 2. With verification
cd repositories/telegram-student-results-bot && git pull && npm install && pm2 restart telegram-bot && curl -s https://checkresultbot.abdulaki.com/status

# 3. Full deployment with logs
cd repositories/telegram-student-results-bot && git pull && npm install && pm2 restart telegram-bot && pm2 logs telegram-bot --lines 10
```

### Emergency Commands

```bash
# Force restart if app is stuck
pkill -9 -f "node app.js" && nohup node app.js > app.log 2>&1 &

# Check what's wrong
curl https://checkresultbot.abdulaki.com/status
tail -20 logs/errors.log
pm2 logs telegram-bot --lines 20
```

## 📱 Post-Deployment Testing

After each deployment, test these:

```bash
# 1. Test application endpoints
curl https://checkresultbot.abdulaki.com/status
curl https://checkresultbot.abdulaki.com/health

# 2. Test webhook
curl -X POST https://checkresultbot.abdulaki.com/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# 3. Check webhook status
curl -s "https://api.telegram.org/bot8629682635:AAEj2q5-6v1vnKC2Yv2N_flGoE4ClCODtdA/getWebhookInfo" | jq '.result'
```

## 🔄 PM2 Setup (Recommended)

If you don't have PM2 set up yet:

```bash
# Install PM2 globally
npm install -g pm2

# Start your app with PM2
pm2 start app.js --name telegram-bot

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Check PM2 status
pm2 status
pm2 monit
```

## 📋 Environment-Specific Commands

### Development Server

```bash
# Pull and test locally first
git pull origin main
node dev-bot.js  # Test locally
```

### Production Server

```bash
# Pull and restart production
cd repositories/telegram-student-results-bot
git pull origin main
pm2 restart telegram-bot
curl https://checkresultbot.abdulaki.com/status
```

Your terminal-based deployment workflow is now streamlined! Use the deployment script for automated deployments or the quick commands for manual updates.
